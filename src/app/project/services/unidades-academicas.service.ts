import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../models/shared/ModeForm';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { UnidadAcademica } from '../models/UnidadAcademica';
import { BehaviorSubject } from 'rxjs';
import { generateServiceMongo } from '../tools/utils/service.utils';

@Injectable({
  providedIn: 'root'
})
export class UnidadesAcademicasService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: UnidadAcademica | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService) { }

  setModeCrud(mode: ModeForm, data?: UnidadAcademica | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  async logica_getUnidadesAcademicas(){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_getUnidadesAcademicas');
  }

  async logica_insertUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('unidadesAcademicas/logica_insertUnidadesAcademicas'), params);
  }
  
  async logica_updateUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke(generateServiceMongo('unidadesAcademicas/logica_updateUnidadesAcademicas'), params);
  }
 
  async logica_deleteUnidadesAcademicas(params: any){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_deleteUnidadesAcademicas', {unidadAcadToDelete:params});
  }
 
  //servicios para mongodb
 
  async getDocumentosWithBinary(Cod_unidad_academica: number) {
    return await this.invoker.httpInvoke(generateServiceMongo('unidadesAcademicas/getDocumentosWithBinary'),{Cod_unidad_academica: Cod_unidad_academica});
  }
 
  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('unidadesAcademicas/getArchiveDoc','pdf',{id: idDocumento});
  }
 
}
