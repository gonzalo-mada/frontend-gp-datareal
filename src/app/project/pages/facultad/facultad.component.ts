import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FacultadService } from '../../services/facultad.service';
import { ActionsCrudService } from '../../services/actions-crud.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { Facultad } from '../../models/Facultad';


export interface DocFromUploader {
  nombre: string;
  tipo: string;
  archivo: string;
  extras: {
    Descripcion_facu: string,
    comentarios: string,
    pesoDocumento: number
  }
}

export interface ActionUploadDoc{
  success: boolean;
  docsToUpload: DocFromUploader[];
  docsToDelete: DocFromUploader[];
}

export interface NamesCrud{
  singular?: string; //facultad
  plural?: string; //facultades
  articulo_singular?: string; //la facultad
  articulo_plural?: string; //las facultades
  genero?: string;
}

@Component({
  selector: 'app-facultad',
  templateUrl: './facultad.component.html',
  styles: [
  ]
})
export class FacultadComponent implements OnInit, OnDestroy {

  facultades: Facultad[] = [];
  facultadesBruto: Facultad[] = [];
  facultad: Facultad = {};
  namesCrud : NamesCrud = {}
  cols: any[] = [];
  globalFiltros : any[] = [];
  selectedRowsService: any[] = [];

  dataKeyTable : string = '';
  keyPopups: string = '';
  dialog: boolean = false;
  mode: string = '';
  private subscription: Subscription = new Subscription();

  public fbForm : FormGroup = this.fb.group({
    Estado_facu: [true, Validators.required],
    Descripcion_facu: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    files: [[], this.filesValidator.bind(this)]
  })

  constructor(private actionsCrudService: ActionsCrudService,
              private facultadService: FacultadService,
              private confirmationService: ConfirmationService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private fb: FormBuilder,
              private messageService: MessageService,
              private commonUtils: CommonUtils){}

  async ngOnInit( ) {
    this.cols = [
      { field: 'Descripcion_facu', header: 'Nombre' },
      { field: 'Estado_facu', header: 'Estado' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.namesCrud = {
      singular: 'facultad',
      plural: 'facultades',
      articulo_singular: 'la facultad',
      articulo_plural: 'las facultades',
      genero: 'femenino'
    };

    this.globalFiltros = [ 'Descripcion_facu' ]
    this.dataKeyTable = 'Cod_facultad';
    this.keyPopups = 'facultad'
    await this.getFacultades();

    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getFacultades()}));
    this.subscription.add(this.actionsCrudService.actionDownloadDoc$.subscribe( event => { event && this.downloadDoc(event)}));
    this.subscription.add(this.actionsCrudService.updateValidatorFiles$.subscribe( event => { event && this.filesChanged(event)}));
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
            case 'changeState':
              this.openConfirmationChangeState(action.data)
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
  }

  filesValidator(control: any): { [key: string]: boolean } | null {   
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
      return null;
    }

    const state = formGroup.get('Estado_facu')?.value;
    const files = formGroup.get('files')?.value;   
    
    if ( this.mode == 'create' ){
      if (files.length === 0 && state === true) {
        return { required: true };
      }
    }else if ( this.mode == 'edit'){
      if (files.length === 0 && state === true) {
        return { required: true };
      }
    }
    return null;
  }

  async getFacultades(){
    try {
      this.facultades = <Facultad[]> await this.facultadService.getFacultades();      
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertFacultad(){
    try {
      const extrasDocs = {
        Descripcion_facu: this.fbForm.get('Descripcion_facu')!.value
      }
      this.actionsCrudService.setExtrasDocs(extrasDocs);
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction({resolve, reject});
      });
      if ( actionUploadDoc.success ) {
        let params = {
          Descripcion_facu: this.fbForm.get('Descripcion_facu')!.value,
          Estado_facu: this.fbForm.get('Estado_facu')!.value,
          docsToUpload: actionUploadDoc.docsToUpload
        }
        const inserted = await this.facultadService.insertFacultadService(params)
        if ( inserted.dataWasInserted ) {
          this.getFacultades();
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${inserted.dataInserted} ha sido ${this.getWordWithGender('creado', this.namesCrud.genero!)} exitosamente`,
          });
          this.reset();
        }
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

  async updateFacultad(facultad: Facultad, isFromChangeState = false ){
    try {

      const extrasDocs = {
        Cod_facultad: facultad.Cod_facultad,
        Descripcion_facu: this.fbForm.get('Descripcion_facu')!.value
      }

      this.actionsCrudService.setExtrasDocs(extrasDocs);

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction({resolve, reject});
      });
      
      if ( actionUploadDoc.success ) {

        let params = {
          Cod_facultad: facultad.Cod_facultad,
          Descripcion_facu: this.fbForm.get('Descripcion_facu')!.value == '' ? facultad.Descripcion_facu : this.fbForm.get('Descripcion_facu')!.value,
          Estado_facu: this.mode == 'changeState' ? facultad.Estado_facu : this.fbForm.get('Estado_facu')!.value,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          isFromChangeState : isFromChangeState
        }
        
        const updated = await this.facultadService.updateFacultadService(params);
        if ( updated.dataWasUpdated ){
          this.getFacultades();
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: `${this.capitalizeFirstLetter(this.namesCrud.articulo_singular!)} ${updated.dataUpdated} ha sido ${this.getWordWithGender('actualizado', this.namesCrud.genero!)} exitosamente`,
          });
          this.reset();
        }
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

  async deleteFacultad(facultadToDelete: Facultad[], isFromDeleteSelected = false){    
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.facultadService.deleteFacultadService(facultadToDelete);
      const message = this.parseNombres(deleted.dataDeleted)
      if ( deleted.dataWasDeleted ) {
        this.getFacultades();
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

  async loadDocsWithBinary(facultad: Facultad){
    try {     
      const files = await this.facultadService.getDocumentosWithBinary(facultad.Cod_facultad!)  
      this.actionsCrudService.setFiles(files)      
      this.filesChanged(files);
      return files
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      });
    }
  }

  async downloadDoc(documento: any) {
    try {
      let blob: Blob = await this.facultadService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento',
          message: e.detail.error.message.message,
      });
    }
  }

  openCreate(){
    this.mode = 'create';
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.reset();
    this.facultad = {};
    this.dialog = true; 
  }

  async openShow(facultad: any) {
    this.mode = 'show'
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.facultad = {...facultad}
    this.fbForm.patchValue({
      Estado_facu: this.facultad.Estado_facu,
      Descripcion_facu: this.facultad.Descripcion_facu
    })
    this.fbForm.get('Estado_facu')?.disable();
    this.fbForm.get('Descripcion_facu')?.disable();
    await this.loadDocsWithBinary(facultad);
    this.dialog = true;
  }

  async openEdit(facultad: any){
    this.reset();
    this.mode = 'edit';
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.facultad = {...facultad}
    this.fbForm.patchValue({
      Estado_facu: this.facultad.Estado_facu,
      Descripcion_facu: this.facultad.Descripcion_facu
    })
    await this.loadDocsWithBinary(facultad);    
    this.dialog = true;
  }

  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  reset() {
    this.fbForm.reset({
      Estado_facu: true,
      Descripcion_facu: '',
      files: []
    });
    this.fbForm.get('Estado_facu')?.enable();
    this.fbForm.get('Descripcion_facu')?.enable();
    this.actionsCrudService.triggerResetSelectedRowsAction();
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  parseNombres(rowsSelected: any[] , withHtml = false){
    const nombresSelected = rowsSelected.map(facultad => facultad.Descripcion_facu);
  
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

  changeState(){
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  async openConfirmationDeleteSelected(facultadSelected: any){
    const message = this.parseNombres(facultadSelected, true);
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
          await this.deleteFacultad(facultadSelected , true);
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

  async openConfirmationDelete(facultad: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${facultad.Descripcion_facu}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let facultadToDelete = []
          facultadToDelete.push(facultad);
          try {
            await this.deleteFacultad(facultadToDelete);
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

  openConfirmationChangeState(facultad: any){
    this.actionsCrudService.triggerResetQueueUploaderAction(); 
    const state = facultad.Estado_facu;
    const action = state ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para <b>${action}</b> ${this.namesCrud.articulo_singular} <b>${facultad.Descripcion_facu}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-success p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          this.mode = 'changeState';
          await this.updateFacultad( facultad , true )
        } catch (e: any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al ${action} ${this.namesCrud.singular}`,
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
        await this.insertFacultad()
      }else{
        //modo edit
        await this.updateFacultad(this.facultad);
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
