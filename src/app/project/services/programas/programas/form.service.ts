import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
import { EstadoMaestro } from 'src/app/project/models/programas/EstadoMaestro';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';
import { MessageServiceGP } from '../../components/message-service.service';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { Campus } from 'src/app/project/models/programas/Campus';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { BackendProgramasService } from './backend.service';
import { ProgramaMainService } from './main.service';
import { Message } from 'primeng/api';

interface Director {
    nombre: string,
    rut: string
}

interface CardPrograma {
  id: number,
  col_lg: number,
  col_md: number,
  isEditable: boolean,
  isEditableWithPE: boolean,
  haveSecondaryValue: boolean,
  modeDialog:ModeDialog,
  collection: CollectionsMongo,
  items: InputPrograma[]
}

interface InputPrograma {
  title: string,
  control: string,
  iconHelp: boolean,
  labelHelp?: string,
  principalValue?: string,
  secondaryName?: string,
  secondaryValue?: string,
}

@Injectable({
    providedIn: 'root'
})

export class FormProgramaService {
	public fbForm!: FormGroup;
	public fbFormUpdate!: FormGroup;
	modeForm: ModeForm = undefined;
	stateForm: StateValidatorForm = undefined;
	stateFormUpdate: StateValidatorForm = undefined;
	dialogSuccessAddPrograma: boolean = false;
	
	//VARS SELECTED
	directorSelected: Director = {nombre: '' , rut: ''};
	directorAlternoSelected: Director = {nombre: '' , rut: ''};
	reglamentoSelected: string = '';
	estadoMaestroSelected: string = '';
	estadoAcreditacionSelected: string = '';
	estadoAcreditacionSiglaSelected: string = '';
	tipoProgramaSelected: string = '';
	tipoProgramaCategoriaSelected: string = '';
	campusSelected: string = '';
	tipoGraduacionSelected: string = '';
	unidadAcademicaSelected: string = '';
	unidadAcademicaFacultadSelected: string = '';
	nameProgramaAdded: string = '';
	codProgramaAdded: number = 0;
	activeIndexStepper: number | undefined = 0 ;
	activeIndexStateForm: number | undefined = 0;
	activeIndexAcordionAddPrograma: number | undefined = 0;
	showTableDirectores: boolean = false;
	showTableDirectoresAlternos: boolean = false;

	//VALUE INPUTS
	inputEstadoAcreditacion: string = '';
	inputReglamento: string = '';
	inputDirector: Director = {nombre: '' , rut: ''};
	inputDirectorAlterno: string = '';
	inputEstadoMaestro: string = '';
	inputTipoSuspension: string = '';

	searchValue: string = '';

	inputs: CardPrograma[] = [
		{id:1, col_lg: 4, col_md: 6, isEditable: true,   isEditableWithPE: true,  haveSecondaryValue: false, modeDialog: 'centro costo' , collection: 'centro_costo' , items: [{title: 'Centro de responsabilidad' , control: 'Centro_costo' , iconHelp: false}]},
		{id:2, col_lg: 4, col_md: 6, isEditable: true,   isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'nombre' , collection: 'nombre_programa' , items: [{title: 'Nombre' , control: 'Nombre_programa' ,   iconHelp: false}]},
		{id:3, col_lg: 4, col_md: 6, isEditable: true,   isEditableWithPE: true,  haveSecondaryValue: false, modeDialog: 'grupo_correo' , collection: 'grupo_correo' , items: [{title: 'Grupo de correo' , control: 'Grupo_correo' ,   iconHelp: false}]},
		{id:4, col_lg: 4, col_md: 6, isEditable: false,  isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: undefined , collection: undefined , items: [{title: 'Código de programa' , control: 'Cod_Programa' , iconHelp: false}]},
		{id:5, col_lg: 4, col_md: 6, isEditable: true,   isEditableWithPE: true,  haveSecondaryValue: false, modeDialog: 'código SIES' , collection: 'codigo_sies' , items: [{title: 'Código SIES' , control: 'Codigo_SIES' ,   iconHelp: false}]},
		{id:6, col_lg: 2, col_md: 6, isEditable: true,   isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'créditos totales' , collection: 'creditos_totales' , items: [{title: 'Créditos totales' , control: 'Creditos_totales' ,   iconHelp: false}]},
		{id:7, col_lg: 2, col_md: 6, isEditable: true,   isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'horas totales' , collection: 'horas_totales' , items: [{title: 'Horas totales' , control: 'Horas_totales' ,   iconHelp: false}]},
		{id:8, col_lg: 4, col_md: 6, isEditable: true,   isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'REXE' , collection: 'REXE' , items: [{title: 'REXE' , control: 'REXE' ,  iconHelp: false}]},
		{id:9, col_lg: 4, col_md: 6, isEditable: true,   isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'título' , collection: 'titulo' ,items: [{title: 'Título' , control: 'Titulo' ,   iconHelp: false}]},
		{id:10, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'grado académico' , collection: 'grado_academico' , items: [{title: 'Grado académico' , control: 'Grado_academico' ,   iconHelp: false}]},
		{id:11, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: true, modeDialog: 'tipo de programa' , collection: 'tipo_programa' , items: [{title: 'Tipo de programa (Categoría)' , control: '' ,   iconHelp: false, principalValue: 'form.tipoProgramaSelected' , secondaryName:'Categoría' , secondaryValue: 'form.tipoProgramaCategoriaSelected'}]},
		{id:12, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'campus' , collection: 'campus' , items: [{title: 'Campus' , control: '' ,   iconHelp: false, principalValue: 'form.campusSelected'}]},
		{id:13, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'estado acreditación' , collection: 'estados_acreditacion' , items: [{title: 'Estado de acreditación' , control: '' ,   iconHelp: false, principalValue: 'form.inputEstadoAcreditacion'}]},
		{id:14, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: true, modeDialog: 'estado maestro' , collection: 'estado_maestro' , items: [{title: 'Estado maestro' , control: '' ,   iconHelp: false, principalValue: 'form.inputEstadoMaestro', secondaryName:'Tipo de suspensión', secondaryValue: 'form.inputTipoSuspension'}]},
		{id:15, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'reglamento' , collection: 'reglamentos' , items: [{title: 'Reglamento' , control: '' ,   iconHelp: false, principalValue: 'form.inputReglamento'}]},
		{id:16, col_lg: 4, col_md: 6, isEditable: true,  isEditableWithPE: false,  haveSecondaryValue: true, modeDialog: 'director' , collection: 'director' , items: [{title: 'Director(a)' , control: '' ,   iconHelp: false, principalValue: 'form.inputDirector.nombre', secondaryName: 'RUT', secondaryValue: 'form.inputDirector.rut'}]},
		{id:17, col_lg: 4, col_md: 12, isEditable: true, isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'unidades académicas' , collection: 'unidades_academicas' , items: [{title: 'Unidades académicas', control: 'Unidades_academicas_Selected' ,   iconHelp: true, labelHelp: 'Organizadas por la facultad a la cual pertenecen'}]},
		{id:18, col_lg: 8, col_md: 12, isEditable: true, isEditableWithPE: false,  haveSecondaryValue: false, modeDialog: 'director alterno' , collection: 'directorAlterno' , 
		items: [
			{title: '¿Tiene director(a) alterno(a)?' , control: 'haveDirectorAlterno' , iconHelp: false},
			{title: 'Director(a) alterno(a)', control: '', iconHelp: false, principalValue: 'form.inputDirectorAlterno'}
		]
		},
		{id:19, col_lg: 12, col_md: 12, isEditable: true, isEditableWithPE: false, haveSecondaryValue: false, modeDialog: 'graduación colaborativa' , collection: 'graduacion_colaborativa', 
		items: [
			{title: '¿Tiene graduación colaborativa?' , control: 'Graduacion_Conjunta_Switch' , iconHelp: false},
			{title: 'Tipo de graduación colaborativa' , control: '' , iconHelp: false, principalValue: 'form.tipoGraduacionSelected'},
			{title: 'Instituciones asociadas' , control: 'Instituciones_Selected' , iconHelp: false, },
		]
		},
		{id:20, col_lg: 12, col_md: 12, isEditable: true, isEditableWithPE: true, haveSecondaryValue: false, modeDialog: 'certificación intermedia' , collection: 'certificacion_intermedia', 
		items: [
			{title: '¿Tiene certificación intermedia?' , control: 'Certificacion_intermedia_Switch' , iconHelp: false},
			{title: 'Certificaciones intermedias' , control: 'Certificacion_intermedia_Selected' , iconHelp: false}
		]
		},
	]

  	filteredInputs: CardPrograma[] = [...this.inputs];

	messages: Message[] = [];

	constructor(
		private fb: FormBuilder,
		private messageService: MessageServiceGP
	){}

	initForm(): Promise<boolean>{
		return new Promise((success) => {
			this.fbForm = this.fb.group({
			//paso 1
			Centro_costo: ['', [GPValidator.regexPattern('solo_num')]],
			Nombre_programa: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			Grupo_correo: ['', [GPValidator.checkCorreoUV()]],
			Cod_Programa: ['', ],
			Codigo_SIES: ['', [GPValidator.regexPattern('num_y_letras')]],
			Creditos_totales: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
			Horas_totales: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
			Titulo: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			Grado_academico: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
			REXE: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],
			
			//paso 2
			Tipo_programa: ['', [Validators.required]],
			Campus: ['', [Validators.required]],
			Unidad_academica: ['', [Validators.required]],
			Unidades_academicas_Selected: [''],
			EstadoMaestro: ['', [Validators.required]],
			Cod_EstadoMaestro: ['', [Validators.required]],
			Graduacion_Conjunta_Switch: [false],
			Instituciones: [{value:'', disabled: true}, [Validators.required]],
			Instituciones_Selected: [''],
			TipoGraduacion: [{value:'', disabled: true}, [Validators.required]],
			Certificacion_intermedia_Switch: [false],
			Certificacion_intermedia: [{value:'', disabled: true}, [Validators.required]],
			Certificacion_intermedia_Selected: [''],
			Cod_TipoGraduacion: [''],
		
			//paso 3 
			Cod_Reglamento: ['', [Validators.required]],
			Director: ['', [Validators.required, RutValidator.rut]],
			Director_selected: ['', [Validators.required, GPValidator.notSameDirectorsSelected()]],
			haveDirectorAlterno: [false],
			Director_alterno: ['', [RutValidator.rut, , GPValidator.notSameAsDirector('Director','Director_selected')]],
			DirectorAlterno_selected: ['',  GPValidator.requiredDirectorAlternoSelected()],
			Cod_acreditacion: ['', ],
		
			//file maestro
			file_maestro: [[], GPValidator.filesValidator('file_maestro',() => this.modeForm)],
			});
			this.fbFormUpdate = this.fb.group({});
			// console.log("inicié formulario programa");
			success(true)
		})
	}

	resetForm(): void {
		this.fbForm.reset({
			Centro_costo: '',
			Nombre_programa: '',
			Grupo_correo: '',
			Cod_Programa: '',
			Codigo_SIES: '',
			Creditos_totales: '',
			Horas_totales: '',
			Titulo: '',
			Grado_academico: '',
			REXE: '',
			
			Tipo_programa: '',
			Campus: '',
			Unidad_academica: '',
			Unidades_academicas_Selected: '',
			EstadoMaestro: '',
			Cod_EstadoMaestro: '',
			Graduacion_Conjunta_Switch: false,
			Instituciones: '',
			Instituciones_Selected: '',
			TipoGraduacion:'',
			Certificacion_intermedia_Switch: false,
			Certificacion_intermedia: '',
			Certificacion_intermedia_Selected: '',
		
			Cod_Reglamento: '',
			Director: '',
			Director_selected: '',
			haveDirectorAlterno: false,
			Director_alterno: '',
			DirectorAlterno_selected: '',
			Cod_acreditacion: '',
		
			file_maestro: []
		})
		this.directorSelected = {nombre: '', rut: ''};
		this.directorAlternoSelected = {nombre: '', rut: ''};
		this.reglamentoSelected = '';
		this.estadoMaestroSelected = '';
		this.estadoAcreditacionSelected = '';
		this.estadoAcreditacionSiglaSelected = '';
		this.tipoProgramaSelected = '';
		this.tipoProgramaCategoriaSelected = '';
		this.campusSelected = '';
		this.tipoGraduacionSelected = '';
		this.unidadAcademicaSelected = '';
		this.unidadAcademicaFacultadSelected = '';
		this.nameProgramaAdded = '';
		this.codProgramaAdded = 0;
		this.activeIndexStepper = 0;
		this.activeIndexStateForm = 0;
		this.activeIndexAcordionAddPrograma = 0;
		this.dialogSuccessAddPrograma = false;
		this.fbForm.enable()
		this.fbForm.get('Instituciones')?.disable();
		this.fbForm.get('TipoGraduacion')?.disable();
		this.fbForm.get('Certificacion_intermedia')?.disable();
		this.resetFileMaestro();
		this.resetValueInputs();
		this.setEditableInputs();
		console.log("resetee formulario programa");
	}

	resetFileMaestro(){
		this.fbForm.get('file_maestro')?.clearValidators();
		this.fbForm.get('file_maestro')?.setValidators([GPValidator.filesValidator('file_maestro',() => this.modeForm)]);
		this.fbForm.get('file_maestro')?.updateValueAndValidity();
	}

	filterInputs(){
		const searchTerm = this.normalizeString(this.searchValue);
		this.filteredInputs = this.inputs.filter(input =>
		input.items.some(item => this.normalizeString(item.title).includes(searchTerm))
		);
	}

	normalizeString(value: string): string {
		return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
	}

	setEditableInputs(){
		const editableFields = this.inputs
		.filter(input => input.isEditableWithPE)
		.map(input => input.items.map(item => `<i>${item.title}</i>`).join(', '))
		.join(', ');

		this.messages = [
			{
				severity: 'info',
				summary: 'Atención',
				detail: `
							<b>Si el programa está asociado a un plan de estudio:</b> solo se pueden actualizar los siguientes campos: ${editableFields}. No obstante, es posible actualizar documentos asociados a todos los campos. <br/>
							<b>Si el programa no está asociado a un plan de estudio:</b> todos los campos son actualizables, excepto el <i>Código de programa</i>.

						`
			}
		]
	}

	resetFilter() {
		this.searchValue = ''; 
		this.filteredInputs = [...this.inputs]; 
	}
	
	setForm(form: Programa): void {
		this.fbForm.patchValue({
			...form, 
			Graduacion_Conjunta_Switch: form.Graduacion_Conjunta === 1 ? true : false,
			Certificacion_intermedia_Switch: form.Certificacion_intermedia === 1 ? true : false,
			haveDirectorAlterno: form.Director_alterno !== '0' ? true : false
		});
		this.setValuesInputs(form);
		console.log("ASI QUEDA EL FORM2",this.fbForm.value);
	}

	setValuesInputs(data: Programa){
		this.inputEstadoAcreditacion = data.Descripcion_acreditacion!;
		this.inputReglamento = data.Descripcion_Reglamento!;
		this.inputDirector = { nombre: data.nombre_Director! , rut: data.Director!};
		this.inputDirectorAlterno = data.Director_alterno! !== '0' ? `${data.nombreDirector_alterno!} - RUT:(${data.Director_alterno!})` : 'NO APLICA'
		this.inputEstadoMaestro = data.Descripcion_EstadoMaestro!;
		this.inputTipoSuspension = data.Cod_EstadoMaestro === 2 ? data.Descripcion_TipoSuspension! : '';
	}

	resetValueInputs(){
		this.inputEstadoAcreditacion = '';
		this.inputReglamento = '';
		this.inputDirector = {nombre: '' , rut: ''};
		this.inputDirectorAlterno = '';
		this.inputEstadoMaestro = '';
		this.inputTipoSuspension = '';
	}

	get stateStepOne() {
		if (
				this.fbForm.get('Centro_costo')!.invalid || 
				this.fbForm.get('Nombre_programa')!.invalid || 
				this.fbForm.get('Grupo_correo')!.invalid || 
				this.fbForm.get('Cod_Programa')!.invalid || 
				this.fbForm.get('Codigo_SIES')!.invalid || 
				this.fbForm.get('Creditos_totales')!.invalid || 
				this.fbForm.get('Horas_totales')!.invalid ||
				this.fbForm.get('Titulo')!.invalid ||
				this.fbForm.get('Grado_academico')!.invalid || 
				this.fbForm.get('REXE')!.invalid 
			) {
			return false;
		} else {
			return true;
		}
	}
	
	get stateStepTwo() {
		if (
				this.fbForm.get('Tipo_programa')!.invalid || 
				this.fbForm.get('Campus')!.invalid || 
				this.fbForm.get('Unidad_academica')!.invalid || 
				this.fbForm.get('Cod_EstadoMaestro')!.invalid || 
				this.fbForm.get('Instituciones')!.invalid ||
				this.fbForm.get('TipoGraduacion')!.invalid ||
				this.fbForm.get('Certificacion_intermedia')!.invalid 
			) {
			return false;
		} else {
			return true;
		}
	}
	
	get stateStepThree() {
		if (
				this.fbForm.get('Cod_Reglamento')!.invalid || 
				this.fbForm.get('Director_selected')!.invalid || 
				this.fbForm.get('DirectorAlterno_selected')!.invalid || 
				this.fbForm.get('Cod_acreditacion')!.invalid
			) {
			return false;
		} else {
			return true;
		}
	}
	
	get stateFileMaestro(){
		if (this.fbForm.get('file_maestro')!.invalid) {
			return false;
		}else{
			return true;
		}
	}
  
	get stateFormPrograma() {
		return this.stateStepOne && this.stateStepTwo && this.stateStepThree && this.stateFileMaestro;
	}

	getValuesSelected(): void {
		let valuesSelected = {
			directorSelected: this.directorSelected,
			directorAlternoSelected: this.directorAlternoSelected,
			reglamentoSelected: this.reglamentoSelected,
			estadoMaestroSelected: this.estadoMaestroSelected,
			tipoProgramaSelected: this.tipoProgramaSelected,
			tipoProgramaCategoriaSelected: this.tipoProgramaCategoriaSelected,
			campusSelected: this.campusSelected,
			unidadAcademicaSelected: this.unidadAcademicaSelected,
			unidadAcademicaFacultadSelected: this.unidadAcademicaFacultadSelected,
			tipoGraduacionSelected: this.tipoGraduacionSelected,
		}
		console.log("valuesSelected",valuesSelected);
	}

	getValuesIndex(): void{
		let valuesIndex = {
			activeIndexStepper: this.activeIndexStepper,
			activeIndexStateForm: this.activeIndexStateForm,
			activeIndexAcordionAddPrograma: this.activeIndexAcordionAddPrograma
		}
		console.log("valuesIndex",valuesIndex);
	}

	updateFilesForm(files: any): void {
		this.fbForm.patchValue({ file_maestro: files });
		this.fbForm.controls['file_maestro'].updateValueAndValidity();
	}

	haveDirectorAlterno(dA: boolean){
		switch (dA) {
			case true: 
			this.fbForm.patchValue({haveDirectorAlterno: true});
			this.fbForm.get('DirectorAlterno_selected')?.updateValueAndValidity();
			this.activeIndexAcordionAddPrograma = 2; 
			break;
			case false:
			this.fbForm.patchValue({haveDirectorAlterno: false});
			this.fbForm.get('Director_alterno')?.reset();
			this.fbForm.get('DirectorAlterno_selected')?.reset();
			this.fbForm.get('DirectorAlterno_selected')?.updateValueAndValidity();
			this.showTableDirectoresAlternos = false;
			this.unsetSelectDirector('alterno'); 
			this.activeIndexAcordionAddPrograma = 1; 
			break;
		}
	}

	setSelectEstadoAcreditacion(eaSelected : EstadosAcreditacion){
		this.messageService.clear();
		if (eaSelected.Acreditado == 'SI') {
		this.estadoAcreditacionSelected = `Acreditado por: ${eaSelected.tiempo?.Cantidad_anios} años ( ${eaSelected.tiempo?.Fecha_inicio} - ${eaSelected.tiempo?.Fecha_termino} )`
		this.estadoAcreditacionSiglaSelected = eaSelected.Sigla!;
		}else{
		this.estadoAcreditacionSelected = 'No acreditado'
		this.estadoAcreditacionSiglaSelected = eaSelected.Sigla!;
		}
		this.fbForm.patchValue({ Cod_acreditacion: eaSelected.Cod_acreditacion })
		this.messageService.add({
		key: 'main',
		severity: 'info',
		detail: `Estado acreditación: "${eaSelected.Sigla}" seleccionado`,
		});
	}
	
	unsetSelectEstadoAcreditacion(eaSelected?: EstadosAcreditacion){
		this.fbForm.patchValue({ Cod_acreditacion: '' })
		this.estadoAcreditacionSelected = ''
		this.estadoAcreditacionSiglaSelected = ''
		if (eaSelected) {
		this.messageService.clear();
		this.messageService.add({
			key: 'main',
			severity: 'info',
			detail: `Estado acreditación: "${eaSelected.Sigla}" deseleccionado`,
		});
		}
	}

	setSelectEstadoMaestro(emSelected : EstadoMaestro){
		this.fbForm.patchValue({ Cod_EstadoMaestro: emSelected.Cod_EstadoMaestro })
		this.estadoMaestroSelected = emSelected.Descripcion_EstadoMaestro!;
	}

	setSelectReglamento(reglamentoSelected : Reglamento){
		this.messageService.clear();
		this.reglamentoSelected = reglamentoSelected!.Descripcion_regla!;
		this.fbForm.patchValue({ Cod_Reglamento: reglamentoSelected?.Cod_reglamento })
		this.messageService.add({
			key: 'main',
			severity: 'info',
			detail: `Reglamento: "${reglamentoSelected!.Descripcion_regla}" seleccionado`,
		});
	}

	unsetSelectReglamento(reglamentoSelected?: Reglamento){
		this.reglamentoSelected = '';
		this.fbForm.patchValue({ Cod_Reglamento: '' })
		if (reglamentoSelected) {
		this.messageService.clear();
		this.messageService.add({
			key: 'main',
			severity: 'info',
			detail: `Reglamento: "${reglamentoSelected.Descripcion_regla}" deseleccionado`,
		});
		}
	}

  setSelectDirector(mode: 'director' | 'alterno' , nombre: string, rut: string){
      switch (mode) {
        case 'director':
          this.directorSelected = {
            nombre: nombre,
            rut: rut
          }
          this.fbForm.patchValue({Director_selected: rut})
          this.fbForm.get('Director')?.disable();
        break;
        case 'alterno':
          this.directorAlternoSelected = {
            nombre: nombre,
            rut: rut
          }
          this.fbForm.patchValue({DirectorAlterno_selected: rut})
          this.fbForm.get('Director_alterno')?.disable();
        break;
      }
  }

  unsetSelectDirector(mode: 'director' | 'alterno'){
      switch (mode) {
        case 'director':
          this.directorSelected = {
            nombre: '',
            rut: ''
          }
          this.fbForm.patchValue({Director_selected: ''})
          this.fbForm.get('Director')?.enable();
          this.haveDirectorAlterno(false)
        break;
        case 'alterno':
          this.directorAlternoSelected = {
            nombre: '',
            rut: ''
          }
          this.fbForm.patchValue({DirectorAlterno_selected: ''})
          this.fbForm.get('Director_alterno')?.enable();
          // this.fbForm.get('DirectorAlterno_selected')?.reset();
        break;
      }
  }

  unsetSelectDirectorFormUpdate(mode: 'director' | 'alterno'){
    switch (mode) {
      case 'director':
        this.directorSelected = {
          nombre: '',
          rut: ''
        }
        this.fbFormUpdate.patchValue({Director_selected: ''})
        this.fbFormUpdate.get('Director')?.enable();
        this.haveDirectorAlterno(false)
      break;
      case 'alterno':
        this.directorAlternoSelected = {
          nombre: '',
          rut: ''
        }
        this.fbFormUpdate.patchValue({DirectorAlterno_selected: ''})
        this.fbFormUpdate.get('Director_alterno')?.enable();
        // this.fbForm.get('DirectorAlterno_selected')?.reset();
      break;
    }
}

  setSelectTipoPrograma(selectedTp: TipoPrograma){
    this.tipoProgramaSelected = selectedTp.Descripcion_tp!;
    this.tipoProgramaCategoriaSelected = selectedTp.Categoria?.Descripcion_categoria!;
  }

  setSelectCampus(selectedCampus: Campus){
      this.campusSelected = selectedCampus.descripcionCampus!;
  }
  
  setSelectTipoGraduacion(selectedTipoGraduacion: TipoGraduacion){
    this.tipoGraduacionSelected = selectedTipoGraduacion.Descripcion_tipoColaborativa!;
  }

  unsetSelectTipoGraduacion(){
    this.tipoGraduacionSelected = 'NO APLICA';
  }

  setSelectUnidadAcademica(selectedTp: UnidadAcademica){
      this.unidadAcademicaSelected = selectedTp.Descripcion_ua!;
      this.unidadAcademicaFacultadSelected = selectedTp.Facultad?.Descripcion_facu!;
  }

  async setFormUpdate(modeDialog: ModeDialog, programa: Programa, isEditableWithPE: boolean): Promise<boolean> {
    this.modeForm = 'edit';
    switch (modeDialog) {
      case 'centro costo':
        this.fbFormUpdate = this.fb.group({
          Centro_costo: [programa.Centro_costo, [Validators.required, GPValidator.regexPattern('solo_num')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'nombre':
        this.fbFormUpdate = this.fb.group({
          Nombre_programa: [programa.Nombre_programa, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        });
      break;
      case 'grupo_correo':
        this.fbFormUpdate = this.fb.group({
          Grupo_correo: [programa.Grupo_correo, [Validators.required, GPValidator.checkCorreoUV()]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        });  
      break;
      case 'código SIES':
        this.fbFormUpdate = this.fb.group({
          Codigo_SIES: [programa.Codigo_SIES, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'créditos totales':  
        this.fbFormUpdate = this.fb.group({
          Creditos_totales: [programa.Creditos_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        });
      break;
      case 'horas totales':
        this.fbFormUpdate = this.fb.group({
          Horas_totales: [programa.Horas_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'REXE':
        this.fbFormUpdate = this.fb.group({
          REXE: [programa.REXE, [Validators.required, GPValidator.regexPattern('num_o_letras')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'título':
        this.fbFormUpdate = this.fb.group({
          Titulo: [programa.Titulo, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'grado académico':
        this.fbFormUpdate = this.fb.group({
          Grado_academico: [programa.Grado_academico, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
          isEditableWithPE: [isEditableWithPE],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'tipo de programa':
        this.fbFormUpdate = this.fb.group({
          Tipo_programa: [programa.Tipo_programa, [Validators.required]],
          isEditableWithPE: [isEditableWithPE],
          Descripcion_TP_Old: [this.tipoProgramaSelected],
          Description_TP_New: [],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'campus':
        this.fbFormUpdate = this.fb.group({
          Campus: [programa.Campus, [Validators.required]],
          isEditableWithPE: [isEditableWithPE],
          Descripcion_Campus_Old: [this.campusSelected],
          Description_Campus_New: [],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)] 
        }); 
      break;
      case 'estado acreditación':
        this.fbFormUpdate = this.fb.group({
          Cod_acreditacion: [programa.Cod_acreditacion, [Validators.required]],
          isEditableWithPE: [isEditableWithPE],
          nombreEstadoAcreditacion: [programa.Descripcion_acreditacion],
        });  
      break;
      case 'estado maestro':
        this.fbFormUpdate = this.fb.group({
          EstadoMaestro: [programa.Cod_EstadoMaestro, [Validators.required]],
          isEditableWithPE: [isEditableWithPE],
          TipoSuspension: [{value:'', disabled: true}],
          files: [[]]
        });  
      break;
      case 'reglamento':
        this.fbFormUpdate = this.fb.group({
          Cod_Reglamento: [programa.Cod_Reglamento, [Validators.required]],
          isEditableWithPE: [isEditableWithPE],
          nombreReglamento: [programa.Descripcion_Reglamento],
        });  
      break;
      case 'director':
        this.fbFormUpdate = this.fb.group({
          Director: [programa.Director, [Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate('D',programa.Director!, programa.Director_alterno!)]],
          isEditableWithPE: [isEditableWithPE],
          Director_selected: [programa.Director, [Validators.required]],
          nombreDirector: [programa.nombre_Director],
          files: [[]]
        });  
      break;
      case 'unidades académicas':
        this.fbFormUpdate = this.fb.group({
          Unidad_academica: [this.fbForm.get('Unidades_academicas_Selected')?.value, [Validators.required]],
          isEditableWithPE: [isEditableWithPE],
          Unidad_academica_old: [this.fbForm.get('Unidades_academicas_Selected')?.value],
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
        });
      break;
      case 'director alterno':
        this.fbFormUpdate = this.fb.group({
          haveDirectorAlterno: [this.fbForm.get('haveDirectorAlterno')?.value],
          isEditableWithPE: [isEditableWithPE],
          Director_alterno: [programa.Director_alterno, [Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate('A',programa.Director!, programa.Director_alterno!)]],
          DirectorAlterno_selected: [programa.Director_alterno, [Validators.required]],
          nombreDirector_alterno: [programa.nombreDirector_alterno],
          files: [[]]
        });  
      break;
      case 'graduación colaborativa':
        this.fbFormUpdate = this.fb.group({
          Graduacion_Conjunta_Switch: [this.fbForm.get('Graduacion_Conjunta_Switch')?.value],
          isEditableWithPE: [isEditableWithPE],
          Cod_TipoGraduacion: [programa.Cod_TipoGraduacion, [Validators.required]],
          Descripcion_TG_Old: [this.tipoGraduacionSelected],
          Description_TG_New: [],
          Instituciones: [this.fbForm.get('Instituciones_Selected')?.value, [Validators.required]],
          Instituciones_old: [this.fbForm.get('Instituciones_Selected')?.value],
          files: [[]]
        });  
      break;

      case 'certificación intermedia':
        this.fbFormUpdate = this.fb.group({
          Certificacion_intermedia_Switch: [this.fbForm.get('Certificacion_intermedia_Switch')!.value],
          isEditableWithPE: [isEditableWithPE],
          Certificacion_intermedia: [this.fbForm.get('Certificacion_intermedia_Selected')?.value, [Validators.required]],
          Certificacion_intermedia_old: [this.fbForm.get('Certificacion_intermedia_Selected')?.value],
          files: [[]]
        });
      break;

      case 'maestro':
        this.fbFormUpdate = this.fb.group({
          files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
        })  
      break;


    }
    this.fbFormUpdate.statusChanges.subscribe(status => {
      this.stateFormUpdate = status as StateValidatorForm
    });
    return true
  }

  updateFilesFormUpdate(files: any){
    this.fbFormUpdate.patchValue({ files });
    this.fbFormUpdate.get('files')?.updateValueAndValidity();
  }



}