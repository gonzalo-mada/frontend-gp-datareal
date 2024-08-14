import { Injectable } from '@angular/core';
import { ActionsCrudService } from './actions-crud.service';
import { Facultad } from '../models/Facultad';
import { InvokerService } from 'src/app/base/services/invoker.service';

@Injectable({
  providedIn: 'root'
})
export class FacultadService {

  constructor(private invoker: InvokerService) { }

  // bruto_getFacultades,
  // bruto_insertFacultad,
  // bruto_updateFacultad,
  // bruto_deteleFacultad

  async bruto_getFacultades(){
    return await this.invoker.httpInvoke('facultades/bruto_getFacultades');
  }

  async bruto_insertFacultad(params: any){
    return await this.invoker.httpInvoke('facultades/bruto_insertFacultad', params);
  }

  async bruto_updateFacultad(params: any){
    return await this.invoker.httpInvoke('facultades/bruto_updateFacultad', params);
  }

  async bruto_deleteFacultad(params: any){
    return await this.invoker.httpInvoke('facultades/bruto_deleteFacultad', {facultadesToDelete:params});
  }

  //servicios para mongodb

  async getDocumentosWithBinary(Cod_facultad: string) {
    return await this.invoker.httpInvoke('facultades/getDocumentosWithBinary',{Cod_facultad: Cod_facultad});
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('facultades/getArchiveDoc','pdf',{id: idDocumento});
  }

  async deleteDoc(Cod_facultad: string) {
    return await this.invoker.httpInvoke('facultades/deleteDoc',{Cod_facultad: Cod_facultad});
  }
}
