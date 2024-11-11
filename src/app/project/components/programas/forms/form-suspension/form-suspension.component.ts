import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { DataUpdated } from 'src/app/project/models/shared/DataUpdated';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-suspension',
  templateUrl: './form-suspension.component.html',
  styles: [
  ]
})
export class FormSuspensionComponent implements OnInit, OnDestroy{

  constructor(
    private fb: FormBuilder,
    public suspensionesService: SuspensionesService,  
  ){}
  
  showAsterisk: boolean = false;
  namesCrud!: NamesCrud;
  suspension: Suspension = {};
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.suspensionesService.modeForm;
  }

  public fbForm: FormGroup = this.fb.group({
    Descripcion_TipoSuspension: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
    aux: ['']
  })

  ngOnInit(): void {
    this.namesCrud = {
      singular: 'tipo de suspensión',
      plural: 'tipo de suspensión',
      articulo_singular: 'el tipo de suspensión',
      articulo_plural: 'los tipos de suspensiones',
      genero: 'masculino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.suspensionesService.stateForm = status as StateValidatorForm }))
    this.subscription.add(
      this.suspensionesService.formUpdate$.subscribe( form => {
        if (form && form.mode) {
          if (form.data) {
            this.suspension = {};
            this.suspension = form.data;
          }
          switch (form.mode) {
            case 'create': this.createForm(form.resolve! , form.reject!); break;
            case 'show': this.showForm(form.resolve! , form.reject!); break;
            case 'edit': this.editForm(form.resolve! , form.reject!); break;
            case 'insert': this.insertForm(form.resolve!, form.reject!); break;
            case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createForm(resolve: Function, reject: Function){
    try {
      this.resetForm();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  async showForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.suspension});
      this.fbForm.get('Descripcion_TipoSuspension')?.disable();
      this.showAsterisk = false;
      resolve(true)
    } catch (e) {      
      reject(e)
    }
  }

  async editForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.suspension});
      this.fbForm.patchValue({aux: this.suspension});
      this.fbForm.get('Descripcion_TipoSuspension')?.enable();
      this.showAsterisk = true;
      resolve(true)
    } catch (e) {      
      reject(e)
    }
  }

  async insertForm(resolve: Function, reject: Function){
    try {
      let params = {...this.fbForm.value};
      
      const inserted: DataInserted = await this.suspensionesService.insertSuspension(params);
      
      if (inserted.dataWasInserted) {
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted, 'creado', true,false);
        resolve({success:true , dataInserted: inserted.dataInserted , messageGp})
        this.resetForm()
      }

    } catch (e) {
      reject(e)
      this.resetForm()
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {
        ...this.fbForm.value,
        ID_TipoSuspension: this.suspension.ID_TipoSuspension,
        aux: this.fbForm.get('aux')!.value
      };
      
      const updated: DataUpdated = await this.suspensionesService.updateSuspension(params);
      
      if (updated.dataWasUpdated) {
        const messageGp = generateMessage(this.namesCrud, updated.dataUpdated, 'actualizado', true,false);
        resolve({success:true , dataInserted: updated.dataUpdated , messageGp})
        this.resetForm()
      }

    } catch (e) {
      reject(e)
      this.resetForm()
    }
  }

  resetForm(){
    this.fbForm.reset({
      Descripcion_TipoSuspension: '',
    });
    this.fbForm.get('Descripcion_TipoSuspension')!.enable();
    this.showAsterisk = false;
  }

}
