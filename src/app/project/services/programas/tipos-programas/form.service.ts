import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormTiposProgramasService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Descripcion_tp: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
            Categoria: this.fb.group({
              Cod_CategoriaTP: ['', [Validators.required]],
              Descripcion_categoria: [''],
            }),
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Descripcion_tp: '',
            Categoria: {
                Cod_CategoriaTP: '',
                Descripcion_categoria: '',
            },
            aux: ''
        });
        this.fbForm.enable();
    }

    setForm(mode:'show' | 'edit' ,data: TipoPrograma): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }


}