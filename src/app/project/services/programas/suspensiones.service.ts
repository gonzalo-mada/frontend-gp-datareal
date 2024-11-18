import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Suspension } from '../../models/programas/Suspension';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { GPValidator } from '../../tools/validators/gp.validators';

type ModeForm = undefined | 'create' | 'edit' | 'show' | 'insert' | 'update' | 'delete'

@Injectable({
  providedIn: 'root'
})
export class SuspensionesService {

  namesCrud: NamesCrud = {
    singular: 'tipo de suspensión',
    plural: 'tipos de suspensiones',
    articulo_singular: 'el tipo de suspensión',
    articulo_plural: 'los tipos de suspensiones',
    genero: 'masculino'
  }
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;
  suspension: Suspension = {};
  public fbForm: FormGroup;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function} | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(
    private fb: FormBuilder,
    private invoker: InvokerService, 
    private messageService: MessageService, 
    private errorTemplateHandler: ErrorTemplateHandler
  ){
    this.fbForm = this.fb.group({
      Descripcion_TipoSuspension: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
      aux: ['']
    });
  }

  resetForm(){
    this.fbForm.reset({
      Descripcion_TipoSuspension: '',
      aux: []
    });
    this.fbForm.get('Descripcion_TipoSuspension')!.enable();
  }

  setModeCrud(mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function){
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

  setModeForm(mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  async getSuspensiones(){
    return await this.invoker.httpInvoke('suspensiones/getSuspensiones');
  }
  async insertSuspension(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('suspensiones/insertSuspension'), params));
  }
  async updateSuspension(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('suspensiones/updateSuspension'), params));
  }
  async deleteSuspension(params: any){
    return await this.invoker.httpInvoke('suspensiones/deleteSuspension', params);
  }

  //servicios para mongodb
  async getDocumentosWithBinary(params: any) {
    return await this.invoker.httpInvoke(generateServiceMongo('suspensiones/getDocumentosWithBinary',false),params);
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('suspensiones/getArchiveDoc','pdf',{id: idDocumento});
  }
}
