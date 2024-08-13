import { Component, EventEmitter, OnDestroy, OnInit } from '@angular/core';
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
  docs: DocFromUploader[];
}


@Component({
  selector: 'app-campus',
  templateUrl: './campus.component.html',
  styles: [
  ]
})

export class CampusComponent implements OnInit, OnDestroy {

  resetQueueUploaderEmitter = new EventEmitter<void>();

  campuses: Campus[] = [];
  campus: Campus = {};

  cols: any[] = [];
  selectedCampus: Campus[] = [];
  globalFiltros : any[] = [];
  dataKeyTable : string = '';

  triggerUpload: any = {}; 
  triggerSelected: boolean = false; 
  dialog: boolean = false;
  mode: string = '';

  _files: any[] = [];
  selectedRows: any[] = [];
  selectedRowsService: any[] = [];

  private subscription: Subscription = new Subscription();

  public fbForm : FormGroup = this.fb.group({
    Estado_campus: [true, Validators.required],
    Descripcion_campus: ['', Validators.required],
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

    this.globalFiltros = [ 'Descripcion_campus' ]
    this.dataKeyTable = 'Cod_campus';
    await this.getCampuses();

    this.subscription.add(this.actionsCrudService.selectedRows$.subscribe(selectedRows => {this.selectedRowsService = selectedRows}));
    this.subscription.add(this.actionsCrudService.actionNewRegister$.subscribe( actionTriggered => { actionTriggered && this.openCreate()}));
    this.subscription.add(this.actionsCrudService.actionRefreshTable$.subscribe( actionTriggered => { actionTriggered && this.getCampuses()}));
    this.subscription.add(this.actionsCrudService.actionDownloadDoc$.subscribe( event => { event && this.downloadDoc(event)}));
    this.subscription.add(this.actionsCrudService.updateValidatorFiles$.subscribe( event => { event && this.filesChanged(event)}));
    this.subscription.add(this.actionsCrudService.actionDeleteDocUploader$.subscribe( event => { event && this.openConfirmationDeleteDoc(event)}));
    this.subscription.add(this.actionsCrudService.actionDeleteSelected$.subscribe( actionTriggered => {actionTriggered && this.openConfirmationDeleteSelectedCampus(this.selectedRowsService)}));
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
              this.openConfirmationDeleteCampus(action.data)
            break;
            case 'changeState':
              this.openConfirmationChangeStateCampus(action.data)
            break;
          }
        }
      })
    )
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  filesValidator(control: any): { [key: string]: boolean } | null {   

    const formGroup = control.parent as FormGroup;
    
    if (!formGroup) {
      return null;
    }

    const estadoCampus = formGroup.get('Estado_campus')?.value;
    const files = formGroup.get('files')?.value;   
    
    if ( this.mode == 'create' ){
      if (files.length === 0 && estadoCampus === true) {
        return { required: true };
      }
    }else if ( this.mode == 'edit'){
      if (files.length === 0 && estadoCampus === true) {
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
        this.actionsCrudService.triggerUploadDocsAction(resolve, reject);
      });
    
      if ( actionUploadDoc.success ) {
        let params = {
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.fbForm.get('Estado_campus')!.value,
          docs: actionUploadDoc.docs
        }
        const campusInserted = await this.campusService.insertCampusService( params )
        return campusInserted;
      } 
      
    } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: 'Error al guardar campus',
            message: e.message,
          });
      }
  }

  async updateCampus(campus: Campus ){
    try {

      const extrasDocs = {
        Cod_campus: campus.Cod_campus,
        Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value
      }

      this.actionsCrudService.setExtrasDocs(extrasDocs);

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.actionsCrudService.triggerUploadDocsAction(resolve, reject);
      });

      if ( actionUploadDoc.success ) {

        let params = {
          Cod_campus: campus.Cod_campus,
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value == '' ? campus.Descripcion_campus : this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.mode == 'changeState' ? campus.Estado_campus : this.fbForm.get('Estado_campus')!.value,
          docs: actionUploadDoc.docs
        }
        
        const campusUpdated = await this.campusService.updateCampusService( params )
        return campusUpdated;
      } 

    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al actualizar campus',
          message: e.message,
      });
    }
  }

  async deleteCampus(campusToDelete: Campus[]){
    try {
      let res = await this.campusService.deleteCampusService(campusToDelete);
      return res ;
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al eliminar campus',
          message: e.message,
      });
    } 
  }

  async loadDocsWithBinary(campus: Campus){
    try {     
      const files = await this.campusService.getDocumentosWithBinaryCampus(campus.Cod_campus!)      
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

  parseNombresCampus(campusSelected: Campus[]){
    let nombresCampusSelected = []; 
    for (let i = 0; i < campusSelected.length; i++) {
      const campus = campusSelected[i];
      nombresCampusSelected.push(campus.Descripcion_campus)
    }
    
    let message = '' ;
    if (nombresCampusSelected.length == 1) {
      message = `el campus: <b>${nombresCampusSelected}</b>`;
    } else {
      let nombresConSeparador = nombresCampusSelected.join(', ');
      message = `los campus: <b>${nombresConSeparador}</b>`;
    }
    return message;
  }


  changeEstadoCampus(event : any){
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  async openConfirmationDeleteSelectedCampus(campusSelected: any){
    const message = this.parseNombresCampus(campusSelected);
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'campus',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        
        try {

          let res = await this.deleteCampus(campusSelected);
          if (res) {
            
            this.messageService.add({
              key: 'campus',
              severity: 'success',
              detail: 'Campus eliminados exitosamente',
            });
            this.reset();
            this.getCampuses();
          }
          
                
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: 'Error al eliminar campus',
              message: e.message,
          });
        }
      }
    })
    
  }

  async openConfirmationDeleteCampus(campus: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar el campus <b>${campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'campus',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let campusToDelete = []
          campusToDelete.push(campus);

          try {

            let res = await this.deleteCampus(campusToDelete);
            if (res) {
              this.getCampuses();
              this.messageService.add({
                key: 'campus',
                severity: 'success',
                detail: 'Campus eliminado exitosamente',
              });
            }
            
            
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: 'Error al eliminar campus',
                message: e.message,
            });
          }
          
      }
    })
  }

  openConfirmationChangeStateCampus(campus: any){
    this.actionsCrudService.triggerResetQueueUploaderAction(); 
    const stateCampus = campus.Estado_campus;
    const action = stateCampus ? 'desactivar' : 'activar';
    const actionUpdated = stateCampus ? 'desactivado' : 'activado';
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para <b>${action}</b> el campus <b>${campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'campus',
      acceptButtonStyleClass: 'p-button-success p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          
          let res = await this.loadDocsWithBinary(campus)
          this.mode = 'changeState';
          if ( stateCampus || (res.length != 0  && stateCampus === false) ) {

            const updatedCampus = {
              Cod_campus: campus.Cod_campus,
              Descripcion_campus: campus.Descripcion_campus,
              Estado_campus: stateCampus === false ? true : false
            }
            
            let response = await this.updateCampus( updatedCampus )

            if (response) {
              this.messageService.add({
                key: 'campus',
                severity: 'success',
                detail: `Campus ${updatedCampus.Descripcion_campus} ${actionUpdated} exitosamente`,
              });
            }
            
          }else{
            this.messageService.add({
              key: 'campus',
              severity: 'error',
              detail: `Campus ${campus.Descripcion_campus} no es posible ${action} sin documentos adjuntos.`,
            });
          }     
          this.getCampuses();
        } catch (e: any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al ${action} campus`,
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
      key: 'campus',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.campusService.deleteDocCampus(doc.id);
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
            key: 'campus',
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
        let res = await this.insertCampus()
        if (res) {
          this.getCampuses();
          this.messageService.add({
            key: 'campus',
            severity: 'success',
            detail: 'Campus creado exitosamente',
          });
        }
      }else{
        //modo edit
        let res = await this.updateCampus(this.campus);
        if (res) {
          this.getCampuses();
          this.messageService.add({
            key: 'campus',
            severity: 'success',
            detail: 'Campus actualizado exitosamente',
          });
        }
      }
    } catch (e:any) {
      const action = this.mode === 'create' ? 'guardar' : 'actualizar';
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al ${action} campus`,
          message: e.message,
      });
    } finally {
      this.dialog = false;
    }

  }

}
