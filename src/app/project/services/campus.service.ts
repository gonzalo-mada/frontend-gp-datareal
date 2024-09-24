import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Campus } from '../models/Campus';
import { ModeForm } from '../models/shared/ModeForm';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CampusService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Campus | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService) {}

  setModeCrud(mode: ModeForm, data?: Campus | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  async getCampus(){
    return await this.invoker.httpInvoke('campus/logica_getCampus');
  }

  async insertCampusService(params: any){
    return await this.invoker.httpInvoke('campus/logica_insertCampus',params);
  }

  async updateCampusService(params: any){
    return await this.invoker.httpInvoke('campus/logica_updateCampus',params);
  }

  async deleteCampusService(params: any){  
    return await this.invoker.httpInvoke('campus/logica_deleteCampus',{campusToDelete: params});
  }

  //servicios para mongodb
  async getDocumentosWithBinary(Cod_campus: string, loading = true) {
    return await this.invoker.httpInvoke({service:'campus/getDocumentosWithBinary' , loading: loading},{Cod_campus: Cod_campus});
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('campus/getArchivoDocumento','pdf',{id: idDocumento});
  }

}
