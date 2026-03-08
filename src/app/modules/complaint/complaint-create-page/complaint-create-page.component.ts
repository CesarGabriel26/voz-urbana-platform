import { Component, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { StepsComponent } from '../../../components/steps/steps.component';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '../../../components/form/form-select/form-select.component';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { GeolocationService } from '../../../services/geolocation.service';
import { Categories } from '../../../utils/consts';
import { Complaint } from '../../../types/Complaint';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { ComplaintService } from '../../../services/complaint.service';

@Component({
  selector: 'app-complaint-create-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    StepsComponent,
    FormInputComponent,
    FormSelectComponent,
    MapComponent
  ],
  templateUrl: './complaint-create-page.component.html',
  styleUrl: './complaint-create-page.component.scss'
})
export class ComplaintCreatePage {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private geoService = inject(GeolocationService);

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService
  ) { }

  currentStep = 0;
  steps = ['Informações', 'Localização', 'Revisão'];

  categories: SelectOption[] = Categories.map(c => ({ label: c, value: c }));

  visibilityOptions: SelectOption[] = [
    { label: 'Público', value: 'public', icon: 'public' },
    { label: 'Anônimo', value: 'anonymous', icon: 'person_off' },
    { label: 'Privado', value: 'private', icon: 'lock' }
  ];

  form: FormGroup = this.fb.group({
    step1: this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5)]],
      category: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(20)]]
    }),
    step2: this.fb.group({
      latitude: [0, [Validators.required]],
      longitude: [0, [Validators.required]],
      address: ['', [Validators.required]]
    }),
    step3: this.fb.group({
      visibility: ['public', [Validators.required]]
    })
  });

  isSubmitting = false;
  addressSearchQuery = '';
  searchResults: any[] = [];
  isSearching = false;

  get step1() { return this.form.get('step1') as FormGroup; }
  get step2() { return this.form.get('step2') as FormGroup; }
  get step3() { return this.form.get('step3') as FormGroup; }

  asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  nextStep(): void {
    if (this.currentStep === 0 && this.step1.invalid) {
      this.step1.markAllAsTouched();
      return;
    }
    if (this.currentStep === 1 && this.step2.invalid) {
      this.step2.markAllAsTouched();
      return;
    }
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  async useCurrentLocation() {
    try {
      const pos = await this.geoService.getCurrentPosition();
      this.updateLocation(
        pos.coords.latitude, 
        pos.coords.longitude
      )
    } catch (error) {
      console.error('Error getting location', error);
      alert('Não foi possível obter sua localização atual.');
    }
  }

  onMapClick(event: any) {
    if (event.latlng) {
      this.updateLocation(event.latlng.lat, event.latlng.lng);
    }
  }

  private updateLocation(lat: number, lng: number) {
    this.step2.patchValue({ latitude: lat, longitude: lng });
    this.mapComponent.focusOn(lat, lng);

    this.geoService.reverseGeocode(lat, lng).subscribe((address: any) => {
      console.log(address);
      
      this.step2.patchValue({ address: address.display_name });
    });
  }

  searchAddress() {
    if (!this.addressSearchQuery.trim()) return;

    this.isSearching = true;
    this.geoService.searchAddress(this.addressSearchQuery).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: () => this.isSearching = false
    });
  }

  selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    this.updateLocation(lat, lng);
    this.searchResults = [];
    this.addressSearchQuery = '';
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user: User | null = this.authService.getUserFromStorage()

    this.isSubmitting = true;
    // Montar complaint
    const values = this.form.value
    const complaint = {
      title: values.step1.title,
      description: values.step1.description,

      category: values.step1.category,

      priority: 0,
      visibility: values.step3.visibility,

      status: "pending",

      lat: values.step2.latitude,
      lng: values.step2.longitude,
      address: values.step2.address,

      createdBy: user?.id || '',
    }

    this.complaintService.createComplaint(complaint).subscribe({
      next: (value) => {
        if (value) {
          this.router.navigate(['/mycomplaints'])
        }
      }
    });
  }

  get mapPoints(): MapPoint[] {
    const lat = this.step2.get('latitude')?.value;
    const lng = this.step2.get('longitude')?.value;
    if (lat && lng) {
      return [{
        id: 'current',
        lat,
        lng,
        title: 'Local da Reclamação',
        color: 'var(--red-10)'
      }];
    }
    return [];
  }
}
