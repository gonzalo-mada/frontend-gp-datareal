import { Component, OnDestroy, OnInit } from '@angular/core';
import { Reglamento } from '../../../models/programas/Reglamento';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { ReglamentosService } from '../../../services/programas/reglamentos.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';

@Component({
  selector: 'app-reglamentos',
  templateUrl: './reglamentos.component.html',
  styles: [],
  providers: [ReglamentosService]
})

export class ReglamentosComponent implements OnInit, OnDestroy {

  constructor(
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    public reglamentosService: ReglamentosService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  reglamentos: Reglamento[] = [];
  reglamento: Reglamento = {};
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.reglamentosService.modeForm;
  }
   
  async ngOnInit() {
    await this.getReglamentos();
    
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getReglamentos()));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
    this.subscription.add(
      this.reglamentosService.crudUpdate$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.reglamentosService.reglamento = {};
            this.reglamentosService.reglamento = crud.data
          }
            switch (crud.mode) {
              case 'show': this.showForm(); break; 
              case 'edit': this.editForm(); break;
              case 'insert': this.insertReglamento(); break;
              case 'update': this.updateReglamento(); break;
              case 'delete': this.openConfirmationDelete(crud.data); break;
          }
        }
      })
    );
    
    this.menuButtonsTableService.setContext('reglamentos', 'dialog');
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reset();
  }

  async getReglamentos(showCountTableValues: boolean = true){
    try {
      this.reglamentos = <Reglamento[]> await this.reglamentosService.getReglamentos();
      if (showCountTableValues) this.reglamentosService.countTableValues(this.reglamentos.length);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertReglamento(){
    try {
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload', resolve, reject);
      });

      if (actionUploadDoc.success) {
        const { files, ...formData } = this.reglamentosService.fbForm.value;
        let params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload
        };
        const response = await this.reglamentosService.insertReglamento(params);
        if ( response.dataWasInserted ) {
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.reglamentosService.namesCrud,response.dataInserted,'creado',true,false)
          });
        }
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al agregar ${this.reglamentosService.namesCrud.singular}`,
          message: e.detail.error.message.message
        }
      );
    }finally{
      this.dialog = false
      this.getReglamentos(false);
      this.reset();
    }
  }


  async updateReglamento(){
    try {
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload', resolve, reject);
      });

      if (actionUploadDoc.success) {
        const { files, ...formData } = this.reglamentosService.fbForm.value;
        let params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          Cod_reglamento: this.reglamentosService.reglamento.Cod_reglamento,
          aux: this.reglamentosService.fbForm.get('aux')!.value
        };
        const response = await this.reglamentosService.updateReglamento(params);
        if ( response.dataWasUpdated ) {
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.reglamentosService.namesCrud,response.dataUpdated,'actualizado',true,false)
          });
        }
      }

    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.reglamentosService.namesCrud.singular}`,
          message: e.detail.error.message.message,
        }
      );
    }finally{
      this.dialog = false
      this.getReglamentos(false);
      this.reset();
    }
  }

  async deleteReglamentos(dataToDelete: Reglamento[]){
    try {
      this.uploaderFilesService.setContext('delete','mantenedores','reglamentos');
      const response = await this.reglamentosService.deleteReglamento(dataToDelete);
      if (response.notDeleted.length !== 0) {
        for (let i = 0; i < response.notDeleted.length; i++) {
          const element = response.notDeleted[i];
          this.messageService.add({
            key: 'main-gp',
            severity: 'warn',
            summary:  `Error al eliminar ${this.reglamentosService.namesCrud.singular}`,
            detail: element.messageError,
            sticky: true
          });
        }
      }
      if (response.deleted.length !== 0) {
        const message = mergeNames(null,response.deleted,false,'data');
        if ( response.deleted.length > 1 ){
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.reglamentosService.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.reglamentosService.namesCrud,message,'eliminado',true, false)
          });
        }
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.reglamentosService.namesCrud.singular}`,
          message: e.detail.error.message.message
      });
    }finally{
      this.reset();
      this.getReglamentos(false);
    }
  }

  async loadDocsWithBinary(reglamento: Reglamento){
    try {  
      this.uploaderFilesService.setLoading(true,true);  
      const files = await this.reglamentosService.getDocumentosWithBinary(reglamento.Cod_reglamento!)        
      this.uploaderFilesService.setFiles(files);      
      this.reglamentosService.filesChanged(files);
      return files
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      });
    }finally{
      this.uploaderFilesService.setLoading(false); 
    }
  }

  createForm(){
    this.reglamentosService.setModeCrud('create');
    this.uploaderFilesService.setContext('create','mantenedores','reglamentos');
    this.reset();
    this.dialog = true;
  }

  async showForm(){
    try {
      this.uploaderFilesService.setContext('show','mantenedores','reglamentos');
      this.reset();
      this.reglamentosService.fbForm.patchValue({...this.reglamentosService.reglamento});
      this.reglamentosService.fbForm.disable();
      this.dialog = true;
      await this.loadDocsWithBinary(this.reglamentosService.reglamento);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al visualizar formulario de ${this.reglamentosService.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  async editForm(){
    try {
      this.uploaderFilesService.setContext('edit','mantenedores','reglamentos');
      this.reset();
      this.reglamentosService.fbForm.patchValue({...this.reglamentosService.reglamento});
      this.reglamentosService.fbForm.patchValue({aux: this.reglamentosService.reglamento});
      this.dialog = true;
      await this.loadDocsWithBinary(this.reglamentosService.reglamento)
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar formulario de ${this.reglamentosService.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setAction('reset');
    this.reglamentosService.resetForm();
  }

  async openConfirmationDeleteSelected(data: any){
    const message = mergeNames(this.reglamentosService.namesCrud,data,true,'Descripcion_regla'); 
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.deleteReglamentos(data);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.reglamentosService.namesCrud.singular}`,
              message: e.message,
          });
        }
      }
    })
  }

  async openConfirmationDelete(data: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.reglamentosService.namesCrud.articulo_singular} <b>${data.Descripcion_regla}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let reglamentoToDelete = []
          reglamentoToDelete.push(data);
          try {
            await this.deleteReglamentos(reglamentoToDelete);
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${this.reglamentosService.namesCrud.singular}`,
                message: e.message,
            });
          }
      }
    })
  }

  submit() {
    this.modeForm === 'create' ? this.insertReglamento() : this.updateReglamento();
  }
  
}