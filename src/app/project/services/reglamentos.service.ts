import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Reglamento } from '../models/Reglamento';

type ModeForm = undefined | 'create' | 'edit' | 'show' | 'insert' | 'update' | 'delete'

@Injectable({
  providedIn: 'root'
})
export class ReglamentosService {

  
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  // BehaviorSubject para manejar el modo CRUD
  private modeCrudSubject = new BehaviorSubject<{mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function} | null>(null);
  modeCrud$ = this.modeCrudSubject.asObservable();

  constructor(private invoker: InvokerService) {}

  // Método para establecer el modo CRUD
  setModeCrud(mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function) {
    if (this.modeForm !== mode) {
        this.modeForm = mode;
        this.modeCrudSubject.next({ mode, data, resolve, reject });
    }
}

  // Métodos CRUD para reglamentos

  async getReglamentos() {
    return await this.invoker.httpInvoke('reglamentos/getReglamentos');
  }

  async insertReglamento(params: any) {
    return await this.invoker.httpInvoke('reglamentos/insertReglamento', params);
  }

  async updateReglamento(params: any) {
    return await this.invoker.httpInvoke('reglamentos/updateReglamento', params);
  }

  async deleteReglamento(params: any) {
    return await this.invoker.httpInvoke('reglamentos/deleteReglamento', { reglamentoToDelete:params });
  }

  // Servicios relacionados con documentos en MongoDB

  async getDocumentosWithBinary(Cod_reglamento: number) {
    return await this.invoker.httpInvoke('reglamentos/getDocumentosWithBinary', { Cod_reglamento });
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('reglamentos/getArchiveDoc', 'pdf', { id: idDocumento });
  }
}