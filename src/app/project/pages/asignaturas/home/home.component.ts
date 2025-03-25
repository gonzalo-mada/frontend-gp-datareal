import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

	private subscription: Subscription = new Subscription();

	constructor(
		public mainFacultad: FacultadesMainService,
		private menuButtonsTableService: MenuButtonsTableService,
		private tableCrudService: TableCrudService,
		public main: AsignaturasMainService
	){
		this.main.setOrigen('asignaturas');
	}

	ngOnInit(): void {
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
			switch (action) {
				case 'agregar': this.main.setModeCrud('create');break;
				case 'eliminar': this.main.setModeCrud('delete-selected');break;
				case 'historial': this.main.setModeCrud('historial');break;
			} 
		}));
	}
	
	ngOnDestroy(): void {
		this.subscription.unsubscribe();
		this.tableCrudService.resetSelectedRows();
	}

	changeFacultad(event: any){
		this.main.resetWhenChangedDropdownFacultad();
		this.main.cod_facultad_selected = event.value;
		this.main.getProgramasPorFacultad();
	}

	changePrograma(event: any){
		this.main.resetWhenChangedDropdownPrograma();
		this.main.cod_programa_selected = event.value;
		this.main.getPlanesDeEstudiosPorPrograma();
	}

	async changePlanDeEstudio(event: any){
		this.main.cod_planestudio_selected = event.value;
		await this.main.getAsignaturasMergedPorPlanDeEstudio();
	}


}
