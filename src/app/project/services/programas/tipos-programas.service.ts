import { effect, Injectable, signal } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../models/shared/ModeForm';
import { TipoPrograma } from '../../models/programas/TipoPrograma';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';

@Injectable({
  providedIn: 'root'
})

export class TiposprogramasService {

  namesCrud: NamesCrud = {
    singular: 'tipo de programa',
    plural: 'tipos de programas',
    articulo_singular: 'el tipo de programa',
    articulo_plural: 'los tipos de programas',
    genero: 'masculino'
  }
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: TipoPrograma | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  constructor(
    private invoker: InvokerService, 
    private messageService: MessageService, 
    private errorTemplateHandler: ErrorTemplateHandler
  ) {}

  setModeCrud(mode: ModeForm, data?: TipoPrograma | null, resolve?: Function, reject?: Function){
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

  async getTiposProgramas(){
    return await this.invoker.httpInvoke('tiposprogramas/getTiposProgramas');
  }

  async insertTipoPrograma(params: any){
    return this.checkResponse(await this.invoker.httpInvoke('tiposprogramas/insertTipoPrograma', params));
  }

  async updateTipoPrograma(params: any){
    return this.checkResponse(await this.invoker.httpInvoke('tiposprogramas/updateTipoPrograma', params));
  }

  async deleteTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/deleteTipoPrograma', {tiposProgramasToDelete:params});
  }
}
