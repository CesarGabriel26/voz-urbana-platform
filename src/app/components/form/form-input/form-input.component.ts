import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'app-form-input',
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

  value: any = '';
  isFocused: boolean = false;
  disabled: boolean = false;

  onChange: any = () => { };
  onTouched: any = () => { };

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
