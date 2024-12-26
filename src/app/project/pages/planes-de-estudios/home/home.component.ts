import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { PlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/main.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

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
    public main: PlanDeEstudioMainService
  ){}

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    await this.mainFacultad.getFacultades(false);
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.main.setModeCrud('create') 
      : this.main.setModeCrud('delete-selected')
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
  }

  changeFacultad(event: any){
    this.main.cod_facultad_selected = event.value;
    this.main.getProgramasPorFacultad();
  }

  async changeProgramaPostgrado(event:any){
    this.main.cod_programa_postgrado_selected = event.value;
    await this.main.getPlanesDeEstudiosMergedPorPrograma();
  }

}
