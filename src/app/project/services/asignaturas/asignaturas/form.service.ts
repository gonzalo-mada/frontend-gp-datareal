import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { MessageServiceGP } from '../../components/message-service.service';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';
import { Asignatura, ModeDialogAsign } from 'src/app/project/models/asignaturas/Asignatura';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';

interface InputAsignatura {
    title: string,
    control: string,
    iconHelp: boolean,
    labelHelp?: string,
    principalValue?: string,
    secondaryName?: string,
    secondaryValue?: string,
}

interface CardAsignatura {
    // id: number,
    col_lg: number,
    col_md: number,
    isEditable: boolean,
    canEdit: boolean, //puede ser editable segun regla de negocio
    haveSecondaryValue: boolean,
    modeDialog: ModeDialogAsign,
    collection: CollectionsMongo,
    items: InputAsignatura[]
}

@Injectable({
    providedIn: 'root'
})

export class FormAsignaturasService {
    public fbForm!: FormGroup;
    public fbFormUpdate!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    stateFormUpdate: StateValidatorForm = undefined;

    //ELEMENTS FORM
    activeIndexStepper: number | undefined = 0 ;
    activeIndexStateForm: number | undefined = 0;
    searchValue: string = '';
    showButtonSubmitUpdate: boolean = false;
    confirmAdd: boolean = false;
    dialogSuccessAdd: boolean = false;
    sidebarVisible2: boolean = false;
    showCardForm: boolean = true;
    stepOne: boolean = false;
    disposition: boolean = true;
    dialogChooseDocsMaestro: boolean = false;
    dialogAsignaturas: boolean = false;
    loadedProgramas: boolean = false;
    loadedPlanes: boolean = false;
    dataExternal: DataExternal = { data: false };

    inputs: CardAsignatura[] = [
        {   
            col_lg: 6, col_md: 6, isEditable: false, canEdit: true, haveSecondaryValue: false, modeDialog: undefined, collection: undefined, 
            items: [
                { title: 'Plan de estudio', control: '', iconHelp: false, principalValue: 'form.selectedNombrePlanEstudio'}
            ]
        },
        {   
            col_lg: 6, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'nombre_asignatura', collection: 'nombre_asignatura', 
            items: [
                { title: 'Nombre', control: 'nombre_asignatura', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'codigo_externo', collection: 'codigo_externo_asign', 
            items: [
                { title: 'Código', control: 'codigo_externo', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'semestre', collection: 'semestre_asign', 
            items: [
                { title: 'Semestre', control: 'semestre', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'num_creditos', collection: 'num_creditos_asign', 
            items: [
                { title: 'Créditos', control: 'num_creditos', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'duracion', collection: 'duracion_asign', 
            items: [
                { title: 'Duración', control: 'duracion', iconHelp: false}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'obligatoria_electiva', collection: 'obligatoria_electiva_asign', 
            items: [
                { title: '¿Es obligatoria o electiva?', control: 'obligatoria_electiva', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'max_duracion', collection: 'max_duracion_asign', 
            items: [
                { title: 'Máximo de duración', control: 'max_duracion', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'modalidad', collection: 'modalidad_asign', 
            items: [
                { title: 'Modalidad', control: '', iconHelp: false, principalValue: 'form.selectedModalidad'}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'regimen', collection: 'regimen_asign', 
            items: [
                { title: 'Régimen', control: '', iconHelp: false, principalValue: 'form.selectedRegimen'}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'cod_tipo_evaluacion', collection: 'tipo_evaluacion_asign', 
            items: [
                { title: 'Tipo de evaluación', control: '', iconHelp: false, principalValue: 'form.selectedTipoEvaluacion'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, canEdit: true, haveSecondaryValue: true, modeDialog: 'tiene_evaluacionintermedia', collection: 'evaluacion_intermedia_asign', 
            items: [
                { title: '¿Tiene evaluación intermedia?', control: 'tiene_evaluacionintermedia', iconHelp: false}
            ]
        },
        {   
            col_lg: 12, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'horas', collection: 'horas_asign', 
            items: [
                { title: 'Horas síncronas', control: 'horas_sincronas', iconHelp: false},
                { title: 'Horas asíncronas', control: 'horas_asincronas', iconHelp: false},
                { title: 'Horas presenciales', control: 'horas_presenciales', iconHelp: false},
                { title: 'Horas indirectas', control: 'horas_indirectas', iconHelp: false},
                { title: 'Horas totales', control: '', iconHelp: false, principalValue: 'form.selected_totalHoras'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'tiene_articulacion', collection: 'articulacion_asign', 
            items: [
                { title: '¿Es articulable?', control: 'tiene_articulacion', iconHelp: false},
                { title: 'Número de articulaciones', control: '', iconHelp: false, principalValue: 'form.selectedArticulacion'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'tiene_mencion', collection: 'mencion_asign', 
            items: [
                { title: '¿Incluida en mención?', control: 'tiene_mencion', iconHelp: false},
                { title: 'Número de menciones', control: '', iconHelp: false, principalValue: 'form.selectedMenciones'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'tiene_prerequisitos', collection: 'pre_requisitos_asign', 
            items: [
                { title: '¿Tiene prerrequisitos?', control: 'tiene_prerequisitos', iconHelp: false},
                { title: 'Número de asignaturas', control: '', iconHelp: false, principalValue: 'form.selectedPrerrequisitos'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'tiene_secuencialidad', collection: 'secuencialidad_asign', 
            items: [
                { title: '¿Es paralela o secuencial?', control: 'tiene_secuencialidad', iconHelp: false},
                { title: 'Número de asignaturas', control: '', iconHelp: false, principalValue: 'form.selectedSecuencialidadesParalelidades'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'cod_tipo_colegiada', collection: 'tipo_colegiada_asign', 
            items: [
                { title: '¿Es colegiada?', control: 'cod_tipo_colegiada', iconHelp: false},
                { title: 'Tipo de colegiada', control: '', iconHelp: false, principalValue: 'form.selectedTipoColegiada'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, canEdit: true, haveSecondaryValue: false, modeDialog: 'tiene_tema', collection: 'tema_asign', 
            items: [
                { title: '¿Tiene tema?', control: 'tiene_tema', iconHelp: false},
                { title: 'Número de temas', control: '', iconHelp: false, principalValue: 'form.selectedTemas'}
            ]
        },
    ];
    filteredInputs: CardAsignatura[] = [...this.inputs];

    //MESSAGES
    showMessageMencion: boolean = false;
    showMessagePreRequisitos: boolean = false;
    showMessageTema: boolean = false;
    showMessageSecuencialParalela: boolean = false;
    showMessageSinAsignaturas: boolean = false;
    showMessageSinAsignaturasSecuencialesParalelas: boolean = false;

    //VALUES SELECTED
    selectedFacultad: string = '';
    selectedPrograma: string = '';
    selectedPlanDeEstudio: string = '';
    selectedRegimen: string = '';
    selectedModalidad: string = '';
    selectedTipoEvaluacion: string = '';
    selectedTipoColegiada: string = '';
    selectedMencion: string = '';
    selectedMenciones: string = '';
    selectedArrayMenciones: any[] = [];
    selectedPrerrequisitos: string = '';
    selectedArrayPrerrequisitos: any[] = [];
    selectedSecuencialidadesParalelidades: string = '';
    selectedArraySecuencialidadesParalelidades: any[] = [];
    selectedNombrePlanEstudio: string = '';
    selectedArticulacion: string = '';
    selectedArrayArticulaciones: any[] = [];
    selectedObligatoria_electiva: string = '';
    selectedTemas: string = '';
    selectedArrayTemas: any[] = [];

    selectedControlAsignSecuenciales: any[] = [];
    selectedControlAsignParalelas: any[] = [];
    selectedControlPrerrequisitos: any[] = [];
    selectedControlTemas: any[] = [];

    selected_CodigoFacultad: number = 0;
    selected_CodigoPrograma: number = 0;
    selected_CodigoPlanDeEstudio: number = 0;
    selected_totalHoras: number = 0;

    //VALUES POST ADDED ASIGNATURA
    nameAsignaturaAdded: string = '';
    codAsignaturaAdded: string = '';
    //VARS TO OPEN FORMS POST ADDED PLAN

    constructor(
        private fb: FormBuilder,
        private messageService: MessageServiceGP
    ){}

    get stateStepOne() {
        if (
              this.fbForm.get('cod_programa')!.invalid || 
              this.fbForm.get('cod_plan_estudio')!.invalid || 
              this.fbForm.get('cod_modalidad')!.invalid || 
              this.fbForm.get('cod_regimen')!.invalid || 
              this.fbForm.get('cod_tipo_evaluacion')!.invalid || 
              this.fbForm.get('codigo_externo')!.invalid || 
              this.fbForm.get('nombre_asignatura')!.invalid ||
              this.fbForm.get('semestre')!.invalid ||
              this.fbForm.get('duracion')!.invalid ||
              this.fbForm.get('max_duracion')!.invalid ||
              this.fbForm.get('num_creditos')!.invalid 

            ) {
          return false;
        } else {
          return true;
        }
    }

    get stateStepTwo() {
        if (
                this.fbForm.get('horas_sincronas')!.invalid ||
                this.fbForm.get('horas_asincronas')!.invalid ||
                this.fbForm.get('horas_presenciales')!.invalid ||
                this.fbForm.get('horas_indirectas')!.invalid 
            ) {
            return false;
        } else {
            return true;
        }
    }

    get stateStepThree() {
        if (
                this.fbForm.get('tiene_mencion')!.invalid || 
                this.fbForm.get('tiene_evaluacionintermedia')!.invalid || 
                this.fbForm.get('tiene_prerequisitos')!.invalid || 
                this.fbForm.get('tiene_tema')!.invalid ||
                this.fbForm.get('obligatoria_electiva')!.invalid ||
                this.fbForm.get('tiene_articulacion')!.invalid ||
                this.fbForm.get('tiene_colegiada')!.invalid ||
                this.fbForm.get('tiene_secuencialidad')!.invalid 
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

    get stateFormAllSteps() {
        return this.stateStepOne && this.stateStepTwo && this.stateStepThree && this.stateFileMaestro;
    }

    get total_horas(){
        return this.fbForm.get('horas_sincronas')?.value + this.fbForm.get('horas_asincronas')?.value  + this.fbForm.get('horas_presenciales')?.value + this.fbForm.get('horas_indirectas')?.value 
    }

    get total_horas_update(){
        return this.fbFormUpdate.get('horas_sincronas')?.value + this.fbFormUpdate.get('horas_asincronas')?.value  + this.fbFormUpdate.get('horas_presenciales')?.value + this.fbFormUpdate.get('horas_indirectas')?.value 
    }

    getValuesSelected() {
        let valuesSelected = {
            asignSecuenciales: this.selectedControlAsignSecuenciales.length === 0 ? 'NO APLICA' : this.selectedControlAsignSecuenciales.map(as => as.data.nombre_asignatura_completa).join(' | '),
            asignParalelas: this.selectedControlAsignParalelas.length === 0 ? 'NO APLICA' : this.selectedControlAsignParalelas.map(ap => ap.data.nombre_asignatura_completa).join(' | '),
            asignPrerrequisitos: this.selectedControlPrerrequisitos.length === 0 ? 'NO APLICA' : this.selectedControlPrerrequisitos.map(pr => pr.data.nombre_asignatura_completa).join(' | '),
            asignTemas: this.selectedControlTemas.length === 0 ? 'NO APLICA' : this.selectedControlTemas.map(t => t.nombre_tema).join(' | '),
        }
        return valuesSelected
    }
    initForm(): Promise<boolean>{
        return new Promise((success) => {
            this.fbForm = this.fb.group({

                cod_facultad_selected: ['', [Validators.required]],

                //paso 1
                cod_programa: ['', [Validators.required]],
                cod_plan_estudio: ['', [Validators.required]],
                cod_modalidad: ['', [Validators.required]],
                cod_regimen: ['', [Validators.required]],
                cod_tipo_evaluacion: ['', [Validators.required]],
                codigo_externo: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],
                nombre_asignatura: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],
                semestre: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
                duracion: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
                max_duracion: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
                num_creditos: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],

                //paso 2
                horas_sincronas: [0, [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],
                horas_asincronas: [0, [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],
                horas_presenciales: [0, [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],
                horas_indirectas: [0, [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],


                //paso 3
                tiene_mencion: [null, [Validators.required]],
                menciones: ['', [Validators.required]],
                menciones_selected: [''],
                tiene_evaluacionintermedia: [null, [Validators.required]],
                tiene_prerequisitos: [null, [Validators.required]],
                pre_requisitos: ['', [Validators.required]],
                pre_requisitos_selected: [''],
                tiene_tema: [null, [Validators.required]],
                tema: ['', [Validators.required]],
                tema_selected: [''],
                obligatoria_electiva: [null, [Validators.required]],
                tiene_articulacion: [null, [Validators.required]],
                tiene_colegiada: [null, [Validators.required]],
                cod_tipo_colegiada: ['', [Validators.required]],
                tiene_secuencialidad: [null, [Validators.required]],
                secuencialidad: [[], [Validators.required]],
                secuencialidad_selected: [[]],
                paralelidad: [[], [Validators.required]],
                paralelidad_selected: [[]],

                file_maestro: [[], GPValidator.filesValidator('file_maestro',() => this.modeForm)],
            });
            this.fbFormUpdate = this.fb.group({});
            console.log("inicié formulario asignatura");
            success(true)
        });
    }

    resetForm(needResetFacultadSelected = true , needResetProgramaSelected = true): void{
        const codControlFacultadSelected = this.fbForm.get('cod_facultad_selected')?.value;
        const codFacultadSelected = this.selected_CodigoFacultad;
        const codControlProgramaSelected = this.fbForm.get('cod_programa')?.value;
        const codProgramaSelected = this.selected_CodigoPrograma;

        this.fbForm.reset({
            //paso 1
            cod_plan_estudio: '',
            cod_modalidad: '',
            cod_regimen: '',
            cod_tipo_evaluacion: '',
            codigo_externo: '',
            nombre_asignatura: '',
            semestre: '',
            duracion: '',
            max_duracion: '',
            num_creditos: '',

            //paso 2
            horas_sincronas: 0,
            horas_asincronas: 0,
            horas_presenciales: 0,
            horas_indirectas: 0,
            
            //paso 3
            tiene_mencion: null,
            menciones: '',
            menciones_selected: '', //borrar si es que definitivamente una asign solo tiene una mención
            tiene_evaluacionintermedia: null,
            tiene_prerequisitos: null,
            pre_requisitos: '',
            pre_requisitos_selected: '',
            tiene_tema: null,
            tema: '',
            tema_selected: '',
            obligatoria_electiva: null,
            tiene_articulacion: null,
            tiene_colegiada: null,
            cod_tipo_colegiada: '',
            tiene_secuencialidad: null,
            secuencialidad: [],
            secuencialidad_selected: [],
            paralelidad: [],
            paralelidad_selected: [],
            
            file_maestro: []
        });
        this.resetValuesSelected();

        if(!needResetFacultadSelected){
            this.fbForm.get('cod_facultad_selected')?.setValue(codControlFacultadSelected);
            this.selected_CodigoFacultad = codFacultadSelected;
        }

        if(!needResetProgramaSelected){
            this.fbForm.get('cod_programa')?.setValue(codControlProgramaSelected);
            this.selected_CodigoPrograma = codProgramaSelected;
        }

        this.fbForm.enable()
        this.resetFileMaestro();
        this.resetMessages();
        this.resetVarsPostAddedAsignatura();
        this.resetElementsForm();
        console.log("resetee formulario asignatura");
    }

    resetFileMaestro(){
        this.fbForm.get('file_maestro')?.clearValidators();
        this.fbForm.get('file_maestro')?.setValidators([GPValidator.filesValidator('file_maestro',() => this.modeForm)]);
        this.fbForm.get('file_maestro')?.updateValueAndValidity();
    }

    resetValuesSelected(){
        this.selectedFacultad = '';
        this.selectedPrograma = '';
        this.selectedPlanDeEstudio = '';
        this.selectedRegimen = '';
        this.selectedModalidad = '';
        this.selectedTipoEvaluacion = '';
        this.selectedTipoColegiada = '';
        this.selectedMencion = '';
        this.selectedMenciones = '';
        this.selectedArrayMenciones = [];
        this.selectedSecuencialidadesParalelidades = '';
        this.selectedArraySecuencialidadesParalelidades = [];
        this.selectedNombrePlanEstudio = '';
        this.selectedArticulacion = '';
        this.selectedArrayArticulaciones = [];
        this.selectedObligatoria_electiva = '';
        this.selectedTemas = '';
        this.selectedArrayTemas= [];
        this.selectedPrerrequisitos = '';
        this.selectedArrayPrerrequisitos= [];

        this.selected_CodigoFacultad = 0;
        this.selected_CodigoPrograma = 0;
        this.selected_CodigoPlanDeEstudio = 0;
        this.selected_totalHoras = 0;

    }

    resetMessages(){
        this.showMessageMencion = false;
        this.showMessagePreRequisitos = false;
        this.showMessageTema = false;
        this.showMessageSecuencialParalela = false;
        this.showMessageSinAsignaturas = false;
        this.showMessageSinAsignaturasSecuencialesParalelas = false;
    }

    resetMessagesSecuencialidadParalelidad(){
		this.showMessageSinAsignaturas = false;
		this.showMessageSinAsignaturasSecuencialesParalelas = false;
		this.showMessageSecuencialParalela = false;
	}

    resetVarsPostAddedAsignatura(){
        this.nameAsignaturaAdded = '';
        this.codAsignaturaAdded = '';
    }

    resetElementsForm(){
        this.activeIndexStepper = 0 ;
        this.activeIndexStateForm = 0;
        this.searchValue = '';
        this.showButtonSubmitUpdate = false;
        this.confirmAdd = false;
        this.dialogSuccessAdd = false;
        this.sidebarVisible2 = false;
        this.showCardForm = true;
        this.stepOne = false;
        this.dialogChooseDocsMaestro = false;
        this.dialogAsignaturas = false;
        this.dataExternal = { data: false };
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
    }

    updateFilesFormUpdate(files: any){
        this.fbFormUpdate.patchValue({ files });
        this.fbFormUpdate.get('files')?.updateValueAndValidity();
    }

    setForm(data: Asignatura, cod_facultad_selected: number, cod_programa_selected: number){
        this.fbForm.patchValue({...data, cod_facultad_selected: cod_facultad_selected});
        this.dataExternal = {
            data: true,
            cod_facultad: cod_facultad_selected,
            cod_plan_estudio: data.cod_plan_estudio,
            cod_programa: cod_programa_selected,
            cod_asignatura: data.cod_asignatura,
            cod_paralela_secuencial: data.tiene_secuencialidad === 1 ? 1 : 0
        }
        this.selectedNombrePlanEstudio = data.nombre_plan_estudio_completo!;
        this.selected_totalHoras = data.total_horas!;
        data.obligatoria_electiva === 0 ? this.selectedObligatoria_electiva = 'OBLIGATORIA' : this.selectedObligatoria_electiva = 'ELECTIVA'
    }

    async setSelectFacultad(event: any){
        //recibes: Cod_facultad y Descripcion_facu
        this.selected_CodigoFacultad = event.Cod_facultad
        this.selectedFacultad = event.Descripcion_facu
        this.fbForm.patchValue({ cod_facultad_selected: event })
    }

    async setSelectPrograma(event: any){
        //recibes: Cod_Programa Nombre_programa Nombre_programa_completo
        this.selectedPrograma = event.Nombre_programa_completo;
        this.selected_CodigoPrograma = event.Cod_Programa;
        this.fbForm.patchValue({ cod_programa: event });
    }

    async setSelectPlanDeEstudio(event: any){
        //recibes: cod_plan_estudio - nombre_plan_estudio_completo
        this.selectedPlanDeEstudio = event.nombre_plan_estudio_completo;
        this.selected_CodigoPlanDeEstudio = event.cod_plan_estudio;
        //se re actualiza data de programa
        this.selectedPrograma = event.nombre_programa_completo;
        this.selected_CodigoPrograma = event.cod_programa;
        this.setDataToPendingForm();
        this.fbForm.patchValue({ cod_plan_estudio: event });
    }

    setDataToPendingForm(){
        this.dataExternal = {
            data: true,
            cod_facultad:  this.selected_CodigoFacultad,
            cod_programa: this.selected_CodigoPrograma,
            cod_plan_estudio: this.selected_CodigoPlanDeEstudio
        }
        console.log("this.dataToPendingForm setDataToPendingForm form asign",this.dataExternal);
        
    }

    setSelectRegimen(regimen: any){
        //recibes: Cod_regimen Descripcion_regimen
        this.selectedRegimen = regimen.Descripcion_regimen
        this.fbForm.patchValue({ cod_regimen: regimen });
    }

    setSelectTipoEvaluacion(tipo_evaluacion: any){
        //recibes: 
        this.selectedTipoEvaluacion = tipo_evaluacion.descripcion_tipo
        this.fbForm.patchValue({ cod_tipo_evaluacion: tipo_evaluacion });
    }

    setSelectTipoColegiada(tipo_colegiada: any){
        //recibes: 
        tipo_colegiada !== undefined ? this.selectedTipoColegiada = tipo_colegiada.descripcion_tipo : this.selectedTipoColegiada = 'NO APLICA'
        this.fbForm.patchValue({ cod_tipo_colegiada: tipo_colegiada });
    }

    setSelectMencion(event: any){
        //recibes: cod_mencion cod_mencion_pe cod_plan_estudio descripcion_mencion fecha_creacion mencion_rexe nombre_mencion vigencia
        this.selectedMencion = `${event.nombre_mencion} - ${event.mencion_rexe}`
        this.fbForm.patchValue({ menciones: event });
    }

    setSelectControlPrerrequisitos(event: any){
        this.selectedControlPrerrequisitos = [];
        this.selectedControlPrerrequisitos = [...event];
        this.fbForm.patchValue({ pre_requisitos_selected: event });
    }

    setSelectControlSecuencialidad(event: any){
        this.selectedControlAsignSecuenciales = [];
        this.selectedControlAsignParalelas = [];
        this.selectedControlAsignSecuenciales = [...event];
        this.fbForm.patchValue({ secuencialidad_selected: event });
    }

    setSelectControlParalelidad(event: any){
        this.selectedControlAsignParalelas = [];
        this.selectedControlAsignSecuenciales = [];
        this.selectedControlAsignParalelas = [...event];
        this.fbForm.patchValue({ paralelidad_selected: event});
    }

    setSelectControlTemas(event: any){
        this.selectedControlTemas = [];
        this.selectedControlTemas = [...event];
        this.fbForm.patchValue({ tema_selected: event});
    }

    setSelectModalidad(modalidad: any){
        //recibes: Cod_modalidad Descripcion_modalidad
        this.selectedModalidad = modalidad.Descripcion_modalidad
        this.fbForm.patchValue({ cod_modalidad: modalidad });
    }

    setSelectArticulacion(tiene_articulacion: any, array_articulaciones: any[]){
        if (tiene_articulacion === 0) {
            this.selectedArticulacion = 'NO APLICA'
        }else if(tiene_articulacion === 1 && array_articulaciones.length === 0){
            this.selectedArticulacion = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedArticulacion = `${array_articulaciones.length} ${array_articulaciones.length > 1 ? 'articulaciones' : 'articulación'}`
            this.selectedArrayArticulaciones = [...array_articulaciones];
        }
    }

    setSelectMenciones(tiene_mencion: any, array_menciones: any[]){
        if (tiene_mencion === 0) {
            this.selectedMenciones = 'NO APLICA'
        }else if(tiene_mencion === 1 && array_menciones.length === 0){
            this.selectedMenciones = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedMenciones = `${array_menciones.length} ${array_menciones.length > 1 ? 'menciones' : 'mención'}`
            this.selectedArrayMenciones = [...array_menciones];
        }
    }

    setSelectPrerrequisitos(tiene_prerequisitos: any, array_prerrequisitos: any[]){
        if (tiene_prerequisitos === 0) {
            this.selectedPrerrequisitos = 'NO APLICA'
        }else if(tiene_prerequisitos === 1 && array_prerrequisitos.length === 0){
            this.selectedPrerrequisitos = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedPrerrequisitos = `${array_prerrequisitos.length} ${array_prerrequisitos.length > 1 ? 'asignaturas' : 'asignatura'}`
            this.selectedArrayPrerrequisitos = [...array_prerrequisitos];
        }
    }

    setSelectSecuencialidades(tiene_secuencialidad: any, array_secuenciales: any[]){
        if (tiene_secuencialidad === 0) {
            this.selectedSecuencialidadesParalelidades = 'NO APLICA'
        }else if(tiene_secuencialidad === 1 && array_secuenciales.length === 0){
            this.selectedSecuencialidadesParalelidades = 'NO APLICA POR SER PRIMERA ASIGN. SECUENCIAL DEL SEMESTRE'
        }else{
            this.selectedSecuencialidadesParalelidades = `${array_secuenciales.length} ${array_secuenciales.length > 1 ? 'asignaturas' : 'asignatura'}`
            this.selectedArraySecuencialidadesParalelidades = [...array_secuenciales];

        }
    }

    setSelectParalelidades(tiene_paralelidad: any, array_paralelas: any[]){
        if (tiene_paralelidad === 0) {
            this.selectedSecuencialidadesParalelidades = 'NO APLICA'
        }else if(tiene_paralelidad === 1 && array_paralelas.length === 0){
            this.selectedSecuencialidadesParalelidades = 'NO APLICA POR SER PRIMERA ASIGN. PARALELA DEL SEMESTRE'
        }else{
            this.selectedSecuencialidadesParalelidades = `${array_paralelas.length} ${array_paralelas.length > 1 ? 'asignaturas' : 'asignatura'}`
            this.selectedArraySecuencialidadesParalelidades = [...array_paralelas];
        }
    }

    setSelectTemas(tiene_tema: any, array_temas: any[]){
        if (tiene_tema === 0) {
            this.selectedTemas = 'NO APLICA'
        }else if(tiene_tema === 1 && array_temas.length === 0){
            this.selectedTemas = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedTemas = `${array_temas.length} ${array_temas.length > 1 ? 'temas' : 'tema'}`
            this.selectedArrayTemas = [...array_temas];
        }
    }

    setParamsForm(): Object {
        let params = {
            ...this.fbForm.value,
            total_horas: this.total_horas 
        };
        return params
    }

    resetControlsWhenChangedDropdownFacultad(){
		this.fbForm.get('cod_programa')?.reset();
		this.fbForm.get('cod_plan_estudio')?.reset();
    }

    resetControlsWhenChangedDropdownPrograma(){
		this.fbForm.get('cod_plan_estudio')?.reset();
    }

    setStatusControlMenciones(status: boolean){
        const control = this.fbForm.get('menciones');
        control?.reset();
        status ? control?.enable() : control?.disable()
    }

    setStatusControlPreRequisitos(status: boolean){
        const control = this.fbForm.get('pre_requisitos');
        control?.reset();
        status ? control?.enable() : control?.disable()
    }

    setStatusControlTema(status: boolean){
        const control = this.fbForm.get('tema');
        control?.reset();
        status ? control?.enable() : control?.disable()
    }

    setStatusControlSecuencialidad(status: boolean){
        const control = this.fbForm.get('secuencialidad');
        control?.reset();
        status ? control?.enable() : control?.disable()
    }

    setStatusControlParalelidad(status: boolean){
        const control = this.fbForm.get('paralelidad');
        control?.reset();
        status ? control?.enable() : control?.disable()
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

    resetFilter() {
        this.searchValue = ''; 
        this.filteredInputs = [...this.inputs]; 
    }

    async setFormUpdate(modeDialog: ModeDialogAsign, asign: Asignatura, canEdit: boolean): Promise<boolean> {
        switch (modeDialog) {

            case 'docs_maestros_asignatura':
                this.fbFormUpdate = this.fb.group({
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'modalidad':
                this.fbFormUpdate = this.fb.group({
                    cod_modalidad: [asign.cod_modalidad, [Validators.required]],
                    description_old: [this.selectedModalidad],
                    description_new: [],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'regimen':
                this.fbFormUpdate = this.fb.group({
                    cod_regimen: [asign.cod_regimen, [Validators.required]],
                    description_old: [this.selectedRegimen],
                    description_new: [],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'codigo_externo': 
                this.fbFormUpdate = this.fb.group({
                    codigo_externo: [asign.codigo_externo, [Validators.required, GPValidator.regexPattern('num_o_letras')]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'nombre_asignatura': 
                this.fbFormUpdate = this.fb.group({
                    nombre_asignatura: [asign.nombre_asignatura, [Validators.required, GPValidator.regexPattern('num_o_letras')]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'num_creditos': 
                this.fbFormUpdate = this.fb.group({
                    num_creditos: [asign.num_creditos, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'horas': 
                this.fbFormUpdate = this.fb.group({
                    horas_sincronas: [asign.horas_sincronas, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    horas_asincronas: [asign.horas_asincronas, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    horas_presenciales: [asign.horas_presenciales, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    horas_indirectas: [asign.horas_indirectas, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    total_horas: [this.total_horas_update],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'semestre': 
                this.fbFormUpdate = this.fb.group({
                    semestre: [asign.semestre, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'duracion': 
                this.fbFormUpdate = this.fb.group({
                    duracion: [asign.duracion, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'max_duracion': 
                this.fbFormUpdate = this.fb.group({
                    max_duracion: [asign.max_duracion, [Validators.required, GPValidator.regexPattern('solo_num')]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'cod_tipo_evaluacion':
                this.fbFormUpdate = this.fb.group({
                    cod_tipo_evaluacion: [asign.cod_tipo_evaluacion, [Validators.required]],
                    description_old: [this.selectedTipoEvaluacion],
                    description_new: [],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'cod_tipo_colegiada':
                this.fbFormUpdate = this.fb.group({
                    tiene_colegiada: [asign.tiene_colegiada, [Validators.required]],
                    cod_tipo_colegiada: [asign.cod_tipo_colegiada, [Validators.required]],
                    description_old: [this.selectedTipoColegiada],
                    description_new: [],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'tiene_evaluacionintermedia':
                this.fbFormUpdate = this.fb.group({
                    tiene_evaluacionintermedia: [asign.tiene_evaluacionintermedia, [Validators.required]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;
            
            case 'tiene_prerequisitos':
                this.fbFormUpdate = this.fb.group({
                    tiene_prerequisitos: [asign.tiene_prerequisitos, [Validators.required]],
                    prerrequisitoToDelete: [this.selectedArrayPrerrequisitos],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'tiene_articulacion':
                this.fbFormUpdate = this.fb.group({
                    tiene_articulacion: [asign.tiene_articulacion, [Validators.required]],
                    articulacionesToDelete : [this.selectedArrayArticulaciones],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'tiene_mencion':
                this.fbFormUpdate = this.fb.group({
                    tiene_mencion: [asign.tiene_mencion, [Validators.required]],
                    mencionToDelete: [this.selectedArrayMenciones],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'tiene_secuencialidad':
                this.fbFormUpdate = this.fb.group({
                    tiene_secuencialidad: [asign.tiene_secuencialidad, [Validators.required]],
                    paralelaSecuencialToDelete: [this.selectedArraySecuencialidadesParalelidades],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'obligatoria_electiva':
                this.fbFormUpdate = this.fb.group({
                    obligatoria_electiva: [asign.obligatoria_electiva, [Validators.required]],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'tiene_tema':
                this.fbFormUpdate = this.fb.group({
                    tiene_tema: [asign.tiene_tema, [Validators.required]],
                    temas: [[], [Validators.required]],
                    temas_old: [[]],
                    temasToDelete: [this.selectedArrayTemas],
                    canEdit: [canEdit],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;
        }
        this.fbFormUpdate.statusChanges.subscribe(status => {
            this.stateFormUpdate = status as StateValidatorForm
        });
        return true
    }
}