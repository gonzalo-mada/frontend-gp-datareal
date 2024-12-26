import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormRangosAGService } from 'src/app/project/services/plan-de-estudio/rangos-ag/form.service';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangos-ag/main.service';

@Component({
  selector: 'app-form-rangos-ag',
  templateUrl: './form-rangos-ag.component.html',
  styles: [
  ]
})
export class FormRangosAgComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormRangosAGService,
    public main: RangosAGMainService
  ) {}
  
  async ngOnInit() {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { 
      this.form.stateForm = status as StateValidatorForm;
    })
  );

 // Suscripción a los cambios en los valores de NotaMinima y NotaMaxima
 this.subscription.add(
  this.form.fbForm.valueChanges.subscribe((values) => {
    const notaMinima = this.form.fbForm.get('NotaMinima')?.value;
    const notaMaxima = this.form.fbForm.get('NotaMaxima')?.value;

    // Validación personalizada: NotaMinima debe ser menor que NotaMaxima
    if (notaMinima != null && notaMaxima != null) {
      if (notaMinima >= notaMaxima) {
        this.form.fbForm.controls['NotaMinima'].setErrors({
          invalidRange: true,
        });
        this.form.fbForm.controls['NotaMaxima'].setErrors({
          invalidRange: true,
        });
      } else {
        // Elimina el error si la validación es correcta
        this.form.fbForm.controls['NotaMinima'].setErrors(null);
        this.form.fbForm.controls['NotaMaxima'].setErrors(null);
        }
      }
    })
  );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async submit() {
    console.log(this.form.fbForm);
    
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }
}