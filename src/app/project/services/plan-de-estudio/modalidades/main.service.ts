import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { Modalidad } from 'src/app/project/models/plan-de-estudio/Modalidad';
import { BackendModalidadService } from './backend.service';
import { FormModalidadService } from './form.service';
import { TableModalidadService } from './table.service';
import { HistorialActividadService } from '../../components/historial-actividad.service';

@Injectable({
    providedIn: 'root'
})

export class ModalidadMainService {

    namesCrud: NamesCrud = {
        singular: 'modalidad',
        plural: 'modalidades',
        articulo_singular: 'la modalidad',
        articulo_plural: 'las modalidades',
        genero: 'femenino'
    };

    modalidades: Modalidad[] = [];
    modalidad: Modalidad = {};

    //MODAL
    dialogForm: boolean = false;

    constructor(
        private backend: BackendModalidadService,
        private confirmationService: ConfirmationService,
        private form: FormModalidadService,
        private messageService: MessageServiceGP,
        private table: TableModalidadService,
        private historialActividad: HistorialActividadService
    ) {
        this.form.initForm();
    }

    get modeForm() {
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Modalidad | null) {
        this.form.modeForm = mode;
        if (data) this.modalidad = { ...data };
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'historial': this.openHistorialActividad(); break;
        }
    }

    reset() {
        this.form.resetForm();
        this.table.resetSelectedRows();
    }

    emitResetExpandedRows() {
        this.table.emitResetExpandedRows();
    }

    async getModalidades(showCountTableValues: boolean = true): Promise<Modalidad[]> {
        this.modalidades = await this.backend.getModalidades(this.namesCrud);
        if (showCountTableValues) this.backend.countTableRegisters(this.modalidades.length, this.namesCrud);
        return this.modalidades;
    }

    async createForm() {
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm() {
        this.form.resetForm();
        this.form.setForm('show', this.modalidad);
        this.dialogForm = true;
    }

    async editForm() {
        this.form.resetForm();
        this.form.setForm('edit', this.modalidad);
        this.dialogForm = true;
    }

    async insertForm() {
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertModalidad(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud, response.dataInserted, 'creado', true, false)
                });
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.dialogForm = false;
            this.getModalidades(false);
            this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async updateForm() {
        try {
            let params = {
                ...this.form.fbForm.value,
                Cod_modalidad: this.modalidad.Cod_modalidad
            };
            const response = await this.backend.updateModalidad(params, this.namesCrud);
            if (response && response.dataWasUpdated && response.dataWasUpdated !== 0 ) {
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
        } catch (error) {
            console.log(error);
        } finally {
            this.dialogForm = false;
            this.getModalidades(false);
            this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: Modalidad[]) {
        try {
            const response = await this.backend.deleteModalidad(dataToDelete, this.namesCrud);
            if (response && response.notDeleted.length !== 0) {
                for (let i = 0; i < response.notDeleted.length; i++) {
                    const element = response.notDeleted[i];
                    this.messageService.add({
                        key: 'main',
                        severity: 'warn',
                        summary: `Error al eliminar ${this.namesCrud.singular}`,
                        detail: element.messageError,
                        sticky: true
                    });
                }
            }
            if (response && response.deleted.length !== 0) {
                const message = mergeNames(null, response.deleted, false, 'data');
                if (response.deleted.length > 1) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud, message, 'eliminados', true, true)
                    });
                } else {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud, message, 'eliminado', true, false)
                    });
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.getModalidades(false);
            this.historialActividad.refreshHistorialActividad();
            this.table.resetSelectedRows();
        }
    }

    async openConfirmationDelete() {
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.modalidad.Descripcion_modalidad}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = [];
                dataToDelete.push(this.modalidad);
                await this.deleteRegisters(dataToDelete);
            }
        });
    }

    async openConfirmationDeleteSelected() {
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud, data, true, 'Descripcion_modalidad');
        this.confirmationService.confirm({
            header: 'Confirmar',
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
        });
    }

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

}