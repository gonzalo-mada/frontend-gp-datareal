import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { PlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/main.service';

@Component({
  selector: 'app-editar-plan-de-estudio',
  templateUrl: './editar-plan-de-estudio.component.html',
  styles: [
  ]
})
export class EditarPlanDeEstudioComponent  {
	constructor(
		private activatedRoute: ActivatedRoute,
		private main: PlanDeEstudioMainService
	){
		this.main.mode = 'edit';
		this.activatedRoute.params.subscribe( ({cod_planDeEstudio}) => this.main.cod_plan_estudio = parseInt(cod_planDeEstudio));
	}

	// async ngOnInit() {
	// 	this.main.mode = 'edit';
	// 	this.activatedRoute.params.subscribe( ({cod_planDeEstudio}) => this.main.cod_planDeEstudio = parseInt(cod_planDeEstudio));
	// }
}
