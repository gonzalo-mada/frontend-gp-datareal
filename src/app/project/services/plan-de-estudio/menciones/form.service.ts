import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
  providedIn: 'root'
})
export class FormMencionesService {

  public fbForm!: FormGroup;
      modeForm: ModeForm = undefined;
      stateForm: StateValidatorForm = undefined;
  
      constructor(private fb: FormBuilder){}

      initForm(): Promise<boolean>{
        return new Promise((success) => {
          this.fbForm = this.fb.group({
            Nombre_mencion: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            Descripcion_mencion: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            Mencion_rexe: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            Fecha_creacion: ['', Validators.required],
            Vigencia: [false],
            files: [[], GPValidator.filesValidator('files',() => this.modeForm)], 
            aux: ['']
          });
          success(true)
        })
    }

    resetForm(): void {
        this.fbForm.reset({
            Nombre_mencion: '',
            Descripcion_mencion: '',
            Mencion_rexe: '',
            Fecha_creacion: '',
            Vigencia: false,
            files: [],
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('files')?.updateValueAndValidity();
    }

    //llamar uploader

    setForm(mode:'show' | 'edit' ,data: Mencion): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }

        //const respondeUploader agregar
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ files });
        this.fbForm.controls['files'].updateValueAndValidity();
    }
}
