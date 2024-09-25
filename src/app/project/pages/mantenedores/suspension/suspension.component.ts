import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Suspension } from 'src/app/project/models/Suspension';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { SuspensionesService } from 'src/app/project/services/suspensiones.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-suspension',
  templateUrl: './suspension.component.html',
  styles: [
  ]
})
export class SuspensionComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    public suspensionesService: SuspensionesService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  suspensiones: Suspension[] = [];
  suspension: Suspension = {};
  namesCrud!: NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;
  private subscription: Subscription = new Subscription();

  get modeForm(){
    return this.suspensionesService.modeForm
  }

  async ngOnInit() {
    this.namesCrud = {
      singular: 'tipo de suspensión',
      plural: 'tipos de suspensiones',
      articulo_singular: 'el tipo de suspensión',
      articulo_plural: 'los tipos de suspensiones',
      genero: 'masculino'
    };

    this.keyPopups = 'ID_TipoSuspension';

    await this.getSuspensiones();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe( () => this.getSuspensiones() ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))

    this.subscription.add(
      this.suspensionesService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.suspension = {};
            this.suspension = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertSuspension(); break;
            case 'update': this.updateSuspension(); break;
            case 'delete': this.openConfirmationDelete(this.suspension); break;

          }
        }
      })
    );
    this.menuButtonsTableService.setContext('suspension','dialog');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.reset();
  }

  async getSuspensiones(){
    try {
      this.suspensiones = <Suspension[]> await this.suspensionesService.getSuspensiones();      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertSuspension(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.suspensionesService.setModeForm('insert',null,resolve,reject)
      })
      
      if (actionForm.success) {
        //insert exitoso
        this.getSuspensiones();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
        this.reset();
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message,
        });
    }finally{
      this.dialog = true
    }
  }

  async updateSuspension(){
    try {
      const data = this.suspension;
      const actionForm: any = await new Promise((resolve, reject) => {
        this.suspensionesService.setModeForm('update',data,resolve,reject)
      })
      if (actionForm.success) {
        this.getSuspensiones();
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
          summary: `Error al actualizar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.dialog = true
    }
  }

  async deleteSuspension(dataToDelete: Suspension[]){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.suspensionesService.deleteSuspension({suspensionToDelete: dataToDelete});
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_TipoSuspension')
      if ( deleted.dataWasDeleted ) {
        this.getSuspensiones();
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
          message: e.detail.error.message.message,
      });
    }
  }

  async createForm(){
    try {
      this.reset();
      await new Promise((resolve,reject) => {
        this.suspensionesService.setModeForm('create',null,resolve,reject)
      })
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al crear formulario de ${this.namesCrud.singular}`,
          message: e.error,
        }
      );
    }finally{
      this.dialog = true;
    }
  }

  async showForm(){
    try {
      const data = this.suspension;
      await new Promise((resolve, reject) => {
        this.suspensionesService.setModeForm('show',data,resolve,reject);
      })
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al mostrar formulario de ${this.namesCrud.singular}`,
          message: e.error,
        }
      );
    }
    finally{
      this.dialog = true;
    }
  }

  async editForm(){
    try {
      const data = this.suspension;
      await new Promise((resolve, reject) => {
        this.suspensionesService.setModeForm('edit',data,resolve,reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al editar formulario de ${this.namesCrud.singular}`,
          message: e.error,
        }
      );
    }finally{
      this.dialog = true;
    }
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setAction('reset')
  }

  async openConfirmationDeleteSelected(data: any){
    const message = mergeNames(this.namesCrud,data,true,'Descripcion_TipoSuspension')
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
          await this.deleteSuspension(data);
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
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${data.Descripcion_TipoSuspension}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let dataToDelete = []
          dataToDelete.push(data);
          try {
            await this.deleteSuspension(dataToDelete);
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

  async submit() {
    try {
      if ( this.modeForm == 'create' ) {
        //modo creacion
        await this.insertSuspension()
      }else{
        //modo edit
        await this.updateSuspension();
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
