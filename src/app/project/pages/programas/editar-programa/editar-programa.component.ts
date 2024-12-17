import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
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
    public form: FormProgramaService
  ){}
  onClickRefreshPrograma: boolean = false;

  async ngOnInit() {
    this.activatedRoute.params.subscribe( ({cod_programa}) => this.programaMainService.cod_programa = parseInt(cod_programa))
    this.programaMainService.mode = 'edit';
  }

  refreshPrograma(){
    this.onClickRefreshPrograma = true
    setTimeout(() => {
      this.onClickRefreshPrograma = false
    }, 500); 
  }

}
