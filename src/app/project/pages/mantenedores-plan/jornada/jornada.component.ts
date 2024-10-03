import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Context } from 'src/app/project/models/shared/Context';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';
import { JornadaService } from 'src/app/project/services/plan-de-estudio/jornada.service';

@Component({
  selector: 'app-jornada',
  templateUrl: './jornada.component.html',
  styles: [
  ]
})
export class JornadaComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private jornadasService: JornadaService
  ){}

  jornadas: Jornada[] = [];
  jornada: Jornada = {};
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.jornadasService.modeForm
  }

  set modeForm(_val){
    this.jornadasService.modeForm = _val;
  }

  public fbForm : FormGroup = this.fb.group({
    Descripcion_jornada: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]]
  })

  async ngOnInit() {
    this.namesCrud = {
      singular: 'jornada',
      plural: 'jornadas',
      articulo_singular: 'la jornada',
      articulo_plural: 'la jornadas',
      genero: 'femenino'
    };
    this.keyPopups = 'jornadas'
    await this.getJornadas();
    console.log("Jornadas",this.jornadas);

  }

  ngOnDestroy(): void {

  }
  async getJornadas(){
    try {
      this.jornadas = <Jornada[]> await this.jornadasService.getJornadas();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }
}
