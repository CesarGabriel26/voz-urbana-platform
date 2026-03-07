import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef, OnInit, OnDestroy } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'm-form-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './form-input.component.html',
  styleUrl: './form-input.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FormInputComponent),
      multi: true,
    },
  ],
})
export class FormInputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
  @Input() icon?: string;
  @Input() disabled: boolean = false;
  private statusSub: any;
  private valueSub: any;

  value: any = '';
  isFocused: boolean = false;

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

  handleInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    
    // Also update control directly if passed as Input
    if (this.control) {
      this.control.setValue(this.value, { emitEvent: true });
    }
  }

  handleFocus(): void {
    this.isFocused = true;
  }

  handleBlur(): void {
    this.isFocused = false;
    this.onTouched();
  }

  get showErrors(): boolean {
    return this.control && this.control.invalid && (this.control.dirty || this.control.touched);
  }

  get errorMessage(): string {
    if (!this.control || !this.control.errors) return '';

    if (this.control.errors['required']) return 'Este campo é obrigatório';
    if (this.control.errors['email']) return 'E-mail inválido';
    if (this.control.errors['minlength'])
      return `Mínimo de ${this.control.errors['minlength'].requiredLength} caracteres`;
    if (this.control.errors['maxlength'])
      return `Máximo de ${this.control.errors['maxlength'].requiredLength} caracteres`;
    if (this.control.errors['pattern']) return 'Formato inválido';
    if (this.control.errors['mismatch']) return 'As senhas não coincidem';

    return 'Valor inválido';
  }
}
