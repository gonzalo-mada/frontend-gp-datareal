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
    cod_programa_selected: number = 0;
    showTables: boolean = false;
    showDropdownSelectFacultadPostgrado: boolean = true;
    showDropdownSelectFacultad: boolean = false;
    showDropdownSelectPlanEstudio: boolean = false;
    showDropdownSelectProgramaPostgrado: boolean = false;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Cod_Facultad_Postgrado_Selected: [''],
            Cod_Programa_Postgrado_Selected: [''],
            Cod_plan_estudio: ['', [Validators.required]],
            Cod_Facultad_Selected: ['', [Validators.required]],
            Cod_programa_pregrado: ['', [Validators.required]],
            Descripcion_programa_pregrado: ['', [Validators.required]],
            Asignaturas: ['', [Validators.required]],
            aux: ['']
        });
        console.log("inicie form articulaciones");
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Cod_Facultad_Postgrado_Selected: '',
            Cod_Facultad_Selected: '',
            Cod_plan_estudio: '',
            Cod_Programa_Postgrado_Selected: '',
            Cod_programa_pregrado: '',
            Descripcion_programa_pregrado: '',
            Asignaturas: '',
            aux: ''
        });
        this.fbForm.enable();
        this.resetElementsForm();
        console.log("resetee form articulaciones");
        
    }

    resetElementsForm(){
        this.cod_facultad_selected_postgrado= 0;
        this.cod_programa_postgrado_selected= 0;
        this.cod_plan_estudio_selected= 0;
        this.cod_facultad_selected_pregrado= 0;
        this.cod_programa_selected= 0;
        this.showTables = false;
        this.showDropdownSelectFacultadPostgrado = true;
        this.showDropdownSelectFacultad = false;
        this.showDropdownSelectPlanEstudio = false;
        this.showDropdownSelectProgramaPostgrado = false;
    }

    setDropdowns(){
        this.showDropdownSelectFacultadPostgrado = false;
        this.showDropdownSelectProgramaPostgrado = false;
        this.showDropdownSelectFacultad = true;
        this.showDropdownSelectPlanEstudio = true;
    }

    hideDropdowns(){
        this.showDropdownSelectFacultad = false;
        this.showDropdownSelectPlanEstudio = false;
        this.showDropdownSelectProgramaPostgrado = false;
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
        const cod_facultad_postgrado = this.fbForm.get('Cod_Facultad_Postgrado_Selected');
        const cod_programa_postgrado = this.fbForm.get('Cod_Programa_Postgrado_Selected');
        const cod_plan_estudio = this.fbForm.get('Cod_plan_estudio');
        let params = {};
        if (cod_facultad_postgrado?.disabled  &&  cod_programa_postgrado?.disabled && cod_plan_estudio?.disabled) {
            params = {
                ...this.fbForm.value,
                Cod_Facultad_Postgrado_Selected: this.cod_facultad_selected_postgrado, 
                Cod_Programa_Postgrado_Selected: this.cod_programa_postgrado_selected,
                Cod_plan_estudio: this.cod_plan_estudio_selected,
            }
        }else{
            params = {...this.fbForm.value}
        }
        return params
    }

    setValuesVarsByAgregarPE(dataFromAgregarPE: any){
        this.cod_facultad_selected_postgrado = dataFromAgregarPE.cod_facultad;
        this.cod_programa_postgrado_selected = dataFromAgregarPE.cod_programa;
        this.cod_plan_estudio_selected = dataFromAgregarPE.cod_plan_estudio;
    }

    setControlsFormByAgregarPE(dataFromAgregarPE: any){
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.patchValue(dataFromAgregarPE.cod_facultad);
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.patchValue(dataFromAgregarPE.cod_programa);
        this.fbForm.get('Cod_plan_estudio')?.patchValue(dataFromAgregarPE.cod_plan_estudio);
        this.setDisabledControlsByAgregarPE();

    }

    setDisabledControlsByAgregarPE(){
        this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.disable();
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
        this.fbForm.get('Cod_plan_estudio')?.disable();
    }

}