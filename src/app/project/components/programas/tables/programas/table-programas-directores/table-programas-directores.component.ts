import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { MessageService } from 'primeng/api';
import { Director } from 'src/app/project/models/programas/Director';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-table-programas-directores',
  templateUrl: './table-programas-directores.component.html',
  styles: [
  ]
})
export class TableProgramasDirectoresComponent implements OnChanges {

  constructor(private programasService: ProgramasService, private messageService: MessageService){}

  @Input() data: any[] = []
  @Input() mode!: 'director' | 'alterno';
  @Input() isAnySelected: boolean = false;
  isSelected: boolean = false; 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']){
      this.isSelected = false;
    }
  }

  changeSelectDirector(modeSelect:'select' | 'unselect', data: Director){
    let nombreCompleto = data.Nombres!.trim() + ' ' + data.Paterno!.trim() + ' ' + data.Materno!.trim();
    this.messageService.clear();
    switch (modeSelect) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.programasService.setSelectDirector(this.mode, nombreCompleto, data.rutcompleto!)
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: this.mode === 'director' 
          ? `Director(a): "${nombreCompleto}" seleccionado(a)` 
          : `Director(a) alterno(a): "${nombreCompleto}" seleccionado(a)`
        });
      break;

      case 'unselect':
        this.isAnySelected = false;
        data.isSelected = false;
        this.programasService.unsetSelectDirector(this.mode)
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: this.mode === 'director' 
          ? `Director(a): "${nombreCompleto}" deseleccionado(a)` 
          : `Director(a) alterno(a): "${nombreCompleto}" deseleccionado(a)`
        });
      break;
    
    }

  }

}
