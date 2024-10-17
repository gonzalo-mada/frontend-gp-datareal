import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { JornadaService } from 'src/app/project/services/plan-de-estudio/jornada.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-jornadas',
  templateUrl: './form-jornadas.component.html',
  styles: [
  ]
})

export class FormJornadasComponent implements OnInit, OnDestroy{
  constructor(
    private fb: FormBuilder,
    private errorTemplateHandler: ErrorTemplateHandler,
    private jornadaService: JornadaService,
  ){}

  jornada: Jornada = {}
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.jornadaService.modeForm;
  }

  public fbForm: FormGroup = this.fb.group({
    Descripcion_jornada: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
  });

  ngOnInit(): void {
    this.namesCrud = {
      singular: 'jornada',
      plural: 'jornadas',
      articulo_singular: 'la jornada',
      articulo_plural: 'las jornadas',
      genero: 'femenino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.jornadaService.stateForm = status as StateValidatorForm }))

    this.subscription.add(
      this.jornadaService.formUpdate$.subscribe( form => {
        if (form && form.mode){
          if (form.data) {
            this.jornada = {};
            this.jornada = form.data;
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
      // Insertar las jornadas utilizando el servicio      
      const inserted: DataInserted = await this.jornadaService.insertJornada(params);
  
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
    reject(e)
    this.resetForm()
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {}
      const { ...formData } = this.fbForm.value ; 
        params = {
          ...formData,
          Cod_jornada: this.jornada.Cod_jornada,
        }
        const updated = await this.jornadaService.updateJornada(params)
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
        reject(e)
        this.resetForm()
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
      console.log(this.jornadaService.modeForm);

      this.fbForm.patchValue({...this.jornada});
      this.fbForm.get('Descripcion_jornada')?.disable();
      resolve(true)
    } catch (e) {      
      reject(e)
    }
  }

  async editForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.jornada});
      let actualValue = this.fbForm.get('Descripcion_jornada')?.value
      this.fbForm.get('Descripcion_jornada')?.setValidators([
        Validators.required,  // Validador de requerido
        GPValidator.existName(actualValue) 
      ]);
      this.fbForm.get('Descripcion_jornada')?.enable();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  resetForm(): void {
    this.fbForm.reset({
      Descripcion_jornada: ''
    });
    this.fbForm.get('Descripcion_jornada')?.enable();
  }
}
