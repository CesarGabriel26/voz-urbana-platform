import { Component, inject, ViewChild, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { StepsComponent } from '../../../components/steps/steps.component';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '../../../components/form/form-select/form-select.component';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { GeolocationService } from '../../../services/geolocation.service';
import { PetitionService } from '../../../services/petition.service';
import { IbgeService } from '../../../services/ibge.service';
import { PetitionsCategories } from '../../../utils/consts';

@Component({
  selector: 'app-petition-create-page',
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
  templateUrl: './petition-create-page.component.html',
  styleUrl: './petition-create-page.component.scss'
})
export class PetitionCreatePage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private geoService = inject(GeolocationService);
  private petitionService = inject(PetitionService);
  private ibgeService = inject(IbgeService);

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  currentStep = 0;
  steps = ['Localização', 'Informações', 'Revisão'];

  categories: SelectOption[] = PetitionsCategories.map(c => ({ label: c, value: c }));

  scopeOptions: SelectOption[] = [
    { label: 'Causa Local (Bairro)', value: 'neighborhood', icon: 'home' },
    { label: 'Pressão Municipal (1% Eleitores)', value: 'city_pressure', icon: 'campaign' },
    { label: 'Projeto de Lei Popular (5% Eleitores)', value: 'city_law', icon: 'gavel' }
  ];

  visibilityOptions: SelectOption[] = [
    { label: 'Público', value: 'public', icon: 'public' },
    { label: 'Anônimo', value: 'anonymous', icon: 'person_off' },
    { label: 'Privado', value: 'private', icon: 'lock' }
  ];

  states = signal<SelectOption[]>([]);
  cities = signal<SelectOption[]>([]);
  minGoal = 100;
  totalVoters = 0;

  form: FormGroup = this.fb.group({
    step1: this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(100)]],
      category: ['', [Validators.required]],
      description: ['', [Validators.required, Validators.minLength(50)]],
      scope: ['neighborhood', [Validators.required]],
      goal: [100, [Validators.required]]
    }),
    step2: this.fb.group({
      state: ['', [Validators.required]],
      city: ['', [Validators.required]],
      cityIbgeCode: [''],
      neighborhood: ['', [Validators.required]],
      latitude: [null, [Validators.required]],
      longitude: [null, [Validators.required]],
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

  ngOnInit() {
    this.loadStates();

    // Watch scope and city changes to update minGoal
    this.step1.get('scope')?.valueChanges.subscribe(() => this.updateMinimumGoal());
    this.step2.get('city')?.valueChanges.subscribe((cityId) => {
      const city = this.cities().find(c => c.value === cityId);
      if (city && cityId) {
        this.step2.get('cityIbgeCode')?.setValue(cityId);
        this.ibgeService.getVoterCount(cityId).subscribe((voters: number) => {
          this.totalVoters = voters;
          this.updateMinimumGoal();
        });
      }
    });

    // Ensure city is disabled if no states are loaded or no state is selected
    if (!this.step2.get('state')?.value) {
      this.step2.get('city')?.disable();
    }

    // Update goal validator based on minGoal
    this.step1.get('goal')?.valueChanges.subscribe(val => {
      if (val < this.minGoal) {
        this.step1.get('goal')?.setErrors({ min: { requiredMin: this.minGoal } });
      }
    });
  }

  loadStates() {
    this.ibgeService.getStates().subscribe((states: any[]) => {
      this.states.set(states.map((s: any) => ({ label: s.nome, value: s.id })));
    });
  }

  onStateChange(stateId: any) {
    this.cities.set([]);
    this.step2.patchValue({ city: '' });
    if (stateId) {
      this.step2.get('city')?.enable();
      this.ibgeService.getCities(stateId).subscribe((cities: any[]) => {
        this.cities.set(cities.map((c: any) => ({ label: c.nome, value: c.id })));
      });
    } else {
      this.step2.get('city')?.disable();
    }
  }

  updateMinimumGoal() {
    const scope = this.step1.get('scope')?.value;
    this.minGoal = this.petitionService.calculateMinimumGoal(scope, this.totalVoters);

    const goalControl = this.step1.get('goal');
    if (goalControl && goalControl.value < this.minGoal) {
      goalControl.setValue(this.minGoal);
    }
  }

  asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  nextStep(): void {
    if (this.currentStep === 0 && this.step2.invalid) {
      this.step2.markAllAsTouched();
      return;
    }
    if (this.currentStep === 1 && this.step1.invalid) {
      this.step1.markAllAsTouched();
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
      this.updateLocation(pos.coords.latitude, pos.coords.longitude);
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
    if (this.mapComponent) {
      this.mapComponent.focusOn(lat, lng);
    }

    this.geoService.reverseGeocode(lat, lng).subscribe(res => {
      this.step2.patchValue({ address: res.display_name });

      if (res.address) {
        // Try to match state
        const stateName = res.address.state;
        const state = this.states().find(s => s.label.toLowerCase() === stateName?.toLowerCase());

        if (state) {
          this.step2.patchValue({ state: state.value });

          // Load cities and try to match city
          this.ibgeService.getCities(state.value).subscribe(cities => {
            this.cities.set(cities.map((c: any) => ({ label: c.nome, value: c.id })));
            this.step2.get('city')?.enable();

            const cityName = res.address.city || res.address.town || res.address.village;
            const city = this.cities().find(c => c.label.toLowerCase() === cityName?.toLowerCase());
            if (city) {
              this.step2.patchValue({ city: city.value });
            }
          });
        }

        const neighborhood = res.address.suburb || res.address.neighbourhood || res.address.district;
        if (neighborhood) {
          this.step2.patchValue({ neighborhood: neighborhood });
        }
      }
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

    this.isSubmitting = true;

    const formVal = this.form.value;
    const petitionData = {
      ...formVal.step1,
      scope: formVal.step1.scope,
      cityIbgeCode: formVal.step2.cityIbgeCode,
      visibility: formVal.step3.visibility,
      location: {
        latitude: formVal.step2.latitude,
        longitude: formVal.step2.longitude,
        address: formVal.step2.address,
        neighborhood: formVal.step2.neighborhood
      },
      status: 'active',
      signaturesCount: 0,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    console.log('Submitting petition:', petitionData);

    setTimeout(() => {
      this.isSubmitting = false;
      this.router.navigate(['/petitions']);
    }, 1500);
  }

  get mapPoints(): MapPoint[] {
    const lat = this.step2.get('latitude')?.value;
    const lng = this.step2.get('longitude')?.value;
    if (lat && lng) {
      return [{
        id: 'current',
        lat,
        lng,
        title: 'Local do Abaixo-Assinado',
        color: 'var(--blue-10)'
      }];
    }
    return [];
  }
}
