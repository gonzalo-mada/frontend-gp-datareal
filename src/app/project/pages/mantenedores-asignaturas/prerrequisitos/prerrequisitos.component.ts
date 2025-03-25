import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { PrerrequisitosMainService } from 'src/app/project/services/asignaturas/prerrequisitos/main.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { FacultadesMainService } from 'src/app/project/services/programas/facultad/main.service';

@Component({
  selector: 'app-prerrequisitos',
  templateUrl: './prerrequisitos.component.html',
  styles: [
  ]
})
export class PrerrequisitosComponent implements OnInit, OnDestroy  {

  	private subscription: Subscription = new Subscription();

	constructor(
		private menuButtonsTableService: MenuButtonsTableService,
		public main: PrerrequisitosMainService,
		public mainFacultad: FacultadesMainService
	){}

	async ngOnInit() {
		this.main.resetDropdownsFilterTable();
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
			switch (action) {
				case 'agregar': this.main.setModeCrud('create');break;
				case 'eliminar': this.main.setModeCrud('delete-selected');break;
				case 'historial': this.main.setModeCrud('historial');break;
			} 
		}));
		this.main.setOrigen('prerrequisitos');
		this.main.setNeedUpdateHistorial(true);
	}

	ngOnDestroy(): void {
		this.subscription.unsubscribe();
		this.main.reset();
		this.main.resetDropdownsFilterTable();
		this.main.setNeedUpdateHistorial(false);
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
		this.main.cod_plan_estudio_selected_notform = event.value;
		await this.main.getAsignaturasConPrerrequisitos();
	}

}
