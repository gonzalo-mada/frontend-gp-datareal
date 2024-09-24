import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Suspension } from '../models/Suspension';

type ModeForm = undefined | 'create' | 'edit' | 'show' | 'insert' | 'update' | 'delete'

@Injectable({
  providedIn: 'root'
})
export class SuspensionesService {

  modeFormSuspension: ModeForm = undefined;
  stateFormSuspension: StateValidatorForm = undefined;

  private modeCrudSubject = new BehaviorSubject<{mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function} | null>(null);
  modeCrud$ = this.modeCrudSubject.asObservable();

  constructor(private invoker: InvokerService){}

  setModeSubject(mode: ModeForm, data?: Suspension | null, resolve?: Function, reject?: Function){
    this.modeFormSuspension = mode;
    this.modeCrudSubject.next({mode, data, resolve, reject});
    this.modeCrudSubject.next(null);
  }

  async getSuspensiones(){
    return await this.invoker.httpInvoke('suspensiones/getSuspensiones');
  }
  async insertSuspension(params: any){
    return await this.invoker.httpInvoke('suspensiones/insertSuspension', params);
  }
  async updateSuspension(params: any){
    return await this.invoker.httpInvoke('suspensiones/updateSuspension', params);
  }
  async deleteSuspension(params: any){
    return await this.invoker.httpInvoke('suspensiones/deleteSuspension', params);
  }

  //servicios para mongodb
  async getDocumentosWithBinary(params: any) {
    return await this.invoker.httpInvoke('suspensiones/getDocumentosWithBinary',params);
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('suspensiones/getArchiveDoc','pdf',{id: idDocumento});
  }
}
