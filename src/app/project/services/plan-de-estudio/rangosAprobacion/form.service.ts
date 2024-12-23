import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RangosAG } from 'src/app/project/models/plan-de-estudio/RangosAG';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
  providedIn: 'root'
})
export class FormRangosAGService {

  public fbForm!: FormGroup;
      modeForm: ModeForm = undefined;
      stateForm: StateValidatorForm = undefined;
  
      constructor(private fb: FormBuilder) {}
  
      async initForm(): Promise<boolean> {
        this.fbForm = this.fb.group(
          {
            Descripcion_RangoAprobG: [
              '',
              [Validators.required, GPValidator.regexPattern('num_y_letras')],
            ],
            NotaMinima: [
              '4.0',
              [
                Validators.required,
                GPValidator.decimalValidator(), // Validador para decimales
                GPValidator.minValueValidator(4.0), // Validador para mínimo 4.0
                GPValidator.decimalValidator()
              ],
            ],
            NotaMaxima: [
              '7.0',
              [
                Validators.required,
                GPValidator.decimalValidator(), // Validador para decimales
                GPValidator.maxValueValidator(7.0), // Validador para máximo 7.0
                GPValidator.decimalValidator()
              ],
            ],
            RexeReglamentoEstudio: [
              '',
              [Validators.required, GPValidator.regexPattern('num_y_letras')],
            ],
            aux: [''],
          },
          {
            validators: GPValidator.minMaxValidator('NotaMinima', 'NotaMaxima'),
          }
        );
      
        return true;
      }
      
      
      
      

      resetForm(): void {
        this.fbForm.reset({
          Descripcion_RangoAprobG: '',
          NotaMinima: '',
          NotaMaxima: '',
          RexeReglamentoEstudio: '',
          aux: ''
        });
        this.fbForm.enable();
    }

    setForm(mode: 'show' | 'edit', data: RangosAG): void {
      this.fbForm.patchValue({ ...data });
      if (mode === 'show') {
          this.fbForm.disable();
      }
      if (mode === 'edit') {
          this.fbForm.patchValue({ aux: data });
      }
  }
}
