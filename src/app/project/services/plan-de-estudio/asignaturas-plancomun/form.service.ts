import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Injectable({
    providedIn: 'root'
})

export class FormAsignaturasPlancomunService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;

    //vars origen
    cod_facultad_selected_origen: number = 0;
    cod_programa_origen: number = 0;
    cod_planestudio_selected: number = 0;
    
    //vars destino
    cod_facultad_selected_destino: number = 0;
    cod_programa_destno: number = 0;
    

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Cod_Facultad_Postgrado_Selected_Origen: ['', [Validators.required]],
            Cod_Programa_Postgrado_Selected_Origen: ['', [Validators.required]],
            Cod_plan_estudio_Origen: ['', [Validators.required]],

            Cod_Facultad_Postgrado_Selected_Destino: ['', [Validators.required]],
            Cod_Programa_Postgrado_Selected_Destino: ['', [Validators.required]],
            Cod_plan_estudio_Destino: ['', [Validators.required]],

            Asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        console.log("inicie form asign plan-comun");
        
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Cod_Facultad_Postgrado_Selected_Origen: '',
            Cod_Programa_Postgrado_Selected_Origen: '',
            Cod_plan_estudio_Origen: '',

            Cod_Facultad_Postgrado_Selected_Destino: '',
            Cod_Programa_Postgrado_Selected_Destino: '',
            Cod_plan_estudio_Destino: '',

            Asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();

        this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen')?.disable();
		this.fbForm.get('Cod_plan_estudio_Origen')?.disable();

        this.fbForm.get('Cod_Facultad_Postgrado_Selected_Destino')?.disable();
        this.fbForm.get('Cod_Programa_Postgrado_Selected_Destino')?.disable();
        this.fbForm.get('Cod_plan_estudio_Destino')?.disable();
        console.log("reset form asignaturas plan comun");

    }

    setControlsFormByAgregarPE(dataFromAgregarPE: any){
        this.fbForm.get('Cod_Facultad_Postgrado_Selected_Origen')?.patchValue(dataFromAgregarPE.cod_facultad);
        this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen')?.patchValue(dataFromAgregarPE.cod_programa);
        this.fbForm.get('Cod_plan_estudio_Origen')?.patchValue(dataFromAgregarPE.cod_plan_estudio);
        this.fbForm.get('Cod_Facultad_Postgrado_Selected_Origen')?.disable();
        this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen')?.disable();
        this.fbForm.get('Cod_plan_estudio_Origen')?.disable();
    }

    setParamsForm(): Object {
        const cod_facultad_postgrado_origen = this.fbForm.get('Cod_Facultad_Postgrado_Selected_Origen');
        const cod_programa_postgrado_origen = this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen');
        const cod_plan_estudio_origen = this.fbForm.get('Cod_plan_estudio_Origen');
        let params = {};
        if (cod_facultad_postgrado_origen?.disabled  &&  cod_programa_postgrado_origen?.disabled && cod_plan_estudio_origen?.disabled) {
            params = {
                ...this.fbForm.value,
                Cod_Facultad_Postgrado_Selected_Origen: this.cod_facultad_selected_origen, 
                Cod_Programa_Postgrado_Selected_Origen: this.cod_programa_origen,
                Cod_plan_estudio_Origen: this.cod_planestudio_selected,
            }
        }else{
            params = {...this.fbForm.value}
        }
        return params
    }

    resetValuesVarsSelected(){
        //vars origen
        this.cod_facultad_selected_origen = 0;
        this.cod_programa_origen = 0;
        this.cod_planestudio_selected = 0;
        //vars destino
        this.cod_facultad_selected_destino = 0;
        this.cod_programa_destno = 0;
    }

    setValuesVarsByAgregarPE(dataFromAgregarPE: any){
        this.cod_facultad_selected_origen = dataFromAgregarPE.cod_facultad;
        this.cod_programa_origen = dataFromAgregarPE.cod_programa;
        this.cod_planestudio_selected = dataFromAgregarPE.cod_plan_estudio;
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

    resetControlsWhenChangedDropdownFacultadOrigen(){
		this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen')?.reset();
		this.fbForm.get('Cod_plan_estudio_Origen')?.reset();
		this.fbForm.get('Asignaturas')?.reset();
	}

    resetControlsWhenChangedDropdownFacultadDestino(){
        this.fbForm.get('Cod_Programa_Postgrado_Selected_Destino')?.reset();
        this.fbForm.get('Cod_plan_estudio_Destino')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadOrigen(){
        this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen')?.disable();
		this.fbForm.get('Cod_plan_estudio_Origen')?.disable();
    }

    disabledControlsWhenChangedDropdownFacultadDestino(){
        this.fbForm.get('Cod_Programa_Postgrado_Selected_Destino')?.disable();
        this.fbForm.get('Cod_plan_estudio_Destino')?.disable();
    }

    resetControlWhenChangedDropdownProgramaOrigen(){
		this.fbForm.get('Cod_plan_estudio_Origen')?.reset();
	}

    disabledControlWhenChangedDropdownProgramaOrigen(){
		this.fbForm.get('Cod_plan_estudio_Origen')?.disable();
	}

    resetControlWhenChangedDropdownProgramaDestino(){
		this.fbForm.get('Cod_plan_estudio_Destino')?.reset();
	}

    disabledControlWhenChangedDropdownProgramaDestino(){
		this.fbForm.get('Cod_plan_estudio_Destino')?.disable();
	}



    resetFormWhenChangedDropdownPEOrigen(){
		this.fbForm.patchValue({ Asignaturas: '' });
	}

    setStatusControlFacultadOrigen(status: boolean){
        const control = this.fbForm.get('Cod_Facultad_Postgrado_Selected_Origen');
        status ? control?.enable() : control?.disable()
    }

    setStatusControlProgramaOrigen(status: boolean){
        const control = this.fbForm.get('Cod_Programa_Postgrado_Selected_Origen');
        status ? control?.enable() : control?.disable()
    }

    setStatusControlPlanEstudioOrigen(status: boolean){
        const control = this.fbForm.get('Cod_plan_estudio_Origen');
        status ? control?.enable() : control?.disable()
    }

    setStatusControlFacultadDestino(status: boolean){
        const control = this.fbForm.get('Cod_Facultad_Postgrado_Selected_Destino');
        status ? control?.enable() : control?.disable()
    }

    setStatusControlProgramaDestino(status: boolean){
        const control = this.fbForm.get('Cod_Programa_Postgrado_Selected_Destino');
        status ? control?.enable() : control?.disable()
    }

    setStatusControlPlanEstudioDestino(status: boolean){
        const control = this.fbForm.get('Cod_plan_estudio_Destino');
        status ? control?.enable() : control?.disable()
    }

}