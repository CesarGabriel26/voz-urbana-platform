import { Component, inject, OnInit, signal, ViewChild, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, AbstractControl, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { StepsComponent } from '../../../components/steps/steps.component';
import { FormInputComponent } from '../../../components/form/form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '../../../components/form/form-select/form-select.component';
import { MapComponent, MapPoint } from '../../../components/map/map';
import { GeolocationService } from '../../../services/geolocation.service';
import { AuthService } from '../../../services/auth.service';
import { User } from '../../../models/user.model';
import { ComplaintService } from '../../../services/complaint.service';
import { CategoryService } from '../../../services/category.service';
import { ImageCompressionService } from '../../../services/image-compression.service';
import { CloudinaryService } from '../../../services/cloudinary.service';

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
export class ComplaintCreatePage implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private geoService = inject(GeolocationService);
  private compressionService = inject(ImageCompressionService);
  private cloudinaryService = inject(CloudinaryService);

  @ViewChild(MapComponent) mapComponent!: MapComponent;

  constructor(
    private authService: AuthService,
    private complaintService: ComplaintService,
    private categoryService: CategoryService
  ) { }

  currentStep = signal(0);
  steps = ['Informações', 'Localização', 'Imagens', 'Revisão'];

  categories = signal<SelectOption[]>([]);

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
      imageUrl: ['']
    }),
    step4: this.fb.group({
      visibility: ['public', [Validators.required]]
    })
  });

  isSubmitting = signal<boolean>(false);
  isUploading = signal<boolean>(false);
  selectedImage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  addressSearchQuery = signal<string>('');
  searchResults = signal<any[]>([]);
  isSearching = signal<boolean>(false);

  // Reactive access to form values for computed signals
  private step1Value = toSignal(this.form.get('step1')!.valueChanges, { initialValue: this.form.get('step1')!.value });
  private step2Value = toSignal(this.form.get('step2')!.valueChanges, { initialValue: this.form.get('step2')!.value });
  private step4Value = toSignal(this.form.get('step4')!.valueChanges, { initialValue: this.form.get('step4')!.value });

  categoryName = computed(() => {
    const catId = this.step1Value()?.category;
    return this.categories().find(c => c.value === catId)?.label;
  });

  get step1() { return this.form.get('step1') as FormGroup; }
  get step2() { return this.form.get('step2') as FormGroup; }
  get step3() { return this.form.get('step3') as FormGroup; }
  get step4() { return this.form.get('step4') as FormGroup; }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile.set(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.selectedImage.set(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadAndNext() {
    if (!this.selectedFile()) {
      this.nextStep();
      return;
    }

    this.isUploading.set(true);
    try {
      console.log('Compressing image...');
      const compressedBlob = await this.compressionService.compressImage(this.selectedFile()!);
      console.log('Original size:', this.selectedFile()!.size, 'Compressed size:', compressedBlob.size);
      
      console.log('Uploading to Cloudinary...');
      const imageUrl = await this.cloudinaryService.uploadImage(compressedBlob);
      this.step3.patchValue({ imageUrl });
      this.isUploading.set(false);
      this.nextStep();
    } catch (error) {
      console.error('Upload error:', error);
      alert('Erro ao processar imagem. Tente novamente.');
      this.isUploading.set(false);
    }
  }

  ngOnInit(): void {
    this.categoryService.getCategories({active: true, type: 'report'}).subscribe(categories => {
      this.categories.set(categories.map(c => ({ label: c.name, value: c.id })));
    });
  }

  asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }

  nextStep(): void {
    if (this.currentStep() === 0 && this.step1.invalid) {
      this.step1.markAllAsTouched();
      return;
    }
    if (this.currentStep() === 1 && this.step2.invalid) {
      this.step2.markAllAsTouched();
      return;
    }
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(s => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update(s => s - 1);
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
      this.step2.patchValue({ address: address.display_name });
    });
  }

  searchAddress() {
    if (!this.addressSearchQuery().trim()) return;

    this.isSearching.set(true);
    this.geoService.searchAddress(this.addressSearchQuery()).subscribe({
      next: (results) => {
        this.searchResults.set(results);
        this.isSearching.set(false);
      },
      error: () => this.isSearching.set(false)
    });
  }

  selectSearchResult(result: any) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    this.updateLocation(lat, lng);
    this.searchResults.set([]);
    this.addressSearchQuery.set('');
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const user: User | null = this.authService.getUserFromStorage()

    this.isSubmitting.set(true);

    try {
      // Se houver arquivo selecionado, faz o upload primeiro
      if (this.selectedFile()) {
        this.isUploading.set(true);
        console.log('Compressing image...');
        const compressedBlob = await this.compressionService.compressImage(this.selectedFile()!);
        console.log('Original size:', this.selectedFile()!.size, 'Compressed size:', compressedBlob.size);
        
        console.log('Uploading to Cloudinary...');
        const imageUrl = await this.cloudinaryService.uploadImage(compressedBlob);
        this.step3.patchValue({ imageUrl });
        this.isUploading.set(false);
      }

      // Montar complaint com valores atualizados (caso imageUrl tenha sido patched)
      const values = this.form.value
      const complaint = {
        title: values.step1.title,
        description: values.step1.description,
        category: values.step1.category,
        priority: 0,
        visibility: values.step4.visibility,
        imageUrl: values.step3.imageUrl,
        status: 0,
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
        },
        error: (err) => {
          console.error('Error creating complaint:', err);
          this.isSubmitting.set(false);
        }
      });
    } catch (error) {
      console.error('Submit/Upload error:', error);
      alert('Erro ao processar imagem ou salvar reclamação. Tente novamente.');
      this.isSubmitting.set(false);
      this.isUploading.set(false);
    }
  }

  mapPoints = computed<MapPoint[]>(() => {
    const lat = this.step2Value()?.latitude;
    const lng = this.step2Value()?.longitude;
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
  });
}
