import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ValidatorsUtils {
  static cpf(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const cpf = control.value ? control.value.replace(/[^\d]/g, '') : '';
      
      if (!cpf) return null;
      if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return { cpf: true };

      const values = cpf.split('').map((el: string) => +el);
      const rest = (count: number) => {
        return (values.slice(0, count - 12).reduce((soma: number, el: number, index: number) => (soma + el * (count - index)), 0) * 10) % 11 % 10;
      };

      if (rest(10) !== values[9] || rest(11) !== values[10]) return { cpf: true };
      
      return null;
    };
  }
}
