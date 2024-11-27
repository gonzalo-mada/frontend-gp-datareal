import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CategoriaTp } from 'src/app/project/models/programas/CategoriaTp';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormCategoriasTpService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Descripcion_categoria: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Descripcion_categoria: '',
            aux: ''
          });
        this.fbForm.enable();
    }

    setForm(mode:'show' | 'edit' ,data: CategoriaTp): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }


}