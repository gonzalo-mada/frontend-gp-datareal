import { Injectable } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { RangoAG } from "src/app/project/models/plan-de-estudio/RangoAG";
import { ModeForm } from "src/app/project/models/shared/ModeForm";
import { StateValidatorForm } from "src/app/project/models/shared/StateValidatorForm";
import { GPValidator } from "src/app/project/tools/validators/gp.validators";

@Injectable({
  providedIn: "root",
})
export class FormRangosAGService {
	public fbForm!: FormGroup;
	modeForm: ModeForm = undefined;
	stateForm: StateValidatorForm = undefined;

	cod_facultad_selected_postgrado: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_planestudio_selected: number = 0;

  	constructor(private fb: FormBuilder) {}

	async initForm(): Promise<boolean> {
		this.fbForm = this.fb.group({
			Cod_Facultad_Postgrado_Selected: ['', [Validators.required]],
            Cod_Programa_Postgrado_Selected: ['', [Validators.required]],
            Cod_plan_estudio: ['', [Validators.required]],

			Descripcion_RangoAprobG: ["",[Validators.required, GPValidator.regexPattern("num_y_letras")]],
			NotaMinima: ["4.0",[Validators.required, GPValidator.rangeValidator()]],
			NotaMaxima: ["7.0",[Validators.required, GPValidator.rangeValidator()]],
			RexeReglamentoEstudio: [ "",[Validators.required, GPValidator.regexPattern("num_y_letras")]],
			aux: [""],
		});
		return true;
	}

	resetForm(): void {
		this.fbForm.reset({
			Cod_Facultad_Postgrado_Selected: '',
            Cod_Programa_Postgrado_Selected: '',
            Cod_plan_estudio: '',

			Descripcion_RangoAprobG: "",
			NotaMinima: "4.0",
			NotaMaxima: "7.0",
			RexeReglamentoEstudio: "",
			aux: "",
		});
		this.fbForm.enable();
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
        this.fbForm.get('Cod_plan_estudio')?.disable();
		this.resetValuesVarsSelected();
		console.log("resetee form rangos");
	}

	resetValuesVarsSelected(){
        this.cod_facultad_selected_postgrado = 0;
        this.cod_programa_postgrado_selected = 0;
        this.cod_planestudio_selected = 0;
    }

	setForm(mode: "show" | "edit", data: RangoAG): void {
		console.log("data RangoAG",data);
		
		this.fbForm.patchValue({ ...data });
		if (mode === "show") {
			this.fbForm.disable();
		}
		if (mode === "edit") {
			this.fbForm.patchValue({ aux: data });
		}
	}

	//DROPDOWNS POSTGRADO
    //INICIO FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 
    resetControlsWhenChangedDropdownFacultadPostgrado(){
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.reset();
		this.fbForm.get('Cod_plan_estudio')?.reset();
	}

    disabledControlsWhenChangedDropdownFacultadPostgrado(){
        this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
		this.fbForm.get('Cod_plan_estudio')?.disable();
    }

    setStatusControlProgramaPostgrado(status: boolean){
        const control = this.fbForm.get('Cod_Programa_Postgrado_Selected');
        status ? control?.enable() : control?.disable()
    }
    //FIN FUNCIONES PARA DROPDOWN FACULTAD POSTGRADO 

	//INICIO FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO
	resetControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('Cod_plan_estudio')?.reset();
	}

	disabledControlsWhenChangedDropdownProgramaPostgrado(){
		this.fbForm.get('Cod_plan_estudio')?.disable();
	}

	setStatusControlPlanEstudioPostgrado(status: boolean){
		const control = this.fbForm.get('Cod_plan_estudio');
		status ? control?.enable() : control?.disable()
	}
	//FIN FUNCIONES PARA DROPDOWN PROGRAMA POSTGRADO

	async setDropdownsAndVars(dataDropdowns: any){
		this.fbForm.patchValue({Cod_Facultad_Postgrado_Selected: dataDropdowns.cod_facultad_selected_notform});
		this.fbForm.patchValue({Cod_Programa_Postgrado_Selected: dataDropdowns.cod_programa_postgrado_selected_notform});
		this.fbForm.patchValue({Cod_plan_estudio: dataDropdowns.cod_plan_estudio_selected_notform});
		this.cod_facultad_selected_postgrado = dataDropdowns.cod_facultad_selected_notform;
		this.cod_programa_postgrado_selected = dataDropdowns.cod_programa_postgrado_selected_notform;
		this.cod_planestudio_selected = dataDropdowns.cod_plan_estudio_selected_notform;
	}

	disableDropdowns(){
		this.fbForm.get('Cod_Facultad_Postgrado_Selected')?.disable();
		this.fbForm.get('Cod_Programa_Postgrado_Selected')?.disable();
		this.fbForm.get('Cod_plan_estudio')?.disable();
	}
}