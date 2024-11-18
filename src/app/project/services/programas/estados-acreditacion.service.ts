import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { EstadosAcreditacion } from '../../models/programas/EstadosAcreditacion';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { GPValidator } from '../../tools/validators/gp.validators';

@Injectable({
  providedIn: 'root'
})
export class EstadosAcreditacionService {

  namesCrud: NamesCrud = {
      singular: 'estado de acreditación',
      plural: 'estados de acreditación',
      articulo_singular: 'el estado de acreditación',
      articulo_plural: 'los estados de acreditación',
      genero: 'masculino'
  };
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;
  estadoAcreditacion: EstadosAcreditacion = {};
  yearsDifference: number | null = null;
  showAsterisk: boolean = false;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: EstadosAcreditacion | null, resolve?: Function, reject?: Function  } | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  public fbForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoker: InvokerService, 
    private messageService: MessageService, 
    private errorTemplateHandler: ErrorTemplateHandler
  ){
    this.fbForm = this.fb.group({
      Acreditado: [false],
      Nombre_ag_acredit: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]], //string
      Evaluacion_interna: [false], // si/no
      Fecha_informe: ['', [Validators.required]], //date
      tiempo: this.fb.group({
        Cod_tiempoacredit: [],
        Fecha_inicio: [{value:'', disabled: true}, [Validators.required]],
        Fecha_termino: [{value:'', disabled: true}, [Validators.required]],
        Cantidad_anios: [{disabled: true}, [GPValidator.notValueNegativeYearsAcredit(),GPValidator.notUpTo15YearsAcredit()]]
      }), //number , positivo
      files: [[], this.filesValidator.bind(this)],
      aux: []
    });
  }

  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
        return null;
    }
    const isAcreditado = formGroup.get('Acreditado')?.value === 'SI';
    const acreditado = this.estadoAcreditacion.Acreditado === 'SI';
    const files = formGroup.get('files')?.value || [];

    // Determinar si el archivo es requerido basándonos en la modalidad y el tipo de switch
    const needsFiles = (( isAcreditado || acreditado )  ) ;
    const isCreatingOrEditing = this.modeForm === 'create' || this.modeForm === 'edit';

    // Validar si se requieren archivos
    if (needsFiles && isCreatingOrEditing && files.length === 0) {
        return { required: true };
    }

    return null;
  }

  resetForm(){
    this.fbForm.reset({
      Acreditado: false,
      Nombre_ag_acredit: '',
      Evaluacion_interna: false,
      Fecha_informe: '',
      tiempo: {
        Cod_tiempoacredit: '',
        Fecha_inicio: '',
        Fecha_termino: '',
        Cantidad_anios: ''
      },
      files: [],
      aux: []
    });
    this.fbForm.get('Acreditado')?.enable();
    this.fbForm.get('Nombre_ag_acredit')?.disable();
    this.fbForm.get('Evaluacion_interna')?.enable();
    this.fbForm.get('Fecha_informe')?.enable();
    this.fbForm.get('tiempo.Fecha_inicio')?.disable();
    this.fbForm.get('tiempo.Fecha_termino')?.disable();
    this.fbForm.get('tiempo.Cantidad_anios')?.disable();
    this.showAsterisk = false;
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  enableForm(){
    this.fbForm.get('Nombre_ag_acredit')?.enable();
    this.showAsterisk = true;
    this.fbForm.get('tiempo.Fecha_inicio')?.enable();
    this.fbForm.get('tiempo.Fecha_termino')?.enable();
  }

  disableForm(){
    this.fbForm.get('Nombre_ag_acredit')?.disable();
    this.yearsDifference = null;
    this.showAsterisk = false;
    this.fbForm.get('tiempo.Fecha_inicio')?.disable();
    this.fbForm.get('tiempo.Fecha_termino')?.disable();
  }

  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  setModeCrud(mode: ModeForm, data?: EstadosAcreditacion | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  checkResponse(response: any){
    if ( response.withControlledErrors ) {
      this.messageService.clear();
      this.messageService.add({
        key: 'main-gp',
        severity: 'warn',
        summary:  `Error al ${response.method} ${this.namesCrud.singular}`,
        detail: response.error.message.message,
        sticky: true
      });
      this.errorTemplateHandler.processError(response.error, {
        notifyMethod: 'none',
      });
      return response
    }else{
      return response
    }
  }

  countTableValues(value: number){
    this.messageService.clear();
    this.messageService.add({
      key: 'main-gp',
      severity: 'info',
      detail: value !== 1
       ? `${value} ${this.namesCrud.plural} ${this.namesCrud.genero === 'masculino' ? 'listados' : 'listadas'}.`
       : `${value} ${this.namesCrud.singular} ${this.namesCrud.genero === 'masculino' ? 'listado' : 'listada'}.`
    });
  };

  async getEstadosAcreditacion(){
    return await this.invoker.httpInvoke('estados_acreditacion/getEstadosAcreditacion');
  }
  async insertEstadoAcreditacion(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('estados_acreditacion/insertEstadoAcreditacion'), params));
  }
  async updateEstadoAcreditacion(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('estados_acreditacion/updateEstadoAcreditacion'), params));
  }
  async deleteEstadoAcreditacion(params: any){
    return await this.invoker.httpInvoke('estados_acreditacion/deleteEstadoAcreditacion', params);
  }

  //servicios para mongodb
  async getDocumentosWithBinary(params: any) {
    return await this.invoker.httpInvoke(generateServiceMongo('estados_acreditacion/getDocumentosWithBinary',false),params);
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('estados_acreditacion/getArchiveDoc','pdf',{id: idDocumento});
  }
}
