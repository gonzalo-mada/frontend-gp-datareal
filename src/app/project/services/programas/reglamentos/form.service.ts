import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormReglamentosService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;

    constructor(private fb: FormBuilder){}

    initForm(): Promise<boolean>{
        return new Promise((success) => {
          this.fbForm = this.fb.group({
            Descripcion_regla: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            anio: ['', Validators.required],
            vigencia: [false],
            files: [[], GPValidator.filesValidator('files',() => this.modeForm)], 
            aux: ['']
          });
          success(true)
        })
    }

    resetForm(): void {
        this.fbForm.reset({
            Descripcion_regla: '',
            anio: '',
            vigencia: false,
            files: [],
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('files')?.updateValueAndValidity();
    }

    setForm(mode:'show' | 'edit' ,data: Reglamento): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ files });
        this.fbForm.controls['files'].updateValueAndValidity();
    }
}