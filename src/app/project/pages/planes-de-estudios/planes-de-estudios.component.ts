import { Component } from '@angular/core';
import { PlanDeEstudioMainService } from '../../services/plan-de-estudio/plan-de-estudio/main.service';

@Component({
  selector: 'app-planes-de-estudios',
  templateUrl: './planes-de-estudios.component.html',
  styles: [
  ]
})
export class PlanesDeEstudiosComponent {
  constructor(private main: PlanDeEstudioMainService){this.main.reset()}
}
