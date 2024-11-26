import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormEstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion/form.service';
import { EstadosAcreditacionMainService } from 'src/app/project/services/programas/estados-acreditacion/main.service';

@Component({
  selector: 'app-form-estados-acreditacion',
  templateUrl: './form-estados-acreditacion.component.html',
  styles: []
})
export class FormEstadosAcreditacionComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormEstadosAcreditacionService,
    public main: EstadosAcreditacionMainService,
  ){}
    
  ngOnInit() {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe( status => { this.form.stateForm = status as StateValidatorForm}));
    this.subscription.add(this.form.fbForm.get('tiempo.Fecha_inicio')?.valueChanges.subscribe(() => this.main.calculateYearsDifference()));
    this.subscription.add(this.form.fbForm.get('tiempo.Fecha_termino')?.valueChanges.subscribe(() => this.main.calculateYearsDifference()));
    this.subscription.add(this.form.fbForm.get('Acreditado')?.valueChanges.subscribe(status => {
      if (status === false && ( this.main.modeForm === 'create' || this.main.modeForm === 'edit' )) {
        this.main.disabledButtonSeleccionar() 
      }else{
        this.main.enabledButtonSeleccionar() 
      }
    }))
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.enabledButtonSeleccionar();
  }

  test(){
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  async submit(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

  onClose(){
    this.main.enabledButtonSeleccionar();
  }

}
