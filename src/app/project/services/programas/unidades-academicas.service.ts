import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { UnidadAcademica } from '../../models/programas/UnidadAcademica';
import { BehaviorSubject } from 'rxjs';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from '../../models/shared/NamesCrud';

@Injectable({
  providedIn: 'root'
})
export class UnidadesAcademicasService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;
  namesCrud: NamesCrud = {
    singular: 'unidad académica',
    plural: 'unidades académicas',
    articulo_singular: 'la unidad académica',
    articulo_plural: 'las unidades académicas',
    genero: 'femenino'
  };

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: UnidadAcademica | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService, private messageService: MessageService, private errorTemplateHandler: ErrorTemplateHandler){}
  
  setModeCrud(mode: ModeForm, data?: UnidadAcademica | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
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

  async logica_getUnidadesAcademicas(){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_getUnidadesAcademicas');
  }

  async logica_insertUnidadesAcademicas(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('unidadesAcademicas/logica_insertUnidadesAcademicas'), params));
  }
  
  async logica_updateUnidadesAcademicas(params: any){
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('unidadesAcademicas/logica_updateUnidadesAcademicas'), params));
  }
 
  async logica_deleteUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_deleteUnidadesAcademicas', {unidadAcadToDelete:params});
  }
 
  //servicios para mongodb
 
  async getDocumentosWithBinary(Cod_unidad_academica: number) {
    return await this.invoker.httpInvoke(generateServiceMongo('unidadesAcademicas/getDocumentosWithBinary',false),{Cod_unidad_academica: Cod_unidad_academica});
  }
 
  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('unidadesAcademicas/getArchiveDoc','pdf',{id: idDocumento});
  }
 
}
