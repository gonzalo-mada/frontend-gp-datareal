import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Tema } from 'src/app/project/models/asignaturas/Tema';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { PrincipalControls } from 'src/app/project/models/shared/PrincipalControls';
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
    dataExternal: DataExternal = {data: false};

    //ELEMENTS FORM
    cod_facultad_selected: number = 0;
    cod_programa_selected: number = 0;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
		this.fbForm = this.fb.group({
			cod_facultad: [''],
			cod_programa: [''],

			nombre_tema: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			aux: ['']
		});
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
			cod_facultad: '',
			cod_programa: '',

            nombre_tema: '',
            aux: ''
        });
        this.fbForm.enable();
		this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();

        console.log("resetee form tema");
    }

    resetValuesVarsSelected(){
		if (!this.dataExternal.data){
			this.cod_facultad_selected = 0;
			this.cod_programa_selected = 0;
		}
    }

    async setForm(mode: 'show' | 'edit', data: Tema) {
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
		await this.setVarsForm(data.cod_facultad!, data.cod_programa!)

    }

    setParamsForm(): Object {
        const cod_facultad = this.fbForm.get('cod_facultad');
        const cod_programa = this.fbForm.get('cod_programa');
        let params = {};
        if (cod_facultad?.disabled && cod_programa?.disabled) {
            params = {
                ...this.fbForm.value,
                cod_facultad: this.cod_facultad_selected, 
                cod_programa: this.cod_programa_selected
            }
        }else {
            params = {...this.fbForm.value}
        }
        return params
    }

    async getDataPrincipalControls(): Promise<PrincipalControls> {
        const cod_facultad = this.fbForm.get('cod_facultad');
        const cod_programa = this.fbForm.get('cod_programa');
        let dataToLog: PrincipalControls = {};
        if (cod_facultad?.disabled  &&  cod_programa?.disabled) {
            dataToLog = {
                cod_facultad: this.cod_facultad_selected, 
                cod_programa: this.cod_programa_selected,
            }
        }else{
            dataToLog = {
                cod_facultad: cod_facultad!.value, 
                cod_programa: cod_programa!.value,
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
    }

    setControlsFormByDataExternal(){
        this.fbForm.get('cod_facultad')?.patchValue(this.dataExternal.cod_facultad);
        this.fbForm.get('cod_programa')?.patchValue(this.dataExternal.cod_programa);
        this.setDisabledPrincipalControls();
    }

    setDisabledPrincipalControls(){
        this.fbForm.get('cod_facultad')?.disable();
        this.fbForm.get('cod_programa')?.disable();
    }

	async setVarsForm(cod_facultad: number, cod_programa: number){
        this.cod_facultad_selected = cod_facultad;
        this.cod_programa_selected = cod_programa;
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