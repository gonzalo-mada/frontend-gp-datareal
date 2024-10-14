import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';
import { JornadaService } from 'src/app/project/services/plan-de-estudio/jornada.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-jornada',
  templateUrl: './jornada.component.html',
  styles: [
  ]
})
export class JornadaComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    public jornadaService: JornadaService
  ){}

  jornadas: Jornada[] = [];
  jornada: Jornada = {};
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.jornadaService.modeForm
  }

  set modeForm(_val){
    this.jornadaService.modeForm = _val;
  }

  async ngOnInit() {
    this.namesCrud = {
      singular: 'jornada',
      plural: 'jornadas',
      articulo_singular: 'la jornada',
      articulo_plural: 'las jornadas',
      genero: 'femenino'
    };
    this.keyPopups = 'jornadas'
    await this.getJornadas();

    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getJornadas()));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    this.subscription.add(
      this.jornadaService.crudUpdate$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.jornada = {};
            this.jornada = crud.data
          }
            switch (crud.mode) {
              case 'show': this.showForm(); break; 
              case 'edit': this.editForm(); break;
              case 'insert': this.insertJornada(); break;
              case 'update': this.updateJornada(); break;
              case 'delete': this.openConfirmationDelete(crud.data); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('jornada', 'dialog');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reset();
  }

  
  async getJornadas(){
    try {
      this.jornadas = <Jornada[]> await this.jornadaService.getJornadas();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertJornada(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.jornadaService.setModeForm('insert',null, resolve, reject);
      })
      if (actionForm.success) {
        //insert exitoso
        this.getJornadas();
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

  async updateJornada() {
    try {
      const actionForm: any = await new Promise<void>((resolve, reject) => {
        this.jornadaService.setModeForm('update', this.jornada, resolve, reject);
      });
  
      if (actionForm.success) {
        // Si la actualización fue exitosa, recargamos la lista de reglamentos
        this.getJornadas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
        this.reset();  // Reseteamos el formulario y el estado
      }
    } catch (e: any) {
      // Manejo de errores en la promesa
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.dialog = true
    }
  }

  async deleteJornada(dataToDelete: Jornada[]){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.jornadaService.deleteJornada(dataToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_jornada')
      if ( deleted.dataWasDeleted ) {
        this.getJornadas();
        if ( dataToDelete.length > 1 ){
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,message,'eliminado',true, false)
          });
        }
        this.reset();
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
      });
    }
  }


  async createForm(){
    try {
      this.reset();
      await new Promise((resolve,reject) => {
        this.jornadaService.setModeForm('create', null, resolve, reject);
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

  async showForm(){
    try {
      this.reset();
      const data = this.jornada;
      await new Promise((resolve,reject) => {
        this.jornadaService.setModeForm('show', data, resolve, reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al visualizar formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }finally{
      this.dialog = true;
    }
  }

  async editForm(){
    try {
      this.reset();
      const data = this.jornada;
      await new Promise((resolve,reject) => {
        this.jornadaService.setModeForm('edit', data, resolve, reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar formulario de ${this.namesCrud.articulo_singular}`,
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
        await this.insertJornada()
      }else{
        //modo edit
        await this.updateJornada();
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

    async openConfirmationDeleteSelected(data: any){
      const message = mergeNames(this.namesCrud,data,true,'Descripcion_jornada'); 
      this.confirmationService.confirm({
        header: "Confirmar",
        message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: 'pi pi-exclamation-triangle',
        key: this.keyPopups,
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
        accept: async () => {
          try {
            await this.deleteJornada(data);
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${this.namesCrud.singular}`,
                message: e.message,
            });
          }
        }
      })
    }
  
    async openConfirmationDelete(data: any){
      this.confirmationService.confirm({
        header: 'Confirmar',
        message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${data.Descripcion_jornada}</b>. ¿Desea confirmar?`,
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: 'pi pi-exclamation-triangle',
        key: this.keyPopups,
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
        accept: async () => {
            let jornadaToDelete = []
            jornadaToDelete.push(data);
            try {
              await this.deleteJornada(jornadaToDelete);
            } catch (e:any) {
              this.errorTemplateHandler.processError(
                e, {
                  notifyMethod: 'alert',
                  summary: `Error al eliminar ${this.namesCrud.singular}`,
                  message: e.message,
              });
            }
        }
      })
    }

}
