import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Programa } from 'src/app/project/models/Programa';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-ver-programa',
  templateUrl: './ver-programa.component.html',
  styles: [
  ]
})
export class VerProgramaComponent implements OnInit {

  constructor(
    private activatedRoute: ActivatedRoute,
    private errorTemplateHandler: ErrorTemplateHandler,
    private programasService: ProgramasService
  ){}

  programa: Programa = {};
  cod_programa: number = 0;
  mode: string = 'show';
  showForm: boolean = false;

  async ngOnInit() {
    this.activatedRoute.params.subscribe( ({cod_programa}) => this.cod_programa = parseInt(cod_programa))
    await this.getPrograma();
  }

  async getPrograma(){
    try {
      this.programa = await this.programasService.getPrograma({Cod_Programa: this.cod_programa});
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener el programa. Intente nuevamente.',
      });
    }finally{
      this.showForm = true ;
    }
  }


  

}
