import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../models/shared/ModeForm';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { Facultad } from '../models/Facultad';
import { BehaviorSubject } from 'rxjs';
import { generateServiceMongo } from '../tools/utils/service.utils';

@Injectable({
  providedIn: 'root'
})
export class FacultadService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Facultad | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService) { }

  setModeCrud(mode: ModeForm, data?: Facultad | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  //logica
  async getFacultades(){
    return await this.invoker.httpInvoke('facultades/getFacultades');
  }

  async insertFacultadService(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('facultades/insertFacultad'),params);
  }

  async updateFacultadService(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('facultades/updateFacultad'),params);
  }

  async deleteFacultadService(params: any){  
    return await this.invoker.httpInvoke('facultades/deleteFacultad',{facultadesToDelete: params});
  }

  //servicios para mongodb

  async getDocumentosWithBinary(Cod_facultad: string) {
    return await this.invoker.httpInvoke(generateServiceMongo('facultades/getDocumentosWithBinary',false),{Cod_facultad: Cod_facultad});
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('facultades/getArchiveDoc','pdf',{id: idDocumento});
  }

}
