import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Programa } from 'src/app/project/models/programas/Programa';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';
import { ProgramaMainService } from 'src/app/project/services/programas/programas/main.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    public mainFacultad: FacultadesMainService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    public programaMainService: ProgramaMainService
  )
  {}

  programas: any[] = [];
  programa: Programa = {};
  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    await this.mainFacultad.getFacultades(false);
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.programaMainService.setModeCrud('create') 
      : this.programaMainService.setModeCrud('delete-selected')
    }));

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
  }

  changeFacultad(event: any){
    this.programaMainService.cod_facultad_selected = event.value;
    this.programaMainService.getProgramasPorFacultad();
  }

}
