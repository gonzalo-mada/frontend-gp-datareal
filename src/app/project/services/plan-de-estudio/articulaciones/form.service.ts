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

    cod_facultad_selected_postgrado: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_plan_estudio_selected: number = 0;
    cod_facultad_selected_pregrado: number = 0;
    cod_programa_selected_pregrado: number = 0;
    showTables: boolean = false;


    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            cod_facultad_postgrado: [''],
            cod_programa_postgrado: [''],
            cod_plan_estudio: ['', [Validators.required]],
            asignatura_postgrado: ['', [Validators.required]],

            cod_facultad_pregrado: ['', [Validators.required]],
            cod_programa_pregrado: ['', [Validators.required]],
            data_programa_pregrado: ['', [Validators.required]], //para obtener codPrograma y nombreCarrera
            asignaturas_pregrado: ['', [Validators.required]],

            asignaturas_articuladas_selected: ['', [Validators.required]],
            aux: ['']
        });
        console.log("inicie form articulaciones");
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            cod_facultad_postgrado: '',
            cod_programa_postgrado: '',
            cod_plan_estudio: '',
            asignatura_postgrado: '',

            cod_facultad_pregrado: '',
            cod_programa_pregrado: '',
            data_programa_pregrado: '',
            asignaturas_pregrado: '',
            asignaturas_articuladas_selected: '',
            aux: ''
        });

        this.fbForm.enable();
        this.fbForm.get('cod_programa_postgrado')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();

        this.fbForm.get('cod_programa_pregrado')?.disable();
        this.fbForm.get('asignaturas_pregrado')?.disable();

        this.resetElementsForm();
        console.log("resetee form articulaciones");
        
    }

    resetElementsForm(){
        this.cod_facultad_selected_postgrado= 0;
        this.cod_programa_postgrado_selected= 0;
        this.cod_plan_estudio_selected= 0;
        this.cod_facultad_selected_pregrado= 0;
        this.cod_programa_selected_pregrado= 0;
        this.showTables = false;
    }



    hideDropdowns(){
        // this.showDropdownSelectFacultad = false;
        // this.showDropdownSelectPlanEstudio = false;
        // this.showDropdownSelectProgramaPostgrado = false;
    }

    setForm(mode:'show' | 'edit' ,data: Articulacion): void {
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
            this.setDisabledControlsByAgregarPE();
        }
    }

    setParamsForm(): Object {
        const cod_facultad_postgrado = this.fbForm.get('cod_facultad_postgrado');
        const cod_programa_postgrado = this.fbForm.get('cod_programa_postgrado');
        const cod_plan_estudio = this.fbForm.get('cod_plan_estudio');
        let params = {};
        if (cod_facultad_postgrado?.disabled  &&  cod_programa_postgrado?.disabled && cod_plan_estudio?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_facultad_postgrado: this.cod_facultad_selected_postgrado, 
                cod_programa_postgrado: this.cod_programa_postgrado_selected,
                cod_plan_estudio: this.cod_plan_estudio_selected,
            }
        }else{
            params = {...this.fbForm.value}
        }
        return params
    }

    setValuesVarsByAgregarPE(dataFromAgregarPE: any){
        console.log("dataFromAgregarPE",dataFromAgregarPE);
        this.cod_facultad_selected_postgrado = dataFromAgregarPE.cod_facultad;
        this.cod_programa_postgrado_selected = dataFromAgregarPE.cod_programa;
        this.cod_plan_estudio_selected = dataFromAgregarPE.cod_plan_estudio;
    }

    setControlsFormByAgregarPE(dataFromAgregarPE: any){
        this.fbForm.get('cod_facultad_postgrado')?.patchValue(dataFromAgregarPE.cod_facultad);
        this.fbForm.get('cod_programa_postgrado')?.patchValue(dataFromAgregarPE.cod_programa);
        this.fbForm.get('cod_plan_estudio')?.patchValue(dataFromAgregarPE.cod_plan_estudio);
        this.setDisabledControlsByAgregarPE();

    }

    setDisabledControlsByAgregarPE(){
        this.fbForm.get('cod_facultad_postgrado')?.disable();
        this.fbForm.get('cod_programa_postgrado')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
    }

    //NUEVA FORMA
    //DROPDOWNS POSTGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
    resetControlsWhenChangedDropdownFacultadPostgrado(){
		this.fbForm.get('cod_programa_postgrado')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignatura_postgrado')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPostgrado(){
        this.fbForm.get('cod_programa_postgrado')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaPostgrado(status: boolean){
        const control = this.fbForm.get('cod_programa_postgrado');
        status ? control?.enable() : control?.disable()
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

    //FIN FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO 

    resetControlAsignaturaPostgrado(){
        this.fbForm.get('asignatura_postgrado')?.reset();
    }

    //DROPDOWNS PREGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD PREGRADO 
    resetControlsWhenChangedDropdownFacultadPregrado(){
		this.fbForm.get('cod_programa_pregrado')?.reset();
		this.fbForm.get('asignaturas_pregrado')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPregrado(){
        this.fbForm.get('cod_programa_pregrado')?.disable();
		this.fbForm.get('asignaturas_pregrado')?.disable();
    }

    setStatusControlProgramaPregrado(status: boolean){
        const control = this.fbForm.get('cod_programa_pregrado');
        status ? control?.enable() : control?.disable()
    }
    //FIN FUNCIONES PARA DROPDOWN FACULTAD PREGRADO 

    //INICIO FUNCIONES PARA DROPDOWN PROGRAMA PREGRADO 
    resetControlsWhenChangedDropdownProgramaPregrado(){
        this.fbForm.get('asignaturas_pregrado')?.reset();
    }

    disabledControlsWhenChangedDropdownProgramaPregrado(){
        this.fbForm.get('asignaturas_pregrado')?.disable();
    }

    setStatusControlAsignaturasPregrado(status: boolean){
        const control = this.fbForm.get('asignaturas_pregrado');
        status ? control?.enable() : control?.disable()
    }
    //FIN FUNCIONES PARA DROPDOWN PROGRAMA PREGRADO 

    resetControlAsignaturaPregrado(){
        this.fbForm.get('asignaturas_articuladas_selected')?.reset();
        this.fbForm.get('asignaturas_pregrado')?.reset();
    }
}