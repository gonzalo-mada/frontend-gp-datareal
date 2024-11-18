import { Component, OnDestroy, OnInit } from '@angular/core';
import { TipoPrograma } from '../../../models/programas/TipoPrograma'
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TiposprogramasService } from '../../../services/programas/tipos-programas.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CategoriaTp } from '../../../models/programas/CategoriaTp';
import { CategoriasTpService } from '../../../services/programas/categorias-tp.service';
import { GPValidator } from '../../../tools/validators/gp.validators';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Component({
  selector: 'app-tipos-programas',
  templateUrl: './tipos-programas.component.html',
  styles: [],
  providers: [TiposprogramasService]
})
export class TiposProgramasComponent implements OnInit, OnDestroy {

  constructor(public categoriasTpService: CategoriasTpService,
    public tipoProgramaService: TiposprogramasService,
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
  ){}

  tiposProgramas: TipoPrograma[] = [];
  categoriasTp: CategoriaTp[] = [];
  tipoPrograma: TipoPrograma = {};
  dialog: boolean = false;
  private subscription: Subscription = new Subscription();
  newCategoryDialog: boolean = false;

  get modeForm() {
    return this.tipoProgramaService.modeForm
  }

  public fbForm : FormGroup = this.fb.group({
    Descripcion_tp: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
    Categoria: this.fb.group({
      Cod_CategoriaTP: ['', [Validators.required , GPValidator.notMinusOneCategory()]]
    })
  })

  async ngOnInit() {
    await this.getTiposProgramas();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe( () => this.getTiposProgramas()));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))

    this.subscription.add(
      this.tipoProgramaService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.tipoPrograma = {};
            this.tipoPrograma = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertTipoPrograma(); break;
            case 'update': this.updateTipoPrograma(); break;
            case 'delete': this.openConfirmationDelete(this.tipoPrograma); break;
          }
        }
      })
    )

    this.menuButtonsTableService.setContext('tp','dialog');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
  }

  async getTiposProgramas(showCountTableValues: boolean = true){
    try {
      this.tiposProgramas = <TipoPrograma[]> await this.tipoProgramaService.getTiposProgramas();
      if (showCountTableValues) this.tipoProgramaService.countTableValues(this.tiposProgramas.length); 
      this.categoriasTp = <CategoriaTp[]> await this.categoriasTpService.getCategoriasTp(); 
      this.categoriasTp.push({ Cod_CategoriaTP: -1, Descripcion_categoria: 'Añadir nueva categoría' });     
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertTipoPrograma(){
    try {
      let params = {
        Descripcion_tp: this.fbForm.get('Descripcion_tp')!.value,
        Cod_CategoriaTP: this.fbForm.get('Categoria.Cod_CategoriaTP')!.value,
      }
      const inserted = await this.tipoProgramaService.insertTipoPrograma(params)
      if ( inserted.dataWasInserted ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.tipoProgramaService.namesCrud,inserted.dataInserted,'creado',true,false)
        });
      } 
    } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al agregar ${this.tipoProgramaService.namesCrud.singular}`,
            message: e.detail.error.message.message,
          });
    }finally{
      this.dialog = false;
      this.getTiposProgramas(false);
      this.reset();
    }
  }

  async updateTipoPrograma(){
    try {

      let params = {
        Cod_tipoPrograma: this.tipoPrograma.Cod_tipoPrograma,
        Descripcion_tp: this.fbForm.get('Descripcion_tp')!.value == '' ? this.tipoPrograma.Descripcion_tp : this.fbForm.get('Descripcion_tp')!.value,
        Cod_CategoriaTP: this.fbForm.get('Categoria.Cod_CategoriaTP')!.value == '' ? this.tipoPrograma.Categoria?.Cod_CategoriaTP : this.fbForm.get('Categoria.Cod_CategoriaTP')!.value,
      }
      const updated = await this.tipoProgramaService.updateTipoPrograma(params);
      if ( updated.dataWasUpdated ){
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.tipoProgramaService.namesCrud,updated.dataUpdated,'actualizado',true,false)
        });
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.tipoProgramaService.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.dialog = false;
      this.getTiposProgramas(false);
      this.reset();
    }
  }

  async deleteTipoPrograma(tipoProgramaToDelete: TipoPrograma[]){    
    try {
      const response = await this.tipoProgramaService.deleteTipoPrograma(tipoProgramaToDelete);
      if (response.notDeleted.length !== 0) {
        for (let i = 0; i < response.notDeleted.length; i++) {
          const element = response.notDeleted[i];
          this.messageService.add({
            key: 'main-gp',
            severity: 'warn',
            summary:  `Error al eliminar ${this.tipoProgramaService.namesCrud.singular}`,
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
            detail: generateMessage(this.tipoProgramaService.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.tipoProgramaService.namesCrud,message,'eliminado',true, false)
          });
        }
      }
    } catch (e:any) {     
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.tipoProgramaService.namesCrud.singular}`,
          message: e.detail.error.message.message
      });
    } finally{
      this.reset();
      this.getTiposProgramas(false);
    }
  }

  createForm(){
    this.reset();
    this.tipoProgramaService.setModeCrud('create')
    this.tipoPrograma = {};
    this.dialog = true; 
  }

  showForm(){
    this.fbForm.patchValue({...this.tipoPrograma});
    this.fbForm.get('Descripcion_tp')?.disable();
    this.fbForm.get('Cod_CategoriaTP')?.disable();
    this.dialog = true;
  }

  editForm(){
    this.reset();
    this.fbForm.patchValue({...this.tipoPrograma});
    this.dialog = true;
  }

  reset() {
    this.fbForm.reset({
      Descripcion_tp: '',
      Cod_CategoriaTP: ''
    });
    this.fbForm.get('Descripcion_tp')?.enable();
    this.fbForm.get('Cod_CategoriaTP')?.enable();
    this.tableCrudService.resetSelectedRows();
  }

  async openConfirmationDeleteSelected(tipoProgramaSelected: any){
    const message = mergeNames(this.tipoProgramaService.namesCrud,tipoProgramaSelected,true,'Descripcion_tp');    
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
          await this.deleteTipoPrograma(tipoProgramaSelected);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.tipoProgramaService.namesCrud.singular}`,
              message: e.message,
          });
        }
      }
    })
  }
  
  async openConfirmationDelete(tipoPrograma: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.tipoProgramaService.namesCrud.articulo_singular} <b>${tipoPrograma.Descripcion_tp}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let dataToDelete = []
          dataToDelete.push(tipoPrograma);
          try {
            await this.deleteTipoPrograma(dataToDelete);
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${this.tipoProgramaService.namesCrud.singular}`,
                message: e.message,
            });
          }
      }
    })
  }

  submit() {
    this.modeForm === 'create' ? this.insertTipoPrograma() : this.updateTipoPrograma();
  }

  onCategoriaChange(event: any) {
    if (event.value === -1) {
      this.newCategoryDialog = true;
    }
  }

  async submitNewCategory(){
    try {
      let params = { ...this.categoriasTpService.fbForm.value }
      const response = await this.categoriasTpService.insertCategoriaTp(params);
      if ( response.dataWasInserted ) {
        await this.getTiposProgramas(false);
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.categoriasTpService.namesCrud,response.dataInserted,'creado',true,false)
        });
        this.fbForm.get('Categoria.Cod_CategoriaTP')?.patchValue(this.categoriasTp[this.categoriasTp.length - 2].Cod_CategoriaTP);
        this.newCategoryDialog = false;
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al agregar ${this.categoriasTpService.namesCrud.singular}`,
          message: e.message,
        });
    }
  }
}
