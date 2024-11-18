import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { StateValidatorForm } from '../../models/shared/StateValidatorForm';
import { BehaviorSubject } from 'rxjs';
import { Reglamento } from '../../models/programas/Reglamento';
import { ModeForm } from '../../models/shared/ModeForm';
import { generateServiceMongo } from '../../tools/utils/service.utils';
import { NamesCrud } from '../../models/shared/NamesCrud';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { GPValidator } from '../../tools/validators/gp.validators';


@Injectable({
  providedIn: 'root'
})
export class ReglamentosService {

  namesCrud: NamesCrud = {
    singular: 'reglamento',
    plural: 'reglamentos',
    articulo_singular: 'el reglamento',
    articulo_plural: 'los reglamentos',
    genero: 'masculino'
  }
  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;
  reglamento: Reglamento = {};

  // BehaviorSubject para manejar el modo CRUD
  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  public fbForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private invoker: InvokerService, 
    private messageService: MessageService, 
    private errorTemplateHandler: ErrorTemplateHandler
  ){
    this.fbForm = this.fb.group({
      Descripcion_regla: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
      anio: ['', Validators.required],
      vigencia: [false],
      files: [[], this.filesValidator.bind(this)],  // Validación personalizada de archivos
      aux: ['']
    });
  }

  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
        return null;
    }
    const files = formGroup.get('files')?.value;

    if ( this.modeForm === 'create' || this.modeForm === 'edit' ){
      if (files.length === 0 ) {
        return { required: true };
      }
    }
    return null;
  }

  resetForm(): void {
    this.fbForm.reset({
      Descripcion_regla: '',
      anio: '',
      vigencia: false,
      files: [],
      aux: []
    });
    this.fbForm.get('Descripcion_regla')?.enable();
    this.fbForm.get('anio')?.enable();
    this.fbForm.get('vigencia')?.enable();
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  filesChanged(files: any): void {
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  // Método para establecer el modo CRUD
  setModeCrud(mode: ModeForm, data?: Reglamento | null, resolve?: Function, reject?: Function) {
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

  // Métodos CRUD para reglamentos
  async getReglamentos() {
    return await this.invoker.httpInvoke('reglamentos/getReglamentos');
  }
  
  async insertReglamento(params: any) {
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('reglamentos/insertReglamento'), params));
  }

  async updateReglamento(params: any) {
    return this.checkResponse(await this.invoker.httpInvoke(generateServiceMongo('reglamentos/updateReglamento'), params));
  }

  async deleteReglamento(params: any) {
    return await this.invoker.httpInvoke('reglamentos/deleteReglamentos', { reglamentoToDelete:params });
  }

  // Servicios relacionados con documentos en MongoDB
  async getDocumentosWithBinary(Cod_reglamento: number) {
    return await this.invoker.httpInvoke(generateServiceMongo('reglamentos/getDocumentosWithBinary',false), { Cod_reglamento });
  }

  async getArchiveDoc(idDocumento: string) {
    return await this.invoker.httpInvokeReport('reglamentos/getArchiveDoc', 'pdf', { id: idDocumento });
  }
}