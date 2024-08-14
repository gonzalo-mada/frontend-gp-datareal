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
  docs: DocFromUploader[];
}

export interface NamesCrud{
  singular?: string;
  plural?: string;
  articulo_singular?: string;
  articulo_plural?: string;
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
    Descripcion_facu: ['', Validators.required],
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
      { field: 'accion', header: 'Acciones' }
    ];

    this.namesCrud = {
      singular: 'facultad',
      plural: 'facultades',
      articulo_singular: 'la facultad',
      articulo_plural: 'las facultades',
      genero: 'femenino'
    }

    this.globalFiltros = [ 'Descripcion_facu' ]
    this.dataKeyTable = 'Cod_facultad';
    this.keyPopups = 'facultad'
    await this.getFacultades();

    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getFacultades()}));
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

  async getFacultades(){
    try {
      this.facultades = <Facultad[]> await this.facultadService.bruto_getFacultades();      
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
          docs: actionUploadDoc.docs
        }
        const inserted = await this.facultadService.bruto_insertFacultad(params)
        return inserted;
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

  async updateFacultad(facultad: Facultad ){
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
          docs: actionUploadDoc.docs
        }
        
        const updated = await this.facultadService.bruto_updateFacultad(params);
        return updated;
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

  async deleteFacultad(facultadToDelete: Facultad[]){    
    try {
      let res = await this.facultadService.bruto_deleteFacultad(facultadToDelete);
      return res ;
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.namesCrud.singular}`,
          message: e.message,
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
        message: e.message,
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
          message: e.message,
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
      Descripcion_facu: this.facultad.Descripcion_facu
    })
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
      Descripcion_facu: '',
      files: []
    });
    this.fbForm.get('Descripcion_facu')?.enable();
    this.actionsCrudService.triggerResetSelectedRowsAction();
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  parseNombres(rowsSelected: Facultad[]){
    let nombresSelected = []; 
    for (let i = 0; i < rowsSelected.length; i++) {
      const facu = rowsSelected[i];
      nombresSelected.push(facu.Descripcion_facu)
    }
    
    let message = '' ;
    if (nombresSelected.length == 1) {
      message = `${this.namesCrud.articulo_singular}: <b>${nombresSelected}</b>`;
    } else {
      let nombresConSeparador = nombresSelected.join(', ');
      message = `${this.namesCrud.articulo_plural}: <b>${nombresConSeparador}</b>`;
    }
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

  async openConfirmationDeleteSelected(facultadSelected: any){
    const message = this.parseNombres(facultadSelected);
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

          let res = await this.deleteFacultad(facultadSelected);
          if (res) {
            
            this.messageService.add({
              key: this.keyPopups,
              severity: 'success',
              detail: `${this.capitalizeFirstLetter(this.namesCrud.plural!)} ${this.getWordWithGender('eliminados', this.namesCrud.genero!)} exitosamente`,
            });
            this.reset();
            this.getFacultades();
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

            let res = await this.deleteFacultad(facultadToDelete);
            if (res) {
              this.getFacultades();
              this.messageService.add({
                key: this.keyPopups,
                severity: 'success',
                detail: `${this.capitalizeFirstLetter(this.namesCrud.singular!)} ${this.getWordWithGender('eliminado', this.namesCrud.genero!)} exitosamente`,
              });
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
          await this.facultadService.deleteDoc(doc.id);
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
        let res = await this.insertFacultad()
        if (res) {
          this.getFacultades();
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: `${this.capitalizeFirstLetter(this.namesCrud.singular!)} ${this.getWordWithGender('creado', this.namesCrud.genero!)} exitosamente`,
          });
        }
      }else{
        //modo edit
        let res = await this.updateFacultad(this.facultad);
        if (res) {
          this.getFacultades();
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: `${this.capitalizeFirstLetter(this.namesCrud.singular!)} ${this.getWordWithGender('actualizado', this.namesCrud.genero!)} exitosamente`,
          });
        }
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
