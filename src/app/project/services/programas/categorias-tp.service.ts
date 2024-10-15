import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { CategoriaTp } from '../../models/programas/CategoriaTp';

@Injectable({
  providedIn: 'root'
})
export class CategoriasTpService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: CategoriaTp | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: CategoriaTp | null, resolve?: Function, reject?: Function} | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService){}

  setModeCrud(mode: ModeForm, data?: CategoriaTp | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: CategoriaTp | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  async getCategoriasTp(){
    return await this.invoker.httpInvoke('categorias-tp/getCategoriasTp');
  }

  async insertCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/insertCategoriaTp', params);
  }

  async updateCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/updateCategoriaTp', params);
  }

  async deleteCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/deleteCategoriaTp', {categoriasTpToDelete:params});
  }

}
