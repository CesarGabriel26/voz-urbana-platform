import { Component, AfterViewInit, Input, OnChanges, SimpleChanges, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet.heat';
import 'leaflet.markercluster';

export interface MapPoint {
  id: string | number;
  lat: number;
  lng: number;
  title: string;
  popupContent?: string;
  color?: string; // Hex or HSL for the marker
  iconHtml?: string; // Optional custom SVG or Emoji
  priority?: number; // Optional for default scaling/coloring
}

@Component({
  selector: 'm-map',
  standalone: true,
  templateUrl: './map.html',
})
export class MapComponent implements AfterViewInit, OnChanges {
  @Input() points: MapPoint[] = [];
  @Input() center: [number, number] = [-20.89, -51.37];
  @Input() zoom: number = 13;
  @Input() showHeatmap: boolean = false;

  @Output() pointClick = new EventEmitter<MapPoint>();

  private map!: L.Map;
  private markers!: L.MarkerClusterGroup;
  private heatLayer?: any;

  ngAfterViewInit(): void {
    this.initMap();
    this.renderPoints();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['points'] && this.map) {
      this.renderPoints();
    }
    if (changes['center'] && this.map && !changes['center'].isFirstChange()) {
      this.map.setView(this.center, this.zoom);
    }
  }

  public focusOn(lat: number, lng: number, zoom?: number) {
    if (this.map) {
      this.map.setView([lat, lng], zoom || 16);

      // Auto-open popup if point exists
      this.markers.getLayers().forEach((layer: any) => {
        if (layer instanceof L.Marker) {
          const latLng = layer.getLatLng();
          if (latLng.lat === lat && latLng.lng === lng) {
            layer.openPopup();
          }
        }
      });
    }
  }

  private initMap() {
    this.map = L.map('map', {
      zoomControl: false,
    }).setView(this.center, this.zoom);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    this.markers = L.markerClusterGroup({
      showCoverageOnHover: false,
      spiderfyOnMaxZoom: true,
      zoomToBoundsOnClick: true
    });
    this.map.addLayer(this.markers);

    if (this.showHeatmap) {
      this.loadHeatMap();
    }
  }

  private loadHeatMap() {
    if (!this.points.length) return;

    const heatPoints = this.points.map(p => [p.lat, p.lng, .5]);

    if (this.heatLayer) {
      this.map.removeLayer(this.heatLayer);
    }

    this.heatLayer = (L as any).heatLayer(heatPoints, {
      radius: 25,
      blur: 15
    }).addTo(this.map);
  }

  private renderPoints() {
    if (!this.map || !this.markers) return;

    this.markers.clearLayers();

    this.points.forEach(p => {
      const icon = this.createIcon(p);

      const marker = L.marker([p.lat, p.lng], {
        icon: icon
      }).bindPopup(p.popupContent || `<strong>${p.title}</strong>`);

      marker.on('click', () => {
        this.pointClick.emit(p);
      });

      marker.on('mouseover', () => {
        marker.openPopup();
      });

      this.markers.addLayer(marker);
    });

    if (this.showHeatmap) {
      this.loadHeatMap();
    }
  }

  private createIcon(point: MapPoint) {
    const color = point.color || 'var(--blue-10, #0060ec)';
    const innerHtml = point.iconHtml || this.getDefaultSvg();

    return L.divIcon({
      html: `
        <div class="map-marker-container" style="
          color: ${color};
          font-size: 2.5rem;
          display: flex;
          justify-content: center;
          align-items: center;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
          transition: transform 0.2s ease;
          width: 100%;
          height: 100%;
          cursor: pointer;
        ">
          ${innerHtml}
        </div>`,
      className: 'custom-map-icon',
      iconSize: [40, 40],
      iconAnchor: [20, 20],
      popupAnchor: [0, -20]
    });
  }

  private getDefaultSvg() {
    return `
      <svg width="1em" height="1em" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
          <path fill="currentColor" fill-rule="evenodd"
              d="M11.291 21.706 12 21l-.709.706zM12 21l.708.706a1 1 0 0 1-1.417 0l-.006-.007-.017-.017-.062-.063a47.708 47.708 0 0 1-1.04-1.106 49.562 49.562 0 0 1-2.456-2.908c-.892-1.15-1.804-2.45-2.497-3.734C4.535 12.612 4 11.248 4 10c0-4.539 3.592-8 8-8 4.408 0 8 3.461 8 8 0 1.248-.535 2.612-1.213 3.87-.693 1.286-1.604 2.585-2.497 3.735a49.583 49.583 0 0 1-3.496 4.014l-.062.063-.017.017-.006.006L12 21zm0-8a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
              clip-rule="evenodd" />
      </svg>
    `;
  }
}
