import { Component, OnDestroy, OnInit } from '@angular/core';
import { Reglamento } from '../../../models/Reglamento';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ReglamentosService } from '../../../services/reglamentos.service';
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

  constructor(public reglamentosService: ReglamentosService,
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  )
    {
      const currentYear = new Date().getFullYear();
      // Establecer la fecha máxima para el final del año actual
      this.maxDate = new Date(currentYear, 11, 31);
  }

  reglamentos: Reglamento[] = [];
  reglamento: Reglamento = {};
  namesCrud! : NamesCrud;
  globalFiltros : any[] = [];
  selectedRowsService: any[] = [];
  dataKeyTable : string = '';
  keyPopups: string = '';
  dialog: boolean = false;
  statusValidatorForm: boolean = false;
  mode: string = '';
  maxDate: Date;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.reglamentosService.modeForm;
  }
  
  set modeForm(_val){
    this.reglamentosService.modeForm = _val;
  }

  get modeCrud() {
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

    this.globalFiltros = [ 'Descripcion_regla']
    this.dataKeyTable = 'Cod_reglamento';
    this.keyPopups = 'reglamentos'

    await this.getReglamentos();
    
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getReglamentos()));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    this.subscription.add(
      this.reglamentosService.modeCrud$.subscribe(crud => {
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
    
    this.menuButtonsTableService.setContext('reglamento', 'dialog');}
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
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
      const result: any = await new Promise <void> ((resolve: Function, reject: Function) => {
        this.reglamentosService.setModeForm('insert',null, resolve, reject);
      })
      if (result.success) {
        //insert exitoso
        this.getReglamentos();
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
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al guardar ${this.namesCrud.singular}`,
            message: e.detail.error.message.message
          });
      }
  }

  // async insertReglamento() {
  //   console.log("Attempting to insert reglamento:", this.reglamento);
  //   if (!this.reglamento.Descripcion_regla) {
  //     console.error("Description is required.");
  //     return; // O lanza un error
  //   }
  
  //   try {
  //     const result: any = await new Promise<void>((resolve, reject) => {
  //       this.reglamentosService.setModeForm('insert', this.reglamento, resolve, reject);
  //     });
  
  //     if (result.success) {
  //       await this.getReglamentos();
  //       this.messageService.add({
  //         key: this.keyPopups,
  //         severity: 'success',
  //         detail: result.messageGp
  //       });
  //       this.reset();
  //     } else {
  //       throw new Error(result.messageGp);
  //     }
  //   } catch (e: any) {
  //     this.errorTemplateHandler.processError(e, {
  //       notifyMethod: 'alert',
  //       summary: `Error al insertar ${this.namesCrud.singular}`,
  //       message: e?.message || 'Error desconocido',
  //     });
  //   }
  // }
  

  async updateReglamento() {
    try {
      const result: any = await new Promise<void>((resolve: Function, reject: Function) => {
        // Cambiamos el modo CRUD a 'update' y pasamos los datos del reglamento
        this.reglamentosService.setModeForm('update', this.reglamento, resolve, reject);
      });
  
      if (result.success) {
        // Si la actualización fue exitosa, recargamos la lista de reglamentos
        this.getReglamentos();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: result.messageGp
        });
        this.reset();  // Reseteamos el formulario y el estado
      } else {
        // Si hubo algún error durante la actualización
        this.errorTemplateHandler.processError(
          result, {
            notifyMethod: 'alert',
            summary: result.messageGp,
            message: result.e?.detail?.error?.message || 'Error al actualizar el reglamento',
          }
        );
        this.reset();  // También reseteamos en caso de error
      }
    } catch (e: any) {
      // Manejo de errores en la promesa
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.namesCrud.singular}`,
          message: e?.detail?.error?.message || 'Error desconocido',
        }
      );
    }
  }

  async deleteReglamentos(reglamentoToDelete: Reglamento[], isFromDeleteSelected = false){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.reglamentosService.deleteReglamento(reglamentoToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_regla')
      if ( deleted.dataWasDeleted ) {
        this.getReglamentos();
        if ( isFromDeleteSelected ){
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
        this.reglamentosService.setModeForm('create', null, resolve, reject);
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
    }finally{
      this.dialog = true;
    }
  }

  async editForm(){
    try {
      this.reset();
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
    }finally{
      this.dialog = true;
    }
  }

  async submit() {
    try {
      
      if ( this.modeCrud == 'create' ) {
        //modo creacion
        await this.insertReglamento()
      }else{
        //modo edit
        await this.updateReglamento();
      }
    } catch (e:any) {
      const action = this.mode === 'create' ? 'guardar' : 'actualizar';
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


  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setAction('reset')
  }

  parseNombres(rowsSelected: any[] , withHtml = false){
    const nombresSelected = rowsSelected.map(reglamento => reglamento.Descripcion_regla);
  
    const message = nombresSelected.length === 1 
      ? `${this.namesCrud.articulo_singular}${withHtml ? ': <b>' : ' '}${nombresSelected[0]}${withHtml ? '</b>' : ''}`
      : `${this.namesCrud.articulo_plural}${withHtml ? ': <b>' : ' '}${nombresSelected.join(', ')}${withHtml ? '</b>' : ''}`;
    
    return message;
  }
  
  capitalizeFirstLetter(word: string): string {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }
  
  getWordWithGender(word: string, gender: string): string {
    if (gender === 'femenino') {
      if (word.endsWith('os')) {
        return word.replace(/os$/, 'as'); // Plural
      } else if (word.endsWith('o')) {
        return word.replace(/o$/, 'a'); // Singular
      }
    }
    return word;
  }
  
  async openConfirmationDeleteSelected(reglamentoSelected: any){
    const message = mergeNames(this.namesCrud,reglamentoSelected,true,'Descripcion_regla'); 
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
          await this.deleteReglamentos(reglamentoSelected , true);
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
  
  async openConfirmationDelete(reglamento: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${reglamento.Descripcion_regla}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let reglamentoToDelete = []
          reglamentoToDelete.push(reglamento);
          try {
            await this.deleteReglamentos(reglamento);
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