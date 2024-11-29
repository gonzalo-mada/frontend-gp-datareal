import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { BackendUnidadAcadService } from './backend.service';
import { FilesUnidadesAcadService } from './files.service';
import { FormUnidadesAcadService } from './form.service';
import { TableUnidadesAcadService } from './table.service';
import { Facultad } from 'src/app/project/models/programas/Facultad';

@Injectable({
    providedIn: 'root'
})

export class UnidadesAcadMainService {

    namesCrud: NamesCrud = {
        singular: 'unidad académica',
        plural: 'unidades académicas',
        articulo_singular: 'la unidad académica',
        articulo_plural: 'las unidades académicas',
        genero: 'femenino'
    };
    messages: Message[] = [{ severity: 'info', summary: 'Atención:', detail: `Si ${this.namesCrud.articulo_singular} está ${this.namesCrud.genero === 'masculino' ? 'asociado' : 'asociada'} a un programa, solo será posible actualizar documentos.` }]

    unidadesAcad: UnidadAcademica[] = [];
    unidadAcad: UnidadAcademica = {};
    facultades: Facultad[] = [];

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendUnidadAcadService,
        private confirmationService: ConfirmationService,
        private files: FilesUnidadesAcadService,
        private form: FormUnidadesAcadService,
        private messageService: MessageServiceGP,
        private table: TableUnidadesAcadService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: UnidadAcademica | null){
        this.form.modeForm = mode;
        if (data) this.unidadAcad = {...data};
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

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.unidadesAcad.length, this.namesCrud);
    }

    reset(){
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.table.resetSelectedRows();
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    async getUnidadesAcademicas(showCountTableValues: boolean = true): Promise<UnidadAcademica[]>{
        this.unidadesAcad = await this.backend.getUnidadesAcademicas(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.unidadesAcad;
    }

    async getFacultades(): Promise<Facultad[]>{
        this.facultades = await this.backend.getFacultades();
        return this.facultades;
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','unidadAcad')
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','unidadAcad')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('show',this.unidadAcad);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.unidadAcad);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','unidadAcad')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('edit',this.unidadAcad);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.unidadAcad);
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
                console.log("params",params);
                const response = await this.backend.insertUnidadAcademica(params, this.namesCrud);
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
            this.getUnidadesAcademicas(false);
            this.reset();
        }
    }

    async updateForm(){
        try {
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                const { files, ...formData } = this.form.fbForm.value;
                let params = {
                    ...formData,
                    Cod_unidad_academica: this.unidadAcad.Cod_unidad_academica,
                    docsToUpload: responseUploader.docsToUpload,
                    docsToDelete: responseUploader.docsToDelete,
                };
                if (!params.aux) {
                    console.log("entré a este caso.");
                    params = {
                        ...params,
                        aux: this.unidadAcad
                    }
                }
                console.log("params update",params);
                const response = await this.backend.updateUnidadAcademica(params, this.namesCrud);
                
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
            this.getUnidadesAcademicas(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: UnidadAcademica[]){
        try {
            const response = await this.backend.deleteUnidadAcademica(dataToDelete,this.namesCrud);
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
            this.getUnidadesAcademicas(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.unidadAcad.Descripcion_ua}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.unidadAcad);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_ua');
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

}