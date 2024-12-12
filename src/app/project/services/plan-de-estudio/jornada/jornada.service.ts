import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../../models/shared/ModeForm';
import { StateValidatorForm } from '../../../models/shared/StateValidatorForm';
import { Jornada } from '../../../models/plan-de-estudio/Jornada';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JornadaService {
  
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Jornada | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();
  
  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Jornada | null, resolve?: Function, reject?: Function  } | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService) { }

  setModeCrud(mode: ModeForm, data?: Jornada | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: Jornada | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  async getJornadas(){
    return await this.invoker.httpInvoke('jornadas/getJornadas');
  }

  async insertJornada(params: any) {
    return await this.invoker.httpInvoke('jornadas/insertJornada', params);
  }

  async updateJornada(params: any) {
    return await this.invoker.httpInvoke('jornadas/updateJornada', params);
  }

  async deleteJornada(params: any) {
    return await this.invoker.httpInvoke('jornadas/deleteJornada', { jornadaToDelete:params });
  }
}
