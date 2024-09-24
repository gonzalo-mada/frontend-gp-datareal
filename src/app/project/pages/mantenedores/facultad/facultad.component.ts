import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { FacultadService } from '../../../services/facultad.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ActionUploadDoc, Facultad } from '../../../models/Facultad';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';


@Component({
  selector: 'app-facultad',
  templateUrl: './facultad.component.html',
  styles: [
  ]
})
export class FacultadComponent implements OnInit, OnDestroy {

  constructor(private commonUtils: CommonUtils,
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private facultadService: FacultadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  facultades: Facultad[] = [];
  facultadesBruto: Facultad[] = [];
  facultad: Facultad = {};
  namesCrud!: NamesCrud;

  keyPopups: string = '';
  dialog: boolean = false;
  showAsterisk : boolean = true;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.facultadService.modeForm
  }

  set modeForm(_val){
    this.facultadService.modeForm = _val;
  }

  public fbForm : FormGroup = this.fb.group({
    Estado_facu: [true, Validators.required],
    Descripcion_facu: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    files: [[], this.filesValidator.bind(this)]
  })

  async ngOnInit( ) {
    
    this.namesCrud = {
      singular: 'facultad',
      plural: 'facultades',
      articulo_singular: 'la facultad',
      articulo_plural: 'las facultades',
      genero: 'femenino'
    };

    this.keyPopups = 'facultad'
    await this.getFacultades();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.openCreate()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getFacultades()));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(file => {file && this.downloadDoc(file)}));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( event => { event && this.filesChanged(event)} ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    this.subscription.add(
      this.facultadService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.facultad = {};
            this.facultad = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertFacultad(); break;
            case 'update': this.updateFacultad(); break;
            case 'delete': this.openConfirmationDelete(this.facultad); break;
            case 'changeState': this.openConfirmationChangeState(this.facultad); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('facultad','dialog');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setFiles(null);
    this.uploaderFilesService.updateValidatorFiles(null);
  }

  filesValidator(control: any): { [key: string]: boolean } | null {   
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
      return null;
    }

    const state = formGroup.get('Estado_facu')?.value;
    const files = formGroup.get('files')?.value;   
    
    if ( this.modeForm == 'create' ){
      if (files.length === 0 && state === true) {
        return { required: true };
      }
    }else if ( this.modeForm == 'edit'){
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

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
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
            detail: generateMessage(this.namesCrud,inserted.dataInserted,'creado',true,false)
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

  async updateFacultad(isFromChangeState = false ){
    try {

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });
      
      if ( actionUploadDoc.success ) {

        let params = {
          Cod_facultad: this.facultad.Cod_facultad,
          Descripcion_facu: this.fbForm.get('Descripcion_facu')!.value == '' ? this.facultad.Descripcion_facu : this.fbForm.get('Descripcion_facu')!.value,
          Estado_facu: this.modeForm == 'changeState' ? this.facultad.Estado_facu : this.fbForm.get('Estado_facu')!.value,
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
            detail: generateMessage(this.namesCrud,updated.dataUpdated,'actualizado',true,false)
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
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_facu')
      if ( deleted.dataWasDeleted ) {
        this.getFacultades();
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

  async loadDocsWithBinary(facultad: Facultad){
    try {     
      const files = await this.facultadService.getDocumentosWithBinary(facultad.Cod_facultad!)  
      this.uploaderFilesService.setFiles(files);     
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
    this.facultadService.setModeCrud('create')
    this.reset();
    this.facultad = {};
    this.dialog = true; 
  }

  async showForm(){
    try {
      this.reset();
      this.fbForm.patchValue({...this.facultad});
      this.fbForm.get('Estado_facu')?.disable();
      this.fbForm.get('Descripcion_facu')?.disable();
      await this.loadDocsWithBinary(this.facultad);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al visualizar ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }finally{
      this.dialog = true;
    }
  }

  async editForm(){
    try {
      this.reset();
      this.fbForm.patchValue({...this.facultad});
      this.facultad.Estado_facu === true ? this.showAsterisk = true : this.showAsterisk = false;
      await this.loadDocsWithBinary(this.facultad);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    } finally{
      this.dialog = true;
    }
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
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setAction('reset');
    this.fbForm.controls['files'].updateValueAndValidity();
    this.showAsterisk = true;
  }

  changeState(event: any){
    if (event.checked) {
      this.showAsterisk = true;
    }else{
      this.showAsterisk = false;
    }
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  async openConfirmationDeleteSelected(facultadSelected: any){
    const message = mergeNames(this.namesCrud,facultadSelected,true,'Descripcion_facu'); 
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
    this.uploaderFilesService.setAction('reset'); 
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
          this.modeForm = 'changeState';
          await this.updateFacultad(true)
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
      if ( this.modeForm == 'create' ) {
        //modo creacion
        await this.insertFacultad()
      }else{
        //modo edit
        await this.updateFacultad();
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
