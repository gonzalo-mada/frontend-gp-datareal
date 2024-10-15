import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { EstadosAcreditacion } from '../../models/programas/EstadosAcreditacion';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { generateServiceMongo } from '../../tools/utils/service.utils';

@Injectable({
  providedIn: 'root'
})
export class EstadosAcreditacionService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: EstadosAcreditacion | null, resolve?: Function, reject?: Function  } | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: EstadosAcreditacion | null, resolve?: Function, reject?: Function  } | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService){}

  setModeCrud(mode: ModeForm, data?: EstadosAcreditacion | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: EstadosAcreditacion | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  async getEstadosAcreditacion(){
    return await this.invoker.httpInvoke('estados_acreditacion/getEstadosAcreditacion');
  }
  async insertEstadoAcreditacion(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('estados_acreditacion/insertEstadoAcreditacion'), params);
  }
  async updateEstadoAcreditacion(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('estados_acreditacion/updateEstadoAcreditacion'), params);
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
