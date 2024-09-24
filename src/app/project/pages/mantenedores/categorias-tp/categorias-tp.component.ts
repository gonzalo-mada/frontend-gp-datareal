import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoriaTp } from '../../../models/CategoriaTp';
import { Subscription } from 'rxjs';
import { CategoriasTpService } from '../../../services/categorias-tp.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Component({
  selector: 'app-categorias-tp',
  templateUrl: './categorias-tp.component.html',
  styles: [
  ]
})
export class CategoriasTpComponent implements OnInit, OnDestroy {

  constructor(public categoriasTpService: CategoriasTpService,
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
  ){}

  categoriasTp: CategoriaTp[] = [];
  categoriaTp: CategoriaTp = {};
  namesCrud!: NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;
  private subscription: Subscription = new Subscription();

  get modeForm(){
    return this.categoriasTpService.modeForm
  }

  async ngOnInit(){
    
    this.namesCrud = {
      singular: 'categoría de tipo de programa',
      plural: 'categorías de tipos de programas',
      articulo_singular: 'la categoría de tipo de programa',
      articulo_plural: 'las categorías de tipos de programas',
      genero: 'femenino'
    };
    
    this.keyPopups = 'categoria_tp'

    await this.getCategoriasTp();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe( () => this.getCategoriasTp() ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))

    this.subscription.add(
      this.categoriasTpService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.categoriaTp = {};
            this.categoriaTp = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertCategoriaTp(); break;
            case 'update': this.updateCategoriaTp(); break;
            case 'delete': this.openConfirmationDelete(this.categoriaTp); break;

          }
        }
      })
    );
    this.menuButtonsTableService.setContext('categorias-tp','dialog');

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
  }

  async getCategoriasTp(){
    try {
      this.categoriasTp = <CategoriaTp[]> await this.categoriasTpService.getCategoriasTp();      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertCategoriaTp(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.categoriasTpService.setModeForm('insert',null,resolve,reject)
      })
      
      if (actionForm.success) {
        //insert exitoso
        this.getCategoriasTp();
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

  async updateCategoriaTp(){
    try {
      const data = this.categoriaTp;
      const actionForm: any = await new Promise((resolve, reject) => {
        this.categoriasTpService.setModeForm('update',data,resolve,reject)
      })
      if (actionForm.success) {
        this.getCategoriasTp();
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

  async deleteCategoriaTp(categoriaTpToDelete: CategoriaTp[], isFromDeleteSelected = false){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.categoriasTpService.deleteCategoriaTp(categoriaTpToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_categoria')
      if ( deleted.dataWasDeleted ) {
        this.getCategoriasTp();
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
          message: e.detail.error.message.message,
      });
    }
  }

  async createForm(){
    try {
      this.reset();
      await new Promise((resolve,reject) => {
        this.categoriasTpService.setModeForm('create',null,resolve,reject)
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
      const data = this.categoriaTp;
      await new Promise((resolve, reject) => {
        this.categoriasTpService.setModeForm('show',data,resolve,reject);
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
      const data = this.categoriaTp;
      await new Promise((resolve, reject) => {
        this.categoriasTpService.setModeForm('edit',data,resolve,reject);
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
  }


  async openConfirmationDeleteSelected(categoriaTpSelected: any){
    const message = mergeNames(this.namesCrud,categoriaTpSelected,true,'Descripcion_categoria')
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
          await this.deleteCategoriaTp(categoriaTpSelected , true);
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

  async openConfirmationDelete(categoriaTp: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${categoriaTp.Descripcion_categoria}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let dataToDelete = []
          dataToDelete.push(categoriaTp);
          try {
            await this.deleteCategoriaTp(dataToDelete);
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
        await this.insertCategoriaTp()
      }else{
        //modo edit
        await this.updateCategoriaTp();
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
