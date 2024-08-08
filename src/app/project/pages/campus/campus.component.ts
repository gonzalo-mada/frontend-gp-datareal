import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { Campus } from '../../models/Campus';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { SystemService } from 'src/app/base/services/system.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { CampusService } from '../../services/campus.service';

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

export class CampusComponent implements OnInit {

  resetQueueUploaderEmitter = new EventEmitter<void>();
  resetSelectedRowsEmitter = new EventEmitter<void>();
  @Output() actionDelete = new EventEmitter<any>();

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
  extrasDocs : any = {};
  _files: any[] = [];
  selectedRows: any[] = [];

  public fbForm : FormGroup = this.fb.group({
    Estado_campus: [true, Validators.required],
    Descripcion_campus: ['', Validators.required],
    files: [[], this.filesValidator.bind(this)]
  })

  constructor(private campusService: CampusService,
              private confirmationService: ConfirmationService,
              private errorTemplateHandler: ErrorTemplateHandler,
              private fb: FormBuilder,
              private messageService: MessageService,
              private systemService: SystemService,
              private commonUtils: CommonUtils
  ){}

  async ngOnInit() {
    this.cols = [
      { field: 'nombre', header: 'Nombre' },
      { field: 'estado', header: 'Estado' },
      { field: 'accion', header: 'Acciones' }
    ];

    this.globalFiltros = [ 'nombre' ]
    this.dataKeyTable = 'Cod_campus';
    await this.getCampuses();
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

      this.extrasDocs = {
        Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value
      }

      const actionUploadDoc: ActionUploadDoc = await new Promise( (resolve , reject) => {
        this.triggerUpload = { resolve , reject }
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
      this.extrasDocs = {
        Cod_campus: campus.Cod_campus,
        Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value
      }

      const actionUploadDoc: ActionUploadDoc = await new Promise( (resolve , reject) => {
        this.triggerUpload = { resolve , reject }
      });
       

      if ( actionUploadDoc.success ) {

        let params = {
          Cod_campus: campus.Cod_campus,
          Descripcion_campus: this.fbForm.get('Descripcion_campus')!.value == '' ? campus.Descripcion_campus : this.fbForm.get('Descripcion_campus')!.value,
          Estado_campus: this.mode == 'activate' ? campus.Estado_campus : this.fbForm.get('Estado_campus')!.value,
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

  async cargarDocumentos(Cod_campus: any) {
    try {
      let res = await this.campusService.getDocumentosCampus(Cod_campus);
      return res      
    } catch (e:any) {
        this.errorTemplateHandler.processError(
          e, {
            notifyMethod: 'alert',
            summary: 'Error al cargar documentos',
            message: e.message,
        });
      }
  }

  async loadDocsWithBinary(campus: Campus){
    try {     
      const files = await this.campusService.getDocumentosWithBinaryCampus(campus.Cod_campus!)
      this.fbForm.patchValue({ files });
      this.filesChanged(files);
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



  actionMode(event: any){
    switch (event.mode) {
      case 'create':
        this.openCreate()
      break;
      case 'show':
        this.openShow(event.data)
      break;
      case 'edit':
        this.openEdit(event.data)
      break;
      case 'delete':
        this.openConfirmationDeleteCampus(event.data)
      break;
      case 'activate':
        this.openConfirmationActivateCampus(event.data)
      break;
    }
  }
  
  openCreate(){
    this.mode = 'create';
    this.extrasDocs = {};
    this.triggerUpload = {};
    this.resetQueueUploaderEmitter.emit();
    this.reset();
    this.campus = {};
    this.dialog = true; 
  }

  async openShow(campus: any) {
    this.mode = 'show'
    this.campus = {...campus}
    let res = await this.cargarDocumentos(this.campus.Cod_campus)
    this._files = res;
    this.dialog = true;
  }

  async openEdit(campus: any){
    this.mode = 'edit';
    this.extrasDocs = {};
    this.triggerUpload = {} ;
    this.resetQueueUploaderEmitter.emit();
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
    this.resetSelectedRowsEmitter.emit();
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

  actionSelectRow(event: any){
    this.selectedRows = event
  }

  changeEstadoCampus(event : any){
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  async openConfirmationDeleteSelectedCampus(campusSelected: Campus[]){

    const message = this.parseNombresCampus(campusSelected);
    //TODO: ERROR AL CREAR UN CAMPUS DESACTIVADO CON ARCHIVOS, LUEGO DESEO ACTIVAR Y TIRA ERROR DE MISMO DOCUMENTO
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
            this.getCampuses();
            this.reset();
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

  async openConfirmationActivateCampus(campus: any){
    this.resetQueueUploaderEmitter.emit();
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para activar el campus <b>${campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'campus',
      acceptButtonStyleClass: 'p-button-success p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
                  
          //TODO: ARREGLAR COMPORTAMIENTO MODAL DESDE CELULAR
          let res = await this.cargarDocumentos(campus.Cod_campus)          
          this.fbForm.patchValue({files : res})

          this.mode = 'activate';
          if (res.length != 0 ) {

            const updatedCampus = {
              Cod_campus: campus.Cod_campus,
              Descripcion_campus: campus.Descripcion_campus,
              Estado_campus: campus.Estado_campus === false ? true : campus.Estado_campus
            }
            
            let res = await this.updateCampus( updatedCampus )

            if (res) {
              this.messageService.add({
                key: 'campus',
                severity: 'success',
                detail: `Campus ${updatedCampus.Descripcion_campus} activado exitosamente`,
              });
            }
            
          }else{
            this.messageService.add({
              key: 'campus',
              severity: 'error',
              detail: `Campus ${campus.Descripcion_campus} no es posible activarlo sin documentos adjuntos.`,
            });
          }     
          this.getCampuses();

        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: 'Error al activar campus',
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
    this.systemService.loading(true);
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
      this.systemService.loading(false);
      this.dialog = false;
    }

  }



}
