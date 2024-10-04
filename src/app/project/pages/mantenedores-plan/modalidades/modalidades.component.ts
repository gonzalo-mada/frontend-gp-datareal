import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
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
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    public modalidadesService: ModalidadesService
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

    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getModalidades()));
    this.subscription.add(
      this.modalidadesService.crudUpdate$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.modalidad = {};
            this.modalidad = crud.data
          }
            switch (crud.mode) {
              // case 'show': this.showForm(); break; 
              // case 'edit': this.editForm(); break;
              case 'insert': this.insertModalidad(); break;
              // case 'update': this.updateReglamento(); break;
              // case 'delete': this.openConfirmationDelete(crud.data); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('modalidad', 'dialog');

  }

  ngOnDestroy(){
    this.subscription.unsubscribe();
    this.reset();
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

  async insertModalidad(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.modalidadesService.setModeForm('insert',null, resolve, reject);
      })
      if (actionForm.success) {
        //insert exitoso
        this.insertModalidad();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
        this.reset();
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
        });
    }finally{
      this.dialog = true
    }
  }

  async createForm(){
    try {
      this.reset();
      await new Promise((resolve,reject) => {
        this.modalidadesService.setModeForm('create', null, resolve, reject);
      })
    } catch (e:any ) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al crear formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }finally{
      this.dialog = true;
    }
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
  }

  async submit() {
    try {
      
      if ( this.modeForm == 'create' ) {
        //modo creacion
        await this.insertModalidad()
      }else{
        //modo edit
        //await this.updateJornada();
      }
    } catch (e:any) {
      const action = this.modeForm === 'create' ? 'guardar' : 'actualizar';
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al ${action} ${this.namesCrud.singular}`,
          message: e.message,
      });
      } finally {
        this.dialog = false;
      }
    }
}
