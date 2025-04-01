import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from 'primeng/api';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { PrincipalControls } from 'src/app/project/models/shared/PrincipalControls';
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
    dataExternal: DataExternal = {data: false};

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

    messagePE: Message[] = [
        {
            severity: 'info',
            detail: `
                    Se cargan solo planes de estudios que cuentan con la opción de <b> ¿Comparte asign. con plan común? </b> habilitada.
                    Si el plan de estudio que desea seleccionar no aparece en la lista, diríjase al Mantenedor de plan de estudio, habilite la opción y actualice el plan de estudio.
                    `,
            data: 'Se cargan solo planes de estudios que cuentan con la opción de ¿Comparte asign. con plan común? habilitada.'
        },

    ];
    tooltipContent: string = this.messagePE[0].data;
    messagePC: Message[] = [
        {
            severity: 'info',
            detail: `
                    Se cargan solo planes de estudios que cuentan con la opción de <b> ¿Comparte asign. con plan común? </b> inhabilitada.
                    Si el plan de estudio que desea seleccionar no aparece en la lista, diríjase al Mantenedor de plan de estudio, inhabilite la opción y actualice el plan de estudio.
                    `,
            data: 'Se cargan solo planes de estudios que cuentan con la opción de ¿Comparte asign. con plan común? inhabilitada.'
        }
    ];
    tooltipContent2: string = this.messagePC[0].data;
    
    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            cod_facultad: ['', [Validators.required]],
            cod_programa: ['', [Validators.required]],
            cod_plan_estudio: ['', [Validators.required]],

            cod_facultad_pc: ['', [Validators.required]],
            cod_programa_pc: ['', [Validators.required]],
            cod_plan_estudio_plan_comun: ['', [Validators.required]],
            nombre_plan_comun_completo: [''],

            asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        console.log("inicie form asign plan-comun");
        
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            cod_facultad: '',
            cod_programa: '',
            cod_plan_estudio: '',

            cod_facultad_pc: '',
            cod_programa_pc: '',
            cod_plan_estudio_plan_comun: '',

            asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();

        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();

        this.fbForm.get('cod_programa_pc')?.disable();
        this.fbForm.get('cod_plan_estudio_plan_comun')?.disable();
        this.resetArrowsColors();
        console.log("reset form asignaturas plan comun");

    }

    async setForm(mode:'show' | 'edit' ,data: AsignaturasPlancomun){
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
            this.setDisabledAllControls();
        }
        await this.setVarsForm(data.cod_facultad!, data.cod_programa!, data.cod_plan_estudio!, data.cod_facultad_pc!, data.cod_programa_pc!, data.cod_plan_estudio_plan_comun!)
    }

    setParamsForm(): Object {
        const cod_facultad = this.fbForm.get('cod_facultad');
        const cod_programa = this.fbForm.get('cod_programa');
        const cod_plan_estudio = this.fbForm.get('cod_plan_estudio');
        let params = {};
        if (cod_facultad?.disabled  &&  cod_programa?.disabled && cod_plan_estudio?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_facultad: this.cod_facultad_selected_origen, 
                cod_programa: this.cod_programa_selected_origen,
                cod_plan_estudio: this.cod_planestudio_selected_origen
            }
        }else{
            params = {...this.fbForm.value}
        }
        return params
    }

    async getDataPrincipalControls(): Promise<PrincipalControls> {
        const cod_facultad = this.fbForm.get('cod_facultad');
        const cod_programa = this.fbForm.get('cod_programa');
        const cod_plan_estudio = this.fbForm.get('cod_plan_estudio');
        const cod_facultad_pc = this.fbForm.get('cod_facultad_pc');
        const cod_programa_pc = this.fbForm.get('cod_programa_pc');
        const cod_plan_estudio_plan_comun = this.fbForm.get('cod_plan_estudio_plan_comun');
        let dataToLog: PrincipalControls = {};
        if (cod_facultad?.disabled && cod_programa?.disabled && cod_plan_estudio?.disabled && cod_facultad_pc?.disabled && cod_programa_pc?.disabled && cod_plan_estudio_plan_comun?.disabled ) {
            dataToLog = {
                cod_facultad: this.cod_facultad_selected_origen, 
                cod_programa: this.cod_programa_selected_origen,
                cod_plan_estudio: this.cod_planestudio_selected_origen,
                cod_facultad_pc: this.cod_facultad_selected_destino,
                cod_programa_pc: this.cod_programa_selected_destino,
                cod_plan_estudio_plan_comun: this.cod_planestudio_selected_destino,
            }
        }else{
            dataToLog = {
                cod_facultad: cod_facultad!.value, 
                cod_programa: cod_programa!.value,
                cod_plan_estudio: cod_plan_estudio!.value,
                cod_facultad_pc: cod_facultad_pc!.value,
                cod_programa_pc: cod_programa_pc!.value,
                cod_plan_estudio_plan_comun: cod_plan_estudio_plan_comun!.value,
            }
        }
        return dataToLog
    }

    setDataExternal(dataExternal: DataExternal){
        this.dataExternal = {...dataExternal};
    }

    setValuesVarsByDataExternal(){
        this.cod_facultad_selected_origen = this.dataExternal.cod_facultad!;
        this.cod_programa_selected_origen = this.dataExternal.cod_programa!;
        this.cod_planestudio_selected_origen = this.dataExternal.cod_plan_estudio!;
    }

    setControlsFormByDataExternal(){
        this.fbForm.get('cod_facultad')?.patchValue(this.dataExternal.cod_facultad);
        this.fbForm.get('cod_programa')?.patchValue(this.dataExternal.cod_programa);
        this.fbForm.get('cod_plan_estudio')?.patchValue(this.dataExternal.cod_plan_estudio);
        this.setDisabledPrincipalControls();
    }

    setDisabledPrincipalControls(){
        this.fbForm.get('cod_facultad')?.disable();
        this.fbForm.get('cod_programa')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setDisabledAllControls(){
        this.fbForm.get('cod_facultad')?.disable();
        this.fbForm.get('cod_programa')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
        this.fbForm.get('cod_facultad_pc')?.disable();
        this.fbForm.get('cod_programa_pc')?.disable();
        this.fbForm.get('cod_plan_estudio_plan_comun')?.disable();
    }

    async setVarsForm(cod_facultad: number, cod_programa: number, cod_plan_estudio: number, cod_facultad_pc: number, cod_programa_pc: number, cod_plan_estudio_pc: number){
        this.cod_facultad_selected_origen = cod_facultad;
        this.cod_programa_selected_origen = cod_programa;
        this.cod_planestudio_selected_origen = cod_plan_estudio;
        this.cod_facultad_selected_destino = cod_facultad_pc;
        this.cod_programa_selected_destino = cod_programa_pc;
        this.cod_planestudio_selected_destino = cod_plan_estudio_pc;
    }

    //DROPDOWNS ORIGEN
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD ORIGEN
    resetControlsWhenChangedDropdownFacultadOrigen(){
		this.fbForm.get('cod_programa')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignaturas')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadOrigen(){
        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaOrigen(status: boolean){
        const control = this.fbForm.get('cod_programa');
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

}