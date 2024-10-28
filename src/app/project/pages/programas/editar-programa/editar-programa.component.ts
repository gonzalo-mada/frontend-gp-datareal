import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Programa } from 'src/app/project/models/programas/Programa';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-editar-programa',
  templateUrl: './editar-programa.component.html',
  styles: [
  ]
})
export class EditarProgramaComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
  ){}

  cod_programa: number = 0;
  mode: string = 'edit';

  async ngOnInit() {
    this.activatedRoute.params.subscribe( ({cod_programa}) => this.cod_programa = parseInt(cod_programa))
  }

}
