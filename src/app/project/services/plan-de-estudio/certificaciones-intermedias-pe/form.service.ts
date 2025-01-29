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
            cod_plan_estudio: ['', [Validators.required]],
            cod_certif_intermedia: ['', [Validators.required]],
            asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Cod_Facultad_Postgrado_Selected: '',
            Cod_Programa_Postgrado_Selected: '',
            cod_plan_estudio: '',
            cod_certif_intermedia: '',
            asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
        this.resetValuesVarsSelected();
        console.log("resetee form certif intermedia pe");
    }

    resetValuesVarsSelected(){
        this.cod_facultad_selected_postgrado = 0;
        this.cod_programa_postgrado_selected = 0;
        this.cod_planestudio_selected = 0;
    }

    setForm(mode:'show' | 'edit' ,data: CertificacionIntermediaPE): void {
        console.log("data--->",data);
        
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    //DROPDOWNS POSTGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
    resetControlsWhenChangedDropdownFacultadPostgrado(){
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPostgrado(){
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaPostgrado(status: boolean){
        const control = this.fbForm.get('Cod_Programa_Postgrado_Selected');
        status ? control?.enable() : control?.disable()
    }
    //FIN FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 

    //INICIO FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO
    resetControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('cod_plan_estudio')?.reset();
	}

    disabledControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlPlanEstudioPostgrado(status: boolean){
        const control = this.fbForm.get('cod_plan_estudio');
        status ? control?.enable() : control?.disable()
    }
    //FIN FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO

	resetFormWhenChangedDropdownPE(){
		this.fbForm.patchValue({ asignaturas: '' });
	}

    setValuesVarsByAgregarPE(dataFromAgregarPE: any){
        this.cod_facultad_selected_postgrado = dataFromAgregarPE.cod_facultad;
        this.cod_programa_postgrado_selected = dataFromAgregarPE.cod_programa;
        this.cod_planestudio_selected = dataFromAgregarPE.cod_plan_estudio;
    }

    setControlsFormByAgregarPE(dataFromAgregarPE: any){
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.patchValue(dataFromAgregarPE.cod_facultad);
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.patchValue(dataFromAgregarPE.cod_programa);
        this.fbForm.get('cod_plan_estudio')?.patchValue(dataFromAgregarPE.cod_plan_estudio);
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.disable();
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
    }

    async setDropdownsAndVars(dataDropdowns: any){
        console.log("dataDropdowns",dataDropdowns);
		this.cod_facultad_selected_postgrado = dataDropdowns.cod_facultad_selected_notform;
		this.cod_programa_postgrado_selected = dataDropdowns.cod_programa_postgrado_selected_notform;
		this.cod_planestudio_selected = dataDropdowns.cod_plan_estudio_selected_notform;
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.patchValue(dataDropdowns.cod_facultad_selected_notform);
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.patchValue(dataDropdowns.cod_programa_postgrado_selected_notform);
        this.fbForm.get('cod_plan_estudio')?.patchValue(dataDropdowns.cod_plan_estudio_selected_notform);
	}

	disableDropdowns(){
		this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.disable();
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
	}

    setCertificacionIntermedia(event: any){
        this.fbForm.patchValue({ cod_certif_intermedia: event });
    }

    setAsignatura(event: any){
		this.fbForm.patchValue({ asignaturas: event });
    }

}