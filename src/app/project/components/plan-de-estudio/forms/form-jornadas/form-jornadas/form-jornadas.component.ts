import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { JornadaService } from 'src/app/project/services/plan-de-estudio/jornada.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';

@Component({
  selector: 'app-form-jornadas',
  templateUrl: './form-jornadas.component.html',
  styles: [
  ]
})

export class FormJornadasComponent implements OnInit, OnDestroy{
  constructor(
    private fb: FormBuilder,
    private jornadaService: JornadaService,
  ){}

  jornada: Jornada = {}
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.jornadaService.modeForm;
  }

  public fbForm: FormGroup = this.fb.group({
    Descripcion_jornada: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
  });

  ngOnInit(): void {
    this.namesCrud = {
      singular: 'jornada',
      plural: 'jornadas',
      articulo_singular: 'la jornada',
      articulo_plural: 'las jornadas',
      genero: 'femenino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.jornadaService.stateForm = status as StateValidatorForm;}));
    this.subscription.add(
      this.jornadaService.formUpdate$.subscribe( form => {
        if (form && form.mode){
          if (form.data) {
            this.jornada = {};
            this.jornada = form.data;
          }
          switch (form.mode) {
            case 'create': this.createForm(form.resolve! , form.reject!); break;
            // case 'show': this.showForm(form.resolve! , form.reject!); break;
            // case 'edit': this.editForm(form.resolve! , form.reject!); break;
            case 'insert': this.insertForm(form.resolve! , form.resolve!); break;
            // case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          
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
    } catch (e) {
      reject(e)
      this.resetForm()
    }
  }

  createForm(resolve: Function, reject: Function){
    try {
      this.resetForm();
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
