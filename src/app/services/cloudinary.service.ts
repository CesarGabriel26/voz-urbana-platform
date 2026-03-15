import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CloudinaryService {
  private http = inject(HttpClient);
  
  private cloudName = 'dpmqi1xm4'; 
  private uploadPreset = 'ml_default'; 

  async uploadImage(imageBlob: Blob): Promise<string> {
    const url = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', imageBlob);
    formData.append('upload_preset', this.uploadPreset);

    try {
      const response: any = await firstValueFrom(this.http.post(url, formData));
      return response.secure_url;
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error('Failed to upload image to Cloudinary');
    }
  }
}
