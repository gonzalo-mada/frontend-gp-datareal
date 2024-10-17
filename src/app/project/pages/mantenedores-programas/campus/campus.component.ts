import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActionUploadDoc, Campus,  } from '../../../models/programas/Campus';
import { NamesCrud } from '../../../models/shared/NamesCrud';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { CampusService } from '../../../services/programas/campus.service';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { Context } from 'src/app/project/models/shared/Context';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styles: [
  ]
})

export class CampusComponent implements OnInit, OnDestroy {

  constructor(private campusService: CampusService,
    private confirmationService: ConfirmationService,
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  campuses: Campus[] = [];
  campus: Campus = {};
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;
  showAsterisk: boolean = true;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.campusService.modeForm
  }

  set modeForm(_val){
    this.campusService.modeForm = _val;
  }

  public fbForm : FormGroup = this.fb.group({
    Estado_campus: [true, Validators.required],
    Descripcion_campus: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
    files: [[], this.filesValidator.bind(this)],
    aux: ['']
  })

  async ngOnInit() {
    this.uploaderFilesService.setContext('init-component','mantenedores','campus');
    this.namesCrud = {
      singular: 'campus',
      plural: 'campus',
      articulo_singular: 'el campus',
      articulo_plural: 'los campus',
      genero: 'masculino'
    };
    this.keyPopups = 'campus'
    await this.getCampuses();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.openCreate()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getCampuses()));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.name === 'campus') {
          this.downloadDoc(from.file)
        }
      }
    }));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'campus') {
          this.filesChanged(from.files)
        }
      }
    }));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))

    this.subscription.add(
      this.campusService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.campus = {};
            this.campus = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertCampus(); break;
            case 'update': this.updateCampus(); break;
            case 'delete': this.openConfirmationDelete(this.campus); break;
            case 'changeState': this.openConfirmationChangeState(this.campus); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('campus','dialog');

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
  }

  filesValidator(control: any): { [key: string]: boolean } | null {   
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
      return null;
    }

    const state = formGroup.get('Estado_campus')?.value;
    const files = formGroup.get('files')?.value; 
    
    if ( this.modeForm === 'create' || this.modeForm === 'edit' ){
      if (files.length === 0 && state === true ) {
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

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });
    
      if ( actionUploadDoc.success ) {
        let params = {
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.fbForm.get('Estado_campus')!.value,
          docsToUpload: actionUploadDoc.docsToUpload
        }
        const inserted = await this.campusService.insertCampusService( params )
        
        if ( inserted.dataWasInserted ) {
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,inserted.dataInserted,'creado',true,false)
          });
        }    
      }
    } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: `Error al guardar ${this.namesCrud.singular}`,
            message: e.detail.error.message.message
          });
    }finally{
      this.reset();
      this.getCampuses();
    }
  }

  async updateCampus(isFromChangeState = false ){
    try {

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });

      if ( actionUploadDoc.success ) {

        let params = {
          Cod_campus: this.campus.Cod_campus,
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value == '' ? this.campus.Descripcion_campus : this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.modeForm == 'changeState' ? this.campus.Estado_campus : this.fbForm.get('Estado_campus')!.value,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          isFromChangeState : isFromChangeState,
          aux: this.fbForm.get('aux')!.value
        }
        console.log("params",params);
        
        const updated = await this.campusService.updateCampusService( params )
        
        if ( updated.dataWasUpdated ){
          this.messageService.add({
            key: this.keyPopups,
            severity: 'success',
            detail: generateMessage(this.namesCrud,updated.dataUpdated,'actualizado',true,false)
          });
        }
      } 

    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
      });
    }finally{
      this.reset();
      this.getCampuses();
    }
  }

  async deleteCampus(campusToDelete: Campus[]){
    try {
      this.uploaderFilesService.setContext('delete','mantenedores','campus');
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.campusService.deleteCampusService(campusToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Descripcion_campus')
      if ( deleted.dataWasDeleted ) {
        this.getCampuses();
        if ( campusToDelete.length > 1 ){
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

  async loadDocsWithBinary(campus: Campus){
    try {    
      this.uploaderFilesService.setLoading(true,true); 
      const files = await this.campusService.getDocumentosWithBinary(campus.Cod_campus!)      
      this.uploaderFilesService.setFiles(files);     
      this.filesChanged(files);
      return files
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.message,
      });
    }finally{
      this.uploaderFilesService.setLoading(false);
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
    this.campusService.setModeCrud('create')
    this.uploaderFilesService.setContext('create','mantenedores','campus');
    this.reset();
    this.campus = {};
    this.dialog = true; 
  }

  async showForm(){
    try {
      this.uploaderFilesService.setContext('show','mantenedores','campus');
      this.dialog = true;
      this.fbForm.patchValue({...this.campus});
      this.fbForm.get('Estado_campus')?.disable();
      this.fbForm.get('Descripcion_campus')?.disable();
      await this.loadDocsWithBinary(this.campus);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al visualizar ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  async editForm(){
    try {
      this.uploaderFilesService.setContext('edit','mantenedores','campus');
      this.dialog = true;
      this.fbForm.patchValue({...this.campus});
      this.fbForm.patchValue({aux: this.campus});
      this.fbForm.get('Estado_campus')?.enable();
      this.fbForm.get('Descripcion_campus')?.enable();
      this.campus.Estado_campus === true ? this.showAsterisk = true : this.showAsterisk = false;
      await this.loadDocsWithBinary(this.campus);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
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

  async openConfirmationDeleteSelected(campusSelected: any){
    const message = mergeNames(this.namesCrud,campusSelected,true,'Descripcion_campus'); 
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
          await this.deleteCampus(campusSelected); 
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
    this.uploaderFilesService.setAction('reset'); 
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
          this.modeForm = 'changeState';
          await this.updateCampus( true )
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
        await this.insertCampus()
      }else{
        //modo edit
        await this.updateCampus();
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
