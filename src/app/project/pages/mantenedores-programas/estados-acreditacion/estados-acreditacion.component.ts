import { Component, OnDestroy, OnInit } from '@angular/core';
import { EstadosAcreditacion, ActionUploadDoc } from '../../../models/programas/EstadosAcreditacion';
import { Subscription } from 'rxjs';
import { EstadosAcreditacionService } from '../../../services/programas/estados-acreditacion.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';

@Component({
  selector: 'app-estado-acreditacion',
  templateUrl: './estados-acreditacion.component.html',
  styles: [],
  providers: [EstadosAcreditacionService]
})
export class EstadosAcreditacionComponent implements OnInit, OnDestroy {

  constructor(
    private commonUtils: CommonUtils,
    private confirmationService: ConfirmationService,
    public estadosAcreditacionService: EstadosAcreditacionService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService
  ){}

  estadosAcreditacion: EstadosAcreditacion[] = [];
  mode: string = '';
  dialog: boolean = false;

  get modeCrud() {
    return this.estadosAcreditacionService.modeForm;
  }

  private subscription: Subscription = new Subscription();
  
  async ngOnInit() {
    await this.getEstadosAcreditacion();

    //ACTION AGREGAR DESDE MANTENEDOR EA
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getEstadosAcreditacion()));
    this.subscription.add(
      this.estadosAcreditacionService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.estadosAcreditacionService.estadoAcreditacion = {};
            this.estadosAcreditacionService.estadoAcreditacion = crud.data
          }
            switch (crud.mode) {
              case 'show': this.showForm(); break; 
              case 'edit': this.editForm(); break;
              case 'insert': this.insertEstadoAcreditacion(); break;
              case 'update': this.updateEstadoAcreditacion(); break;
              case 'delete': this.openConfirmationDelete(crud.data); break;
            }
          
        }
    }))
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ));
    
    this.menuButtonsTableService.setContext('estado-acreditacion','dialog');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.reset();
  }

  async getEstadosAcreditacion(showCountTableValues: boolean = true){
    try {
      this.estadosAcreditacion = <EstadosAcreditacion[]> await this.estadosAcreditacionService.getEstadosAcreditacion();
      if (showCountTableValues) this.estadosAcreditacionService.countTableValues(this.estadosAcreditacion.length);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertEstadoAcreditacion(){
    try {
      let params = {};
      const { Acreditado } = this.estadosAcreditacionService.fbForm.value;
      if (Acreditado === false) {
        // no requiero docs
        const { files, tiempo: { Cantidad_anios }, ...formData } = this.estadosAcreditacionService.fbForm.value ;
        params = {...formData};
      }else{
        // si requiero docs
        const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
          this.uploaderFilesService.setAction('upload',resolve,reject);
        })

        if (actionUploadDoc.success) {
          const { files, ...formData } = this.estadosAcreditacionService.fbForm.value ;
          params = {
            ...formData,
            docsToUpload: actionUploadDoc.docsToUpload
          }
        }
      }

      const response = await this.estadosAcreditacionService.insertEstadoAcreditacion(params);
      if ( response.dataWasInserted ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.estadosAcreditacionService.namesCrud,response.dataInserted,'creado',true,false)
        });
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al agregar ${this.estadosAcreditacionService.namesCrud.singular}`,
          message: e.detail.error.message.message
        }
      );
    }finally{
      this.dialog = false;
      this.getEstadosAcreditacion(false);
      this.reset();
    }
  }

  async updateEstadoAcreditacion(){
    try {
      let params = {};
      const { switchAcreditado } = this.estadosAcreditacionService.fbForm.value

      if (switchAcreditado == 'NO' ) {
        //no requiero docs
        const { files, ...formData } = this.estadosAcreditacionService.fbForm.value;
        params = {
          ...formData,
          Cod_acreditacion: this.estadosAcreditacionService.estadoAcreditacion.Cod_acreditacion,
          Cod_tiempoacredit: this.estadosAcreditacionService.estadoAcreditacion.tiempo?.Cod_tiempoacredit,
          aux: this.estadosAcreditacionService.fbForm.get('aux')!.value
        };
      }else{
        //si requiero docs
        const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
          this.uploaderFilesService.setAction('upload',resolve,reject);
        });

        if (actionUploadDoc.success) {
          const { files, ...formData } = this.estadosAcreditacionService.fbForm.value; 
          params = {
            ...formData,
            docsToUpload: actionUploadDoc.docsToUpload,
            docsToDelete: actionUploadDoc.docsToDelete,
            Cod_acreditacion: this.estadosAcreditacionService.estadoAcreditacion.Cod_acreditacion,
            Cod_tiempoacredit: this.estadosAcreditacionService.estadoAcreditacion.tiempo?.Cod_tiempoacredit,
            aux: this.estadosAcreditacionService.fbForm.get('aux')!.value
          }
        }
      }

      const response = await this.estadosAcreditacionService.updateEstadoAcreditacion(params);
      if ( response.dataWasUpdated ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.estadosAcreditacionService.namesCrud,response.dataUpdated,'actualizado',true,false)
        });
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.estadosAcreditacionService.namesCrud.singular}`,
          message: e.detail.error.message.message,
        }
      );
    }finally{
      this.dialog = true
      this.getEstadosAcreditacion(false);
      this.reset();
    }
  }

  async deleteEstadoAcreditacion(estadosAcreditacionToDelete: EstadosAcreditacion[]){    
    try {
      this.uploaderFilesService.setContext('delete','mantenedores','estado-acreditacion');
      const response = await this.estadosAcreditacionService.deleteEstadoAcreditacion({estadosAcreditacionToDelete:estadosAcreditacionToDelete});
      if (response.notDeleted.length !== 0) {
        for (let i = 0; i < response.notDeleted.length; i++) {
          const element = response.notDeleted[i];
          this.messageService.add({
            key: 'main-gp',
            severity: 'warn',
            summary:  `Error al eliminar ${this.estadosAcreditacionService.namesCrud.singular}`,
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
            detail: generateMessage(this.estadosAcreditacionService.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.estadosAcreditacionService.namesCrud,message,'eliminado',true, false)
          });
        }
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.estadosAcreditacionService.namesCrud.singular}`,
          message: e.detail.error.message.message
      });
    }finally{
      this.reset();
      this.getEstadosAcreditacion(false);
    } 
  }

  async loadDocsWithBinary(estadoAcreditacion: EstadosAcreditacion){
    try {
      this.uploaderFilesService.setLoading(true,true);
      const files = await this.estadosAcreditacionService.getDocumentosWithBinary({Cod_acreditacion: estadoAcreditacion.Cod_acreditacion});
      this.uploaderFilesService.setFiles(files);
      this.estadosAcreditacionService.filesChanged(files);
      return files;
    } catch (e: any) {
        this.errorTemplateHandler.processError(e, {
          notifyMethod: 'alert',
          summary: 'Error al obtener documentos',
          message: e.detail.error.message.message
        }
      );
    }finally{
      this.uploaderFilesService.setLoading(false); 
    }
  }

  createForm(){
    this.estadosAcreditacionService.setModeCrud('create');
    this.uploaderFilesService.setContext('create','mantenedores','estado-acreditacion');
    this.estadosAcreditacionService.fbForm.get('Nombre_ag_acredit')?.clearValidators();
    this.reset();
    this.dialog = true;
  }

  async showForm(){
    try {
      this.uploaderFilesService.setContext('show','mantenedores','estado-acreditacion');
      this.reset();
      this.estadosAcreditacionService.fbForm.patchValue({...this.estadosAcreditacionService.estadoAcreditacion});
      this.estadosAcreditacionService.yearsDifference = this.estadosAcreditacionService.estadoAcreditacion.tiempo?.Cantidad_anios!;
      this.estadosAcreditacionService.fbForm.disable();
      this.estadosAcreditacionService.showAsterisk = false;
      this.dialog = true; 
      await this.loadDocsWithBinary(this.estadosAcreditacionService.estadoAcreditacion);
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al visualizar formulario de ${this.estadosAcreditacionService.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  async editForm(){
    try {
      this.uploaderFilesService.setContext('edit','mantenedores','estado-acreditacion');
      this.reset();
      const formValues =  this.estadosAcreditacionService.estadoAcreditacion;
      
      if (formValues.tiempo?.Fecha_inicio === '01-01-1900' && formValues.tiempo?.Fecha_termino === '01-01-1900') {
        formValues.tiempo.Fecha_inicio = undefined;
        formValues.tiempo.Fecha_termino = undefined;
      }

      this.estadosAcreditacionService.fbForm.patchValue({...this.estadosAcreditacionService.estadoAcreditacion});
      this.estadosAcreditacionService.fbForm.patchValue({aux: this.estadosAcreditacionService.estadoAcreditacion});

      if (formValues.Fecha_informe === '01-01-1900' ) {
        this.estadosAcreditacionService.fbForm.get('Fecha_informe')?.reset();
      }

      this.estadosAcreditacionService.yearsDifference = this.estadosAcreditacionService.estadoAcreditacion.tiempo?.Cantidad_anios == 0 ? null : this.estadosAcreditacionService.estadoAcreditacion.tiempo?.Cantidad_anios!;
      
      switch (this.estadosAcreditacionService.estadoAcreditacion.Acreditado) {
        case 'SI':
          this.estadosAcreditacionService.enableForm();
          this.uploaderFilesService.enabledButtonSeleccionar();
        break;
        case 'NO':
          this.estadosAcreditacionService.disableForm();
          this.uploaderFilesService.disabledButtonSeleccionar();
        break;
      }
      this.dialog = true;
      await this.loadDocsWithBinary(this.estadosAcreditacionService.estadoAcreditacion)
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al editar formulario de ${this.estadosAcreditacionService.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }
  }

  reset(){
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setAction('reset');
    this.estadosAcreditacionService.resetForm();
  }

  async openConfirmationDeleteSelected(data: any){
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para eliminar ${this.estadosAcreditacionService.namesCrud.articulo_plural}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.deleteEstadoAcreditacion(data);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.estadosAcreditacionService.namesCrud.articulo_plural}`,
              message: e.message,
          });
        }
      }
    })
  }
  
  async openConfirmationDelete(data: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.estadosAcreditacionService.namesCrud.articulo_singular}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let dataToDelete = []
          dataToDelete.push(data);
          try {
            await this.deleteEstadoAcreditacion(dataToDelete);
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${this.estadosAcreditacionService.namesCrud.singular}`,
                message: e.message,
            });
          }
      }
    })
  }

  submit() {
    this.modeCrud === 'create' ? this.insertEstadoAcreditacion() : this.updateEstadoAcreditacion();
  }

}
