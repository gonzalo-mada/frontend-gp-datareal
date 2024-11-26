import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { FormCertifIntermediaService } from './form.service';
import { FilesCertifIntermediaService } from './files.service';
import { BackendCertifIntermediaService } from './backend.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { TableCertifIntermediaService } from './table.service';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';
@Injectable({
    providedIn: 'root'
})

export class CertifIntermediaMainService {

    namesCrud: NamesCrud = {
        singular: 'certificación intermedia',
        plural: 'certificaciones intermedias',
        articulo_singular: 'la certificación intermedia',
        articulo_plural: 'las certificaciones intermedias',
        genero: 'femenino'
    }
    messages: Message[] = [{ severity: 'info', summary: 'Atención:', detail: `Si ${this.namesCrud.articulo_singular} está ${this.namesCrud.genero === 'masculino' ? 'asociado' : 'asociada'} a un programa, solo será posible actualizar documentos.` }]

    certificaciones: CertificacionIntermedia[] = [];
    certificacion: CertificacionIntermedia = {};

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendCertifIntermediaService,
        private confirmationService: ConfirmationService,
        private files: FilesCertifIntermediaService,
        private form: FormCertifIntermediaService,
        private messageService: MessageServiceGP,
        private table: TableCertifIntermediaService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: CertificacionIntermedia | null){
        this.form.modeForm = mode;
        if (data) this.certificacion = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
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

    async getCertificacionesIntermedias(showCountTableValues: boolean = true): Promise<CertificacionIntermedia[]>{
        this.certificaciones = await this.backend.getCertificacionIntermedia(this.namesCrud);
        if (showCountTableValues) this.backend.countTableRegisters(this.certificaciones.length, this.namesCrud);
        return this.certificaciones;
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','certificacion-intermedia')
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','certificacion-intermedia')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('show',this.certificacion);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.certificacion);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','certificacion-intermedia')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('edit',this.certificacion);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.certificacion);
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
    
                const response = await this.backend.insertCertificacionIntermedia(params, this.namesCrud);
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
            this.getCertificacionesIntermedias(false);
            this.table.resetSelectedRows();
            this.files.resetLocalFiles();
        }
    }

    async updateForm(){
        try {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const { files, ...formData } = this.form.fbForm.value;
                let params = {
                    ...formData,
                    Cod_CertificacionIntermedia: this.certificacion.Cod_CertificacionIntermedia,
                    docsToUpload: responseUploader.docsToUpload,
                    docsToDelete: responseUploader.docsToDelete 
                };
    
                const response = await this.backend.updateCertificacionIntermedia(params, this.namesCrud);
                
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
            this.getCertificacionesIntermedias(false);
            this.table.resetSelectedRows();
            this.files.resetLocalFiles();
        }
    }

    async deleteCertificaciones(dataToDelete: CertificacionIntermedia[]){
        try {
            const response = await this.backend.deleteCertificacionIntermedia(dataToDelete,this.namesCrud);
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
            this.getCertificacionesIntermedias(false);
            this.table.resetSelectedRows();
            this.files.resetLocalFiles();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.certificacion.Descripcion_certif_inter}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.certificacion);
                await this.deleteCertificaciones(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_certif_inter');
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
                await this.deleteCertificaciones(data);
            }
        }) 
    }


}