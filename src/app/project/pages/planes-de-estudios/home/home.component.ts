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
  ){
		this.main.setOrigen('planDeEstudio');
  }

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
			switch (action) {
				case 'agregar': this.main.setModeCrud('create');break;
				case 'eliminar': this.main.setModeCrud('delete-selected');break;
				case 'historial': this.main.setModeCrud('historial');break;
			} 
		}));
    this.main.cod_programa_postgrado_selected !== 0 ? this.main.getPlanesDeEstudiosMergedPorPrograma() : this.main.resetDropdownsFilterTable();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
    // this.main.reset();
  }

  changeFacultad(event: any){
    this.main.resetWhenChangedDropdownFacultad();
    this.main.cod_facultad_selected = event.value;
    this.main.getProgramasPorFacultad();
  }

  async changeProgramaPostgrado(event:any){
    this.main.cod_programa_postgrado_selected = event.value;
    await this.main.getPlanesDeEstudiosMergedPorPrograma();
  }

}
