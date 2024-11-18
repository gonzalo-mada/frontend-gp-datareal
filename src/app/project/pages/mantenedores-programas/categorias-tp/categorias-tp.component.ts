import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoriaTp } from '../../../models/programas/CategoriaTp';
import { Subscription } from 'rxjs';
import { CategoriasTpService } from '../../../services/programas/categorias-tp.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-categorias-tp',
  templateUrl: './categorias-tp.component.html',
  styles: [],
  providers: [CategoriasTpService]
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
  dialog: boolean = false;
  private subscription: Subscription = new Subscription();

  get modeForm(){
    return this.categoriasTpService.modeForm
  }

  async ngOnInit(){
    await this.getCategoriasTp();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe( () => this.getCategoriasTp() ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))

    this.subscription.add(
      this.categoriasTpService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.categoriasTpService.categoriaTp = {};
            this.categoriasTpService.categoriaTp = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertCategoriaTp(); break;
            case 'update': this.updateCategoriaTp(); break;
            case 'delete': this.openConfirmationDelete(this.categoriasTpService.categoriaTp); break;
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

  async getCategoriasTp(showCountTableValues: boolean = true){
    try {
      this.categoriasTp = <CategoriaTp[]> await this.categoriasTpService.getCategoriasTp();
      if (showCountTableValues) this.categoriasTpService.countTableValues(this.categoriasTp.length);      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertCategoriaTp(){
    try {
      let params = { ...this.categoriasTpService.fbForm.value }
      const response = await this.categoriasTpService.insertCategoriaTp(params);
      if ( response.dataWasInserted ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.categoriasTpService.namesCrud,response.dataInserted,'creado',true,false)
        });
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al agregar ${this.categoriasTpService.namesCrud.singular}`,
          message: e.detail.error.message.message,
        }
      );
    }finally{
      this.dialog = false;
      this.getCategoriasTp(false);
      this.reset();
    }
  }

  async updateCategoriaTp(){
    try {
      let params = { 
        ...this.categoriasTpService.fbForm.value,
        Cod_CategoriaTP: this.categoriasTpService.categoriaTp.Cod_CategoriaTP
      }
      const response = await this.categoriasTpService.updateCategoriaTp(params);
      if ( response.dataWasUpdated ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.categoriasTpService.namesCrud,response.dataUpdated,'actualizado',true,false)
        });
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.categoriasTpService.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.dialog = false;
      this.getCategoriasTp(false);
      this.reset();
    }

  }

  async deleteCategoriaTp(categoriaTpToDelete: CategoriaTp[]){
    try {
      const response  = await this.categoriasTpService.deleteCategoriaTp(categoriaTpToDelete);
      if (response.notDeleted.length !== 0) {
        for (let i = 0; i < response.notDeleted.length; i++) {
          const element = response.notDeleted[i];
          this.messageService.add({
            key: 'main-gp',
            severity: 'warn',
            summary:  `Error al eliminar ${this.categoriasTpService.namesCrud.singular}`,
            detail: element.messageError,
            sticky: true
          });
        }
      }
      if (response.deleted.length !== 0) {
        const message = mergeNames(null,response.deleted,false,'data');
        if ( response.deleted.length > 1 ){
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.categoriasTpService.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.categoriasTpService.namesCrud,message,'eliminado',true, false)
          });
        }
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.categoriasTpService.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.reset();
      this.getCategoriasTp(false);
    }
  }

  createForm(){
    this.reset();
    this.categoriasTpService.setModeCrud('create')
    this.dialog = true;
  }

  showForm(){
    this.reset();
    this.categoriasTpService.fbForm.patchValue({...this.categoriasTpService.categoriaTp});
    this.categoriasTpService.fbForm.disable();
    this.dialog = true;
  }

  editForm(){
    this.reset();
    this.categoriasTpService.fbForm.patchValue({...this.categoriasTpService.categoriaTp});
    this.dialog = true;
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.categoriasTpService.resetForm();
  }

  async openConfirmationDeleteSelected(categoriaTpSelected: any){
    const message = mergeNames(this.categoriasTpService.namesCrud,categoriaTpSelected,true,'Descripcion_categoria')
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.deleteCategoriaTp(categoriaTpSelected);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.categoriasTpService.namesCrud.singular}`,
              message: e.message,
          });
        }
      }
    })
  }

  async openConfirmationDelete(categoriaTp: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.categoriasTpService.namesCrud.articulo_singular} <b>${categoriaTp.Descripcion_categoria}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
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
                summary: `Error al eliminar ${this.categoriasTpService.namesCrud.singular}`,
                message: e.message,
            });
          }
      }
    })
  }

  submit() {
    this.modeForm === 'create' ? this.insertCategoriaTp() : this.updateCategoriaTp();
  }


}
