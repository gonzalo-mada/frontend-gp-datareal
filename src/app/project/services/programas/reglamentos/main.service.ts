import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { FormReglamentosService } from './form.service';
import { FilesReglamentosService } from './files.service';
import { BackendReglamentosService } from './backend.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { TableReglamentosService } from './table.service';
@Injectable({
    providedIn: 'root'
})

export class ReglamentosMainService {

    namesCrud: NamesCrud = {
        singular: 'reglamento',
        plural: 'reglamentos',
        articulo_singular: 'el reglamento',
        articulo_plural: 'los reglamentos',
        genero: 'masculino'
    }
    messages: Message[] = [{ severity: 'info', summary: 'Atención:', detail: `Si ${this.namesCrud.articulo_singular} está ${this.namesCrud.genero === 'masculino' ? 'asociado' : 'asociada'} a un programa, solo será posible actualizar documentos.` }]

    reglamentos: Reglamento[] = [];
    reglamento: Reglamento = {};

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendReglamentosService,
        private confirmationService: ConfirmationService,
        private files: FilesReglamentosService,
        private form: FormReglamentosService,
        private messageService: MessageServiceGP,
        private table: TableReglamentosService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Reglamento | null){
        this.form.modeForm = mode;
        if (data) this.reglamento = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'rowExpandClick': await this.clickRowExpandTablePrograma(); break;
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
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.reglamentos.length, this.namesCrud);
    }

    async getReglamentos(showCountTableValues: boolean = true): Promise<Reglamento[]>{
        this.reglamentos = await this.backend.getReglamentosBackend(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.reglamentos;
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','reglamentos');
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','reglamentos');
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('show',this.reglamento);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.reglamento);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','reglamentos');
        this.table.emitResetExpandedRows();
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('edit',this.reglamento);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.reglamento);
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
                const response = await this.backend.insertReglamentoBackend(params, this.namesCrud);
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
            this.getReglamentos(false);
            this.table.emitRefreshTablesReglamentos();
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
                    Cod_reglamento: this.reglamento.Cod_reglamento,
                    docsToUpload: responseUploader.docsToUpload, 
                    docsToDelete: responseUploader.docsToDelete  
                }
                const response = await this.backend.updateReglamentoBackend(params, this.namesCrud);
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
            this.getReglamentos(false);
            this.table.emitRefreshTablesReglamentos();
            this.reset();
        }
    }

    async deleteReglamentos(dataToDelete: Reglamento[]){
        try {
            const response = await this.backend.deleteReglamentoBackend(dataToDelete,this.namesCrud);
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
            this.getReglamentos(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.reglamento.Descripcion_regla}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let reglamentoToDelete = []
                reglamentoToDelete.push(this.reglamento);
                await this.deleteReglamentos(reglamentoToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_regla');
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
                await this.deleteReglamentos(data);
            }
        }) 
    }

    async clickRowExpandTablePrograma(){
        await this.files.setContextUploader('show','servicio','reglamentos');
        this.files.resetLocalFiles();
        await this.files.loadDocsWithBinary(this.reglamento)
    }

}