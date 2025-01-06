import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { FormMencionesService } from './form.service';
import { FilesMencionesService } from './files.service';
import { BackendMencionesService } from './backend.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { TableMencionesService } from './table.service';

@Injectable({
  providedIn: 'root'
})
export class MencionesMainService {
    namesCrud: NamesCrud = {
    singular: 'mención',
    plural: 'menciones',
    articulo_singular: 'la mención',
    articulo_plural: 'las menciones',
    genero: 'femenino'
}
messages: Message[] = [{ severity: 'info', summary: 'Atención:', detail: `Si ${this.namesCrud.articulo_singular} está ${this.namesCrud.genero === 'masculino' ? 'asociado' : 'asociada'} a un programa, solo será posible actualizar documentos.` }]

menciones: Mencion[] = [];
mencion: Mencion = {};

//MODAL
dialogForm: boolean = false

constructor(
      private backend: BackendMencionesService,
      private confirmationService: ConfirmationService,
      private files: FilesMencionesService,
      private form: FormMencionesService,
      private messageService: MessageServiceGP,
      private table: TableMencionesService
  ){
      this.form.initForm();
      this.files.initFiles();
  }

  get modeForm(){
      return this.form.modeForm;
  }

  async setModeCrud(mode: ModeForm, data?: Mencion | null){
    this.form.modeForm = mode;
    if (data) this.mencion = {...data};
    switch (mode) {
        case 'create': this.createForm(); break;
        case 'show': await this.showForm(); break;
        case 'edit': await this.editForm(); break;
        case 'insert': await this.insertForm(); break;
        case 'update': await this.updateForm(); break;
        case 'delete': await this.openConfirmationDelete(); break;
        case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
        // case 'rowExpandClick': await this.clickRowExpandTablePrograma(); break;
    }
}

reset(){
    this.files.resetLocalFiles();
    this.form.resetForm();
    this.table.resetSelectedRows();
}

emitResetExpandedRows(){
    this.table.emitResetExpandedRows();
}

countTableValues(value?: number){
    value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.menciones.length, this.namesCrud);
}

async getMenciones(showCountTableValues: boolean = true): Promise<Mencion[]>{
        this.menciones = await this.backend.getMencionesBackend(this.namesCrud);
        console.log(this.menciones);
        
        if (showCountTableValues) this.countTableValues();
        return this.menciones;
    }
        
async createForm(){
    await this.files.setContextUploader('create','servicio','menciones');
    this.table.emitResetExpandedRows();
    this.form.resetForm();
    this.dialogForm = true;
}

async showForm(){
    await this.files.setContextUploader('show','servicio','menciones');
    this.files.resetLocalFiles();
    this.form.resetForm();
    this.form.setForm('show',this.mencion);
    this.dialogForm = true;
    await this.files.loadDocsWithBinary(this.mencion);
    
}

async editForm(){
    await this.files.setContextUploader('edit','servicio','menciones');
    this.table.emitResetExpandedRows();
    this.files.resetLocalFiles();
    this.form.resetForm();
    this.form.setForm('edit',this.mencion);
    this.dialogForm = true;
    await this.files.loadDocsWithBinary(this.mencion);
}

async insertForm(){
    try {
        const responseUploader = await this.files.setActionUploader('upload');
        if (responseUploader) {
            const { files, ...formData } =  this.form.fbForm.value;
            let params = {
                ...formData,
                docsToUpload: responseUploader.docsToUpload
            };
            const response = await this.backend.insertMencionBackend(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
            }
        }
    } catch (error) {
        console.log(error);
    }finally{
        this.dialogForm = false;
        this.getMenciones(false);
        this.table.emitRefreshTablesMenciones();
        this.reset();
    }

}

async updateForm(){
    try {
        const responseUploader = await this.files.setActionUploader('upload');
        if (responseUploader){
            const { files, ...formData } =  this.form.fbForm.value;
            let params = { 
                ...formData, 
                Cod_mencion: this.mencion.Cod_mencion,
                docsToUpload: responseUploader.docsToUpload, 
                docsToDelete: responseUploader.docsToDelete  
            }
            const response = await this.backend.updateMencionBackend(params, this.namesCrud);
            if (response && response.dataWasUpdated) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
            }
        }
    } catch (error) {
        console.log(error);
    }finally{
        this.dialogForm = false;
        this.getMenciones(false);
        this.table.emitRefreshTablesMenciones();
        this.reset();
    }
}

async deleteMenciones(dataToDelete: Mencion[]){
    try {
        const response = await this.backend.deleteMencionBackend(dataToDelete,this.namesCrud);
        if (response && response.notDeleted.length !== 0) {
            for (let i = 0; i < response.notDeleted.length; i++) {
                const element = response.notDeleted[i];
                this.messageService.add({
                  key: 'main',
                  severity: 'warn',
                  summary:  `Error al eliminar ${this.namesCrud.singular}`,
                  detail: element.messageError,
                  sticky: true
                });
              }
        }
        if (response && response.deleted.length !== 0) {
            const message = mergeNames(null,response.deleted,false,'data');
            if ( response.deleted.length > 1 ){
              this.messageService.add({
                key: 'main',
                severity: 'success',
                detail: generateMessage(this.namesCrud,message,'eliminados',true, true)
              });
            }else{
              this.messageService.add({
                key: 'main',
                severity: 'success',
                detail: generateMessage(this.namesCrud,message,'eliminado',true, false)
              });
            }
        }
    } catch (error) {
        console.log(error);
        
    }finally{
        this.getMenciones(false);
        this.reset();
    }
}

async openConfirmationDelete(){
    this.confirmationService.confirm({
        header: 'Confirmar',
        message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.mencion.Nombre_mencion}</b>. ¿Desea confirmar?`,
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: 'pi pi-exclamation-triangle',
        key: 'main-gp',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
        accept: async () => {
            let mencionToDelete = []
            mencionToDelete.push(this.mencion);
            await this.deleteMenciones(mencionToDelete);
        }
    })
}

async openConfirmationDeleteSelected(){
    const data = this.table.selectedRows;
    const message = mergeNames(this.namesCrud,data,true,'Nombre_mencion');
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
            await this.deleteMenciones(data);
        }
    }) 
}

// async clickRowExpandTablePrograma(){
//     await this.files.setContextUploader('show','servicio','menciones');
//     this.files.resetLocalFiles();
//     await this.files.loadDocsWithBinary(this.mencion)
// }

}