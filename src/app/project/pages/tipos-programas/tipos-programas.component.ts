import { Component, OnDestroy, OnInit } from '@angular/core';
import { TipoPrograma, ActionUploadDoc, DocFromUploader, NamesCrud } from '../../models/TipoPrograma'
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionsCrudService } from '../../services/actions-crud.service';
import { TiposprogramasService } from '../../services/tipos-programas.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CategoriaTp } from '../../models/CategoriaTp';
import { CategoriasTpService } from '../../services/categorias-tp.service';

@Component({
  selector: 'app-tipos-programas',
  templateUrl: './tipos-programas.component.html',
  styles: [
  ]
})
export class TiposProgramasComponent implements OnInit, OnDestroy {

  tiposProgramas: TipoPrograma[] = [];
  categoriasTp: CategoriaTp[] = [];
  tipoPrograma: TipoPrograma = {};
  namesCrud: NamesCrud = {};
  cols: any[] = [];
  globalFiltros : any[] = [];
  selectedRowsService: any[] = [];
  dataKeyTable : string = '';
  keyPopups: string = '';
  mode: string = '';
  dialog: boolean = false;
  statusValidatorForm: boolean = false;
  newCategoryDialog: boolean = false;
  private subscription: Subscription = new Subscription();

  public fbForm : FormGroup = this.fb.group({
    Descripcion_tp: ['', Validators.required],
    Cod_CategoriaTP: ['', Validators.required]
  })

  constructor(private actionsCrudService: ActionsCrudService,
              private categoriasTpService: CategoriasTpService,
              private tipoProgramaService: TiposprogramasService,
              private confirmationService: ConfirmationService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private fb: FormBuilder,
              private messageService: MessageService,
  ){}

  async ngOnInit() {
    this.cols = [
      { field: 'Descripcion_tp', header: 'Nombre' },
      { field: 'Categoria.Descripcion_categoria', header: 'Categoría' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.namesCrud = {
      singular: 'tipo de programa',
      plural: 'tipos de programas',
      articulo_singular: 'el tipo de programa',
      articulo_plural: 'los tipos de programas',
      genero: 'masculino'
    };

    this.globalFiltros = [ 'Descripcion_tp' , 'Categoria.Descripcion_categoria' ]
    this.dataKeyTable = 'Cod_tipoPrograma';
    this.keyPopups = 'tipoprograma'

    await this.getTiposProgramas();

    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getTiposProgramas()}));
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
    this.subscription.add(this.actionsCrudService.statusValidator$.subscribe(statusValidator => {
      if (statusValidator === 'INVALID' || statusValidator === '' ) {
        this.statusValidatorForm = false
      }else{
        this.statusValidatorForm = true
      }
    }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.actionsCrudService.setSelectedRows([]); 
    this.actionsCrudService.triggerFormAction(null);
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
        Cod_CategoriaTP: this.fbForm.get('Cod_CategoriaTP')!.value,
      }
      const inserted = await this.tipoProgramaService.insertTipoPrograma(params)
      if ( inserted.dataWasInserted ) {
        this.getTiposProgramas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${inserted.dataInserted} ha sido ${this.getWordWithGender('creado', this.namesCrud.genero!)} exitosamente`,
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

  async updateTipoPrograma(tipoPrograma: TipoPrograma ){
    try {

      let params = {
        Cod_tipoPrograma: tipoPrograma.Cod_tipoPrograma,
        Descripcion_tp: this.fbForm.get('Descripcion_tp')!.value == '' ? tipoPrograma.Descripcion_tp : this.fbForm.get('Descripcion_tp')!.value,
        Cod_CategoriaTP: this.fbForm.get('Cod_CategoriaTP')!.value == '' ? tipoPrograma.Categoria?.Cod_CategoriaTP : this.fbForm.get('Cod_CategoriaTP')!.value,
      }
      
      const updated = await this.tipoProgramaService.updateTipoPrograma(params);
      if ( updated.dataWasUpdated ){
        this.getTiposProgramas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${updated.dataUpdated} ha sido ${this.getWordWithGender('actualizado', this.namesCrud.genero!)} exitosamente`,
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

  async deleteTipoPrograma(tipoProgramaToDelete: TipoPrograma[], isFromDeleteSelected = false){    
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.tipoProgramaService.deleteTipoPrograma(tipoProgramaToDelete);
      const message = this.parseNombres(deleted.dataDeleted)
      if ( deleted.dataWasDeleted ) {
        this.getTiposProgramas();
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
          message: e.detail.error.message.message
      });
    } 
  }

  openCreate(){
    this.reset();
    this.mode = 'create';
    this.tipoPrograma = {};
    this.dialog = true; 
  }

  async openShow(tipoPrograma: any) {
    this.mode = 'show'
    this.tipoPrograma = {...tipoPrograma}
    this.fbForm.patchValue({
      Descripcion_tp: this.tipoPrograma.Descripcion_tp,
      Cod_CategoriaTP: this.tipoPrograma.Categoria?.Cod_CategoriaTP
    })
    this.fbForm.get('Descripcion_tp')?.disable();
    this.fbForm.get('Cod_CategoriaTP')?.disable();
    this.dialog = true;
  }

  async openEdit(tipoPrograma: any){
    this.reset();
    this.mode = 'edit';
    this.tipoPrograma = {...tipoPrograma}
    this.fbForm.patchValue({
      Descripcion_tp: this.tipoPrograma.Descripcion_tp,
      Cod_CategoriaTP: this.tipoPrograma.Categoria?.Cod_CategoriaTP
    })
    this.dialog = true;
  }

  reset() {
    this.fbForm.reset({
      Descripcion_tp: '',
      Cod_CategoriaTP: ''
    });
    this.fbForm.get('Descripcion_tp')?.enable();
    this.fbForm.get('Cod_CategoriaTP')?.enable();
    this.actionsCrudService.triggerResetSelectedRowsAction();
    this.actionsCrudService.triggerFormAction(null);
  }

  parseNombres(rowsSelected: any[] , withHtml = false){
    const nombresSelected = rowsSelected.map(tipoPrograma => tipoPrograma.Descripcion_tp);
  
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

  async openConfirmationDeleteSelected(tipoProgramaSelected: any){
    const message = this.parseNombres(tipoProgramaSelected, true);
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
          await this.deleteTipoPrograma(tipoProgramaSelected , true);
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
      if ( this.mode == 'create' ) {
        //modo creacion
        await this.insertTipoPrograma()
      }else{
        //modo edit
        await this.updateTipoPrograma(this.tipoPrograma);
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

  onCategoriaChange(event: any) {
    if (event.value === -1) {
      this.newCategoryDialog = true;
    }
  }

  async submitNewCategory(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerFormAction({mode: 'insert', resolve, reject})
      })
      
      if (actionForm.success) {
        //insert exitoso
        await this.getTiposProgramas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${actionForm.dataInserted} ha sido ${this.getWordWithGender('creado', this.namesCrud.genero!)} exitosamente`,
        });
        this.fbForm.patchValue({
          Cod_CategoriaTP: this.categoriasTp[this.categoriasTp.length - 2].Cod_CategoriaTP
        })
        this.newCategoryDialog = false;
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.message,
        });
    }
  }
}
