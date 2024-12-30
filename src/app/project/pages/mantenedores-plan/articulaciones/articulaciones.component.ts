import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { ArticulacionesMainService } from 'src/app/project/services/plan-de-estudio/articulaciones/main.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-articulaciones',
  templateUrl: './articulaciones.component.html',
  styles: [
  ]
})
export class ArticulacionesComponent implements OnInit, OnDestroy  {

  private subscription: Subscription = new Subscription();

  constructor(
    public mainFacultad: FacultadesMainService, 
    private menuButtonsTableService: MenuButtonsTableService,
    public main: ArticulacionesMainService,
  ){}

  async ngOnInit() {
    this.main.resetElementsMantenedor();
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.main.setModeCrud('create') 
      : this.main.setModeCrud('delete-selected')
    }));
    await this.mainFacultad.getFacultades(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
    this.main.resetElementsMantenedor();
  }

  changeFacultad(event: any){
    this.main.resetWhenChangedDropdownFacultadNotForm();
    this.main.cod_facultad_selected_notform = event.value;
    this.main.getProgramasPorFacultadNotForm();
  }

  async changeProgramaPostgrado(event:any){
    this.main.resetWhenChangedDropdownProgramaNotForm();
    this.main.cod_programa_postgrado_selected_notform = event.value;
    await this.main.getPlanesDeEstudiosPorProgramaNotForm();
  }

  async changePlanDeEstudio(event:any){
    this.main.wasFilteredTable = true;
    this.main.cod_plan_estudio_selected_notform = event.value;
    await this.main.getArticulacionesPorPlanDeEstudio(false,false);
  }

}
