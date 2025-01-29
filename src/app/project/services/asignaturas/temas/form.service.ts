import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tema } from 'src/app/project/models/asignaturas/Tema';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormTemasService {
    public fbForm!: FormGroup;
    public fbFormUpdate!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    stateFormUpdate: StateValidatorForm = undefined;

    //ELEMENTS FORM
    cod_facultad_selected: number = 0;
    cod_programa_selected: number = 0;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
		this.fbForm = this.fb.group({
			cod_facultad: [''],
			cod_programa: [''],

			cod_tema: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			nombre_tema: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			aux: ['']
		});
		console.log("inicie form tema");
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
			cod_facultad: '',
			cod_programa: '',

            cod_tema: '',
            nombre_tema: '',
            aux: ''
        });
        this.fbForm.enable();
		this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();

		this.resetValuesVarsSelected();
        console.log("resetee form tema");
    }

    resetValuesVarsSelected(){
        this.cod_facultad_selected = 0;
        this.cod_programa_selected = 0;
    }

    setForm(mode: 'show' | 'edit', data: Tema): void {
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    setParamsForm(): Object {
        const cod_programa = this.fbForm.get('cod_programa');
        let params = {};
        if (cod_programa?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_programa: this.cod_programa_selected
            }
        }else {
            params = {...this.fbForm.value}
        }
        return params
    }

    setValuesVarsByExternalData(externalData: any){
		console.log("externalData",externalData);
		this.cod_facultad_selected = externalData.cod_facultad
		this.cod_programa_selected = externalData.cod_programa
	}

    setControlsFormByExternalData(externalData: any){
        this.fbForm.get('cod_facultad')?.patchValue(externalData.cod_facultad);
        this.fbForm.get('cod_programa')?.patchValue(externalData.cod_programa);
        this.setDisabledControlsByAgregarPE();
	}

    setDisabledControlsByAgregarPE(){
        this.fbForm.get('cod_facultad')?.disable();
        this.fbForm.get('cod_programa')?.disable();
    }

    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO
	resetControlsWhenChangedDropdownFacultad(){
		this.fbForm.get('cod_programa')?.reset();
	}

	disabledControlsWhenChangedDropdownFacultad(){
        this.fbForm.get('cod_programa')?.disable();
    }

	setStatusControlPrograma(status: boolean){
        const control = this.fbForm.get('cod_programa');
        status ? control?.enable() : control?.disable()
    }
	//FIN FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
}