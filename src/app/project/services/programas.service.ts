import { effect, Injectable, signal } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Programa } from '../models/Programa'
import { BehaviorSubject, Subject, Subscription } from 'rxjs';
import { EstadosAcreditacion } from '../models/EstadosAcreditacion';
import { EstadoMaestro } from '../models/EstadoMaestro';
import { Suspension } from '../models/Suspension';
import { ModeForm } from '../models/shared/ModeForm';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { Reglamento } from '../models/Reglamento';
import { generateServiceMongo } from '../tools/utils/service.utils';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UploaderFilesService } from './components/uploader-files.service';
import { LabelComponent } from '../models/shared/Context';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
import { ConfigModeService } from './components/config-mode.service';
import { GPValidator } from '../tools/validators/gp.validators';

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
  disposition: boolean = false;
  showAsterisk: boolean = false;
  activeIndexStateForm: number | undefined = 0;
  keyPopups: string = 'programas'


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

  public fbForm: FormGroup;
  directorSelected!: Director;
  directorAlternoSelected!: Director
  reglamentoSelected: string = '';
  estadoMaestroSelected: string = '';
  estadoAcreditacionSelected: string = '';

  constructor(private fb: FormBuilder,private invoker: InvokerService, private uploaderFilesService: UploaderFilesService, private configModeService: ConfigModeService) { 

    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        switch (from.context.component.label) {
          case 'Título': this.filesChanged(from.files, 'Título'); break;
          case 'Grado académico': this.filesChanged(from.files, 'Grado académico'); break;
          case 'REXE': this.filesChanged(from.files, 'REXE'); break;
          case 'Director': this.filesChanged(from.files, 'Director'); break;
          case 'Director alterno': this.filesChanged(from.files, 'Director alterno'); break;
          case 'Estado maestro': this.filesChanged(from.files, 'Estado maestro'); break; 
          default:
            break;
        }
      }
    }));
    this.fbForm = this.fb.group({
      //paso 1
      Centro_costo: ['', [Validators.required]],
      Nombre_programa: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      Grupo_correo: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      Cod_Programa: ['', [Validators.required]],
      Codigo_SIES: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      Creditos_totales: ['', [Validators.required]],
      Horas_totales: ['', [Validators.required]],
      
      //paso 2
      Tipo_programa: ['', [Validators.required]],
      Campus: ['', [Validators.required]],
      Unidad_academica: ['', [Validators.required]],
      Graduacion_Conjunta_Switch: [false],
      Instituciones: [{value:'', disabled: true}, [Validators.required]],

      //paso 3 
      Titulo: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      files_titulo: [[], this.filesValidator('files_titulo')],
      Grado_academico: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      files_gradoacad: [[], this.filesValidator('files_gradoacad')],
      REXE: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      files_rexe: [[], this.filesValidator('files_rexe')],
      Cod_Reglamento: ['', [Validators.required]],
      Director: ['', [Validators.required, RutValidator.rut]],
      Director_selected: ['', [Validators.required]],
      files_director: [[], this.filesValidator('files_director')],
      Director_alterno: ['', [Validators.required, RutValidator.rut]],
      DirectorAlterno_selected: ['', [Validators.required]],
      files_directorAlterno: [[], this.filesValidator('files_directorAlterno')],
      EstadoMaestro: ['', [Validators.required]],
      Cod_EstadoMaestro: ['', [Validators.required]],
      files_estadomaestro: [[], this.filesValidator('files_estadomaestro')],
      Cod_acreditacion: ['', [Validators.required]],
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
          this.fbForm.get('Horas_totales')!.invalid 
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
          this.fbForm.get('Instituciones')!.invalid 
        ) {
      return false;
    } else {
      return true;
    }
  }

  get stateStepThree() {
    if (
          this.fbForm.get('Titulo')!.invalid || 
          this.fbForm.get('files_titulo')!.invalid || 
          this.fbForm.get('Grado_academico')!.invalid || 
          this.fbForm.get('files_gradoacad')!.invalid || 
          this.fbForm.get('REXE')!.invalid || 
          this.fbForm.get('files_rexe')!.invalid || 
          this.fbForm.get('Cod_Reglamento')!.invalid || 
          this.fbForm.get('Director_selected')!.invalid || 
          this.fbForm.get('files_director')!.invalid || 
          this.fbForm.get('DirectorAlterno_selected')!.invalid || 
          this.fbForm.get('files_directorAlterno')!.invalid || 
          this.fbForm.get('Cod_EstadoMaestro')!.invalid || 
          this.fbForm.get('files_estadomaestro')!.invalid || 
          this.fbForm.get('Cod_acreditacion')!.invalid
        ) {
      return false;
    } else {
      return true;
    }
  }

  get stateFormPrograma() {
    return this.stateStepOne && this.stateStepTwo && this.stateStepThree;
  }

  filesValidator(fileKey: 'files_titulo' | 'files_gradoacad' | 'files_rexe' | 'files_director' | 'files_directorAlterno' | 'files_estadomaestro' ) {
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
  
  setSelectDirector(mode: 'director' | 'alterno' , nombre: string, rut: string){
    switch (mode) {
      case 'director':
        this.fbForm.patchValue({Director_selected: rut})
        this.directorSelected = {
          nombre: nombre,
          rut: rut
        }
      break;
      case 'alterno':
        this.fbForm.patchValue({DirectorAlterno_selected: rut})
        this.directorAlternoSelected = {
          nombre: nombre,
          rut: rut
        }
      break;
    }

    
    
  }

  setFormPrograma(form: Programa){
    this.fbForm.patchValue({...form, Graduacion_Conjunta_Switch: form.Graduacion_Conjunta === 1 ? true : false});
  }




  async getTiposProgramas(){
    return await this.invoker.httpInvoke('tiposprogramas/getTiposProgramas');
  }

  async getCampus(){
    return await this.invoker.httpInvoke('campus/logica_getCampus');
  }

  async getUnidadesAcademicas(){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_getUnidadesAcademicas');
  }

  async getDirector(params: any){
    return await this.invoker.httpInvoke('programas/getDirector', params);
  }

  async getInstituciones(){
    return await this.invoker.httpInvoke('programas/getInstituciones');
  }

  async getReglamentos() {
    return await this.invoker.httpInvoke('reglamentos/getReglamentos');
  }

  async getInstitucionesSelected(params: any){
    return await this.invoker.httpInvoke('programas/getInstitucionesSelected', params);
  }

  async getProgramas(){
    return await this.invoker.httpInvoke('programas/getProgramas');
  }

  async getPrograma(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('programas/getPrograma'),params);
  }

  async getEstadosMaestros(){
    return await this.invoker.httpInvoke('estado_maestro/getEstadosMaestros');
  }

  async getEstadosAcreditacion(){
    return await this.invoker.httpInvoke('estados_acreditacion/getEstadosAcreditacion');
  }

  async getArchiveDoc(idDocumento: string, from: 'titulo' | 'REXE' | 'gradoAcad' | 'estadoMaestro') {
    return await this.invoker.httpInvokeReport('programas/getArchiveDoc','pdf',{id: idDocumento, from: from});
  }

  async getDocumentosWithBinary(cod_programa: number, from: 'titulo' | 'REXE' | 'grado_academico' | 'estado_maestro' | 'director' | 'directorAlterno') {
    return await this.invoker.httpInvoke(generateServiceMongo('programas/getDocumentosWithBinary'),{Cod_Programa: cod_programa , from: from});
  }

  async insertProgramaService(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('programas/insertPrograma'),params);
  }

}
