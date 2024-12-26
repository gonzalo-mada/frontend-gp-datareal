import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { RangoAG } from 'src/app/project/models/plan-de-estudio/RangoAG';
import { BackendRangosAGService } from './backend.service';
import { FormRangosAGService } from './form.service';
import { TableRangosAGService } from './table.service';

@Injectable({
  providedIn: 'root'
})
export class RangosAGMainService {

  namesCrud: NamesCrud = {
    singular: 'rango de aprobación',
    plural: 'rangos de aprobación',
    articulo_singular: 'el rango de aprobación',
    articulo_plural: 'los rangos de aprobación',
    genero: 'masculino'
};

  rangosAG: RangoAG[] = [];
  rangoAG: RangoAG = {};

  dialogForm: boolean = false;

  constructor(
      private backend: BackendRangosAGService,
      private confirmationService: ConfirmationService,
      private form: FormRangosAGService,
      private messageService: MessageServiceGP,
      private table: TableRangosAGService
  ) { 
    this.form.initForm();
  }

  get modeForm() {
    return this.form.modeForm;
  }

  async setModeCrud(mode: ModeForm, data?: RangoAG | null) {
    this.form.modeForm = mode;
    if (data) this.rangoAG = { ...data };
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

  reset() {
    this.form.resetForm();
    this.table.resetSelectedRows();
  }

  emitResetExpandedRows() {
      this.table.emitResetExpandedRows();
  }

  async getRangosAprobacion(showCountTableValues: boolean = true): Promise<RangoAG[]> {
    this.rangosAG = await this.backend.getRangosAprobacion(this.namesCrud);
    if (showCountTableValues) this.backend.countTableRegisters(this.rangosAG.length, this.namesCrud);
    return this.rangosAG;
  }

  async createForm() {
    this.table.emitResetExpandedRows();
    this.form.resetForm();
    this.dialogForm = true;
  }

  async showForm() {
      this.form.resetForm();
      this.form.setForm('show', this.rangoAG);
      this.dialogForm = true;
  }

  async editForm() {
      this.form.resetForm();
      this.form.setForm('edit', this.rangoAG);
      this.dialogForm = true;
  }

  async insertForm() {
    try {
        let params = { ...this.form.fbForm.value };
        console.log(params)
        const response = await this.backend.insertRangoAprobacion(params, this.namesCrud);
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
        this.getRangosAprobacion(false);
        this.reset();
    }
  }

  async updateForm() {
    try {
        let params = {
            ...this.form.fbForm.value,
            Cod_RangoAprobG: this.rangoAG.Cod_RangoAprobG
        };        
        delete params.aux;
        console.log(params);

        const response = await this.backend.updateRangoAprobacion(params, this.namesCrud);
        
        if (response && response.dataWasUpdated) {
            this.messageService.add({
                key: 'main',
                severity: 'success',
                detail: generateMessage(this.namesCrud, response.dataUpdated, 'actualizado', true, false)
            });
        }
    } catch (error) {
        console.log(error);
        console.error('Error recibido:', error);
    } finally {
        this.dialogForm = false;
        this.getRangosAprobacion(false);
        this.reset();
    }
  }

  async deleteRegisters(dataToDelete: RangoAG[]) {
    try {
        const response = await this.backend.deleteRangoAprobacion(dataToDelete, this.namesCrud);
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
        this.getRangosAprobacion(false);
        this.table.resetSelectedRows();
    }
  }

  async openConfirmationDelete() {
    this.confirmationService.confirm({
        header: 'Confirmar',
        message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.rangoAG.Descripcion_RangoAprobG}</b>. ¿Desea confirmar?`,
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: 'pi pi-exclamation-triangle',
        key: 'main-gp',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
        accept: async () => {
            let dataToDelete = [];
            dataToDelete.push(this.rangoAG);
            await this.deleteRegisters(dataToDelete);
        }
    });
}

async openConfirmationDeleteSelected() {
    const data = this.table.selectedRows;
    const message = mergeNames(this.namesCrud, data, true, 'Descripcion_RangoAprobG');
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

}