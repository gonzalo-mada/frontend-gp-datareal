import { Component, OnDestroy, OnInit } from '@angular/core';
import { TipoPrograma } from '../../../models/TipoPrograma'
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TiposprogramasService } from '../../../services/tipos-programas.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CategoriaTp } from '../../../models/CategoriaTp';
import { CategoriasTpService } from '../../../services/categorias-tp.service';
import { GPValidator } from '../../../tools/validators/gp.validators';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Component({
  selector: 'app-tipos-programas',
  templateUrl: './tipos-programas.component.html',
  styles: [
  ]
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
  namesCrud!: NamesCrud;
  namesCrud_cat!: NamesCrud;
  keyPopups: string = '';
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

    this.namesCrud = {
      singular: 'tipo de programa',
      plural: 'tipos de programas',
      articulo_singular: 'el tipo de programa',
      articulo_plural: 'los tipos de programas',
      genero: 'masculino'
    };

    this.namesCrud_cat = {
      singular: 'categoría de tipo de programa',
      plural: 'categorías de tipos de programas',
      articulo_singular: 'la categoría de tipo de programa',
      articulo_plural: 'las categorías de tipos de programas',
      genero: 'femenino'
    };

    this.keyPopups = 'tipoprograma'

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

  async getTiposProgramas(){
    try {
      this.tiposProgramas = <TipoPrograma[]> await this.tipoProgramaService.getTiposProgramas();
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
        this.getTiposProgramas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: generateMessage(this.namesCrud,inserted.dataInserted,'creado',true,false)
        });
        this.reset();
      } 
    } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al guardar ${this.namesCrud.singular}`,
            message: e.detail.error.message.message,
          });
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
        this.getTiposProgramas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: generateMessage(this.namesCrud,updated.dataUpdated,'actualizado',true,false)
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
    }
  }

  async deleteTipoPrograma(tipoProgramaToDelete: TipoPrograma[]){    
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.tipoProgramaService.deleteTipoPrograma(tipoProgramaToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_tp')
      if ( deleted.dataWasDeleted ) {
        this.getTiposProgramas();
        if ( tipoProgramaToDelete.length > 1 ){
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
    const message = mergeNames(this.namesCrud,tipoProgramaSelected,true,'Descripcion_tp');    
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
          await this.deleteTipoPrograma(tipoProgramaSelected);
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
  
  async openConfirmationDelete(tipoPrograma: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${tipoPrograma.Descripcion_tp}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
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
        await this.insertTipoPrograma()
      }else{
        //modo edit
        await this.updateTipoPrograma();
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

  onCategoriaChange(event: any) {
    if (event.value === -1) {
      this.newCategoryDialog = true;
    }
  }

  async submitNewCategory(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.categoriasTpService.setModeForm('insert',null,resolve,reject)
      })
      
      if (actionForm.success) {
        //insert exitoso
        await this.getTiposProgramas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: generateMessage(this.namesCrud_cat,actionForm.dataInserted,'creado',true,false)
        });
        this.fbForm.get('Categoria.Cod_CategoriaTP')?.patchValue(this.categoriasTp[this.categoriasTp.length - 2].Cod_CategoriaTP);
        this.newCategoryDialog = false;
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud_cat.singular}`,
          message: e.message,
        });
    }
  }
}
