import { Component } from '@angular/core';
import { ProgramaMainService } from '../../services/programas/programas/main.service';

@Component({
  selector: 'app-programas',
  templateUrl: './programas.component.html',
  styles: [],
})
export class ProgramasComponent {

  constructor(private main: ProgramaMainService){this.main.reset()}
  
}
