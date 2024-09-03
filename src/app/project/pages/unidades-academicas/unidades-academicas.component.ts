import { Component } from '@angular/core';
import { ActionUploadDoc, NamesCrud, UnidadAcademica } from '../../models/UnidadAcademica';
import { Facultad } from '../../models/Facultad';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActionsCrudService } from '../../services/actions-crud.service';
import { UnidadesAcademicasService } from '../../services/unidades-academicas.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { FacultadService } from '../../services/facultad.service';

@Component({
  selector: 'app-unidades-academicas',
  templateUrl: './unidades-academicas.component.html',
  styles: [
  ]
})
export class UnidadesAcademicasComponent {

  unidadesAcademicas: UnidadAcademica[] = [];
  unidadAcademica: UnidadAcademica = {};
  facultades: Facultad[] = [];
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
    Descripcion_ua: ['', Validators.required],
    Cod_facultad: ['', Validators.required],
    files: [[], this.filesValidator.bind(this)]
  })

  constructor(private actionsCrudService: ActionsCrudService,
    private unidadesAcademicasService: UnidadesAcademicasService,
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
    private commonUtils: CommonUtils,
    private facultadService: FacultadService){
  }

  async ngOnInit() {
    this.cols = [
      { field: 'Descripcion_ua', header: 'Nombre' },
      { field: 'Cod_facultad', header: 'Facultad' },
      { field: 'accion', header: 'Acciones' }
    ];
 
    this.namesCrud = {
      singular: 'unidad académica',
      plural: 'unidades académicas',
      articulo_singular: 'la unidad académica',
      articulo_plural: 'las unidades académicas',
      genero: 'femenino'
    };
 
    this.globalFiltros = [ 'Descripcion_ua', 'Cod_facultad' ]
    this.dataKeyTable = 'Cod_unidad_academica';
    this.keyPopups = 'unidad_academica'
 
    await this.getUnidadesAcademicas();
 
    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getUnidadesAcademicas()}));
    this.subscription.add(this.actionsCrudService.actionDownloadDoc$.subscribe( event => { event && this.downloadDoc(event)}));
    this.subscription.add(this.actionsCrudService.updateValidatorFiles$.subscribe( event => { event && this.filesChanged(event)}));
    this.subscription.add(this.actionsCrudService.actionDeleteDocUploader$.subscribe( event => { event && this.openConfirmationDeleteDoc(event)}));
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
  }
 
  filesValidator(control: any): { [key: string]: boolean } | null {  
 
    const formGroup = control.parent as FormGroup;
   
    if (!formGroup) {
      return null;
    }
 
    const files = formGroup.get('files')?.value;  
   
    if ( this.mode == 'create' ){
      if (files.length === 0 ) {
        return { required: true };
      }
    }else if ( this.mode == 'edit'){
      if (files.length === 0 ) {
        return { required: true };
      }
    }
    return null;
  }

  async getUnidadesAcademicas(){
    try {
      this.unidadesAcademicas = <UnidadAcademica[]> await this.unidadesAcademicasService.logica_getUnidadesAcademicas();
      console.log(this.unidadesAcademicas);
      this.facultades = <Facultad[]> await this.facultadService.getFacultades();
      console.log(this.facultades);
     
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }
 
  async insertUnidadAcademica(){
    try {
      const extrasDocs = {
        Descripcion_ua: this.fbForm.get('Descripcion_ua')!.value
      }
      this.actionsCrudService.setExtrasDocs(extrasDocs);
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction({resolve, reject});
      });
      if ( actionUploadDoc.success ) {
        let params = {
          Descripcion_ua: this.fbForm.get('Descripcion_ua')!.value,
          Cod_facultad: this.fbForm.get('Cod_facultad')!.value.Cod_facultad,
          docs: actionUploadDoc.docs
        }
        const inserted = await this.unidadesAcademicasService.logica_insertUnidadesAcademicas(params)
        if ( inserted.dataWasInserted ) {
          this.getUnidadesAcademicas();
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
            message: e.message,
          });
      }
  }
 
  async updateUnidadAcademica(unidadAcademica: UnidadAcademica){
    try {
 
      const extrasDocs = {
        Cod_unidad_academica: unidadAcademica.Cod_unidad_academica,
        Descripcion_ua: this.fbForm.get('Descripcion_ua')!.value
      }
 
      this.actionsCrudService.setExtrasDocs(extrasDocs);
 
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction({resolve, reject});
      });
 
      if ( actionUploadDoc.success ) {
 
        let params = {
          Cod_unidad_academica: unidadAcademica.Cod_unidad_academica,
          Descripcion_ua: this.fbForm.get('Descripcion_ua')!.value == '' ? unidadAcademica.Descripcion_ua : this.fbForm.get('Descripcion_ua')!.value,
          Cod_facultad: this.mode == 'changeState' ? this.fbForm.get('Cod_facultad') : this.fbForm.get('Cod_facultad')!.value,
          docs: actionUploadDoc.docs
        }
        console.log(params);
       
        const updated = await this.unidadesAcademicasService.logica_updateUnidadesAcademicas(params);
        if ( updated.dataWasUpdated ){
          this.getUnidadesAcademicas();
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
          message: e.message,
      });
     
    }
  }
 
  async deleteUnidadAcademica(unidadAcadToDelete: UnidadAcademica[], isFromDeleteSelected = false){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.unidadesAcademicasService.logica_deleteUnidadesAcademicas(unidadAcadToDelete);
      const message = this.parseNombres(deleted.dataDeleted)
      if ( deleted.dataWasDeleted ) {
        this.getUnidadesAcademicas();
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
          message: e.message,
      });
    }
  }
 
  async loadDocsWithBinary(unidadAcademica: UnidadAcademica){
    try {    
      const files = await this.unidadesAcademicasService.getDocumentosWithBinary(unidadAcademica.Cod_unidad_academica!)  
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
      let blob: Blob = await this.unidadesAcademicasService.getArchiveDoc(documento.id);
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
    this.unidadAcademica = {};
    this.dialog = true;
  }
 
  async openShow(unidadAcademica: any) {
    this.mode = 'show';
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.unidadAcademica = {...unidadAcademica};
 
    // Buscar la facultad correspondiente usando Cod_facultad
    const facultad = this.facultades.find(f => f.Cod_facultad === this.unidadAcademica.Cod_facultad);
 
    this.fbForm.patchValue({
        Descripcion_ua: this.unidadAcademica.Descripcion_ua,
        Cod_facultad: facultad ? facultad.Descripcion_facu : '' // Cambiar Cod_facultad por Descripcion_facu
    });
 
    this.fbForm.get('Descripcion_ua')?.disable();
    this.fbForm.get('Cod_facultad')?.disable();
    await this.loadDocsWithBinary(unidadAcademica);
    this.dialog = true;
}
 
 
  async openEdit(unidadAcademica: any){
    this.reset();
    this.mode = 'edit';
    this.actionsCrudService.triggerResetQueueUploaderAction();
    this.unidadAcademica = {...unidadAcademica}
    this.fbForm.patchValue({
      Descripcion_ua: this.unidadAcademica.Descripcion_ua,
      Cod_facultad: this.unidadAcademica.Cod_facultad,
    })
    await this.loadDocsWithBinary(unidadAcademica);    
    this.dialog = true;
  }
 
  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }
 
  reset() {
    this.fbForm.reset({
      Descripcion_ua: '',
      Cod_facultad: '',
      files: []
    });
    this.fbForm.get('Descripcion_ua')?.enable();
    this.fbForm.get('Cod_facultad')?.enable();
    this.actionsCrudService.triggerResetSelectedRowsAction();
    this.fbForm.controls['files'].updateValueAndValidity();
  }
 
  parseNombres(rowsSelected: any[] , withHtml = false){
    const nombresSelected = rowsSelected.map(unidadAcademica => unidadAcademica.Descripcion_ua);
 
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
 
  async openConfirmationDeleteSelected(unidadAcademicaSelected: any){
    const message = this.parseNombres(unidadAcademicaSelected, true);
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
          await this.deleteUnidadAcademica(unidadAcademicaSelected , true);
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
 
  async openConfirmationDelete(unidadAcademica: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${unidadAcademica.Descripcion_ua}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let unidadAcadToDelete = []
          unidadAcadToDelete.push(unidadAcademica);
          try {
            await this.deleteUnidadAcademica(unidadAcadToDelete);
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
 
  async openConfirmationDeleteDoc(event : any){    
    const {file: doc , resolve, reject} = event ;
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar el documento <b>${doc.nombre}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.unidadesAcademicasService.deleteDoc(doc.id);
          resolve({success: true})
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: 'Error al eliminar documento',
              message: e.message,
          });
          reject(e)
        } finally {
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: 'Documento eliminado exitosamente',
          });
        }
      }
    })
  }
 
  async submit() {
    try {
      if ( this.mode == 'create' ) {
        //modo creacion
        await this.insertUnidadAcademica()
      }else{
        //modo edit
        await this.updateUnidadAcademica(this.unidadAcademica);
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
