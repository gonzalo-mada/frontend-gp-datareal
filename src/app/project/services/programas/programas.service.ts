import { effect, Injectable, signal } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Programa } from '../../models/programas/Programa'
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { EstadosAcreditacion } from '../../models/programas/EstadosAcreditacion';
import { EstadoMaestro } from '../../models/programas/EstadoMaestro';
import { Suspension } from '../../models/programas/Suspension';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { Reglamento } from '../../models/programas/Reglamento';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploaderFilesService } from '../components/uploader-files.service';
import { LabelComponent } from '../../models/shared/Context';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
import { ConfigModeService } from '../components/config-mode.service';
import { GPValidator } from '../../tools/validators/gp.validators';
import { MessageService } from 'primeng/api';

interface Director {
  nombre: string,
  rut: string
}

@Injectable({
  providedIn: 'root'
})

export class ProgramasService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;
  disposition: boolean = true;
  showAsterisk: boolean = false;
  activeIndexStateForm: number | undefined = 0;
  activeIndexAcordionAddPrograma: number | undefined = 0;
  keyPopups: string = 'programas';
  keyPopupsCenter: string = 'programas-center';
  directorSelected!: Director;
  directorAlternoSelected!: Director;
  reglamentoSelected: string = '';
  estadoMaestroSelected: string = '';
  estadoAcreditacionSelected: string = '';
  showTableDirectores: boolean = false;
  showTableDirectoresAlternos: boolean = false;


  public fbForm: FormGroup;
  private subscription: Subscription = new Subscription();

  private buttonClickRefreshTableEA = new Subject<void>();
  buttonRefreshTableEA$ = this.buttonClickRefreshTableEA.asObservable();

  private buttonClickRefreshTableSusp = new Subject<void>();
  buttonRefreshTableSusp$ = this.buttonClickRefreshTableSusp.asObservable();

  private buttonClickRefreshTableReglamento = new Subject<void>();
  buttonRefreshTableReglamento$ = this.buttonClickRefreshTableReglamento.asObservable();

  private actionDirectorSelected = new Subject<boolean>();
  actionDirectorSelected$ = this.actionDirectorSelected.asObservable();

  private actionDirectorAlternoSelected = new Subject<boolean>();
  actionDirectorAlternoSelected$ = this.actionDirectorAlternoSelected.asObservable();

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function  } | null>(null);
  formUpdate$ = this.formUpdate.asObservable();



  constructor(
    private fb: FormBuilder,
    private invoker: InvokerService, 
    private uploaderFilesService: UploaderFilesService, 
    private configModeService: ConfigModeService,
    public messageService: MessageService
  ) { 

    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        switch (from.context.component.label) {
          case 'Título': this.filesChanged(from.files, 'Título'); break;
          case 'Grado académico': this.filesChanged(from.files, 'Grado académico'); break;
          case 'REXE': this.filesChanged(from.files, 'REXE'); break;
          case 'Director': this.filesChanged(from.files, 'Director'); break;
          case 'Director alterno': this.filesChanged(from.files, 'Director alterno'); break;
          case 'Estado maestro': this.filesChanged(from.files, 'Estado maestro'); break; 
          case 'Maestro': this.filesChanged(from.files, 'Maestro'); break; 
          default:
            break;
        }
      }
    }));
    this.fbForm = this.fb.group({
      //paso 1
      Centro_costo: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
      Nombre_programa: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      Grupo_correo: ['', [Validators.required, GPValidator.checkCorreoUV()]],
      Cod_Programa: ['', ],
      Codigo_SIES: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      Creditos_totales: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
      Horas_totales: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
      Titulo: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      Grado_academico: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      REXE: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],
      
      //paso 2
      Tipo_programa: ['', [Validators.required]],
      Campus: ['', [Validators.required]],
      Unidad_academica: ['', [Validators.required]],
      EstadoMaestro: ['', [Validators.required]],
      Cod_EstadoMaestro: ['', [Validators.required]],
      Graduacion_Conjunta_Switch: [false],
      Instituciones: [{value:'', disabled: true}, [Validators.required]],

      //paso 3 
      Cod_Reglamento: ['', [Validators.required]],
      Director: ['', [Validators.required, RutValidator.rut]],
      Director_selected: ['', [Validators.required, GPValidator.notSameDirectorsSelected()]],
      haveDirectorAlterno: [false],
      Director_alterno: ['', [RutValidator.rut, , GPValidator.notSameAsDirector('Director','Director_selected')]],
      DirectorAlterno_selected: ['',  GPValidator.requiredDirectorAlternoSelected()],
      Cod_acreditacion: ['', [Validators.required]],

      //file maestro
      file_maestro: [[], this.filesValidator('file_maestro')],
    });

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
          this.fbForm.get('Instituciones')!.invalid 
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

  filesValidator(fileKey: 'files_titulo' | 'files_gradoacad' | 'files_rexe' | 'files_director' | 'files_directorAlterno' | 'files_estadomaestro' | 'file_maestro' ) {
    return (control: AbstractControl): { [key: string]: boolean } | null => {
      const formGroup = control.parent as FormGroup;
      
      if (!formGroup) {
          return null;
      }
  
      const files = formGroup.get(fileKey)?.value;
  
      if (this.modeForm === 'create' || this.modeForm === 'edit') {
        if (files.length === 0) {
          return { required: true };
        }
      }
  
      return null;
    };
  }
  
  filesChanged(files: any , from: LabelComponent){
    switch (from) {
      case 'Título':
        this.fbForm.patchValue({ files_titulo: files });
        this.fbForm.controls['files_titulo'].updateValueAndValidity();
      break;
      case 'Grado académico':
        this.fbForm.patchValue({ files_gradoacad: files });
        this.fbForm.controls['files_gradoacad'].updateValueAndValidity();
      break;
      case 'REXE':
        this.fbForm.patchValue({ files_rexe: files });
        this.fbForm.controls['files_rexe'].updateValueAndValidity();
      break;
      case 'Director':
        this.fbForm.patchValue({ files_director: files });
        this.fbForm.controls['files_director'].updateValueAndValidity();
      break;
      case 'Director alterno':
        this.fbForm.patchValue({ files_directorAlterno: files });
        this.fbForm.controls['files_directorAlterno'].updateValueAndValidity();
      break;
      case 'Estado maestro':
        this.fbForm.patchValue({ files_estadomaestro: files });
        this.fbForm.controls['files_estadomaestro'].updateValueAndValidity();
      break;
      case 'Maestro':
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
      break;
    }
  }

  setModeCrud(mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  resetModeCrud(){
    this.crudUpdate.next(null);
  }

  emitButtonRefreshTableEA(){
    this.buttonClickRefreshTableEA.next();
  }

  emitButtonRefreshTableSusp(){
    this.buttonClickRefreshTableSusp.next();
  }

  emitButtonRefreshTableReg(){
    this.buttonClickRefreshTableReglamento.next();
  }

  setSelectEstadoAcreditacion(eaSelected : EstadosAcreditacion){
    this.fbForm.patchValue({ Cod_acreditacion: eaSelected.Cod_acreditacion })
    if (this.configModeService.getMode()) {
      //si es postgrado
      if (eaSelected.Acreditado == 'SI') {
        this.estadoAcreditacionSelected = `Acreditado por: ${eaSelected.tiempo?.Cantidad_anios} años ( ${eaSelected.tiempo?.Fecha_inicio} - ${eaSelected.tiempo?.Fecha_termino} )`
      }else{
        this.estadoAcreditacionSelected = 'No acreditado'
      }
    }else{
      if (eaSelected.Certificado == 'SI') {
        this.estadoAcreditacionSelected = `Certificado por: ${eaSelected.tiempo?.Cantidad_anios} años ( ${eaSelected.tiempo?.Fecha_inicio} - ${eaSelected.tiempo?.Fecha_termino} )`
      }else{
        this.estadoAcreditacionSelected = 'No certificado'
      }
    }
  }

  unsetSelectEstadoAcreditacion(){
    this.fbForm.patchValue({ Cod_acreditacion: '' })
    this.estadoAcreditacionSelected = ``
  }

  setSelectEstadoMaestro(emSelected : EstadoMaestro){
    this.fbForm.patchValue({ Cod_EstadoMaestro: emSelected.Cod_EstadoMaestro })
    this.estadoMaestroSelected = emSelected.Descripcion_EstadoMaestro!;
  }

  setSelectSuspension(suspSelected : Suspension | undefined){
    // this.programa.update((programa) => ({
    //   ...programa,
    //   Suspension: suspSelected
    // }))
  }

  setSelectReglamento(reglamentoSelected : Reglamento | undefined){
    this.fbForm.patchValue({ Cod_Reglamento: reglamentoSelected?.Cod_reglamento })
    this.reglamentoSelected = reglamentoSelected!.Descripcion_regla!;
  }

  unsetSelectReglamento(){
    this.fbForm.patchValue({ Cod_Reglamento: '' })
    this.reglamentoSelected = '';
  }
  
  setSelectDirector(mode: 'director' | 'alterno' , nombre: string, rut: string){
    switch (mode) {
      case 'director':
        this.fbForm.patchValue({Director_selected: rut})
        this.directorSelected = {
          nombre: nombre,
          rut: rut
        }
        this.fbForm.get('Director')?.disable();
      break;
      case 'alterno':
        this.fbForm.patchValue({DirectorAlterno_selected: rut})
        this.directorAlternoSelected = {
          nombre: nombre,
          rut: rut
        }
        this.fbForm.get('Director_alterno')?.disable();
      break;
    }
  }

  unsetSelectDirector(mode: 'director' | 'alterno'){
    switch (mode) {
      case 'director':
        this.fbForm.patchValue({Director_selected: ''})
        this.directorSelected = {
          nombre: '',
          rut: ''
        }
        this.fbForm.get('Director')?.enable();
        this.haveDirectorAlterno(false)
      break;
      case 'alterno':
        this.fbForm.patchValue({DirectorAlterno_selected: ''})
        this.directorAlternoSelected = {
          nombre: '',
          rut: ''
        }
        this.fbForm.get('Director_alterno')?.enable();
        this.fbForm.get('DirectorAlterno_selected')?.reset();
      break;
    }
  }

  haveDirectorAlterno(dA: boolean){
    switch (dA) {
      
      case true: 
        this.fbForm.patchValue({haveDirectorAlterno: true});
        this.activeIndexAcordionAddPrograma = 3; 
      break;

      case false:
        this.fbForm.patchValue({haveDirectorAlterno: false});
        this.fbForm.get('Director_alterno')?.reset();
        this.fbForm.get('DirectorAlterno_selected')?.reset();
        this.showTableDirectoresAlternos = false;
        this.unsetSelectDirector('alterno'); 
        this.activeIndexAcordionAddPrograma = 2; 
      break;
    
      default:
        break;
    }
  }

  setFormPrograma(form: Programa){
    this.fbForm.patchValue({...form, Graduacion_Conjunta_Switch: form.Graduacion_Conjunta === 1 ? true : false});
    console.log("ASI QUEDA EL FORM",this.fbForm.value);
    
  }

  resetFormPrograma(){
    this.resetFormProgramaCreate();
    this.uploaderFilesService.resetUploader();
    this.activeIndexStateForm = 0;
    // this.fbForm.clearValidators();
    this.fbForm.enable();
    this.fbForm.get('Instituciones')?.disable();
    
  }

  resetFormProgramaCreate(){
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
      EstadoMaestro: '',
      Cod_EstadoMaestro: '',
      Graduacion_Conjunta_Switch: false,
      Instituciones: {value:'', disabled: true},

      Cod_Reglamento: '',
      Director: '',
      Director_selected: '',
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
  }




  async getTiposProgramas(loading = true){
    return await this.invoker.httpInvoke({service: 'tiposprogramas/getTiposProgramas', loading: loading});
  }

  async getCampus(loading = true){
    return await this.invoker.httpInvoke({service: 'campus/logica_getCampus', loading: loading});
  }

  async getUnidadesAcademicas(loading = true){
    return await this.invoker.httpInvoke({service: 'unidadesAcademicas/logica_getUnidadesAcademicas', loading: loading});
  }

  async getDirector( params: any , loading = true,){
    return await this.invoker.httpInvoke({service: 'programas/getDirector', loading: loading},params);
  }

  async getInstituciones(loading = true){
    return await this.invoker.httpInvoke({service: 'programas/getInstituciones', loading: loading});
  }

  async getReglamentos(loading = true) {
    return await this.invoker.httpInvoke({service: 'reglamentos/getReglamentos', loading: loading});
  }

  async getInstitucionesSelected(params: any, loading = true){
    return await this.invoker.httpInvoke({service: 'programas/getInstitucionesSelected', loading: loading}, params);
  }

  async getLogPrograma(params: any, loading = true){
    return await this.invoker.httpInvoke({service: 'programas/getLogPrograma', loading: loading}, params);
  }

  async getProgramas(){
    return await this.invoker.httpInvoke('programas/getProgramas');
  }

  async getPrograma(params: any, loading = true){
    return await this.invoker.httpInvoke({
      service: 'programas/getPrograma',
      loading: loading,
      retry: 0,
      timeout: 30000
    },params);
  }

  async getEstadosMaestros(loading = true){
    return await this.invoker.httpInvoke({service: 'estado_maestro/getEstadosMaestros', loading: loading});
  }

  async getEstadosAcreditacion(loading = true){
    return await this.invoker.httpInvoke({service: 'estados_acreditacion/getEstadosAcreditacion', loading: loading});
  }

  async getArchiveDoc(idDocumento: string, from: string) {
    return await this.invoker.httpInvokeReport('programas/getArchiveDoc','pdf',{id: idDocumento, from: from});
  }

  async getDocumentosWithBinary(cod_programa: number, from: 'titulo' | 'REXE' | 'grado_academico' | 'estado_maestro' | 'director' | 'directorAlterno' | 'maestro', loading = true) {
    // return await this.invoker.httpInvoke(generateServiceMongo('programas/getDocumentosWithBinary'),{Cod_Programa: cod_programa , from: from});
    return await this.invoker.httpInvoke({
      service: 'programas/getDocumentosWithBinary',
      loading: loading,
      retry: 0,
      timeout: 30000
    },{Cod_Programa: cod_programa , from: from});
  }

  async insertProgramaService(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('programas/insertPrograma'),params);
  }

}
