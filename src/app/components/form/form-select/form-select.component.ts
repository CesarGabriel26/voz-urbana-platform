import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, forwardRef, ElementRef, HostListener, ViewChild, OnInit, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

export interface SelectOption {
  label: string;
  value: any;
  icon?: string;
}

@Component({
  selector: 'm-form-select',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './form-select.component.html',
  styleUrl: './form-select.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormSelectComponent),
      multi: true,
    },
  ],
})
export class FormSelectComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() options: SelectOption[] = [];
  @Input() control!: FormControl;
  @Input() placeholder: string = 'Selecione uma opção';
  @Input() icon?: string;
  @Input() disabled: boolean = false;
  @Output() valueChange = new EventEmitter<any>();
  private statusSub: any;
  private valueSub: any;

  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;

  value: any = null;
  isOpen: boolean = false;
  searchTerm: string = '';

  onChange: any = () => { };
  onTouched: any = () => { };

  ngOnInit(): void {
    if (this.control) {
      this.value = this.control.value;
      this.disabled = this.control.disabled;

      this.valueSub = this.control.valueChanges.subscribe(val => {
        this.value = val;
      });

      this.statusSub = this.control.statusChanges.subscribe(() => {
        this.disabled = this.control.disabled;
      });
    }
  }

  ngOnDestroy(): void {
    if (this.valueSub) this.valueSub.unsubscribe();
    if (this.statusSub) this.statusSub.unsubscribe();
  }

  constructor(private elementRef: ElementRef) { }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.close();
    }
  }

  writeValue(value: any): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  toggleDropdown(): void {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.searchTerm = '';
      setTimeout(() => this.searchInput.nativeElement.focus(), 0);
    }
  }

  close(): void {
    this.isOpen = false;
    this.onTouched();
  }

  selectOption(option: SelectOption): void {
    this.value = option.value;
    this.onChange(this.value);

    if (this.control) {
      this.control.setValue(this.value, { emitEvent: true });
    }

    this.close();
    this.valueChange.emit(this.value);
  }

  get selectedLabel(): string {
    const selected = this.options.find((o) => o.value === this.value);
    return selected ? selected.label : '';
  }

  get filteredOptions(): SelectOption[] {
    if (!this.searchTerm) return this.options;
    return this.options.filter((o) =>
      o.label.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  get showErrors(): boolean {
    return this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string {
    if (!this.control || !this.control.errors) return '';
    if (this.control.errors['required']) return 'Este campo é obrigatório';
    return 'Valor inválido';
  }
}
