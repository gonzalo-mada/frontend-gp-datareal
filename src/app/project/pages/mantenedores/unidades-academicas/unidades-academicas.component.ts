import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionUploadDoc, UnidadAcademica } from '../../../models/UnidadAcademica';
import { Facultad } from '../../../models/Facultad';
import { Subscription } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadesAcademicasService } from '../../../services/unidades-academicas.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { FacultadService } from '../../../services/facultad.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Context } from 'src/app/project/models/shared/Context';
// import { noWhitespaceValidator } from '../../configs/form'

@Component({
  selector: 'app-unidades-academicas',
  templateUrl: './unidades-academicas.component.html',
  styles: [
  ]
})
export class UnidadesAcademicasComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private facultadService: FacultadService,
    private fb: FormBuilder,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private unidadesAcademicasService: UnidadesAcademicasService,
    private uploaderFilesService: UploaderFilesService
  ){}

  unidadesAcademicas: UnidadAcademica[] = [];
  unidadAcademica: UnidadAcademica = {};
  facultades: Facultad[] = [];
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.unidadesAcademicasService.modeForm
  }

  set modeForm(_val){
    this.unidadesAcademicasService.modeForm = _val;
  }
 
  public fbForm : FormGroup = this.fb.group({
    Descripcion_ua: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
    Facultad: this.fb.group({
      Cod_facultad: ['', Validators.required],
    }),
    files: [[], this.filesValidator.bind(this)]
  })

  async ngOnInit() {
    this.uploaderFilesService.setContext('mantenedores','unidadAcad') ;
    this.namesCrud = {
      singular: 'unidad académica',
      plural: 'unidades académicas',
      articulo_singular: 'la unidad académica',
      articulo_plural: 'las unidades académicas',
      genero: 'femenino'
    };
    this.keyPopups = 'unidad_academica'
    await this.getUnidadesAcademicas();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.openCreate()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getUnidadesAcademicas()));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.name === 'unidadAcad') {
          this.downloadDoc(from.file)
        }
      }
    }));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( event => { event && this.filesChanged(event)} ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    
    this.subscription.add(
      this.unidadesAcademicasService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.unidadAcademica = {};
            this.unidadAcademica = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertUnidadAcademica(); break;
            case 'update': this.updateUnidadAcademica(); break;
            case 'delete': this.openConfirmationDelete(this.unidadAcademica); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('unidadAcad','dialog');
  }
 
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.updateValidatorFiles(null);
    this.uploaderFilesService.setFiles(null);
  }
 
  filesValidator(control: any): { [key: string]: boolean } | null {  
 
    const formGroup = control.parent as FormGroup;
   
    if (!formGroup) {
      return null;
    }
 
    const files = formGroup.get('files')?.value;  
   
    if ( this.modeForm == 'create' ){
      if (files.length === 0 ) {
        return { required: true };
      }
    }else if ( this.modeForm == 'edit'){
      if (files.length === 0 ) {
        return { required: true };
      }
    }
    return null;
  }

  async getUnidadesAcademicas(){
    try {
      this.unidadesAcademicas = <UnidadAcademica[]> await this.unidadesAcademicasService.logica_getUnidadesAcademicas();
      this.facultades = <Facultad[]> await this.facultadService.getFacultades();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }
 
  async insertUnidadAcademica(){
    try {

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });
      if ( actionUploadDoc.success ) {
        let params = {
          Descripcion_ua: this.fbForm.get('Descripcion_ua')!.value,
          Cod_facultad: this.fbForm.get('Facultad.Cod_facultad')!.value,
          docsToUpload: actionUploadDoc.docsToUpload
        }
        const inserted = await this.unidadesAcademicasService.logica_insertUnidadesAcademicas(params)
        if ( inserted.dataWasInserted ) {
          this.getUnidadesAcademicas();
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
            message: e.detail.error.message.message
          });
      }
  }
 
  async updateUnidadAcademica(){
    try {
  
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });
 
      if ( actionUploadDoc.success ) {
 
        let params = {
          Cod_unidad_academica: this.unidadAcademica.Cod_unidad_academica,
          Descripcion_ua: this.fbForm.get('Descripcion_ua')!.value == '' ? this.unidadAcademica.Descripcion_ua : this.fbForm.get('Descripcion_ua')!.value,
          Cod_facultad: this.fbForm.get('Facultad.Cod_facultad')!.value == '' ? this.unidadAcademica.Facultad?.Cod_facultad : this.fbForm.get('Facultad.Cod_facultad')!.value,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete
        }
       
        const updated = await this.unidadesAcademicasService.logica_updateUnidadesAcademicas(params);
        if ( updated.dataWasUpdated ){
          this.getUnidadesAcademicas();
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
 
  async deleteUnidadAcademica(unidadAcadToDelete: UnidadAcademica[]){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.unidadesAcademicasService.logica_deleteUnidadesAcademicas(unidadAcadToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_ua')
      if ( deleted.dataWasDeleted ) {
        this.getUnidadesAcademicas();
        if ( unidadAcadToDelete.length > 1 ){
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
 
  async loadDocsWithBinary(unidadAcademica: UnidadAcademica){
    try {    
      const files = await this.unidadesAcademicasService.getDocumentosWithBinary(unidadAcademica.Cod_unidad_academica!)  
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
      let blob: Blob = await this.unidadesAcademicasService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento',
          message: e.detail.error.message.message
      });
    }
  }
 
  openCreate(){
    this.unidadesAcademicasService.setModeCrud('create')
    this.reset();
    this.unidadAcademica = {};
    this.dialog = true;
  }
 
  async showForm(){
    try {
      this.reset();
      this.fbForm.patchValue({...this.unidadAcademica});
      this.fbForm.get('Descripcion_ua')?.disable();
      this.fbForm.get('Cod_facultad')?.disable();
      await this.loadDocsWithBinary(this.unidadAcademica);
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
      this.fbForm.patchValue({...this.unidadAcademica});
      await this.loadDocsWithBinary(this.unidadAcademica);
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
      Descripcion_ua: '',
      Cod_facultad: '',
      files: []
    });
    this.fbForm.get('Descripcion_ua')?.enable();
    this.fbForm.get('Cod_facultad')?.enable();
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.setAction('reset');
    this.fbForm.controls['files'].updateValueAndValidity();
  }
  
  async openConfirmationDeleteSelected(unidadAcademicaSelected: any){
    const message = mergeNames(this.namesCrud,unidadAcademicaSelected,true,'Descripcion_ua'); 
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
          await this.deleteUnidadAcademica(unidadAcademicaSelected);
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
  
  async submit() {
    try {
      if ( this.modeForm == 'create' ) {
        //modo creacion
        await this.insertUnidadAcademica()
      }else{
        //modo edit
        await this.updateUnidadAcademica();
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
