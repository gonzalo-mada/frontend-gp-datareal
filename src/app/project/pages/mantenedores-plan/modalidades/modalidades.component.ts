import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';
import { ModalidadesService } from 'src/app/project/services/plan-de-estudio/modalidades.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

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
    this.keyPopups = 'modalidades'
    await this.getModalidades();
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { action==='agregar' ? this.createForm() : this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows())}));

    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getModalidades()));
    this.subscription.add(
      this.modalidadesService.crudUpdate$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.modalidad = {};
            this.modalidad = crud.data
          }
            switch (crud.mode) {
              case 'show': this.showForm(); break; 
              case 'edit': this.editForm(); break;
              case 'insert': this.insertModalidad(); break;
              case 'update': this.updateModalidad(); break;
              case 'delete': this.openConfirmationDelete(crud.data); break;
          }
        }
      })
    );
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
        this.getModalidades();
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

  async updateModalidad() {
    try {
      const actionForm: any = await new Promise<void>((resolve, reject) => {
        this.modalidadesService.setModeForm('update', this.modalidad, resolve, reject);
      });
  
      if (actionForm.success) {
        // Si la actualización fue exitosa, recargamos la lista de reglamentos
        this.getModalidades();
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

  async deleteModalidad(dataToDelete: Modalidad[]){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.modalidadesService.deleteModalidad(dataToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_modalidad')
      if ( deleted.dataWasDeleted ) {
        this.getModalidades();
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


  async showForm(){
    try {
      this.reset();
      const data = this.modalidad;
      await new Promise((resolve,reject) => {
        this.modalidadesService.setModeForm('show', data, resolve, reject);
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
      const data = this.modalidad;
      await new Promise((resolve,reject) => {
        this.modalidadesService.setModeForm('edit', data, resolve, reject);
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
        await this.updateModalidad();
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
      const message = mergeNames(this.namesCrud,data,true,'Descripcion_modalidad'); 
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
            await this.deleteModalidad(data);
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
        message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${data.Descripcion_modalidad}</b>. ¿Desea confirmar?`,
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: 'pi pi-exclamation-triangle',
        key: this.keyPopups,
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
        accept: async () => {
            let modalidadToDelete = []
            modalidadToDelete.push(data);
            try {
              await this.deleteModalidad(modalidadToDelete);
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
