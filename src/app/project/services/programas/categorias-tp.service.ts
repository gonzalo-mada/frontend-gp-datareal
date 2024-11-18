import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ModeForm } from '../../models/shared/ModeForm';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { CategoriaTp } from '../../models/programas/CategoriaTp';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GPValidator } from '../../tools/validators/gp.validators';

@Injectable({
  providedIn: 'root'
})
export class CategoriasTpService {

  namesCrud: NamesCrud = {
    singular: 'categoría de tipo de programa',
    plural: 'categorías de tipos de programas',
    articulo_singular: 'la categoría de tipo de programa',
    articulo_plural: 'las categorías de tipos de programas',
    genero: 'femenino'
  };
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;
  categoriaTp: CategoriaTp = {};

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: CategoriaTp | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  public fbForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoker: InvokerService, 
    private messageService: MessageService, 
    private errorTemplateHandler: ErrorTemplateHandler
  ){
    this.fbForm = this.fb.group({
      Descripcion_categoria: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
    });
  }

  resetForm(){
    this.fbForm.reset({
      Descripcion_categoria: ''
    });
    this.fbForm.enable();
  }

  getStateForm(){
    console.log("state form categoria tp:",this.stateForm);
  }

  setModeCrud(mode: ModeForm, data?: CategoriaTp | null, resolve?: Function, reject?: Function){
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

  async getCategoriasTp(){
    return await this.invoker.httpInvoke('categorias-tp/getCategoriasTp');
  }

  async insertCategoriaTp(params: any){
    return this.checkResponse(await this.invoker.httpInvoke('categorias-tp/insertCategoriaTp', params));
  }

  async updateCategoriaTp(params: any){
    return this.checkResponse(await this.invoker.httpInvoke('categorias-tp/updateCategoriaTp', params));
  }

  async deleteCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/deleteCategoriaTp', {categoriasTpToDelete:params});
  }

}
