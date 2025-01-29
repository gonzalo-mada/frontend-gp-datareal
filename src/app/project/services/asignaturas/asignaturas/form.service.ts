import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { MessageServiceGP } from '../../components/message-service.service';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

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
    loadedProgramas: boolean = false;
    loadedPlanes: boolean = false;
    dataToPendingForm: any = { data: false };

    //MESSAGES
    showMessageMencion: boolean = false;
    showMessagePreRequisitos: boolean = false;
    showMessageTema: boolean = false;
    showMessageSecuencial: boolean = false;
    showMessageParalelidad: boolean = false;
    showMessageSinAsignaturas: boolean = false;
    showMessageSinAsignaturasSecuenciales: boolean = false;

    //VALUES SELECTED
    selectedFacultad: string = '';
    selectedPrograma: string = '';
    selectedPlanDeEstudio: string = '';
    selectedRegimen: string = '';
    selectedModalidad: string = '';
    selectedTipoEvaluacion: string = '';
    selectedTipoColegiada: string = '';
    selectedMencion: string = '';

    selected_CodigoFacultad: number = 0;
    selected_CodigoPrograma: number = 0;
    selected_CodigoPlanDeEstudio: number = 0;

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
                horas_sincronas: ['', [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],
                horas_asincronas: ['', [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],
                horas_presenciales: ['', [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],
                horas_indirectas: ['', [Validators.required, GPValidator.regexPattern('solo_num_and_decimals')]],


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
                secuencialidad: ['', [Validators.required]],

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
            horas_sincronas: '',
            horas_asincronas: '',
            horas_presenciales: '',
            horas_indirectas: '',
            
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
            secuencialidad: '',
            
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
        this.selectedRegimen = '';

        this.selected_CodigoFacultad = 0;
        this.selected_CodigoPrograma = 0;
    }

    resetMessages(){
        this.showMessageMencion = false;
        this.showMessagePreRequisitos = false;
        this.showMessageTema = false;
        this.showMessageSecuencial = false;
        this.showMessageParalelidad = false;
        this.showMessageSinAsignaturas = false;
        this.showMessageSinAsignaturasSecuenciales = false;
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
        this.dataToPendingForm = { data: false };
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
    }

    async setSelectFacultad(event: any){
        //recibes: Cod_facultad y Descripcion_facu
        this.selected_CodigoFacultad = event.Cod_facultad
        this.selectedFacultad = event.Descripcion_facu
        this.fbForm.patchValue({ cod_facultad_selected: event })
    }

    async setSelectPrograma(event: any){
        //recibes: Cod_Programa Nombre_programa Nombre_programa_completo
        console.log("event setSelectPrograma",event);
        
        this.selectedPrograma = event.Nombre_programa_completo;
        this.selected_CodigoPrograma = event.Cod_Programa;
        this.fbForm.patchValue({ cod_programa: event });
    }

    async setSelectPlanDeEstudio(event: any){
        console.log("event",event);
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
        this.dataToPendingForm = {
            data: true,
            cod_facultad:  this.selected_CodigoFacultad,
            cod_programa: this.selected_CodigoPrograma,
            cod_plan_estudio: this.selected_CodigoPlanDeEstudio
        }
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
        this.selectedTipoColegiada = tipo_colegiada.descripcion_tipo
        this.fbForm.patchValue({ cod_tipo_colegiada: tipo_colegiada });
    }

    setSelectMencion(event: any){
        //recibes: cod_mencion cod_mencion_pe cod_plan_estudio descripcion_mencion fecha_creacion mencion_rexe nombre_mencion vigencia
        console.log("event setSelectMencion",event);
        
        this.selectedMencion = `${event.nombre_mencion} - ${event.mencion_rexe}`
        this.fbForm.patchValue({ menciones: event });
    }

    setSelectSecuencialidad(event: any){
        //recibes: cod_mencion cod_mencion_pe cod_plan_estudio descripcion_mencion fecha_creacion mencion_rexe nombre_mencion vigencia
        console.log("event setSelectSecuencialidad",event);
        this.fbForm.patchValue({ secuencialidad: event });

        
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
}