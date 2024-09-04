import { Component, OnDestroy, OnInit } from '@angular/core';
import { Campus } from '../../models/Campus';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { CampusService } from '../../services/campus.service';
import { Subscription } from 'rxjs';
import { ActionsCrudService } from '../../services/actions-crud.service';

export interface DocFromUploader {
  nombre: string;
  tipo: string;
  archivo: string;
  extras: {
    Descripcion_campus: string,
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
  singular?: string;
  plural?: string;
  articulo_singular?: string;
  articulo_plural?: string;
  genero?: string;
}

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styles: [
  ]
})

export class CampusComponent implements OnInit, OnDestroy {

  campuses: Campus[] = [];
  campus: Campus = {};
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
    Estado_campus: [true, Validators.required],
    Descripcion_campus: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
    files: [[], this.filesValidator.bind(this)]
  })

  constructor(private actionsCrudService: ActionsCrudService,
              private campusService: CampusService,
              private confirmationService: ConfirmationService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private fb: FormBuilder,
              private messageService: MessageService,
              private commonUtils: CommonUtils
  ){}

  async ngOnInit() {
    this.cols = [
      { field: 'Descripcion_campus', header: 'Nombre' },
      { field: 'Estado_campus', header: 'Estado' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.namesCrud = {
      singular: 'campus',
      plural: 'campus',
      articulo_singular: 'el campus',
      articulo_plural: 'los campus',
      genero: 'masculino'
    }

    this.globalFiltros = [ 'Descripcion_campus' ]
    this.dataKeyTable = 'Cod_campus';
    this.keyPopups = 'campus'
    await this.getCampuses();

    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getCampuses()}));
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

    const state = formGroup.get('Estado_campus')?.value;
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

  async getCampuses(){
    try {
      this.campuses = <Campus[]> await this.campusService.getCampus();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertCampus(){
    try {
      const extrasDocs = {
        Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value
      }

      this.actionsCrudService.setExtrasDocs(extrasDocs);

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction({resolve, reject});
      });
    
      if ( actionUploadDoc.success ) {
        let params = {
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.fbForm.get('Estado_campus')!.value,
          docsToUpload: actionUploadDoc.docsToUpload
        }
        const inserted = await this.campusService.insertCampusService( params )
        
        if ( inserted.dataWasInserted ) {
          this.getCampuses();
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
            message: e.detail.error.message.message
          });
      }
  }

  async updateCampus(campus: Campus, isFromChangeState = false ){
    try {

      const extrasDocs = {
        Cod_campus: campus.Cod_campus,
        Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value
      }

      this.actionsCrudService.setExtrasDocs(extrasDocs);

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction({resolve, reject});
      });

      if ( actionUploadDoc.success ) {

        let params = {
          Cod_campus: campus.Cod_campus,
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value == '' ? campus.Descripcion_campus : this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.mode == 'changeState' ? campus.Estado_campus : this.fbForm.get('Estado_campus')!.value,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          isFromChangeState : isFromChangeState
        }
        
        const updated = await this.campusService.updateCampusService( params )
        
        if ( updated.dataWasUpdated ){
          this.getCampuses();
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
          message: e.detail.error.message.message
      });
    }
  }

  async deleteCampus(campusToDelete: Campus[], isFromDeleteSelected = false){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.campusService.deleteCampusService(campusToDelete);
      const message = this.parseNombres(deleted.dataDeleted)
      if ( deleted.dataWasDeleted ) {
        this.getCampuses();
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

  async loadDocsWithBinary(campus: Campus, loading = true ){
    try {     
      const files = await this.campusService.getDocumentosWithBinary(campus.Cod_campus! , loading)      
      this.actionsCrudService.setFiles(files)      
      this.filesChanged(files);
      return files
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.message,
      });
    }
  }

  async downloadDoc(documento: any) {
    try {
      let blob: Blob = await this.campusService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento',
          message: e.message,
      });
    }
  }

  openCreate(){
    this.mode = 'create';
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.reset();
    this.campus = {};
    this.dialog = true; 
  }

  async openShow(campus: any) {
    this.mode = 'show'
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.campus = {...campus}
    this.fbForm.patchValue({
      Estado_campus: this.campus.Estado_campus,
      Descripcion_campus: this.campus.Descripcion_campus
    })
    this.fbForm.get('Estado_campus')?.disable();
    this.fbForm.get('Descripcion_campus')?.disable();
    await this.loadDocsWithBinary(campus);
    this.dialog = true;
  }

  async openEdit(campus: any){
    this.reset();
    this.mode = 'edit';
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.campus = {...campus}
    this.fbForm.patchValue({
      Estado_campus: this.campus.Estado_campus,
      Descripcion_campus: this.campus.Descripcion_campus
    })
    await this.loadDocsWithBinary(campus);    
    this.dialog = true;
  }

  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  reset() {
    this.fbForm.reset({
      Estado_campus: true,
      Descripcion_campus: '',
      files: []
    });
    this.fbForm.get('Estado_campus')?.enable();
    this.fbForm.get('Descripcion_campus')?.enable();
    this.actionsCrudService.triggerResetSelectedRowsAction();
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  parseNombres(rowsSelected: Campus[] , withHtml = false){
    const nombresSelected = rowsSelected.map(campus => campus.Descripcion_campus);
  
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

  async openConfirmationDeleteSelected(campusSelected: any){
    const message = this.parseNombres(campusSelected, true);
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para <b>eliminar</b> ${message}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.deleteCampus(campusSelected , true); 
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

  async openConfirmationDelete(campus: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para <b>eliminar</b> ${this.namesCrud.articulo_singular}: <b>${campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let campusToDelete = []
          campusToDelete.push(campus);
          try {
            await this.deleteCampus(campusToDelete);
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

  openConfirmationChangeState(campus: any){
    this.actionsCrudService.triggerResetQueueUploaderAction(); 
    const state = campus.Estado_campus;
    const action = state ? 'desactivar' : 'activar';
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para <b>${action}</b> ${this.namesCrud.articulo_singular} <b>${campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-success p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          this.mode = 'changeState';
          await this.updateCampus( campus , true )
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
        await this.insertCampus()
      }else{
        //modo edit
        await this.updateCampus(this.campus);
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
