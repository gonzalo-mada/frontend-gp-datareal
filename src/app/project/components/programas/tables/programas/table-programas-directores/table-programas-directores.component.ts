import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Director } from 'src/app/project/models/programas/Director';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';

@Component({
  selector: 'app-table-programas-directores',
  templateUrl: './table-programas-directores.component.html',
  styles: [
  ]
})
export class TableProgramasDirectoresComponent implements OnChanges {

  constructor(private form: FormProgramaService, private messageService: MessageServiceGP){}

  @Input() data: any[] = []
  @Input() type!: 'director' | 'alterno';
  @Input() mode: string = '';
  @Input() isAnySelected: boolean = false;
  isSelected: boolean = false; 

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data']) this.isSelected = false;
  }

  changeSelectDirector(modeSelect:'select' | 'unselect', data: Director){
    let nombreCompleto = data.Nombres!.trim() + ' ' + data.Paterno!.trim() + ' ' + data.Materno!.trim();
    this.messageService.clear();
    switch (modeSelect) {
      case 'select':
        this.isAnySelected = true
        data.isSelected = true;
        this.form.setSelectDirector(this.type, nombreCompleto, data.rutcompleto!)
        this.messageService.add({
          key: 'main',
          severity: 'info',
          detail: this.type === 'director' 
          ? `Director(a): "${nombreCompleto}" seleccionado(a)` 
          : `Director(a) alterno(a): "${nombreCompleto}" seleccionado(a)`
        });
      break;

      case 'unselect':
        this.isAnySelected = false;
        data.isSelected = false;
        this.form.unsetSelectDirector(this.type)
        this.messageService.add({
          key: 'main',
          severity: 'info',
          detail: this.type === 'director' 
          ? `Director(a): "${nombreCompleto}" deseleccionado(a)` 
          : `Director(a) alterno(a): "${nombreCompleto}" deseleccionado(a)`
        });
      break;
    
    }

  }

}
