import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Message } from "primeng/api";
import { ParalelaSecuencial } from "src/app/project/models/asignaturas/ParalelaSecuencial";
import { DataExternal } from "src/app/project/models/shared/DataExternal";
import { ModeForm } from "src/app/project/models/shared/ModeForm";
import { PrincipalControls } from "src/app/project/models/shared/PrincipalControls";
import { StateValidatorForm } from "src/app/project/models/shared/StateValidatorForm";
import { parseAsignaturas } from "src/app/project/tools/utils/form.utils";

@Injectable({
  providedIn: "root",
})
export class FormParalelaSecuencialService {
	public fbForm!: FormGroup;
	modeForm: ModeForm = undefined;
	stateForm: StateValidatorForm = undefined;
	dataExternal: DataExternal = {data: false};

	cod_facultad_selected_postgrado: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_planestudio_selected: number = 0;
    cod_paralela_secuencial_selected: number = 0;

	asignaturas_selected: any[] = [];

	showTableAsignatura: boolean = false;
	showTableParalelaSecuencial: boolean = false;

	messages: Message[] = [
        {
            severity: 'info',
            detail: `
                        Se cargan solo asignaturas que cuentan con la opción de <b> ¿Tiene prerrequisito? </b> habilitada.
                        Si la asignatura que desea seleccionar no aparece en la tabla, diríjase al Mantenedor de asignaturas, habilite la opción y actualice la asignatura.
                    `
        }
    ];

  	constructor(private fb: FormBuilder) {}

	async initForm(): Promise<boolean> {
		this.fbForm = this.fb.group({
			cod_facultad: ['', [Validators.required]],
            cod_programa: ['', [Validators.required]],
            cod_plan_estudio: ['', [Validators.required]],
            cod_paralela_secuencial: ['', [Validators.required]],

            asignaturas: [[], [Validators.required]],
            data_asignaturas: [[]],
            asignaturas_old: [[]],
            data_asignaturas_old: [[]],
			
            paralelasecuencial: [[], [Validators.required]],
            data_paralelasecuencial: [[]],
            paralelasecuencial_old: [[]],
            data_paralelasecuencial_old: [[]],

			aux: [""],
		});
		return true;
	}

	resetForm(): void {
		this.fbForm.reset({
			cod_facultad: '',
            cod_programa: '',
            cod_plan_estudio: '',

			asignaturas: [],
			asignaturas_old: [],
			data_asignaturas: [],
			data_asignaturas_old: [],

			paralelasecuencial: [],
			data_paralelasecuencial: [],
			paralelasecuencial_old: [],
			data_paralelasecuencial_old: [],

			aux: "",
		});
		this.fbForm.enable();
		this.fbForm.get('cod_programa')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
        this.fbForm.get('cod_paralela_secuencial')?.disable();
		this.resetShowTables();
		console.log("resetee form paralelasecuencial");
	}

	resetShowTables(){
		this.showTableAsignatura = false;
		this.showTableParalelaSecuencial = false;
	}

	resetValuesVarsSelected(){
		if (!this.dataExternal.data){
			this.cod_facultad_selected_postgrado = 0;
			this.cod_programa_postgrado_selected = 0;
			this.cod_planestudio_selected = 0;
		}
    }

	async setForm(mode: "show" | "edit", data: ParalelaSecuencial) {
		this.fbForm.patchValue({ ...data });
		if (mode === "show") {
			this.fbForm.disable();
		}
		if (mode === "edit") {
			this.fbForm.patchValue({ aux: data });
		}
		await this.setVarsForm(data.cod_facultad!, data.cod_programa!, data.cod_plan_estudio!, data.cod_paralela_secuencial!)
	}

	setParamsForm() {
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
				cod_plan_estudio: cod_plan_estudio!.value,
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
		this.cod_paralela_secuencial_selected = this.dataExternal.cod_paralela_secuencial!;
    }

	setControlsFormByDataExternal(){
        this.fbForm.get('cod_facultad')?.patchValue(this.dataExternal.cod_facultad);
        this.fbForm.get('cod_programa')?.patchValue(this.dataExternal.cod_programa);
        this.fbForm.get('cod_plan_estudio')?.patchValue(this.dataExternal.cod_plan_estudio);
        this.fbForm.get('cod_paralela_secuencial')?.patchValue(this.dataExternal.cod_paralela_secuencial);
        this.setDisabledPrincipalControls();
    }

    setDisabledPrincipalControls(){
        this.fbForm.get('cod_facultad')?.disable();
        this.fbForm.get('cod_programa')?.disable();
        this.fbForm.get('cod_plan_estudio')?.disable();
    }

	async setVarsForm(cod_facultad: number, cod_programa: number, cod_plan_estudio: number, cod_paralela_secuencial: number){
        this.cod_facultad_selected_postgrado = cod_facultad;
        this.cod_programa_postgrado_selected = cod_programa;
        this.cod_planestudio_selected = cod_plan_estudio;
        this.cod_paralela_secuencial_selected = cod_paralela_secuencial;
    }

	//DROPDOWNS POSTGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
    resetControlsWhenChangedDropdownFacultadPostgrado(){
		this.fbForm.get('cod_programa')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('cod_paralela_secuencial')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPostgrado(){
        this.fbForm.get('cod_programa')?.disable();
		this.fbForm.get('cod_plan_estudio')?.disable();
		this.fbForm.get('cod_paralela_secuencial')?.disable();
    }

    setStatusControlProgramaPostgrado(status: boolean){
        const control = this.fbForm.get('cod_programa');
        status ? control?.enable() : control?.disable()
    }
    //FIN FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 

	//INICIO FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO
	resetControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('cod_plan_estudio')?.reset();
		this.fbForm.get('cod_paralela_secuencial')?.reset();
	}

	disabledControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('cod_plan_estudio')?.disable();
		this.fbForm.get('cod_paralela_secuencial')?.disable();
	}

	setStatusControlPlanEstudioPostgrado(status: boolean){
		const control = this.fbForm.get('cod_plan_estudio');
		status ? control?.enable() : control?.disable()
	}
	//FIN FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO

	//INICIO FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO
	resetControlsWhenChangedDropdownPlanDeEstudio(){
		this.fbForm.get('cod_paralela_secuencial')?.reset();
	}

	disabledControlsWhenChangedDropdownPlanDeEstudio(){
		this.fbForm.get('cod_paralela_secuencial')?.disable();
	}

	setStatusControlParalelaSecuencial(status: boolean){
		const control = this.fbForm.get('cod_paralela_secuencial');
		status ? control?.enable() : control?.disable()
	}
	//FIN FUNCIONES PARA DROPDOWN PLAN DE ESTUDIO

	setAsignatura(event: any){
		this.fbForm.patchValue({ asignaturas: event.filteredResult });
		this.fbForm.patchValue({ data_asignaturas: event.selectedData });
    }

	setParalelaSecuencial(event: any){
		this.fbForm.patchValue({ paralelasecuencial: event.filteredResult });
		this.fbForm.patchValue({ data_paralelasecuencial: event.selectedData });
    }

	setAsignaturaSelected(event: any){
		//este arreglo es el que se usa para filtrar 
		//asi el usuario no pueda seleccionar la misma asignatura
		this.asignaturas_selected = event
	}

	setAsignaturasOld(event:any, array:any){
		const result = parseAsignaturas(event,array);
		this.fbForm.patchValue({ asignaturas_old: result.filteredResult });
		this.fbForm.patchValue({ data_asignaturas_old: result.selectedData });
	}

	setParalelasecuencial_old(event:any, array:any){
		const result = parseAsignaturas(event,array);
		this.fbForm.patchValue({ paralelasecuencial_old: result.filteredResult });
		this.fbForm.patchValue({ data_paralelasecuencial_old: result.selectedData });
	}


}