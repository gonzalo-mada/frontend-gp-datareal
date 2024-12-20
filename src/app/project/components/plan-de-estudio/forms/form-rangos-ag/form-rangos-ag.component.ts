import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormRangosAGService } from 'src/app/project/services/plan-de-estudio/rangosAprobacion/form.service';
import { RangosAGMainService } from 'src/app/project/services/plan-de-estudio/rangosAprobacion/main.service';

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
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update');
  }
}
