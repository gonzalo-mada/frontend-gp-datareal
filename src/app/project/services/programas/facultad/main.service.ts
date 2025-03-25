import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { Facultad } from 'src/app/project/models/programas/Facultad';
import { BackendFacultadesService } from './backend.service';
import { FilesFacultadesService } from './files.service';
import { FormFacultadesService } from './form.service';
import { TableFacultadesService } from './table.service';
import { HistorialActividadService } from '../../components/historial-actividad.service';
@Injectable({
    providedIn: 'root'
})

export class FacultadesMainService {

    namesCrud: NamesCrud = {
        singular: 'facultad',
        plural: 'facultades',
        articulo_singular: 'la facultad',
        articulo_plural: 'las facultades',
        genero: 'femenino'
    };
    messages: Message[] = [{ severity: 'info', summary: 'Atención:', detail: `Si ${this.namesCrud.articulo_singular} está ${this.namesCrud.genero === 'masculino' ? 'asociado' : 'asociada'} a un programa, solo será posible actualizar documentos.` }]

    facultades: Facultad[] = [];
    facultad: Facultad = {};
    isFromChangeState: boolean = false;

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendFacultadesService,
        private confirmationService: ConfirmationService,
        private files: FilesFacultadesService,
        private form: FormFacultadesService,
        private messageService: MessageServiceGP,
        private table: TableFacultadesService,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
        this.files.initFiles();
        this.getFacultades(false);
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Facultad | null){
        this.form.modeForm = mode;
        if (data) this.facultad = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'changeState': this.openConfirmationChangeState(); break;
            case 'historial': this.openHistorialActividad(); break;
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

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.facultades.length, this.namesCrud);
    }

    async getFacultades(showCountTableValues: boolean = true): Promise<Facultad[]>{
        this.facultades = await this.backend.getFacultades(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.facultades;
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','facultad')
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','facultad')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('show',this.facultad);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.facultad);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','facultad')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('edit',this.facultad);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.facultad);
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
    
                const response = await this.backend.insertFacultad(params, this.namesCrud);
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
            this.getFacultades(false);
            this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async updateForm(){
        try {
            if (this.isFromChangeState) {
                await this.files.loadDocsWithBinary(this.facultad);
            }
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader) {
                let params = {
                    Cod_facultad: this.facultad.Cod_facultad,
                    Descripcion_facu: this.form.fbForm.get('Descripcion_facu')!.value == '' ? this.facultad.Descripcion_facu : this.form.fbForm.get('Descripcion_facu')!.value,
                    Sigla_facu: this.form.fbForm.get('Sigla_facu')!.value == '' ? this.facultad.Sigla_facu : this.form.fbForm.get('Sigla_facu')!.value,
                    Estado_facu: this.modeForm == 'changeState' ? this.facultad.Estado_facu : this.form.fbForm.get('Estado_facu')!.value,
                    docsToUpload: responseUploader.docsToUpload,
                    docsToDelete: responseUploader.docsToDelete,
                    isFromChangeState : this.isFromChangeState,
                    aux: this.facultad
                };
                
                const response = await this.backend.updateFacultad(params, this.namesCrud);
                
                if ( response && response.dataWasUpdated && response.dataWasUpdated !== 0 ) {
                    if (response.dataWasUpdated === 1) {
                        this.messageService.add({
                            key: 'main',
                            severity: 'success',
                            detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                        });
                    }else{
                        this.messageService.add({
                            key: 'main',
                            severity: 'info',
                            detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',false,false)
                        });
                    }
                }
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getFacultades(false);
            this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: Facultad[]){
        try {
            const response = await this.backend.deleteFacultad(dataToDelete,this.namesCrud);
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
            this.getFacultades(false);
            this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.facultad.Descripcion_facu}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.facultad);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_facu');
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
        const state = this.facultad.Estado_facu;
        const action = state ? 'desactivar' : 'activar';
        this.confirmationService.confirm({
          header: 'Confirmar',
          message: `Es necesario confirmar la acción para <b>${action}</b> ${this.namesCrud.articulo_singular} <b>${this.facultad.Descripcion_facu}</b>. ¿Desea confirmar?`,
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

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }


}