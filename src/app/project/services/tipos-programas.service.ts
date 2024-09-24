import { effect, Injectable, signal } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../models/shared/ModeForm';
import { TipoPrograma } from '../models/TipoPrograma';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

export class TiposprogramasService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: TipoPrograma | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(private invoker: InvokerService) {}

  setModeCrud(mode: ModeForm, data?: TipoPrograma | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  async getTiposProgramas(){
    return await this.invoker.httpInvoke('tiposprogramas/getTiposProgramas');
  }

  async insertTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/insertTipoPrograma', params);
  }

  async updateTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/updateTipoPrograma', params);
  }

  async deleteTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/deleteTipoPrograma', {tiposProgramasToDelete:params});
  }
}
