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

interface CardPlanEstudio {
    // id: number,
    col_lg: number,
    col_md: number,
    isEditable: boolean,
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
    activeIndexStepper: number | undefined = 0 ;
    activeIndexStateForm: number | undefined = 0;
    searchValue: string = '';

    //MESSAGES
    showMessageDontHaveCI: boolean = false;
    showMessageCI: boolean = false;
    showMessageArticulacion: boolean = false;
    showMessagePlanComun: boolean = false;
    showMessageRangos: boolean = false;

    //VALUES SELECTED
    cod_programa_selected: number = 0;

    selectedEstadoPlanEstudio: string = '';
    selectedModalidad: string = '';
    selectedJornada: string = '';
    selectedRegimen: string = '';
    selectedArticulacion: string = '';
    selectedReglamento: string = '';
    selectedNombrePrograma: string = '';
    selectedCodigoPrograma: number = 0;
    selectedNombrePlanEstudio: string = '';
    selectedCodigoPlanEstudio: number = 0;

    name_programa_selected: string = '';

    inputs: CardPlanEstudio[] = [
        {   
            col_lg: 6, col_md: 6, isEditable: false, haveSecondaryValue: true, modeDialog: undefined, collection: undefined, 
            items: [
                { title: 'Plan de estudio', control: '', iconHelp: false, principalValue: 'form.selectedNombrePlanEstudio', secondaryName: 'Código', secondaryValue: 'form.selectedCodigoPlanEstudio'}
            ]
        },
        {   
            col_lg: 6, col_md: 6, isEditable: false, haveSecondaryValue: true, modeDialog: undefined, collection: undefined, 
            items: [
                { title: 'Programa', control: '', iconHelp: false, principalValue: 'form.selectedNombrePrograma', secondaryName: 'Código', secondaryValue: 'form.selectedCodigoPrograma'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'estado', collection: undefined, 
            items: [
                { title: 'Estado', control: '', iconHelp: false, principalValue: 'form.selectedEstadoPlanEstudio'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'modalidad', collection: undefined, 
            items: [
                { title: 'Modalidad', control: '', iconHelp: false, principalValue: 'form.selectedModalidad'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'jornada', collection: undefined, 
            items: [
                { title: 'Jornada', control: '', iconHelp: false, principalValue: 'form.selectedJornada'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'regimen', collection: undefined, 
            items: [
                { title: 'Régimen', control: '', iconHelp: false, principalValue: 'form.selectedRegimen'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'reglamento', collection: undefined, 
            items: [
                { title: 'Reglamento', control: '', iconHelp: false, principalValue: 'form.selectedReglamento'}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'rexe', collection: undefined, 
            items: [
                { title: 'REXE', control: 'rexe', iconHelp: false}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'cupo_minimo', collection: undefined, 
            items: [
                { title: 'Cupo mínimo estudiantes', control: 'cupo_minimo', iconHelp: false}
            ]
        },
        {   
            col_lg: 4, col_md: 6, isEditable: true, haveSecondaryValue: false, modeDialog: 'articulacion', collection: undefined, 
            items: [
                { title: 'Articulación', control: '', iconHelp: false, principalValue: 'form.selectedArticulacion'}
            ]
        }
    ];

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
                this.fbForm.get('tiene_rangos')!.invalid 
            ) {
            return false;
        } else {
            return true;
        }
    }

    get stateStepThree() {
        if (
                this.fbForm.get('cod_reglamento')!.invalid || 
                this.fbForm.get('menciones')!.invalid 
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
        return this.stateStepOne && this.stateStepTwo && this.stateFileMaestro;
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
                tiene_rangos: [null, [Validators.required]],

                //paso 3
                cod_reglamento: ['', [Validators.required]],
                Cod_RangosAprobacion: ['', [Validators.required]],
                tiene_mencion: [false],
                menciones: ['', [Validators.required]],
                
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
            tiene_rangos: null,
            
            //paso 3
            cod_reglamento: '',
            Cod_RangosAprobacion: '',
            tiene_mencion: false,
            menciones: '',

            file_maestro: []
        });
        if(!needResetFacultadSelected){
            this.fbForm.get('cod_facultad_selected')?.setValue(codFacultadSeleccionado);
        }

        this.fbForm.enable()
        this.resetMessages();
        this.resetFileMaestro();
        this.resetValuesSelected();
        console.log("resetee formulario plan de estudio");
    }

    resetFileMaestro(){
        this.fbForm.get('file_maestro')?.clearValidators();
        this.fbForm.get('file_maestro')?.setValidators([GPValidator.filesValidator('file_maestro',() => this.modeForm)]);
        this.fbForm.get('file_maestro')?.updateValueAndValidity();
    }

    resetValuesSelected(){
        this.cod_programa_selected = 0;
        this.name_programa_selected = '';
        this.selectedEstadoPlanEstudio = ''
    }

    resetMessages(){
        this.showMessageCI = false;
        this.showMessageArticulacion = false;
        this.showMessagePlanComun = false;
        this.showMessageRangos = false;
        this.showMessageDontHaveCI = false;
    }

    setForm(data: PlanDeEstudio){
        this.fbForm.patchValue({...data});
        console.log("setee formulario plan de estudio");
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
    }

    updateFilesFormUpdate(files: any){
        this.fbFormUpdate.patchValue({ files });
        this.fbFormUpdate.get('files')?.updateValueAndValidity();
    }

    setSelectEstadoPlanEstudio(estado: any){
        this.selectedEstadoPlanEstudio = estado.descripcion_estado
    }

    setSelectModalidad(modalidad: any){
        this.selectedModalidad = modalidad.Descripcion_modalidad
    }

    setSelectJornada(jornada: any){
        this.selectedJornada = jornada.Descripcion_jornada
    }

    setSelectRegimen(regimen: any){
        this.selectedRegimen = regimen.Descripcion_regimen
    }

    setSelectArticulacion(num_articulacion: any){
        this.selectedArticulacion = `${num_articulacion} ${num_articulacion > 1 ? 'articulaciones' : 'articulación'}`
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
        this.selectedNombrePlanEstudio = plan.nombre_plan_de_estudio_completo!;
        this.selectedCodigoPlanEstudio = plan.cod_plan_estudio!;
        this.selectedNombrePrograma = plan.nombre_programa_completo!;
        this.selectedCodigoPrograma = plan.cod_programa!;
    }

    checkCertifIntermedia(programa: Programa){
        switch (programa.Certificacion_intermedia) {
            case 0:
                this.fbForm.get('tiene_certificacion')?.disable();
                this.name_programa_selected = programa.Nombre_programa_completo!
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

    
}