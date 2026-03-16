import { Injectable, inject } from '@angular/core';
import { ConnectivityService } from './connectivity.service';
import { StorageService, QueuedComplaint } from './storage.service';
import { ComplaintService } from './complaint.service';
import { CloudinaryService } from './cloudinary.service';
import { filter, switchMap, delay } from 'rxjs/operators';
import { from, of, concatMap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private connectivity = inject(ConnectivityService);
  private storage = inject(StorageService);
  private complaintService = inject(ComplaintService);
  private cloudinary = inject(CloudinaryService);

  private isSyncing = false;

  constructor() {
    this.initSyncListener();
  }

  private initSyncListener() {
    this.connectivity.isOnline$.pipe(
      filter(online => online && !this.isSyncing)
    ).subscribe(() => {
      this.syncAll();
    });
  }

  async syncAll() {
    if (this.isSyncing) return;
    
    const queuedItems = await this.storage.getAllQueued();
    if (queuedItems.length === 0) return;

    this.isSyncing = true;
    console.log(`Starting sync of ${queuedItems.length} complaints...`);

    for (const item of queuedItems) {
      try {
        await this.syncItem(item);
      } catch (error) {
        console.error('Failed to sync item', item.id, error);
      }
    }

    this.isSyncing = false;
    console.log('Sync finished.');
  }

  private async syncItem(item: QueuedComplaint) {
    if (!item.id) return;
    
    await this.storage.updateQueueStatus(Number(item.id), 'syncing');

    try {
      let photoUrl = item.data.photoUrl;

      // 1. Upload photo if blob exists
      if (item.photoBlob) {
        photoUrl = await this.cloudinary.uploadImage(item.photoBlob);
      }

      // 2. Create complaint
      const complaintData = { ...item.data, photoUrl };
      
      await new Promise((resolve, reject) => {
        this.complaintService.createComplaint(complaintData).subscribe({
          next: () => resolve(true),
          error: (err) => reject(err)
        });
      });

      // 3. Success -> Remove from queue
      await this.storage.deleteFromQueue(Number(item.id));
      console.log(`Synced complaint ${item.id} successfully.`);

    } catch (error: any) {
      await this.storage.updateQueueStatus(Number(item.id), 'failed', error.message || 'Unknown error');
      throw error;
    }
  }
}
