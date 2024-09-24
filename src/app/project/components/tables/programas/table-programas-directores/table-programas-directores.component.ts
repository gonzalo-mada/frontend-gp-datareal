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
  @Input() mode: string = '';

  setDirector(rut: string, nombres: string, paterno: string, materno: string){
    if (this.mode === 'director') {
      const nombreCompleto = nombres + ' ' + paterno.trim() + ' ' + materno.trim();   
      this.programasService.programa.update((programa) => ({
        ...programa,
        Director: rut,
        Nombre_Director: nombreCompleto
      }))
      this.programasService.triggerDirectorSelected();
    }else{
      const nombreCompleto = nombres + ' ' + paterno.trim() + ' ' + materno.trim();   
      this.programasService.programa.update((programa) => ({
        ...programa,
        Director_alterno: rut,
        Nombre_Director_alterno: nombreCompleto
      }))
      this.programasService.triggerDirectorAlternoSelected();
    }

  }


}
