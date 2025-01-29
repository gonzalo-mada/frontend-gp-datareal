import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
  providedIn: 'root'
})
export class FormMencionesService {

  	public fbForm!: FormGroup;
	modeForm: ModeForm = undefined;
	stateForm: StateValidatorForm = undefined;

	cod_facultad_selected: number = 0;
    cod_programa_selected: number = 0;
    cod_plan_estudio: number = 0;

    openedFrom: string = '';
    optionDisabled: string = 'none';
  
	constructor(private fb: FormBuilder){}

	async initForm(): Promise<boolean>{
		this.fbForm = this.fb.group({
			cod_facultad: [''],
			cod_programa: [''],
			cod_plan_estudio: [''],

			asignaturas: ['', GPValidator.needAsignaturas(() => this.openedFrom)], 
			nombre_mencion: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			descripcion_mencion: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			mencion_rexe: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			fecha_creacion: ['', Validators.required],
			vigencia: [false],

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

            asignaturas: '',
            nombre_mencion: '',
            descripcion_mencion: '',
            mencion_rexe: '',
            fecha_creacion: '',
            vigencia: false,
            
            files: [],
            aux: ''
        });
        this.fbForm.enable();
		this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
		this.fbForm.get('asignaturas')?.disable();

		this.resetValuesVarsSelected();
        this.optionDisabled = 'none';
        console.log("resetee form menciones");
    }

    resetValuesVarsSelected(){
        this.cod_facultad_selected= 0;
        this.cod_programa_selected= 0;
        this.cod_plan_estudio= 0;
    }

    setForm(mode: 'show' | 'edit', data: Mencion): void {
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
            this.optionDisabled = 'checkDisabled'
            this.fbForm.get('asignaturas')?.enable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    setParamsForm(): Object {
        const cod_plan_estudio = this.fbForm.get('cod_plan_estudio');
        let params = {};
        if (cod_plan_estudio?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_plan_estudio: this.cod_plan_estudio
            }
        }else {
            params = {...this.fbForm.value}
        }
        return params
    }
  
    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ files });
        this.fbForm.controls['files'].updateValueAndValidity();
    }

	setValuesVarsByExternalData(externalData: any){
		console.log("externalData",externalData);
		this.cod_facultad_selected = externalData.cod_facultad
		this.cod_programa_selected = externalData.cod_programa
		this.cod_plan_estudio = externalData.cod_plan_estudio
	}

	setControlsFormByExternalData(externalData: any){
        this.fbForm.get('cod_facultad')?.patchValue(externalData.cod_facultad);
        this.fbForm.get('cod_programa')?.patchValue(externalData.cod_programa);
        this.fbForm.get('cod_plan_estudio')?.patchValue(externalData.cod_plan_estudio);
        this.setDisabledControlsByAgregarPE();
	}

	setDisabledControlsByAgregarPE(){
        this.fbForm.get('cod_facultad')?.disable();
        this.fbForm.get('cod_programa')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
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

    async setDropdownsAndVars(dataDropdowns: any){
		this.fbForm.patchValue({cod_facultad: dataDropdowns.cod_facultad_selected_notform});
		this.fbForm.patchValue({cod_programa: dataDropdowns.cod_programa_postgrado_selected_notform});
		this.fbForm.patchValue({cod_plan_estudio: dataDropdowns.cod_plan_estudio_selected_notform});
		this.cod_facultad_selected = dataDropdowns.cod_facultad_selected_notform;
		this.cod_programa_selected = dataDropdowns.cod_programa_postgrado_selected_notform;
		this.cod_plan_estudio = dataDropdowns.cod_plan_estudio_selected_notform;
	}

	disableDropdowns(){
		this.fbForm.get('cod_facultad')?.disable();
		this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
	}
}