import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';

@Injectable({
  providedIn: 'root'
})
export class UnidadesAcademicasService {

  constructor(private invoker: InvokerService) { }

  async logica_getUnidadesAcademicas(){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_getUnidadesAcademicas');
  }
 
  async logica_insertUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_insertUnidadesAcademicas', params);
  }
 
  async logica_updateUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_updateUnidadesAcademicas', params);
  }
 
  async logica_deleteUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_deleteUnidadesAcademicas', {unidadAcadToDelete:params});
  }
 
  //servicios para mongodb
 
  async getDocumentosWithBinary(Cod_unidad_academica: number) {
    return await this.invoker.httpInvoke('unidadesAcademicas/getDocumentosWithBinary',{Cod_unidad_academica: Cod_unidad_academica});
  }
 
  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('unidadesAcademicas/getArchiveDoc','pdf',{id: idDocumento});
  }
 
  async deleteDoc(Cod_unidad_academica: string) {
    return await this.invoker.httpInvoke('unidadesAcademicas/deleteDoc',{Cod_unidad_academica: Cod_unidad_academica});
  }
}
