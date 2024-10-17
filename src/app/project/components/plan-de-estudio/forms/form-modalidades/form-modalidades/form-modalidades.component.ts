import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { ModalidadesService } from 'src/app/project/services/plan-de-estudio/modalidades.service';
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-modalidades',
  templateUrl: './form-modalidades.component.html',
  styles: [
  ]
})

export class FormModalidadesComponent implements OnInit, OnDestroy{
  constructor(
    private fb: FormBuilder,
    private errorTemplateHandler: ErrorTemplateHandler,
    private modalidadesService: ModalidadesService,
  ){}

  modalidad: Modalidad = {}
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.modalidadesService.modeForm;
  }

  public fbForm: FormGroup = this.fb.group({
    Descripcion_modalidad: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
  });

  ngOnInit(): void {
    this.namesCrud = {
      singular: 'modalidad',
      plural: 'modalidades',
      articulo_singular: 'la modalidad',
      articulo_plural: 'las modalidades',
      genero: 'femenino'
    };
    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.modalidadesService.stateForm = status as StateValidatorForm }))

    this.subscription.add(
      this.modalidadesService.formUpdate$.subscribe( form => {
        if (form && form.mode){
          if (form.data) {
            this.modalidad = {};
            this.modalidad = form.data;
          }
          switch (form.mode) {
            case 'create': this.createForm(form.resolve! , form.reject!); break;
            case 'show': this.showForm(form.resolve! , form.reject!); break;
            case 'edit': this.editForm(form.resolve! , form.reject!); break;
            case 'insert': this.insertForm(form.resolve! , form.resolve!); break;
            case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          
          }
        }
    }));
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  async insertForm(resolve: Function, reject: Function): Promise<void> {
    try {
      let params = {};
        const { ...formData } = this.fbForm.value;
        params = {
          ...formData
        };
      // Insertar las modalidades utilizando el servicio      
      const inserted: DataInserted = await this.modalidadesService.insertModalidad(params);
  
      if (inserted.dataWasInserted) {
        // Generar mensaje de éxito y resolver la promesa
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted, 'creado', true, false);
        resolve({ success: true, dataInserted: inserted.dataInserted, messageGp });
        this.resetForm();  // Resetear el formulario tras el éxito
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
        });
      this.resetForm();
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {}
      const { ...formData } = this.fbForm.value ; 
        params = {
          ...formData,
          Cod_modalidad: this.modalidad.Cod_modalidad,
        }
        const updated = await this.modalidadesService.updateModalidad(params)
        if ( updated.dataWasUpdated ) {
          const messageGp = generateMessage(this.namesCrud, null , 'actualizado', true,false)
          resolve({success:true , dataWasUpdated: updated.dataWasUpdated, messageGp})
          this.resetForm()
        }
      }catch (e: any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al guardar ${this.namesCrud.singular}`,
            message: e.detail.error.message.message
          });
        this.resetForm();
      }
  }

  async createForm(resolve: Function, reject: Function){
    try {
      this.resetForm();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  async showForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.modalidad});
      this.fbForm.get('Descripcion_modalidad')?.disable();
      resolve(true)
    } catch (e) {      
      reject(e)
    }  
  }

  async editForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.modalidad});
      let actualValue = this.fbForm.get('Descripcion_modalidad')?.value
      this.fbForm.get('Descripcion_modalidad')?.setValidators([
        Validators.required,  // Validador de requerido
        GPValidator.existName(actualValue) 
      ]);
      this.fbForm.get('Descripcion_modalidad')?.enable();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  resetForm(): void {
    this.fbForm.reset({
      Descripcion_modalidad: ''
    });
    this.fbForm.get('Descripcion_modalidad')?.enable();
  }
}
