import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';

@Component({
  selector: 'app-ver-asignatura',
  templateUrl: './ver-asignatura.component.html',
  styles: [
  ]
})
export class VerAsignaturaComponent {
	constructor(
		private activatedRoute: ActivatedRoute,
		private main: AsignaturasMainService
	){
		this.main.mode = 'show';
		this.activatedRoute.params.subscribe( ({cod_asignatura}) => {
			this.main.cod_asignatura = cod_asignatura;
		});
	}
}
