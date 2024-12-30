import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Injectable({
    providedIn: 'root'
})

export class FormCertifIntermediasPEService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;

    cod_facultad_selected_postgrado: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_planestudio_selected: number = 0;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Cod_Facultad_Postgrado_Selected: ['', [Validators.required]],
            Cod_Programa_Postgrado_Selected: ['', [Validators.required]],
            Cod_plan_estudio: ['', [Validators.required]],
            Cod_CertificacionIntermedia: ['', [Validators.required]],
            Asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Cod_Facultad_Postgrado_Selected: '',
            Cod_Programa_Postgrado_Selected: '',
            Cod_plan_estudio: '',
            Cod_CertificacionIntermedia: '',
            Asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();
    }

    resetValuesVarsSelected(){
        this.cod_facultad_selected_postgrado = 0;
        this.cod_programa_postgrado_selected = 0;
        this.cod_planestudio_selected = 0;
    }

    setForm(mode:'show' | 'edit' ,data: CertificacionIntermediaPE): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    resetFormWhenChangedDropdownFacultad(){
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.reset();
		this.fbForm.get('Cod_plan_estudio')?.reset();
		this.fbForm.patchValue({ Cod_Programa_Postgrado_Selected: '' });
		this.fbForm.patchValue({ Cod_plan_estudio: '' });
		this.fbForm.patchValue({ Cod_CertificacionIntermedia: '' });
		this.fbForm.patchValue({ Asignaturas: '' });
	}

    resetFormWhenChangedDropdownPrograma(){
		this.fbForm.get('Cod_plan_estudio')?.reset();
		this.fbForm.patchValue({ Cod_plan_estudio: '' });
		this.fbForm.patchValue({ Cod_CertificacionIntermedia: '' });
		this.fbForm.patchValue({ Asignaturas: '' });
	}

	resetFormWhenChangedDropdownPE(){
		this.fbForm.patchValue({ Asignaturas: '' });
	}

    setValuesVarsByAgregarPE(dataFromAgregarPE: any){
        this.cod_facultad_selected_postgrado = dataFromAgregarPE.cod_facultad;
        this.cod_programa_postgrado_selected = dataFromAgregarPE.cod_programa;
        this.cod_planestudio_selected = dataFromAgregarPE.cod_plan_estudio;
    }

    setControlsFormByAgregarPE(dataFromAgregarPE: any){
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.patchValue(dataFromAgregarPE.cod_facultad);
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.patchValue(dataFromAgregarPE.cod_programa);
        this.fbForm.get('Cod_plan_estudio')?.patchValue(dataFromAgregarPE.cod_plan_estudio);
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.disable();
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
        this.fbForm.get('Cod_plan_estudio')?.disable();
    }

}