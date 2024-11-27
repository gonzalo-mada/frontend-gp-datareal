import { Component } from '@angular/core';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';

@Component({
  selector: 'app-form-programas-step-one',
  templateUrl: './form-programas-step-one.component.html',
  styles: [
  ]
})

export class FormProgramasStepOneComponent {

  constructor(public form: FormProgramaService){}

  get modeForm() {
    return this.form.modeForm;
  }

}
