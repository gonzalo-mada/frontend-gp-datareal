import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { BackendCampusService } from './backend.service';
import { FilesCampusService } from './files.service';
import { FormCampusService } from './form.service';
import { TableCampusService } from './table.service';
import { Campus } from 'src/app/project/models/programas/Campus';
@Injectable({
    providedIn: 'root'
})

export class CampusMainService {

    namesCrud: NamesCrud = {
        singular: 'campus',
        plural: 'campus',
        articulo_singular: 'el campus',
        articulo_plural: 'los campus',
        genero: 'masculino'
    };
    messages: Message[] = [{ severity: 'info', summary: 'Atención:', detail: `Si ${this.namesCrud.articulo_singular} está ${this.namesCrud.genero === 'masculino' ? 'asociado' : 'asociada'} a un programa, solo será posible actualizar documentos.` }]

    campuses: Campus[] = [];
    campus: Campus = {};
    isFromChangeState: boolean = false;

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendCampusService,
        private confirmationService: ConfirmationService,
        private files: FilesCampusService,
        private form: FormCampusService,
        private messageService: MessageServiceGP,
        private table: TableCampusService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Campus | null){
        this.form.modeForm = mode;
        if (data) this.campus = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'changeState': this.openConfirmationChangeState(); break;
        }
    }

    reset(){
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.table.resetSelectedRows();
        this.isFromChangeState = false
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    async getCampus(showCountTableValues: boolean = true): Promise<Campus[]>{
        this.campuses = await this.backend.getCampus(this.namesCrud);
        if (showCountTableValues) this.backend.countTableRegisters(this.campuses.length, this.namesCrud);
        return this.campuses;
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','campus')
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','campus')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('show',this.campus);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.campus);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','campus')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('edit',this.campus);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.campus);
    }

    async insertForm(){
        try {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const { files, ...formData } = this.form.fbForm.value;
                let params = {
                    ...formData,
                    docsToUpload: responseUploader.docsToUpload
                };
    
                const response = await this.backend.insertCampus(params, this.namesCrud);
                if (response && response.dataWasInserted) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                    });
                }
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getCampus(false);
            this.reset();
        }
    }

    async updateForm(){
        try {
            if (this.isFromChangeState) {
                await this.files.loadDocsWithBinary(this.campus);
            }
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                let params = {
                    Cod_campus: this.campus.Cod_campus,
                    Descripcion_campus: this.form.fbForm.get('Descripcion_campus')!.value == '' ? this.campus.Descripcion_campus : this.form.fbForm.get('Descripcion_campus')!.value,
                    Estado_campus: this.modeForm == 'changeState' ? this.campus.Estado_campus : this.form.fbForm.get('Estado_campus')!.value,
                    docsToUpload: responseUploader.docsToUpload,
                    docsToDelete: responseUploader.docsToDelete,
                    isFromChangeState : this.isFromChangeState,
                    aux: this.campus
                };
                
                const response = await this.backend.updateCampus(params, this.namesCrud);
                
                if (response && response.dataWasUpdated) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                    });
                }
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getCampus(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: Campus[]){
        try {
            const response = await this.backend.deleteCampus(dataToDelete,this.namesCrud);
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
            this.getCampus(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.campus);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_campus');
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
                await this.deleteRegisters(data);
            }
        }) 
    }

    openConfirmationChangeState(){
        const state = this.campus.Estado_campus;
        const action = state ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
          header: 'Confirmar',
          message: `Es necesario confirmar la acción para <b>${action}</b> ${this.namesCrud.articulo_singular} <b>${this.campus.Descripcion_campus}</b>. ¿Desea confirmar?`,
          acceptLabel: 'Si',
          rejectLabel: 'No',
          icon: 'pi pi-exclamation-triangle',
          key: 'main-gp',
          acceptButtonStyleClass: 'p-button-success p-button-sm',
          rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
          accept: async () => {
            this.isFromChangeState = true;
            await this.updateForm()
          }
        })    
      }


}