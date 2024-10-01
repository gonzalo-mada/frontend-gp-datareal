import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Programa } from 'src/app/project/models/Programa';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-ver-programa',
  templateUrl: './ver-programa.component.html',
  styles: [
  ]
})
export class VerProgramaComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
    private programasService: ProgramasService
  ){}

  programa: Programa = {};

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({cod_programa}) => console.log("cod_programa:",cod_programa))
  }


  

}
