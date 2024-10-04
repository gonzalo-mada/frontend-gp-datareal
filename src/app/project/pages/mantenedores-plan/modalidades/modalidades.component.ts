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
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';
import { ModalidadesService } from 'src/app/project/services/plan-de-estudio/modalidades.service';

@Component({
  selector: 'app-modalidad',
  templateUrl: './modalidades.component.html',
  styles: [
  ]
})
export class ModalidadesComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private modalidadesService: ModalidadesService
  ){}

  modalidades: Modalidad[] = [];
  modalidad: Modalidad = {};
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.modalidadesService.modeForm
  }

  set modeForm(_val){
    this.modalidadesService.modeForm = _val;
  }

  public fbForm : FormGroup = this.fb.group({
    Descripcion_modalidad: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]]
  })

  async ngOnInit(){
    this.namesCrud = {
      singular: 'modalidad',
      plural: 'modalidades',
      articulo_singular: 'la modalidad',
      articulo_plural: 'las modalidades',
      genero: 'femenino'
    };
    this.keyPopups = 'jornadas'
    await this.getModalidades();
    console.log("Modalidades",this.modalidades);

  }

  ngOnDestroy(){

  }

  async getModalidades(){
    try {
      this.modalidades = <Modalidad[]> await this.modalidadesService.getModalidades();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }
}
