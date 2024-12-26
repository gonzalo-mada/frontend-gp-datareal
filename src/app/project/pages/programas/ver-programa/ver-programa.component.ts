import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { ProgramaMainService } from 'src/app/project/services/programas/programas/main.service';

@Component({
  selector: 'app-ver-programa',
  templateUrl: './ver-programa.component.html',
  styles: [
  ]
})
export class VerProgramaComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private programaMainService: ProgramaMainService,
  ){}

  async ngOnInit() {
    this.activatedRoute.params.subscribe( ({cod_programa}) => this.programaMainService.cod_programa = parseInt(cod_programa))
    this.programaMainService.mode = 'show';
  }

}
