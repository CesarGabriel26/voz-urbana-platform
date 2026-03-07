import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormInputComponent } from '../../components/form/form-input/form-input.component';
import { StepsComponent } from '../../components/steps/steps.component';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signup-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, StepsComponent, RouterLink],
  templateUrl: './signup-page.component.html',
  styleUrl: './signup-page.component.scss'
})
export class SignupPage {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private authService = inject(AuthService);
  private router = inject(Router);

  currentStep = 0;
  steps = ['Identificação', 'Contato', 'Segurança'];

  identityForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    cpf: ['', [Validators.required, Validators.pattern(/^\d{3}\.\d{3}\.\d{3}-\d{2}$|^\d{11}$/)]],
    birthDate: ['', [Validators.required]]
  });

  contactForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.pattern(/^\d{10,11}$/)]]
  });

  securityForm: FormGroup = this.fb.group({
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.pattern(/^(?=.*[0-9])(?=.*[#Ç&%$!@._-]).{8,}$/)
    ]],
    confirmPassword: ['', [Validators.required]]
  }, { validators: this.passwordMatchValidator });

  get passwordStrength(): number {
    const password = this.securityForm.get('password')?.value || '';
    if (!password) return 0;

    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[#Ç&%$!@._-]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;

    return strength;
  }

  get passwordStrengthText(): string {
    const strength = this.passwordStrength;
    if (strength === 0) return '';
    if (strength <= 1) return 'Fraca';
    if (strength <= 2) return 'Média';
    if (strength <= 3) return 'Forte';
    return 'Muito Forte';
  }

  get passwordStrengthColor(): string {
    const strength = this.passwordStrength;
    if (strength <= 1) return '#ff4d4f'; // Red
    if (strength <= 2) return '#faad14'; // Orange
    if (strength <= 3) return '#52c41a'; // Green
    return '#13c2c2'; // Cyan/Strongest
  }

  passwordMatchValidator(g: FormGroup) {
    const password = g.get('password')?.value;
    const confirmPassword = g.get('confirmPassword');

    if (password !== confirmPassword?.value) {
      confirmPassword?.setErrors({ mismatch: true });
      return { mismatch: true };
    }

    // If they match, we need to clear the mismatch error 
    // but keep other errors if they exist (like required)
    const errors = confirmPassword?.errors;
    if (errors) {
      delete errors['mismatch'];
      confirmPassword?.setErrors(Object.keys(errors).length > 0 ? errors : null);
    }

    return null;
  }

  nextStep(): void {
    if (this.isStepValid()) {
      this.currentStep++;
    } else {
      this.markStepAsTouched();
    }
  }

  prevStep(): void {
    if (this.currentStep > 0) {
      this.currentStep--;
    }
  }

  isStepValid(): boolean {
    switch (this.currentStep) {
      case 0: return this.identityForm.valid;
      case 1: return this.contactForm.valid;
      case 2: return this.securityForm.valid;
      default: return false;
    }
  }

  markStepAsTouched(): void {
    switch (this.currentStep) {
      case 0: this.identityForm.markAllAsTouched(); break;
      case 1: this.contactForm.markAllAsTouched(); break;
      case 2: this.securityForm.markAllAsTouched(); break;
    }
  }

  onSubmit(): void {
    if (this.identityForm.valid && this.contactForm.valid && this.securityForm.valid) {
      const signupData = {
        ...this.identityForm.value,
        ...this.contactForm.value,
        ...this.securityForm.value
      };
      
      this.userService.create(signupData).subscribe({
        next: () => {
          this.authService.login({ 
            cpf: signupData.cpf, 
            password: signupData.password 
          });
          this.router.navigate(['/']);
        },
        error: (err) => console.error('Signup error:', err)
      });
    } else {
      this.markStepAsTouched();
    }
  }
}
