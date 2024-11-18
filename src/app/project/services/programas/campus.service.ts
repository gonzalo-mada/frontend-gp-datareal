import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Campus } from '../../models/programas/Campus';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';

@Injectable({
  providedIn: 'root'
})
export class CampusService {

  namesCrud: NamesCrud = {
    singular: 'campus',
    plural: 'campus',
    articulo_singular: 'el campus',
    articulo_plural: 'los campus',
    genero: 'masculino'
  };
  keyPopups: string = 'facultad';
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Campus | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService, private messageService: MessageService, private errorTemplateHandler: ErrorTemplateHandler){}

  setModeCrud(mode: ModeForm, data?: Campus | null, resolve?: Function, reject?: Function){
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

  async getCampus(){
    return await this.invoker.httpInvoke('campus/logica_getCampus');
  }

  async insertCampusService(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('campus/logica_insertCampus'),params));
  }

  async updateCampusService(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('campus/logica_updateCampus'),params));
  }

  async deleteCampusService(params: any){  
    return await this.invoker.httpInvoke('campus/logica_deleteCampus',{campusToDelete: params});
  }

  //servicios para mongodb
  async getDocumentosWithBinary(Cod_campus: string) {
    return await this.invoker.httpInvoke(generateServiceMongo('campus/getDocumentosWithBinary',false),{Cod_campus: Cod_campus});
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('campus/getArchivoDocumento','pdf',{id: idDocumento});
  }

}
