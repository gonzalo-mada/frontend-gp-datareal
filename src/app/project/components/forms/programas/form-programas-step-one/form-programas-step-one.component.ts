import { Component } from '@angular/core';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-form-programas-step-one',
  templateUrl: './form-programas-step-one.component.html',
  styles: [
  ]
})

export class FormProgramasStepOneComponent {

  constructor(public programasService: ProgramasService){}

  get modeForm() {
    return this.programasService.modeForm;
  }

}
