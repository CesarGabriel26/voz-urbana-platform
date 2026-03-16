import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { config } from '../config';

export interface NominatimResponse {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    road?: string;
    suburb?: string;
    city?: string;
    town?: string;
    village?: string;
    neighbourhood?: string;
    district?: string;
    state?: string;
    postcode?: string;
    country?: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class GeolocationService {
  private nominatimUrl = 'https://nominatim.openstreetmap.org';

  constructor(private http: HttpClient) { }

  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      }
      const options = {
        enableHighAccuracy: true, // Força o uso de métodos mais precisos
        timeout: 5000,            // Tempo máximo de espera
        maximumAge: 0             // Não aceita localização em cache
      };
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  reverseGeocode(lat: number, lng: number): Observable<any> {
    if (config.useGooglePlaces) {
      return this.http.get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${config.googleApis}&language=pt-BR`
      ).pipe(
        map(response => {
          if (response.status === 'OK' && response.results.length > 0) {
            return {
              display_name: response.results[0].formatted_address,
              lat: lat.toString(),
              lon: lng.toString(),
              address: {}
            };
          }
          throw new Error('No results found');
        })
      );
    }

    return this.http.get<NominatimResponse>(
      `${this.nominatimUrl}/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    );
  }

  searchAddress(query: string): Observable<any[]> {
    if (config.useGooglePlaces) {
      return this.http.get<any>(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(query)}&key=${config.googleApis}&language=pt-BR`
      ).pipe(
        map(response => {
          if (response.status === 'OK') {
            return response.results.map((r: any) => ({
              display_name: r.formatted_address,
              lat: r.geometry.location.lat.toString(),
              lon: r.geometry.location.lng.toString()
            }));
          }
          return [];
        })
      );
    }

    return this.http.get<NominatimResponse[]>(
      `${this.nominatimUrl}/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`,
      { headers: { 'Accept-Language': 'pt-BR' } }
    );
  }
}
