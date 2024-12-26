import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Injectable({
    providedIn: 'root'
})

export class FormArticulacionesService{

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;



    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Cod_Facultad_Postgrado_Selected: ['', [Validators.required]],
            Cod_Programa_Postgrado_Selected: ['', [Validators.required]],
            Cod_Facultad_Selected: ['', [Validators.required]],
            Cod_plan_estudio: ['', [Validators.required]],
            Cod_programa_pregrado: ['', [Validators.required]],
            Descripcion_programa_pregrado: ['', [Validators.required]],
            Asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Cod_Facultad_Postgrado_Selected: '',
            Cod_Facultad_Selected: '',
            Cod_Programa_Postgrado_Selected: '',
            Cod_plan_estudio: '',
            Cod_programa_pregrado: '',
            Descripcion_programa_pregrado: '',
            Asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();
    }

    setForm(mode:'show' | 'edit' ,data: Articulacion): void {
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

}