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
        console.log("inicie form");
        
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
        console.log("reset form");

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