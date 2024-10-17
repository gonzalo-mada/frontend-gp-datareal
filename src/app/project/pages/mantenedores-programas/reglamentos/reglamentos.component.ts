import { Component, OnDestroy, OnInit } from '@angular/core';
import { Reglamento } from '../../../models/programas/Reglamento';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ReglamentosService } from '../../../services/programas/reglamentos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-reglamentos',
  templateUrl: './reglamentos.component.html',
  styles: [
  ]
})

export class ReglamentosComponent implements OnInit, OnDestroy {

  constructor(
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    public reglamentosService: ReglamentosService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  reglamentos: Reglamento[] = [];
  reglamento: Reglamento = {};
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.reglamentosService.modeForm;
  }
   
  async ngOnInit() {
    this.namesCrud = {
      singular: 'reglamento',
      plural: 'reglamentos',
      articulo_singular: 'el reglamento',
      articulo_plural: 'los reglamentos',
      genero: 'masculino'
    };

    this.keyPopups = 'reglamentos'

    await this.getReglamentos();
    
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getReglamentos()));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    this.subscription.add(
      this.reglamentosService.crudUpdate$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.reglamento = {};
            this.reglamento = crud.data
          }
            switch (crud.mode) {
              case 'show': this.showForm(); break; 
              case 'edit': this.editForm(); break;
              case 'insert': this.insertReglamento(); break;
              case 'update': this.updateReglamento(); break;
              case 'delete': this.openConfirmationDelete(crud.data); break;
          }
        }
      })
    );
    
    this.menuButtonsTableService.setContext('reglamentos', 'dialog');
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reset();
  }

  async getReglamentos(){
    try {
      this.reglamentos = <Reglamento[]> await this.reglamentosService.getReglamentos();
      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertReglamento(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.reglamentosService.setModeForm('insert',null, resolve, reject);
      })
      if (actionForm.success) {
        //insert exitoso
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
      }else{
        throw actionForm;
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
        });
    }finally{
      this.getReglamentos();
      this.dialog = true
      this.reset();
    }
  }

  async updateReglamento() {
    try {
      const actionForm: any = await new Promise<void>((resolve, reject) => {
        this.reglamentosService.setModeForm('update', this.reglamento, resolve, reject);
      });
  
      if (actionForm.success) {
        // Si la actualización fue exitosa, recargamos la lista de reglamentos
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
      }else{
        throw actionForm;
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
      this.getReglamentos();
      this.dialog = true
      this.reset();
    }
  }

  async deleteReglamentos(dataToDelete: Reglamento[]){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.reglamentosService.deleteReglamento(dataToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_regla')
      if ( deleted.dataWasDeleted ) {
        this.getReglamentos();
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
      this.dialog = true;
      await new Promise((resolve,reject) => {
        this.reglamentosService.setModeForm('create', null, resolve, reject);
      })
    } catch (e:any ) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al crear formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }

  }

  async showForm(){
    try {
      this.reset();
      this.dialog = true;
      const data = this.reglamento;
      await new Promise((resolve,reject) => {
        this.reglamentosService.setModeForm('show', data, resolve, reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al visualizar formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  async editForm(){
    try {
      this.reset();
      this.dialog = true;
      const data = this.reglamento;
      await new Promise((resolve,reject) => {
        this.reglamentosService.setModeForm('edit', data, resolve, reject);
      })
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
  }

  async openConfirmationDeleteSelected(data: any){
    const message = mergeNames(this.namesCrud,data,true,'Descripcion_regla'); 
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
          await this.deleteReglamentos(data);
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
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${data.Descripcion_regla}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let reglamentoToDelete = []
          reglamentoToDelete.push(data);
          try {
            await this.deleteReglamentos(reglamentoToDelete);
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
        await this.insertReglamento()
      }else{
        //modo edit
        await this.updateReglamento();
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