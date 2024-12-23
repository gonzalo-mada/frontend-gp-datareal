import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { BackendTiposSuspensionesService } from './backend.service';
import { FormTiposSuspensionesService } from './form.service';
import { TableTiposSuspensionesService } from './table.service';
@Injectable({
    providedIn: 'root'
})

export class TiposSuspensionesMainService {

    namesCrud: NamesCrud = {
        singular: 'tipo de suspensión',
        plural: 'tipos de suspensiones',
        articulo_singular: 'el tipo de suspensión',
        articulo_plural: 'los tipos de suspensiones',
        genero: 'masculino'
    }

    tipos_susp: Suspension[] = [];
    tipo_susp: Suspension = {};

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendTiposSuspensionesService,
        private confirmationService: ConfirmationService,
        private form: FormTiposSuspensionesService,
        private messageService: MessageServiceGP,
        private table: TableTiposSuspensionesService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Suspension | null){
        this.form.modeForm = mode;
        if (data) this.tipo_susp = {...data};
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
        this.form.resetForm();
        this.table.resetSelectedRows();
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.tipos_susp.length, this.namesCrud);
    }

    async getTiposSuspensiones(showCountTableValues: boolean = true): Promise<Suspension[]>{
        this.tipos_susp = await this.backend.getSuspensiones(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.tipos_susp;
    }

    async createForm(){
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.tipo_susp);
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.tipo_susp);
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertSuspension(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getTiposSuspensiones(false);
            this.reset()
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                ID_TipoSuspension: this.tipo_susp.ID_TipoSuspension
            }
            const response = await this.backend.updateSuspension(params,this.namesCrud);
            if ( response && response.dataWasUpdated ) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getTiposSuspensiones(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: Suspension[]){
        try {
            const response = await this.backend.deleteSuspension(dataToDelete,this.namesCrud);
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
            this.getTiposSuspensiones(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.tipo_susp.Descripcion_TipoSuspension}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.tipo_susp);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_TipoSuspension');
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