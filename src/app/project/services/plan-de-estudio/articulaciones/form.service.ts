import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { PrincipalControls } from 'src/app/project/models/shared/PrincipalControls';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

interface ArrowsColors {
    facultad_to_programas_left?: string,
    programas_to_planestudio_left?: string,
    planestudio_to_table_left?: string,

    facultad_to_programas_right?: string,
    programas_to_asignaturas_right?: string,
    asignaturas_to_table_right?: string,
}

@Injectable({
    providedIn: 'root'
})

export class FormArticulacionesService{

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    dataExternal: DataExternal = {data: false};

    cod_facultad_selected_postgrado: number = 0;
    cod_programa_selected_postgrado: number = 0;
    cod_plan_estudio_selected: number = 0;
    cod_facultad_selected_pregrado: number = 0;
    cod_programa_selected_pregrado: number = 0;
    nombre_programa_selected_pregrado: string = '';

    //colores para flechas
    arrowsColors: ArrowsColors  = {
        facultad_to_programas_left: 'gray', 
        programas_to_planestudio_left: 'gray',
        planestudio_to_table_left: 'gray',

        facultad_to_programas_right: 'gray', 
        programas_to_asignaturas_right: 'gray',
        asignaturas_to_table_right: 'gray'
    };

    openedFromMantenedorAsignatura: boolean = false
    asignaturaHaveTemas: boolean = false

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            cod_facultad: [''],
            cod_programa: [''],
            cod_plan_estudio: [''],
            asignatura_postgrado: ['', [Validators.required]],

            cod_facultad_pregrado: [''],
            cod_programa_pregrado: [''],
            data_programa_pregrado: [''], //para obtener codPrograma y nombreCarrera
            asignaturas_pregrado_dropdown: [''],

            asignaturas_articuladas_selected: ['', [Validators.required]],
            aux: ['']
        });
        console.log("inicie form articulaciones");
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            cod_facultad: '',
            cod_programa: '',
            cod_plan_estudio: '',
            asignatura_postgrado: '',

            cod_facultad_pregrado: '',
            cod_programa_pregrado: '',
            data_programa_pregrado: '',
            asignaturas_pregrado_dropdown: '',
            asignaturas_articuladas_selected: '',
            aux: ''
        });

        this.fbForm.enable();
        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();

        this.fbForm.get('cod_programa_pregrado')?.disable();
        this.fbForm.get('asignaturas_pregrado_dropdown')?.disable();

        this.resetArrowsColors();
        this.resetVarsMantenedorAsignatura();
        console.log("resetee form articulaciones");
        
    }

    resetValuesVarsSelected(){
        if (!this.dataExternal.data){
            this.cod_facultad_selected_postgrado= 0;
            this.cod_programa_selected_postgrado= 0;
            this.cod_plan_estudio_selected= 0;
            this.cod_facultad_selected_pregrado= 0;
            this.cod_programa_selected_pregrado= 0;
            this.nombre_programa_selected_pregrado= '';
            console.log("resetee vars selected de form-articulaciones");
        }
    }

    resetVarsMantenedorAsignatura(){
        this.openedFromMantenedorAsignatura = false; 
        this.asignaturaHaveTemas = false;
    }


    async setForm(mode:'show' | 'edit' ,data: Articulacion) {
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
            // this.setDisabledPrincipalControls();
        }
        await this.setVarsForm(data.cod_facultad!, data.cod_programa!, data.cod_plan_estudio!)
        
    }

    setParamsForm(): Object {
        const cod_facultad = this.fbForm.get('cod_facultad');
        const cod_programa = this.fbForm.get('cod_programa');
        const cod_plan_estudio = this.fbForm.get('cod_plan_estudio');
        let params = {};
        if (cod_facultad?.disabled  &&  cod_programa?.disabled && cod_plan_estudio?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_facultad: this.cod_facultad_selected_postgrado, 
                cod_programa: this.cod_programa_selected_postgrado,
                cod_plan_estudio: this.cod_plan_estudio_selected,
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
        let dataToLog: PrincipalControls = {};
        if (cod_facultad?.disabled  &&  cod_programa?.disabled && cod_plan_estudio?.disabled) {
            dataToLog = {
                cod_facultad: this.cod_facultad_selected_postgrado, 
                cod_programa: this.cod_programa_selected_postgrado,
                cod_plan_estudio: this.cod_plan_estudio_selected,
            }
        }else{
            dataToLog = {
                cod_facultad: cod_facultad!.value, 
                cod_programa: cod_programa!.value,
                cod_plan_estudio: cod_plan_estudio!.value
            }
        }
        return dataToLog
    }

    setDataExternal(dataExternal: DataExternal){
        this.dataExternal = {...dataExternal};
    }

    setValuesVarsByDataExternal(){
        this.cod_facultad_selected_postgrado = this.dataExternal.cod_facultad!;
        this.cod_programa_selected_postgrado = this.dataExternal.cod_programa!;
        this.cod_plan_estudio_selected = this.dataExternal.cod_plan_estudio!;
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

    async setVarsForm(cod_facultad: number, cod_programa: number, cod_plan_estudio: number){
        this.cod_facultad_selected_postgrado = cod_facultad;
        this.cod_programa_selected_postgrado = cod_programa;
        this.cod_plan_estudio_selected = cod_plan_estudio;
    }

    //NUEVA FORMA
    //DROPDOWNS POSTGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
    resetControlsWhenChangedDropdownFacultadPostgrado(){
		this.fbForm.get('cod_programa')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignatura_postgrado')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPostgrado(){
        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaPostgrado(status: boolean){
        const control = this.fbForm.get('cod_programa');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownFacultadPostgrado(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            facultad_to_programas_left: 'gray',
            programas_to_planestudio_left: 'gray',
            planestudio_to_table_left: 'gray',
        };
	}
    //FIN FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 

    //INICIO FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO 
    resetControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignatura_postgrado')?.reset();
	}

    disabledControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlPlanEstudioPostgrado(status: boolean){
        const control = this.fbForm.get('cod_plan_estudio');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownProgramaPostgrado(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            programas_to_planestudio_left: 'gray',
            planestudio_to_table_left: 'gray'
        };
	}

    //FIN FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO

    resetControlAsignaturaPostgrado(){
        this.fbForm.get('asignatura_postgrado')?.reset();
    }

    //DROPDOWNS PREGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD PREGRADO 
    resetControlsWhenChangedDropdownFacultadPregrado(){
		this.fbForm.get('cod_programa_pregrado')?.reset();
		this.fbForm.get('asignaturas_pregrado_dropdown')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPregrado(){
        this.fbForm.get('cod_programa_pregrado')?.disable();
		this.fbForm.get('asignaturas_pregrado_dropdown')?.disable();
    }

    setStatusControlProgramaPregrado(status: boolean){
        const control = this.fbForm.get('cod_programa_pregrado');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownFacultadPregrado(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            facultad_to_programas_right: 'gray',
            programas_to_asignaturas_right: 'gray',
            asignaturas_to_table_right: 'gray',
        };
	}
    //FIN FUNCIONES PARA DROPDOWN FACULTAD PREGRADO 

    //INICIO FUNCIONES PARA DROPDOWN PROGRAMA PREGRADO 
    resetControlsWhenChangedDropdownProgramaPregrado(){
        this.fbForm.get('asignaturas_pregrado_dropdown')?.reset();
    }

    disabledControlsWhenChangedDropdownProgramaPregrado(){
        this.fbForm.get('asignaturas_pregrado_dropdown')?.disable();
    }

    setStatusControlAsignaturasPregrado(status: boolean){
        const control = this.fbForm.get('asignaturas_pregrado_dropdown');
        status ? control?.enable() : control?.disable()
    }

    resetArrowsColorsWhenChangedDropdownAsignaturasPregrado(){
        const valuesColors = {...this.arrowsColors};
        this.arrowsColors = {
            ...valuesColors,
            programas_to_asignaturas_right: 'gray',
            asignaturas_to_table_right: 'gray',
        };
	}
    
    //FIN FUNCIONES PARA DROPDOWN PROGRAMA PREGRADO 

    resetControlAsignaturaPregrado(){
        this.fbForm.get('asignaturas_articuladas_selected')?.reset();
        this.fbForm.get('asignaturas_pregrado_dropdown')?.reset();
    }

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
            programas_to_asignaturas_right: 'gray',
            asignaturas_to_table_right: 'gray'
        };
    }

    setAsignaturaPregrado(event: any){
		if (event === '') this.fbForm.patchValue({ asignaturas_pregrado_dropdown: event , asignaturas_articuladas_selected: event });
    }

    setAsignaturaPostgrado(event: any){
        this.fbForm.patchValue({ asignatura_postgrado: event });
    }

    setAsignaturaArticuladas(event: any){
        this.fbForm.patchValue({ asignaturas_articuladas_selected: event });
    }

}