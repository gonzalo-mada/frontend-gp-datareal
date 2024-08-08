import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Campus } from '../models/Campus';

@Injectable({
  providedIn: 'root'
})
export class CampusService {

  constructor(private invoker: InvokerService) { }

  // router.post('/logica_getCampus', services.logica_getCampus);
  // router.post('/logica_insertCampus', services.logica_insertCampus);
  // router.post('/logica_updateCampus', services.logica_updateCampus);
  // router.post('/logica_deleteCampus', services.logica_deleteCampus);

  async getCampus(){
    return await this.invoker.httpInvoke('campus/logica_getCampus');
  }

  async insertCampusService(params: any){
    // console.log("params from service insertCampus",params);
    return await this.invoker.httpInvoke('campus/logica_insertCampus',params);
  }

  async updateCampusService(params: any){
    console.log("params from service updateCampusService",params);
    return await this.invoker.httpInvoke('campus/logica_updateCampus',params);
  }

  async deleteCampusService(params: any){  
    // console.log("params from service deleteCampusService",params);
    return await this.invoker.httpInvoke('campus/logica_deleteCampus',{campusToDelete: params});
  }

  //servicios para mongodb

  async getDocumentosCampus(Cod_campus: string) {
    return await this.invoker.httpInvoke('campus/getDocumentosCampus',{Cod_campus: Cod_campus,});
  }

  async getDocumentosWithBinaryCampus(Cod_campus: string) {
    return await this.invoker.httpInvoke('campus/getDocumentosWithBinaryCampus',{Cod_campus: Cod_campus,});
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('campus/getArchivoDocumento','pdf',{id: idDocumento,});
  }

  async deleteDocCampus(Cod_campus: string) {
    return await this.invoker.httpInvoke('campus/deleteDocCampus',{Cod_campus: Cod_campus,});
  }

  async saveDocs(docs: any){
    return await this.invoker.httpInvoke(
      {
        service: 'campus/saveDocs',
        retry: 0,
        timeout: 30000
      },
      {
        nombre: docs.nombre,
        archivo: docs.archivo,
        tipo: docs.tipo,
        Cod_campus: docs.extras.Cod_campus,
        Descripcion_campus: docs.extras.Descripcion_campus,
        pesoDocumento: docs.extras.pesoDocumento,
        comentarios: docs.extras.comentarios,
      }
    );
  }
}
