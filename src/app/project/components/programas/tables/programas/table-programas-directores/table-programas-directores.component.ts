import { Component, Input } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-table-programas-directores',
  templateUrl: './table-programas-directores.component.html',
  styles: [
  ]
})
export class TableProgramasDirectoresComponent  {

  constructor(private programasService: ProgramasService, private messageService: MessageService){}

  @Input() data: any[] = []
  @Input() mode!: 'director' | 'alterno';
  isSelected: boolean = false; 

  changeSelectDirector(modeSelect:'select' | 'unselect', rut: string, nombres: string, paterno: string, materno: string){
    let nombreCompleto = nombres.trim() + ' ' + paterno.trim() + ' ' + materno.trim();
    this.messageService.clear();
    switch (modeSelect) {
      case 'select':
        this.isSelected = true;
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: this.mode === 'director' 
          ? `Director(a): "${nombreCompleto}" seleccionado(a)` 
          : `Director(a) alterno(a): "${nombreCompleto}" seleccionado(a)`
        });
        this.programasService.setSelectDirector(this.mode, nombreCompleto, rut)
      break;

      case 'unselect':
        this.isSelected = false;
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: this.mode === 'director' 
          ? `Director(a): "${nombreCompleto}" deseleccionado(a)` 
          : `Director(a) alterno(a): "${nombreCompleto}" deseleccionado(a)`
        });
        this.programasService.unsetSelectDirector(this.mode)
      break;
    
    }

  }

}
