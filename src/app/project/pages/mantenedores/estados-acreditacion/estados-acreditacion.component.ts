import { Component, OnDestroy, OnInit } from '@angular/core';
import { EstadosAcreditacion, ActionUploadDoc } from '../../../models/EstadosAcreditacion';
import { NamesCrud } from '../../../models/shared/NamesCrud';
import { Subscription } from 'rxjs';
import { EstadosAcreditacionService } from '../../../services/estados-acreditacion.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { Context } from 'src/app/project/models/shared/Context';

@Component({
  selector: 'app-estado-acreditacion',
  templateUrl: './estados-acreditacion.component.html',
  styles: [
  ]
})
export class EstadosAcreditacionComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    public estadosAcreditacionService: EstadosAcreditacionService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private commonUtils: CommonUtils,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  estadosAcreditacion: EstadosAcreditacion[] = [];
  estadoAcreditacion: EstadosAcreditacion = {};
  namesCrud!: NamesCrud;
  keyPopups: string = '';
  mode: string = '';
  dialog: boolean = false;
  yearsDifference: number | null = null;

  get modeCrud() {
    return this.estadosAcreditacionService.modeForm;
  }

  private subscription: Subscription = new Subscription();
  
  async ngOnInit() {
    this.namesCrud = {
      singular: 'estado de acreditación',
      plural: 'estados de acreditación',
      articulo_singular: 'el estado de acreditación',
      articulo_plural: 'los estados de acreditación',
      genero: 'masculino'
    };

    this.keyPopups = 'estadoacreditacion'

    await this.getEstadosAcreditacion();

    //ACTION AGREGAR DESDE MANTENEDOR EA
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getEstadosAcreditacion()));
    this.subscription.add(
      this.estadosAcreditacionService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.estadoAcreditacion = {};
            this.estadoAcreditacion = crud.data
          }
            switch (crud.mode) {
              case 'show': this.showForm(); break; 
              case 'edit': this.editForm(); break;
              case 'insert': this.insertEstadoAcreditacion(); break;
              case 'update': this.updateEstadoAcreditacion(); break;
              case 'delete': this.openConfirmationDelete(crud.data); break;
            }
          
        }
    }))
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.reset();
  }

  async getEstadosAcreditacion(){
    try {
      this.estadosAcreditacion = <EstadosAcreditacion[]> await this.estadosAcreditacionService.getEstadosAcreditacion();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertEstadoAcreditacion(){
    try {

      const result: any = await new Promise <void> ((resolve: Function, reject: Function) => {
        this.estadosAcreditacionService.setModeForm('insert',null, resolve, reject);
      })
      
      if (result.success) {
        //insert exitoso
        this.getEstadosAcreditacion();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        this.reset();
      }else{
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e.detail.error.message,
        });
        this.reset();
      }
      
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: 'Hubo un error al insertar. Intente nuevamente.',
      });
    }finally{
      this.dialog = true;
    }
  }

  async updateEstadoAcreditacion(){
    
    try {
      const result: any = await new Promise ((resolve,reject) => {
        this.estadosAcreditacionService.setModeForm('update',null, resolve, reject);
      })

      if (result.success) {
        this.getEstadosAcreditacion();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        this.reset();
      }else{
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e.detail.error.message,
        });
        this.reset();
      }

    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: 'Hubo un error al actualizar. Intente nuevamente.',
      });
    }
  }

  async deleteEstadoAcreditacion(estadosAcreditacionToDelete: EstadosAcreditacion[]){    
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.estadosAcreditacionService.deleteEstadoAcreditacion({estadosAcreditacionToDelete:estadosAcreditacionToDelete});
      // const message = this.parseNombres(deleted.dataDeleted)
      if ( deleted.dataWasDeleted ) {
        this.getEstadosAcreditacion();
        if ( estadosAcreditacionToDelete.length > 1 ){
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud, null, 'eliminados', true, true)
          });
        }else{
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud, null, 'eliminado' , true, false)
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
        this.estadosAcreditacionService.setModeForm('create', null, resolve, reject);
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
      const data = this.estadoAcreditacion;
      await new Promise((resolve,reject) => {
        this.estadosAcreditacionService.setModeForm('show', data, resolve, reject);
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
      const data = this.estadoAcreditacion;
      await new Promise((resolve,reject) => {
        this.estadosAcreditacionService.setModeForm('edit', data, resolve, reject);
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
    this.uploaderFilesService.setAction('reset')
  }

  async openConfirmationDeleteSelected(data: any){
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_plural}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.deleteEstadoAcreditacion(data);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.namesCrud.articulo_plural}`,
              message: e.message,
          });
        }
      }
    })
  }
  
  async openConfirmationDelete(data: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular}. ¿Desea confirmar?`,
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
            await this.deleteEstadoAcreditacion(dataToDelete);
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
      if ( this.modeCrud == 'create' ) {
        //modo insert
        await this.insertEstadoAcreditacion()
      }else{
        //modo update
        await this.updateEstadoAcreditacion();
      }
    } catch (e:any) {
      const action = this.modeCrud === 'create' ? 'guardar' : 'actualizar';
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
