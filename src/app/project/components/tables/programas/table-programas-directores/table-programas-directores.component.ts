import { Component, Input } from '@angular/core';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-table-programas-directores',
  templateUrl: './table-programas-directores.component.html',
  styles: [
  ]
})
export class TableProgramasDirectoresComponent  {

  constructor(private programasService: ProgramasService){}

  @Input() data: any[] = []
  @Input() mode!: 'director' | 'alterno';

  setDirector(rut: string, nombres: string, paterno: string, materno: string){
    const nombreCompleto = nombres + ' ' + paterno.trim() + ' ' + materno.trim();
    this.programasService.setSelectDirector(this.mode, nombreCompleto, rut)


  }


}
