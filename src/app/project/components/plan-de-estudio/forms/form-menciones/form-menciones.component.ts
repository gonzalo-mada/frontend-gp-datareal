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

  actualDate: string = '';
  today: Date = new Date(); // Inicialización directa
  minDate: Date = new Date('1900-01-01');

  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.minDate = new Date();
    this.today = new Date();
    this.actualDate = this.getActualDate();
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm}));
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

  getActualDate(): any {
    const today = new Date();
    const date = String(today.getDate()).padStart(2, '0');      // Día con dos dígitos
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Mes con dos dígitos (Enero es 0)
    const year = String(today.getFullYear());                    // Año con cuatro dígitos

    return {
      date: date,
      month: month,
      year: year
    };
  }

  async submitMencion(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }

}
