import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormRegimenService } from 'src/app/project/services/plan-de-estudio/regimen/form.service';
import { RegimenMainService } from 'src/app/project/services/plan-de-estudio/regimen/main.service';

@Component({
  selector: 'app-form-regimenes',
  templateUrl: './form-regimenes.component.html',
  styles: []
})
export class FormRegimenesComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormRegimenService,
    public main: RegimenMainService
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
