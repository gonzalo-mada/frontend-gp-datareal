import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Modalidad } from '../../models/plan-de-estudio/Modalidad';

@Injectable({
  providedIn: 'root'
})
export class ModalidadesService {
  
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Modalidad | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Modalidad | null, resolve?: Function, reject?: Function  } | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService) { }

  setModeCrud(mode: ModeForm, data?: Modalidad | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: Modalidad | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  async getModalidades(){
    return await this.invoker.httpInvoke('modalidades/getModalidades');
  }

  async insertModalidad(params: any) {
    return await this.invoker.httpInvoke('modalidades/insertModalidad', params);
  }

  async updateModalidad(params: any) {
    return await this.invoker.httpInvoke('modalidades/updateModalidad', params);
  }

  async deleteModalidad(params: any) {
    return await this.invoker.httpInvoke('modalidades/deleteModalidad', { modalidadToDelete:params });
  }
}
