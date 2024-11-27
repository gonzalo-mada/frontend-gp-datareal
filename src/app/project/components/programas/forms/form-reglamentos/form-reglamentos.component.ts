import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormReglamentosService } from 'src/app/project/services/programas/reglamentos/form.service';
import { ReglamentosMainService } from 'src/app/project/services/programas/reglamentos/main.service';

@Component({
  selector: 'app-form-reglamentos',
  templateUrl: './form-reglamentos.component.html',
  styles: []
})
export class FormReglamentosComponent implements OnInit, OnDestroy {
  constructor(    
    public form: FormReglamentosService,
    public main: ReglamentosMainService
  ){}

  maxDate!: Date;
  private subscription: Subscription = new Subscription();


  ngOnInit(): void {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm}));
    const currentYear = new Date().getFullYear();
    this.maxDate = new Date(currentYear, 11, 31);
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

  async submitReglamento(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }

}