import { Injectable } from '@angular/core';
import { openDB, IDBPDatabase } from 'idb';

export interface QueuedComplaint {
  id?: number | string;
  data: any;
  photoBlob?: Blob;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  createdAt: number;
}

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private dbPromise: Promise<IDBPDatabase>;
  private readonly DB_NAME = 'voz-urbana-db';
  private readonly VERSION = 1;

  constructor() {
    this.dbPromise = this.initDB();
  }

  private async initDB() {
    return openDB(this.DB_NAME, this.VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('complaints_queue')) {
          db.createObjectStore('complaints_queue', { keyPath: 'id', autoIncrement: true });
        }
        if (!db.objectStoreNames.contains('app_state')) {
          db.createObjectStore('app_state');
        }
      },
    });
  }

  async queueComplaint(data: any, photoBlob?: Blob): Promise<number> {
    const db = await this.dbPromise;
    const queuedItem: QueuedComplaint = {
      data,
      photoBlob,
      status: 'pending',
      createdAt: Date.now()
    };
    return (await db.add('complaints_queue', queuedItem)) as number;
  }

  async getAllQueued(): Promise<QueuedComplaint[]> {
    const db = await this.dbPromise;
    return db.getAll('complaints_queue');
  }

  async deleteFromQueue(id: number | string): Promise<void> {
    const db = await this.dbPromise;
    await db.delete('complaints_queue', id);
  }

  async updateQueueStatus(id: number | string, status: QueuedComplaint['status'], error?: string): Promise<void> {
    const db = await this.dbPromise;
    const item = await db.get('complaints_queue', id);
    if (item) {
      item.status = status;
      if (error) item.error = error;
      await db.put('complaints_queue', item);
    }
  }

  async setAppState(key: string, value: any): Promise<void> {
    const db = await this.dbPromise;
    await db.put('app_state', value, key);
  }

  async getAppState(key: string): Promise<any> {
    const db = await this.dbPromise;
    return db.get('app_state', key);
  }
}
