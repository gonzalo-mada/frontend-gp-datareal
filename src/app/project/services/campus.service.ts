import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Campus } from '../models/Campus';
import { ActionsCrudService } from './actions-crud.service';

@Injectable({
  providedIn: 'root'
})
export class CampusService extends ActionsCrudService {

  constructor(private invoker: InvokerService) { super() }

  async getCampus(){
    return await this.invoker.httpInvoke('campus/logica_getCampus');
  }

  async insertCampusService(params: any){
    // console.log("params from service insertCampus",params);
    return await this.invoker.httpInvoke('campus/logica_insertCampus',params);
  }

  async updateCampusService(params: any){
    // console.log("params from service updateCampusService",params);
    return await this.invoker.httpInvoke('campus/logica_updateCampus',params);
  }

  async deleteCampusService(params: any){  
    // console.log("params from service deleteCampusService",params);
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
