import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Suspension } from '../../models/programas/Suspension';
import { generateServiceMongo } from '../../tools/utils/service.utils';

type ModeForm = undefined | 'create' | 'edit' | 'show' | 'insert' | 'update' | 'delete'

@Injectable({
  providedIn: 'root'
})
export class SuspensionesService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function} | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService){}

  setModeCrud(mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  async getSuspensiones(){
    return await this.invoker.httpInvoke('suspensiones/getSuspensiones');
  }
  async insertSuspension(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('suspensiones/insertSuspension'), params);
  }
  async updateSuspension(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('suspensiones/updateSuspension'), params);
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
