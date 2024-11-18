import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { Facultad } from '../../models/programas/Facultad';
import { BehaviorSubject } from 'rxjs';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { Table } from 'primeng/table';

@Injectable({
  providedIn: 'root'
})
export class FacultadService {

  namesCrud: NamesCrud = {
    singular: 'facultad',
    plural: 'facultades',
    articulo_singular: 'la facultad',
    articulo_plural: 'las facultades',
    genero: 'femenino'
  };
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Facultad | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService, private messageService: MessageService, private errorTemplateHandler: ErrorTemplateHandler){}

  setModeCrud(mode: ModeForm, data?: Facultad | null, resolve?: Function, reject?: Function){
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

  //logica
  async getFacultades(){
    return await this.invoker.httpInvoke('facultades/getFacultades');
  }

  async insertFacultadService(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('facultades/insertFacultad'),params));
  }

  async updateFacultadService(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('facultades/updateFacultad'),params));
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
