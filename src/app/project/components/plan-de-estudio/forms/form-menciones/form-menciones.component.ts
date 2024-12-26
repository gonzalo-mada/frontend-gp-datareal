import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormMencionesService } from 'src/app/project/services/plan-de-estudio/menciones/form.service';
import { MencionesMainService } from 'src/app/project/services/plan-de-estudio/menciones/main.service';

@Component({
  selector: 'app-form-menciones',
  templateUrl: './form-menciones.component.html',
  styles: [
  ]
})
export class FormMencionesComponent implements OnInit, OnDestroy{

  constructor(
    public form: FormMencionesService,
    public main: MencionesMainService
  ){}

  today: Date = new Date(); // Inicialización directa

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm}));
    this.today = new Date();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  test(){
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  async submitMencion(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }

}