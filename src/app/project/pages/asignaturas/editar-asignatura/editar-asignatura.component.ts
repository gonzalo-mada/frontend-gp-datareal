import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AsignaturasMainService } from 'src/app/project/services/asignaturas/asignaturas/main.service';

@Component({
  selector: 'app-editar-asignatura',
  templateUrl: './editar-asignatura.component.html',
  styles: [
  ]
})
export class EditarAsignaturaComponent {
	constructor(
		private activatedRoute: ActivatedRoute,
		private main: AsignaturasMainService
	){
		this.main.mode = 'edit';
		this.activatedRoute.params.subscribe( ({cod_asignatura}) => {
			this.main.cod_asignatura = cod_asignatura;
		});
	}
}
