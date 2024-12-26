import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { PlanDeEstudioMainService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/main.service';

@Component({
  selector: 'app-ver-plan-de-estudio',
  templateUrl: './ver-plan-de-estudio.component.html',
  styles: [
  ]
})
export class VerPlanDeEstudioComponent {

	constructor(
		private activatedRoute: ActivatedRoute,
		private main: PlanDeEstudioMainService
	){
		this.main.mode = 'show';
		this.activatedRoute.params.subscribe( ({cod_planDeEstudio}) => this.main.cod_plan_estudio = parseInt(cod_planDeEstudio));
	}

	// async ngOnInit() {
	// 	this.activatedRoute.params.subscribe( ({cod_planDeEstudio}) => this.main.cod_planDeEstudio = parseInt(cod_planDeEstudio));
	// 	this.main.mode = 'show';
	// }

}
