import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Reglamento } from '../models/Reglamento';
import { ModeForm } from '../models/shared/ModeForm';
import { generateServiceMongo } from '../tools/utils/service.utils';


@Injectable({
  providedIn: 'root'
})
export class ReglamentosService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  // BehaviorSubject para manejar el modo CRUD
  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function  } | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService) {}

  // Método para establecer el modo CRUD
  setModeCrud(mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function) {
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  // Métodos CRUD para reglamentos
  async getReglamentos() {
    return await this.invoker.httpInvoke('reglamentos/getReglamentos');
  }
  
  async insertReglamento(params: any) {
    return await this.invoker.httpInvoke(generateServiceMongo('reglamentos/insertReglamento'), params);
  }

  async updateReglamento(params: any) {
    return await this.invoker.httpInvoke(generateServiceMongo('reglamentos/updateReglamento'), params);
  }

  async deleteReglamento(params: any) {
    return await this.invoker.httpInvoke('reglamentos/deleteReglamentos', { reglamentoToDelete:params });
  }

  // Servicios relacionados con documentos en MongoDB
  async getDocumentosWithBinary(Cod_reglamento: number) {
    return await this.invoker.httpInvoke('reglamentos/getDocumentosWithBinary', { Cod_reglamento });
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('reglamentos/getArchiveDoc', 'pdf', { id: idDocumento });
  }
}