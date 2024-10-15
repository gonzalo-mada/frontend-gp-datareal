import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Programa } from 'src/app/project/models/Programa';

@Component({
  selector: 'app-ver-programa',
  templateUrl: './ver-programa.component.html',
  styles: [
  ]
})
export class VerProgramaComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
  ){}

  programa: Programa = {};
  cod_programa: number = 0;
  mode: string = 'show';
  showForm: boolean = false;

  async ngOnInit() {
    this.activatedRoute.params.subscribe( ({cod_programa}) => this.cod_programa = parseInt(cod_programa))
  }

}
