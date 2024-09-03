import { Component, OnDestroy, OnInit } from '@angular/core';
import { CategoriaTp, NamesCrud } from '../../models/CategoriaTp';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionsCrudService } from '../../services/actions-crud.service';
import { CategoriasTpService } from '../../services/categorias-tp.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';

@Component({
  selector: 'app-categorias-tp',
  templateUrl: './categorias-tp.component.html',
  styles: [
  ]
})
export class CategoriasTpComponent implements OnInit, OnDestroy {

  categoriasTp: CategoriaTp[] = [];
  categoriaTp: CategoriaTp = {};
  namesCrud: NamesCrud = {};
  cols: any[] = [];
  globalFiltros : any[] = [];
  selectedRowsService: any[] = [];
  dataKeyTable : string = '';
  keyPopups: string = '';
  mode: string = '';
  dialog: boolean = false;
  statusValidatorForm: boolean = false;
  private subscription: Subscription = new Subscription();

  public fbForm : FormGroup = this.fb.group({
    Descripcion_categoria: ['', Validators.required],
  })

  constructor(private actionsCrudService: ActionsCrudService,
    private categoriasTpService: CategoriasTpService,
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
  ){}

  async ngOnInit(){
    this.cols = [
      { field: 'Descripcion_categoria', header: 'Nombre' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.namesCrud = {
      singular: 'categoría de tipo de programa',
      plural: 'categorías de tipos de programas',
      articulo_singular: 'la categoría de tipo de programa',
      articulo_plural: 'las categorías de tipos de programas',
      genero: 'femenino'
    };

    this.globalFiltros = [ 'Descripcion_categoria' ]
    this.dataKeyTable = 'Cod_CategoriaTP';
    this.keyPopups = 'categoria_tp'

    await this.getCategoriasTp();

    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.statusValidator$.subscribe(statusValidator => {
      if (statusValidator === 'INVALID' || statusValidator === '' ) {
        this.statusValidatorForm = false
      }else{
        this.statusValidatorForm = true
      }
    }));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getCategoriasTp()}));
    this.subscription.add(this.actionsCrudService.actionDeleteSelected$.subscribe( actionTriggered => {actionTriggered && this.openConfirmationDeleteSelected(this.selectedRowsService)}));
    this.subscription.add(
      this.actionsCrudService.actionMode$.subscribe( action => {
        if (action) {
          switch (action.mode) {
            case 'create':
              this.openCreate()
            break;
            case 'show':        
              this.openShow(action.data)
            break;
            case 'edit':
              this.openEdit(action.data)
            break;
            case 'delete':
              this.openConfirmationDelete(action.data)
            break;

          }
        }
      })
    )

  }
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.actionsCrudService.setSelectedRows([]); 
    this.actionsCrudService.setExtrasDocs(null);
    this.actionsCrudService.setFiles(null);
    this.actionsCrudService.triggerUploadDocsAction(null);
    this.actionsCrudService.triggerDeleteDocUplaoderAction(null);
    this.actionsCrudService.triggerFormAction(null);
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
        this.actionsCrudService.triggerFormAction({mode: 'insert', resolve, reject})
      })
      
      if (actionForm.success) {
        //insert exitoso
        this.getCategoriasTp();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${actionForm.dataInserted} ha sido ${this.getWordWithGender('creado', this.namesCrud.genero!)} exitosamente`,
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
    }
  }

  async updateCategoriaTp(categoriaTp: CategoriaTp){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerFormAction({mode: 'update', data: categoriaTp, resolve, reject})
      })
      if (actionForm.success) {
        this.getCategoriasTp();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${actionForm.dataUpdated} ha sido ${this.getWordWithGender('actualizado', this.namesCrud.genero!)} exitosamente`,
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

  async deleteCategoriaTp(categoriaTpToDelete: CategoriaTp[], isFromDeleteSelected = false){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.categoriasTpService.deleteCategoriaTp(categoriaTpToDelete);
      const message = this.parseNombres(deleted.dataDeleted)
      if ( deleted.dataWasDeleted ) {
        this.getCategoriasTp();
        if ( isFromDeleteSelected ){
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: `${this.capitalizeFirstLetter(message)} han sido ${this.getWordWithGender('eliminados', this.namesCrud.genero!)} exitosamente`,
          });
        }else{
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: `${this.capitalizeFirstLetter(message)} ha sido ${this.getWordWithGender('eliminado', this.namesCrud.genero!)} exitosamente`,
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

  async openCreate(){
    this.mode = 'create';
    const actionForm: any = await new Promise((resolve, reject) => {
      this.actionsCrudService.triggerFormAction({mode: this.mode, data: this.categoriaTp = {}, resolve, reject})
    })
    if (actionForm.success) {
      this.dialog = true;
    }

  }

  async openShow(categoriaTp: any) {
    this.mode = 'show'
    const actionForm: any = await new Promise((resolve, reject) => {
      this.actionsCrudService.triggerFormAction({mode: this.mode, data: categoriaTp, resolve, reject})
    })
    if (actionForm.success) {
      this.dialog = true;
    }
  }

  async openEdit(categoriaTp: any){
    this.mode = 'edit'
    this.categoriaTp = {...categoriaTp}
    const actionForm: any = await new Promise((resolve, reject) => {
      this.actionsCrudService.triggerFormAction({mode: this.mode, data: categoriaTp, resolve, reject})
    })
    if (actionForm.success) {
      this.dialog = true;
    }

  }

  reset() {
    this.fbForm.reset({
      Descripcion_categoria: '',
    });
    this.fbForm.get('Descripcion_categoria')?.enable();
    this.actionsCrudService.triggerResetSelectedRowsAction();
    this.actionsCrudService.triggerFormAction(null);
  }

  parseNombres(rowsSelected: any[] , withHtml = false){
    const nombresSelected = rowsSelected.map(categoriaTp => categoriaTp.Descripcion_categoria);
  
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

  async openConfirmationDeleteSelected(categoriaTpSelected: any){
    const message = this.parseNombres(categoriaTpSelected, true);
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
      if ( this.mode == 'create' ) {
        //modo creacion
        await this.insertCategoriaTp()
      }else{
        //modo edit
        await this.updateCategoriaTp(this.categoriaTp);
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


}
