import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

interface ArrowsColors {
    facultad_to_programas_left: string,
    programas_to_planestudio_left: string,
    planestudio_to_table_left: string,

    facultad_to_programas_right: string,
    programas_to_planestudio_right: string,
    planestudio_to_table_right: string,
}

@Injectable({
    providedIn: 'root'
})

export class FormAsignaturasPlancomunService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;

    //vars origen
    cod_facultad_selected_origen: number = 0;
    cod_programa_selected_origen: number = 0;
    cod_planestudio_selected_origen: number = 0;
    
    //vars destino
    cod_facultad_selected_destino: number = 0;
    cod_programa_selected_destino: number = 0;
    cod_planestudio_selected_destino: number = 0;

    //colores para flechas
    arrowsColors: ArrowsColors  = {
        facultad_to_programas_left: 'gray', 
        programas_to_planestudio_left: 'gray',
        planestudio_to_table_left: 'gray',

        facultad_to_programas_right: 'gray', 
        programas_to_planestudio_right: 'gray',
        planestudio_to_table_right: 'gray'
    };

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            cod_facultad_pe: ['', [Validators.required]],
            cod_programa_pe: ['', [Validators.required]],
            cod_plan_estudio: ['', [Validators.required]],

            cod_facultad_pc: ['', [Validators.required]],
            cod_programa_pc: ['', [Validators.required]],
            cod_plan_estudio_plan_comun: ['', [Validators.required]],

            asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        console.log("inicie form asign plan-comun");
        
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            cod_facultad_pe: '',
            cod_programa_pe: '',
            cod_plan_estudio: '',

            cod_facultad_pc: '',
            cod_programa_pc: '',
            cod_plan_estudio_plan_comun: '',

            asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();

        this.fbForm.get('cod_programa_pe')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();

        this.fbForm.get('cod_programa_pc')?.disable();
        this.fbForm.get('cod_plan_estudio_plan_comun')?.disable();
        this.resetArrowsColors();
        console.log("reset form asignaturas plan comun");

    }

    setControlsFormByAgregarPE(dataFromAgregarPE: any){
        this.fbForm.get('cod_facultad_pe')?.patchValue(dataFromAgregarPE.cod_facultad);
        this.fbForm.get('cod_programa_pe')?.patchValue(dataFromAgregarPE.cod_programa);
        this.fbForm.get('cod_plan_estudio')?.patchValue(dataFromAgregarPE.cod_plan_estudio);
        this.fbForm.get('cod_facultad_pe')?.disable();
        this.fbForm.get('cod_programa_pe')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setParamsForm(): Object {
        const cod_facultad_pc = this.fbForm.get('cod_facultad_pc');
        const cod_programa_pc = this.fbForm.get('cod_programa_pc');
        const cod_plan_estudio_plan_comun = this.fbForm.get('cod_plan_estudio_plan_comun');
        let params = {};
        if (cod_facultad_pc?.disabled  &&  cod_programa_pc?.disabled && cod_plan_estudio_plan_comun?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_facultad_pc: this.cod_facultad_selected_destino, 
                cod_programa_pc: this.cod_programa_selected_destino,
                cod_plan_estudio_plan_comun: this.cod_planestudio_selected_destino
            }
        }else{
            params = {...this.fbForm.value}
        }
        return params
    }

    resetValuesVarsSelected(){
        //vars origen
        this.cod_facultad_selected_origen = 0;
        this.cod_programa_selected_origen = 0;
        this.cod_planestudio_selected_origen = 0;
        //vars destino
        this.cod_facultad_selected_destino = 0;
        this.cod_programa_selected_destino = 0;
        this.cod_planestudio_selected_destino = 0;
    }

    setValuesVarsByAgregarPE(dataFromAgregarPE: any){
        this.cod_facultad_selected_origen = dataFromAgregarPE.cod_facultad;
        this.cod_programa_selected_origen = dataFromAgregarPE.cod_programa;
        this.cod_planestudio_selected_origen = dataFromAgregarPE.cod_plan_estudio;
    }

    setForm(mode:'show' | 'edit' ,data: AsignaturasPlancomun): void{
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    //DROPDOWNS ORIGEN
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD ORIGEN
    resetControlsWhenChangedDropdownFacultadOrigen(){
		this.fbForm.get('cod_programa_pe')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignaturas')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadOrigen(){
        this.fbForm.get('cod_programa_pe')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaOrigen(status: boolean){
        const control = this.fbForm.get('cod_programa_pe');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownFacultadOrigen(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            facultad_to_programas_left: 'gray',
            programas_to_planestudio_left: 'gray',
            planestudio_to_table_left: 'gray',
        };
	}

    //FIN FUNCIONES PARA DROPDOWN FACULTAD ORIGEN

    //INICIO FUNCIONES PARA DROPDOWN PROGRAMA ORIGEN
    resetControlWhenChangedDropdownProgramaOrigen(){
		this.fbForm.get('cod_plan_estudio')?.reset();
	}

    disabledControlWhenChangedDropdownProgramaOrigen(){
		this.fbForm.get('cod_plan_estudio')?.disable();
	}

    setStatusControlPlanEstudioOrigen(status: boolean){
        const control = this.fbForm.get('cod_plan_estudio');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownProgramaOrigen(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            programas_to_planestudio_left: 'gray',
            planestudio_to_table_left: 'gray',
        };
	}

    //FIN FUNCIONES PARA DROPDOWN PROGRAMA ORIGEN

    //INICIO FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO ORIGEN
    resetFormWhenChangedDropdownPEOrigen(){
		this.fbForm.patchValue({ asignaturas: '' });
	}
    //FIN FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO ORIGEN


    //DROPDOWNS DESTINO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD DESTINO
    resetControlsWhenChangedDropdownFacultadDestino(){
        this.fbForm.get('cod_programa_pc')?.reset();
        this.fbForm.get('cod_plan_estudio_plan_comun')?.reset();
	}
    
    disabledControlsWhenChangedDropdownFacultadDestino(){
        this.fbForm.get('cod_programa_pc')?.disable();
        this.fbForm.get('cod_plan_estudio_plan_comun')?.disable();
    }

    setStatusControlProgramaDestino(status: boolean){
        const control = this.fbForm.get('cod_programa_pc');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownFacultadDestino(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            facultad_to_programas_right: 'gray',
            programas_to_planestudio_right: 'gray',
            planestudio_to_table_right: 'gray',
        };
	}
    //FIN FUNCIONES PARA DROPDOWN FACULTAD DESTINO

    //INICIO FUNCIONES PARA DROPDOWN PROGRAMA DESTINO
    resetControlWhenChangedDropdownProgramaDestino(){
		this.fbForm.get('cod_plan_estudio_plan_comun')?.reset();
	}

    disabledControlWhenChangedDropdownProgramaDestino(){
		this.fbForm.get('cod_plan_estudio_plan_comun')?.disable();
	}

    setStatusControlPlanEstudioDestino(status: boolean){
        const control = this.fbForm.get('cod_plan_estudio_plan_comun');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownProgramaDestino(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            programas_to_planestudio_right: 'gray',
            planestudio_to_table_right: 'gray',
        };
	}
    //FIN FUNCIONES PARA DROPDOWN PROGRAMA DESTINO

    //INICIO FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO DESTINO

    //FIN FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO DESTINO


    getArrowColor(icon: keyof ArrowsColors): string {
        return this.arrowsColors[icon] || 'gray';
    }

    setArrowColor(icon: keyof ArrowsColors, color: 'red' | 'green'): void {
        if (color === 'red' || color === 'green') {
          this.arrowsColors[icon] = color;
        }
    }

    resetArrowsColors(){
        this.arrowsColors = {
            facultad_to_programas_left: 'gray', 
            programas_to_planestudio_left: 'gray',
            planestudio_to_table_left: 'gray',
    
            facultad_to_programas_right: 'gray', 
            programas_to_planestudio_right: 'gray',
            planestudio_to_table_right: 'gray'
        };
    }

    setAsignatura(event: any){
		this.fbForm.patchValue({ asignaturas: event });
    }

    async setDropdownsAndVars(dataDropdowns: any){
        this.cod_facultad_selected_origen = dataDropdowns.cod_facultad_selected_origen;
        this.cod_programa_selected_origen = dataDropdowns.cod_programa_selected_origen;
        this.cod_planestudio_selected_origen = dataDropdowns.cod_planestudio_selected_origen;

        this.cod_facultad_selected_destino = dataDropdowns.cod_facultad_selected_destino;
        this.cod_programa_selected_destino = dataDropdowns.cod_programa_selected_destino;
        this.cod_planestudio_selected_destino = dataDropdowns.cod_planestudio_selected_destino;
    }

    disableDropdowns(){
		this.fbForm.get('cod_facultad_pc')?.disable();
		this.fbForm.get('cod_programa_pc')?.disable();
		this.fbForm.get('cod_plan_estudio_plan_comun')?.disable();
	}

}