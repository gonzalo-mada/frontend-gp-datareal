import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Message } from 'primeng/api';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { PrincipalControls } from 'src/app/project/models/shared/PrincipalControls';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
  providedIn: 'root'
})
export class FormMencionesService {

  	public fbForm!: FormGroup;
	modeForm: ModeForm = undefined;
	stateForm: StateValidatorForm = undefined;
	stateAssociateForm: StateValidatorForm = undefined;
    dataExternal: DataExternal = {data: false};

	cod_facultad_selected: number = 0;
    cod_programa_selected: number = 0;
    cod_plan_estudio: number = 0;

    needShowAsignaturas: boolean = true;
    needShowMenciones: boolean = false;
	activeTab: number = 0;

	showTableAsignatura: boolean = false;
    messagePE: Message[] = [
        {
            severity: 'info',
            detail: `
                    Se cargan solo planes de estudios que cuentan con la opción de <b> ¿Tiene mención? </b> habilitada.
                    Si el plan de estudio que desea seleccionar no aparece en la lista, diríjase al Mantenedor de plan de estudio, habilite la opción y actualice el plan de estudio.
                    `,
            data: 'Se cargan solo planes de estudios que cuentan con la opción de ¿Tiene mención? habilitada.'
        }
    ];
    tooltipContent: string = this.messagePE[0].data;

    messages: Message[] = [
        {
            severity: 'info',
            detail: `
                        Se cargan solo asignaturas que cuentan con la opción de <b> ¿Incluye mención? </b> habilitada.
                        Si la asignatura que desea seleccionar no aparece en la tabla, diríjase al Mantenedor de asignaturas, habilite la opción y actualice la asignatura.
                    `
        }
    ];
  
	constructor(private fb: FormBuilder){}

    get stateStepOne() {
        if (
              this.fbForm.get('nombre_mencion')!.invalid || 
              this.fbForm.get('descripcion_mencion')!.invalid || 
              this.fbForm.get('vigencia')!.invalid || 
              this.fbForm.get('mencion_rexe')!.invalid || 
              this.fbForm.get('fecha_creacion')!.invalid 
            ) {
          return false;
        } else {
          return true;
        }
    }

    get stateStepTwo() {
        if ( this.fbForm.get('asignaturas')!.disabled || this.fbForm.get('asignaturas')!.value === null || this.fbForm.get('asignaturas')!.invalid )   {
            return false;
        } else {
            return true;
        }
    }

	async initForm(): Promise<boolean>{
		this.fbForm = this.fb.group({
			cod_facultad: [''],
			cod_programa: [''],
			cod_plan_estudio: [''],

			asignaturas: [[], [GPValidator.needAsignaturas(() => this.needShowAsignaturas)]], 
            data_asignaturas: [[]],
			nombre_mencion: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			descripcion_mencion: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			mencion_rexe: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			fecha_creacion: ['', Validators.required],
			vigencia: [false],

            menciones: ['', [GPValidator.needMenciones(() => this.needShowMenciones)]],

			files: [[], GPValidator.filesValidator('files',() => this.modeForm)], 
			aux: ['']
		});
		console.log("inicie form menciones");
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
			cod_facultad: '',
			cod_programa: '',
			cod_plan_estudio: '',

            asignaturas: [],
            data_asignaturas: [],
            nombre_mencion: '',
            descripcion_mencion: '',
            mencion_rexe: '',
            fecha_creacion: '',
            vigencia: false,

            menciones: '',
            
            files: [],
            aux: ''
        });
        this.fbForm.enable();
		this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
		this.fbForm.get('asignaturas')?.disable();
        this.activeTab = 0;
        console.log("resetee form menciones");
    }

    resetValuesVarsSelected(){
        if (!this.dataExternal.data){
            this.cod_facultad_selected= 0;
            this.cod_programa_selected= 0;
            this.cod_plan_estudio= 0;
        }
    }

    async setForm(mode: 'show' | 'edit', data: Mencion) {
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
                cod_facultad: this.cod_facultad_selected, 
                cod_programa: this.cod_programa_selected,
                cod_plan_estudio: this.cod_plan_estudio,
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
                cod_facultad: this.cod_facultad_selected, 
                cod_programa: this.cod_programa_selected,
                cod_plan_estudio: this.cod_plan_estudio,
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
        this.cod_facultad_selected = this.dataExternal.cod_facultad!;
        this.cod_programa_selected = this.dataExternal.cod_programa!;
        this.cod_plan_estudio = this.dataExternal.cod_plan_estudio!;
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
        this.cod_facultad_selected = cod_facultad;
        this.cod_programa_selected = cod_programa;
        this.cod_plan_estudio = cod_plan_estudio;
    }
  
    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ files });
        this.fbForm.controls['files'].updateValueAndValidity();
    }

	//INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO
	resetControlsWhenChangedDropdownFacultad(){
		this.fbForm.get('cod_programa')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignaturas')?.reset();
	}

	disabledControlsWhenChangedDropdownFacultad(){
        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
		this.fbForm.get('asignaturas')?.disable();
    }

	setStatusControlPrograma(status: boolean){
        const control = this.fbForm.get('cod_programa');
        status ? control?.enable() : control?.disable()
    }
	//FIN FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 

	//INICIO FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO
	resetControlsWhenChangedDropdownPrograma(){
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('asignaturas')?.reset();
	}

    disabledControlsWhenChangedDropdownPrograma(){
		this.fbForm.get('cod_plan_estudio')?.disable();
		this.fbForm.get('asignaturas')?.disable();
    }

    setStatusControlPlanEstudio(status: boolean){
        const control = this.fbForm.get('cod_plan_estudio');
        status ? control?.enable() : control?.disable()
    }
	//FIN FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO

    //INICIO FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO POSTGRADO
	resetControlsWhenChangedDropdownPlanEstudio(){
		this.fbForm.get('asignaturas')?.reset();
	}

    disabledControlsWhenChangedDropdownPlanEstudio(){
		this.fbForm.get('asignaturas')?.disable();
    }

    setStatusControlAsignaturas(status: boolean){
        const control = this.fbForm.get('asignaturas');
        status ? control?.enable() : control?.disable()
    }
	//FIN FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO POSTGRADO

    setAsignatura(event: any){
		this.fbForm.patchValue({ asignaturas: event.filteredResult });
		this.fbForm.patchValue({ data_asignaturas: event.selectedData });
    }

    setMenciones(event: any){
		this.fbForm.patchValue({ menciones: event });
    }

    getFormToCrudAsign(){
        let form = {
            asignaturas: this.fbForm.get('asignaturas')?.value,
            menciones: this.fbForm.get('menciones')?.value,
        }
        return form
    }

    setDisabledFormByIncluirMencionAsignatura(){
        this.fbForm.disable();
        this.fbForm.get('asignaturas')?.enable();
        this.fbForm.get('menciones')?.enable();
    }

}