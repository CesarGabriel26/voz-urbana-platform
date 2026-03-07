import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { FormInputComponent } from '../form-input/form-input.component';
import { FormSelectComponent, SelectOption } from '../form-select/form-select.component';

@Component({
  selector: 'app-form-demo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormInputComponent, FormSelectComponent],
  templateUrl: './form-demo.component.html',
  styleUrl: './form-demo.component.scss'
})
export class FormDemoComponent implements OnInit {
  demoForm!: FormGroup;

  categoryOptions: SelectOption[] = [
    { label: 'Problema de Infraestrutura', value: 'infrastructure', icon: 'construction' },
    { label: 'Iluminação Pública', value: 'lighting', icon: 'lightbulb' },
    { label: 'Limpeza Urbana', value: 'cleaning', icon: 'delete' },
    { label: 'Segurança', value: 'security', icon: 'security' },
    { label: 'Transporte Público', value: 'transport', icon: 'directions_bus' },
    { label: 'Outros', value: 'others', icon: 'more_horiz' },
  ];

  typeOptions: SelectOption[] = [
    { label: 'Denúncia', value: 'report' },
    { label: 'Sugestão', value: 'suggestion' },
    { label: 'Elogio', value: 'compliment' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.demoForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern('^[0-9]*$')]],
      category: [null, [Validators.required]],
      type: ['report'],
      description: ['', [Validators.required, Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.demoForm.valid) {
      console.log('Formulário enviado com sucesso!', this.demoForm.value);
      alert('Formulário enviado com sucesso! Verifique o console.');
    } else {
      this.demoForm.markAllAsTouched();
    }
  }

  getControl(name: string) {
    return this.demoForm.get(name);
  }
}
