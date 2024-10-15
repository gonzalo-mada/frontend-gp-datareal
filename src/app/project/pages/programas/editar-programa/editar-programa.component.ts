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
  constructor(private activatedRoute: ActivatedRoute,
    private programasService: ProgramasService
  ){}

  programa: Programa = {};

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({cod_programa}) => console.log("cod_programa:",cod_programa))

  }

}
