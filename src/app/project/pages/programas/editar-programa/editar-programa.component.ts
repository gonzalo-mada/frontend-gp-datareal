import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProgramaMainService } from 'src/app/project/services/programas/programas/main.service';

@Component({
  selector: 'app-editar-programa',
  templateUrl: './editar-programa.component.html',
  styles: [
  ]
})
export class EditarProgramaComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private programaMainService: ProgramaMainService,
  ){}

  async ngOnInit() {
    this.activatedRoute.params.subscribe( ({cod_programa}) => this.programaMainService.cod_programa = parseInt(cod_programa))
    this.programaMainService.mode = 'edit';
  }

}
