import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { MessageServiceGP } from '../../components/message-service.service';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { Programa } from 'src/app/project/models/programas/Programa';
import { ModeDialogPE, PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';

interface CardPlanEstudio {
    // id: number,
    col_lg: number,
    col_md: number,
    isEditable: boolean,
    isEditableBy: boolean,
    haveSecondaryValue: boolean,
    modeDialog: ModeDialogPE,
    collection: CollectionsMongo,
    items: InputPlanEstudio[]
}

interface InputPlanEstudio {
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

export class FormPlanDeEstudioService {
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
    sidebarVisible2: boolean = false;
    showCardForm: boolean = true;
    stepOne: boolean = false;
    disposition: boolean = true;
    dialogChooseDocsMaestro: boolean = false;
    loadedProgramas: boolean = false;
    dataExternal: DataExternal = { data: false };

    inputs: CardPlanEstudio[] = [
        {   
            col_lg: 4, col_md: 6, isEditable: false, isEditableBy: false, haveSecondaryValue: false, modeDialog: undefined, collection: undefined, 
            items: [
                { title: 'Plan de estudio', control: '', iconHelp: false, principalValue: 'form.selectedNombrePlanEstudio'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: false, isEditableBy: false, haveSecondaryValue: false, modeDialog: undefined, collection: undefined, 
            items: [
                { title: 'Programa', control: '', iconHelp: false, principalValue: 'form.selectedPrograma'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'asignaturas', collection: 'asignaturas_pe', 
            items: [
                { title: 'Asignaturas', control: '', iconHelp: false, principalValue: 'form.selectedAsignaturas'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'estado', collection: 'estado_pe', 
            items: [
                { title: 'Estado', control: '', iconHelp: false, principalValue: 'form.selectedEstadoPlanEstudio'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'modalidad', collection: 'modalidad_pe', 
            items: [
                { title: 'Modalidad', control: '', iconHelp: false, principalValue: 'form.selectedModalidad'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'jornada', collection: 'jornada_pe', 
            items: [
                { title: 'Jornada', control: '', iconHelp: false, principalValue: 'form.selectedJornada'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'regimen', collection: 'regimen_pe', 
            items: [
                { title: 'Régimen', control: '', iconHelp: false, principalValue: 'form.selectedRegimen'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'reglamento', collection: undefined, 
            items: [
                { title: 'Reglamento', control: '', iconHelp: false, principalValue: 'form.selectedReglamento'}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'rexe', collection: 'rexe_pe', 
            items: [
                { title: 'REXE', control: 'rexe', iconHelp: false}
            ]
        },
        {   
            col_lg: 2, col_md: 6, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'cupo_minimo', collection: 'cupo_minimo_pe', 
            items: [
                { title: 'Cupo mínimo', control: 'cupo_minimo', iconHelp: false}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'articulacion', collection: 'articulaciones', 
            items: [
                { title: '¿Tiene articulación con programas de Pregrado?', control: 'tiene_articulacion', iconHelp: false},
                { title: 'Número de articulaciones', control: '', iconHelp: false, principalValue: 'form.selectedArticulacion'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'certificacion', collection: 'certificacion_intermedia_pe', 
            items: [
                { title: '¿Tiene certificación intermedia?', control: 'tiene_certificacion', iconHelp: false},
                { title: 'Número de certificaciones intermedias', control: '', iconHelp: false, principalValue: 'form.selectedCertifIntermedia'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'rangos', collection: 'rangos', 
            items: [
                { title: '¿Tiene rangos de aprobación?', control: 'tiene_rango_aprob_g', iconHelp: false},
                { title: 'Número de rangos de aprobación', control: '', iconHelp: false, principalValue: 'form.selectedRangos'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'menciones', collection: 'menciones_pe', 
            items: [
                { title: '¿Tiene menciones?', control: 'tiene_mencion', iconHelp: false},
                { title: 'Número de menciones', control: '', iconHelp: false, principalValue: 'form.selectedMenciones'}
            ]
        },
        {   
            col_lg: 6, col_md: 12, isEditable: true, isEditableBy: true, haveSecondaryValue: false, modeDialog: 'asign-pc', collection: 'asign-pc', 
            items: [
                { title: '¿Comparte asign. con plan común?', control: 'tiene_plan_comun', iconHelp: false},
                { title: 'Número de planes comunes', control: '', iconHelp: false, principalValue: 'form.selectedAsignPC'}
            ]
        }
    ];

    //MESSAGES
    showMessageDontHaveCI: boolean = false;
    showMessageCI: boolean = false;
    showMessageArticulacion: boolean = false;
    showMessagePlanComun: boolean = false;
    showMessageRangos: boolean = false;
    showMessageMenciones: boolean = false;

    //VALUES SELECTED
    selectedFacultad: string = '';
    selectedEstadoPlanEstudio: string = '';
    selectedModalidad: string = '';
    selectedJornada: string = '';
    selectedRegimen: string = '';
    selectedArticulacion: string = '';
    selectedArrayArticulaciones: any[] = [];
    selectedAsignPC: string = '';
    selectedArrayAsignPC: any[] = [];
    selectedReglamento: string = '';
    selectedPrograma: string = '';
    selectedNombrePlanEstudio: string = '';
    selectedCertifIntermedia: string = '';
    selectedArrayCertifIntermedia: any[] = [];
    selectedRangos: string = '';
    selectedArrayRangos: any[] = [];
    selectedMenciones: string = '';
    selectedArrayMenciones: any[] = [];
    selectedAsignaturas: string = '';
    asignaturasArray: any[] = [];

    selected_CodigoPrograma: number = 0;
    selected_CodigoPlanEstudio: number = 0;
    selected_CodigoFacultad: number = 0;

    //VALUES POST PENDING FORMS
    namePlanDeEstudioAdded: string = '';
    codPlanDeEstudioAdded: number = 0;

    //VARS TO OPEN FORMS POST ADDED PLAN
    showFormArticulaciones: boolean = false;
    showTableArticulaciones: boolean = false;
    showFormAsignPlanComun: boolean = false;
    showTableAsignPlanComun: boolean = false;
    showFormCertif: boolean = false;
    showTableCertif: boolean = false;




    filteredInputs: CardPlanEstudio[] = [...this.inputs];

    constructor(
        private fb: FormBuilder,
        private messageService: MessageServiceGP
    ){}

    get stateStepOne() {
        if (
              this.fbForm.get('cod_programa')!.invalid || 
              this.fbForm.get('cod_estado')!.invalid || 
              this.fbForm.get('cod_modalidad')!.invalid || 
              this.fbForm.get('cod_jornada')!.invalid || 
              this.fbForm.get('cod_regimen')!.invalid || 
              this.fbForm.get('cupo_minimo')!.invalid || 
              this.fbForm.get('rexe')!.invalid 
            ) {
          return false;
        } else {
          return true;
        }
    }

    get stateStepTwo() {
        if (
                this.fbForm.get('tiene_certificacion')!.invalid || 
                this.fbForm.get('tiene_articulacion')!.invalid || 
                this.fbForm.get('tiene_plan_comun')!.invalid || 
                this.fbForm.get('tiene_rango_aprob_g')!.invalid ||
                this.fbForm.get('tiene_mencion')!.invalid 
            ) {
            return false;
        } else {
            return true;
        }
    }

    get stateStepThree() {
        if (
                this.fbForm.get('cod_reglamento')!.invalid 
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

    get stateFormPlanDeEstudio() {
        return this.stateStepOne && this.stateStepTwo && this.stateStepThree && this.stateFileMaestro;
    }

    initForm(): Promise<boolean>{
        return new Promise((success) => {
            this.fbForm = this.fb.group({
                cod_facultad_selected: ['', [Validators.required]],

                //paso 1
                cod_programa: ['', [Validators.required]],
                cod_estado: ['', [Validators.required]],
                cod_modalidad: ['', [Validators.required]],
                cod_jornada: ['', [Validators.required]],
                cod_regimen: ['', [Validators.required]],
                cupo_minimo: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
                rexe: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],

                //paso 2
                tiene_certificacion: [null, [Validators.required]],
                tiene_articulacion: [null, [Validators.required]],
                tiene_plan_comun: [null, [Validators.required]],
                tiene_rango_aprob_g: [null, [Validators.required]],
                tiene_mencion: [null, [Validators.required]],

                //paso 3
                cod_reglamento: ['', [Validators.required]],
                
                file_maestro: [[], GPValidator.filesValidator('file_maestro',() => this.modeForm)],
            });
            this.fbFormUpdate = this.fb.group({});
            console.log("inicié formulario plan de estudio");
            success(true)
        });
    }

    resetForm(needResetFacultadSelected = true): void{
        const codFacultadSeleccionado = this.fbForm.get('cod_facultad_selected')?.value;

        this.fbForm.reset({
            //paso 1
            cod_programa: '',
            cod_estado: '',
            cod_modalidad: '',
            cod_jornada: '',
            cod_regimen: '',
            cupo_minimo: '',
            rexe: '',

            //paso 2
            tiene_certificacion: null,
            tiene_articulacion: null,
            tiene_plan_comun: null,
            tiene_rango_aprob_g: null,
            tiene_mencion: null,
            
            //paso 3
            cod_reglamento: '',

            file_maestro: []
        });
        if(!needResetFacultadSelected){
            this.fbForm.get('cod_facultad_selected')?.setValue(codFacultadSeleccionado);
        }

        this.fbForm.enable()
        this.resetMessages();
        this.resetFileMaestro();
        this.resetValuesSelected();
        this.resetVarsPendingForms();
        this.resetElementsForm();
        console.log("resetee formulario plan de estudio");
    }

    resetFileMaestro(){
        this.fbForm.get('file_maestro')?.clearValidators();
        this.fbForm.get('file_maestro')?.setValidators([GPValidator.filesValidator('file_maestro',() => this.modeForm)]);
        this.fbForm.get('file_maestro')?.updateValueAndValidity();
    }

    resetValuesSelected(){
        this.selectedFacultad = '';
        this.selectedEstadoPlanEstudio = '';
        this.selectedModalidad = '';
        this.selectedJornada = '';
        this.selectedRegimen = '';
        this.selectedArticulacion = '';
        this.selectedArrayArticulaciones = [];
        this.selectedAsignPC = '';
        this.selectedArrayAsignPC = [];
        this.selectedReglamento = '';
        this.selectedPrograma = '';
        this.selectedCertifIntermedia = '';
        this.selectedArrayCertifIntermedia = [];
        this.selectedRangos = '';
        this.selectedArrayRangos = [];
        this.selectedMenciones = '';
        this.selectedArrayMenciones = [];
        this.selectedAsignaturas = '';
        this.asignaturasArray = [];
        this.selectedNombrePlanEstudio = '';

        this.selected_CodigoPrograma = 0;
        this.selected_CodigoPlanEstudio = 0;
        this.selected_CodigoFacultad = 0;
    }

    resetMessages(){
        this.showMessageDontHaveCI = false;
        this.showMessageCI = false;
        this.showMessageArticulacion = false;
        this.showMessagePlanComun = false;
        this.showMessageRangos = false;
        this.showMessageMenciones = false;
    }

    resetVarsPendingForms(){
        this.namePlanDeEstudioAdded = '';
        this.codPlanDeEstudioAdded = 0;
        this.showFormArticulaciones = false;
        this.showTableArticulaciones = false;
        this.showFormAsignPlanComun = false;
        this.showTableAsignPlanComun = false;
        this.showFormCertif = false;
        this.showTableCertif = false;
    }

    resetElementsForm(){
        this.activeIndexStepper = 0 ;
        this.activeIndexStateForm = 0;
        this.searchValue = '';
        this.showButtonSubmitUpdate = false;
        this.confirmAdd = false;
        this.sidebarVisible2 = false;
        this.showCardForm = true;
        this.stepOne = false;
        this.dialogChooseDocsMaestro = false;
        this.dataExternal = { data: false };
    }

    setForm(data: PlanDeEstudio, cod_facultad_selected: number){
        this.fbForm.patchValue({...data, cod_facultad_selected: cod_facultad_selected});
        this.dataExternal = {
            data: true,
            cod_facultad: cod_facultad_selected,
            cod_plan_estudio: data.cod_plan_estudio,
            cod_programa: data.cod_programa,
        }
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
    }

    updateFilesFormUpdate(files: any){
        this.fbFormUpdate.patchValue({ files });
        this.fbFormUpdate.get('files')?.updateValueAndValidity();
    }

    setSelectFacultad(event: any){
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

    setSelectEstadoPlanEstudio(estado: any){
        //recibes: cod_estado descripcion_estado
        this.selectedEstadoPlanEstudio = estado.descripcion_estado
        this.fbForm.patchValue({ cod_estado: estado });
    }

    setSelectModalidad(modalidad: any){
        //recibes: Cod_modalidad Descripcion_modalidad
        this.selectedModalidad = modalidad.Descripcion_modalidad
        this.fbForm.patchValue({ cod_modalidad: modalidad });
    }

    setSelectJornada(jornada: any){
        //recibes: Cod_jornada Descripcion_jornada
        this.selectedJornada = jornada.Descripcion_jornada
        this.fbForm.patchValue({ cod_jornada: jornada });
    }

    setSelectRegimen(regimen: any){
        //recibes: Cod_regimen Descripcion_regimen
        this.selectedRegimen = regimen.Descripcion_regimen
        this.fbForm.patchValue({ cod_regimen: regimen });
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

    setSelectAsignPC(tiene_plan_comun: any, array_asign_pc: any[]){
        if (tiene_plan_comun === 0) {
            this.selectedAsignPC = 'NO APLICA'
        }else if(tiene_plan_comun === 1 && array_asign_pc.length === 0){
            this.selectedAsignPC = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedAsignPC = `${array_asign_pc.length} ${array_asign_pc.length > 1 ? 'planes comunes' : 'plan común'}`
            this.selectedArrayAsignPC = [...array_asign_pc];
        }
    }

    setSelectCertifIntermedia(tiene_certificacion: any, array_certif: any[]){
        if (tiene_certificacion === 0) {
            this.selectedCertifIntermedia = 'NO APLICA'
        }else if(tiene_certificacion === 1 && array_certif.length === 0){
            this.selectedCertifIntermedia = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedCertifIntermedia = `${array_certif.length} ${array_certif.length > 1 ? 'certificaciones' : 'certificación'}`
            this.selectedArrayCertifIntermedia = [...array_certif];

        }
    }

    setSelectAsignaturas(num_asignaturas: any, asignaturas: any){
        if (num_asignaturas === 0) {
            this.selectedAsignaturas = 'Sin asignaturas'
        }else{
            this.selectedAsignaturas = `${num_asignaturas} ${num_asignaturas > 1 ? 'asignaturas' : 'asignatura'}`
            this.asignaturasArray = [...asignaturas];
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

    setSelectRangos(tiene_rango_aprob_g: any, array_rangos: any[]){
        if (tiene_rango_aprob_g === 0) {
            this.selectedRangos = 'NO APLICA'
        }else if(tiene_rango_aprob_g === 1 && array_rangos.length === 0){
            this.selectedRangos = 'PENDIENTE DE ASIGNAR'
        }else{
            this.selectedRangos = `${array_rangos.length} ${array_rangos.length > 1 ? 'rangos de aprobación' : 'rango de aprobación'}`
            this.selectedArrayRangos = [...array_rangos];

        }
    }

    setSelectReglamento(reglamentoSelected : Reglamento, isFromTable = true){
        this.selectedReglamento = reglamentoSelected!.Descripcion_regla!;
        if (isFromTable) {
            this.messageService.clear();
            this.fbForm.patchValue({ cod_reglamento: reglamentoSelected?.Cod_reglamento })
            this.messageService.add({
              key: 'main',
              severity: 'info',
              detail: `Reglamento: "${reglamentoSelected!.Descripcion_regla}" seleccionado`,
            });
        }
    }
  
    unsetSelectReglamento(reglamentoSelected?: Reglamento){
      this.selectedReglamento = '';
      this.fbForm.patchValue({ cod_reglamento: '' })
      if (reglamentoSelected) {
        this.messageService.clear();
        this.messageService.add({
          key: 'main',
          severity: 'info',
          detail: `Reglamento: "${reglamentoSelected.Descripcion_regla}" deseleccionado`,
        });
      }
    }

    setNames(plan: PlanDeEstudio){
        this.selectedNombrePlanEstudio = plan.nombre_plan_estudio_completo!;
        this.selected_CodigoPlanEstudio = plan.cod_plan_estudio!;
        this.selectedPrograma = plan.nombre_programa_completo!;
        this.selected_CodigoPrograma = plan.cod_programa!;
    }

    checkCertifIntermedia(programa: Programa){
        switch (programa.Certificacion_intermedia) {
            case 0:
                this.fbForm.get('tiene_certificacion')?.disable();
                this.selectedPrograma = programa.Nombre_programa_completo!
                this.showMessageDontHaveCI = true;
            break;
        
            case 1:
                this.fbForm.get('tiene_certificacion')?.enable();
            break;
        }
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


    getValuesSelected(): void {
        let valuesSelected = {
            selectedEstadoPlanEstudio: this.selectedEstadoPlanEstudio,
        }
        console.log("valuesSelected",valuesSelected);
    }

    getValuesIndex(): void{
        let valuesIndex = {
          activeIndexStepper: this.activeIndexStepper,
          activeIndexStateForm: this.activeIndexStateForm,
        }
        console.log("valuesIndex",valuesIndex);
    }

    setParamsForm(): Object {
        const tiene_certificacion = this.fbForm.get('tiene_certificacion');
        let params = {};
        if (tiene_certificacion?.disabled) {
            params = {
                ...this.fbForm.value,
                tiene_certificacion: 0, 
                descripcion_reglamento: this.selectedReglamento
            }
        }else{
            params = {...this.fbForm.value , descripcion_reglamento: this.selectedReglamento}
        }
        return params
    }

    async setFormUpdate(modeDialog: ModeDialogPE, plan: PlanDeEstudio, isEditableBy: boolean): Promise<boolean> {
        switch (modeDialog) {
            case 'docs_maestros_plan_estudio':
                this.fbFormUpdate = this.fb.group({
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'estado':
                this.fbFormUpdate = this.fb.group({
                    cod_estado: [plan.cod_estado, [Validators.required]],
                    description_old: [this.selectedEstadoPlanEstudio],
                    description_new: [],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'modalidad':
                this.fbFormUpdate = this.fb.group({
                    cod_modalidad: [plan.cod_modalidad, [Validators.required]],
                    description_old: [this.selectedModalidad],
                    description_new: [],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'jornada':
                this.fbFormUpdate = this.fb.group({
                    cod_jornada: [plan.cod_jornada, [Validators.required]],
                    description_old: [this.selectedJornada],
                    description_new: [],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'regimen':
                this.fbFormUpdate = this.fb.group({
                    cod_regimen: [plan.cod_regimen, [Validators.required]],
                    description_old: [this.selectedRegimen],
                    description_new: [],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                })
            break;

            case 'reglamento':
                this.fbFormUpdate = this.fb.group({
                    cod_reglamento: [plan.cod_reglamento, [Validators.required]],
                    description_old: [this.selectedReglamento],
                    description_new: [],
                    isEditableBy: [isEditableBy]
                });  
            break;

            case 'rexe': 
                this.fbFormUpdate = this.fb.group({
                    rexe: [plan.rexe, [Validators.required]],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'cupo_minimo': 
                this.fbFormUpdate = this.fb.group({
                    cupo_minimo: [plan.cupo_minimo, [Validators.required]],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });  
            break;

            case 'articulacion':
                this.fbFormUpdate = this.fb.group({
                    tiene_articulacion: [plan.tiene_articulacion, [Validators.required]],
                    articulacionesToDelete : [this.selectedArrayArticulaciones],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'certificacion':
                this.fbFormUpdate = this.fb.group({
                    tiene_certificacion: [plan.tiene_certificacion, [Validators.required]],
                    asignCiToDelete : [this.selectedArrayCertifIntermedia],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'rangos':
                this.fbFormUpdate = this.fb.group({
                    tiene_rango_aprob_g: [plan.tiene_rango_aprob_g, [Validators.required]],
                    rangoToDelete: [this.selectedArrayRangos],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'menciones':
                this.fbFormUpdate = this.fb.group({
                    tiene_mencion: [plan.tiene_mencion, [Validators.required]],
                    mencionToDelete: [this.selectedArrayMenciones],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'asign-pc':
                this.fbFormUpdate = this.fb.group({
                    tiene_plan_comun: [plan.tiene_plan_comun, [Validators.required]],
                    asignPCToDelete : [this.selectedArrayAsignPC],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;

            case 'asignaturas':
                this.fbFormUpdate = this.fb.group({
                    asignaturas: [this.asignaturasArray, [Validators.required]],
                    asignaturasToDelete: [[]],
                    isEditableBy: [isEditableBy],
                    files: [[], GPValidator.filesValidator('files',() => this.modeForm)]
                });
            break;
        
        }
        this.fbFormUpdate.statusChanges.subscribe(status => {
            this.stateFormUpdate = status as StateValidatorForm
        });
        return true
    }

    setAsignaturasToDelete(asignaturasToDelete: any){
        this.fbFormUpdate.patchValue({ asignaturasToDelete: [...asignaturasToDelete] });
    }
}