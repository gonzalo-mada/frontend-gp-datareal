import { Component } from '@angular/core';
import { AsignaturasMainService } from '../../services/asignaturas/asignaturas/main.service';

@Component({
  selector: 'app-asignaturas',
  templateUrl: './asignaturas.component.html',
  styles: [
  ]
})
export class AsignaturasComponent {
  constructor(private main: AsignaturasMainService){this.main.resetDropdownsFilterTable()}
}
