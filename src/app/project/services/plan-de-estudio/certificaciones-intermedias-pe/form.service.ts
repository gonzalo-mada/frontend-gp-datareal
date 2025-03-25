import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from 'primeng/api';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { PrincipalControls } from 'src/app/project/models/shared/PrincipalControls';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Injectable({
    providedIn: 'root'
})

export class FormCertifIntermediasPEService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    dataExternal: DataExternal = {data: false};

    cod_facultad_selected_postgrado: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_planestudio_selected: number = 0;

	showTableAsignatura: boolean = false;


    messages: Message[] = [
        {
            severity: 'info',
            detail: `
                        Se cargan solo programas que cuentan con la opción de <b> ¿Tiene certificación intermedia? </b> habilitada.
                        Si el programa que desea seleccionar no aparece en la lista, diríjase al Mantenedor de programas, habilite la opción y actualice el programa.
                    `
        }
    ];

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            cod_facultad: ['', [Validators.required]],
            cod_programa: ['', [Validators.required]],
            cod_plan_estudio: ['', [Validators.required]],
            cod_certif_intermedia: ['', [Validators.required]],
            descripcion_certif_intermedia: [''],
            asignaturas: [[], [Validators.required]],
            data_asignaturas: [[]],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            cod_facultad: '',
            cod_programa: '',
            cod_plan_estudio: '',
            cod_certif_intermedia: '',
            descripcion_certif_intermedia: '',
            asignaturas: [],
            data_asignaturas: [],
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('cod_programa')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
        this.showTableAsignatura = false;
        console.log("resetee form certif intermedia pe");
    }

    resetValuesVarsSelected(){
        if (this.dataExternal.data){
            this.cod_facultad_selected_postgrado = 0;
            this.cod_programa_postgrado_selected = 0;
            this.cod_planestudio_selected = 0;
        }
    }

    async setForm(mode:'show' | 'edit' ,data: CertificacionIntermediaPE) {
        console.log("data",data);
        
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
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
                cod_programa: this.cod_programa_postgrado_selected,
                cod_plan_estudio: this.cod_planestudio_selected,
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
                cod_programa: this.cod_programa_postgrado_selected,
                cod_plan_estudio: this.cod_planestudio_selected,
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
        this.cod_programa_postgrado_selected = this.dataExternal.cod_programa!;
        this.cod_planestudio_selected = this.dataExternal.cod_plan_estudio!;
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
        this.cod_programa_postgrado_selected = cod_programa;
        this.cod_planestudio_selected = cod_plan_estudio;
    }

    //DROPDOWNS POSTGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
    resetControlsWhenChangedDropdownFacultadPostgrado(){
		this.fbForm.get('cod_programa')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPostgrado(){
        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaPostgrado(status: boolean){
        const control = this.fbForm.get('cod_programa');
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
		this.fbForm.patchValue({ asignaturas: [] });
	}

    setCertificacionIntermedia(event: any){
        this.fbForm.patchValue({ cod_certif_intermedia: event.Cod_CertificacionIntermedia });
        this.fbForm.patchValue({ descripcion_certif_intermedia: event.Descripcion_certif_inter });
    }

    setAsignaturas(event: any){
        console.log("evevnenvenvne",event);
        
		this.fbForm.patchValue({ asignaturas: event.filteredResult });
		this.fbForm.patchValue({ data_asignaturas: event.selectedData });
    }


}