import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { CategoriaTp } from 'src/app/project/models/programas/CategoriaTp';
import { BackendCategoriasTpService } from './backend.service';
import { FormCategoriasTpService } from './form.service';
import { TableCategoriasTpService } from './table.service';
import { HistorialActividadService } from '../../components/historial-actividad.service';
@Injectable({
    providedIn: 'root'
})

export class CategoriasTpMainService {

    namesCrud: NamesCrud = {
        singular: 'categoría de tipo de programa',
        plural: 'categorías de tipos de programas',
        articulo_singular: 'la categoría de tipo de programa',
        articulo_plural: 'las categorías de tipos de programas',
        genero: 'femenino'
    };

    categoriasTp: CategoriaTp[] = [];
    categoriaTp: CategoriaTp = {};

    //MODAL
    dialogForm: boolean = false;

    constructor(
        private backend: BackendCategoriasTpService,
        private confirmationService: ConfirmationService,
        private form: FormCategoriasTpService,
        private messageService: MessageServiceGP,
        private table: TableCategoriasTpService,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: CategoriaTp | null){
        this.form.modeForm = mode;
        if (data) this.categoriaTp = {...data};
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

    reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.categoriasTp.length, this.namesCrud);
    }

    async getCategoriasTp(showCountTableValues: boolean = true): Promise<CategoriaTp[]>{
        this.categoriasTp = await this.backend.getCategoriasTp(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.categoriasTp;
    }

    async createForm(){
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.categoriaTp);
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.categoriaTp);
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertCategoriaTp(params, this.namesCrud);
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
            this.getCategoriasTp(false);
            this.reset();
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                Cod_CategoriaTP: this.categoriaTp.Cod_CategoriaTP
            }
            const response = await this.backend.updateCategoriaTp(params,this.namesCrud);
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
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getCategoriasTp(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: CategoriaTp[]){
        try {
            const response = await this.backend.deleteCategoriaTp(dataToDelete,this.namesCrud);
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
            this.getCategoriasTp(false);
            this.historialActividad.refreshHistorialActividad();
            this.table.resetSelectedRows();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.categoriaTp.Descripcion_categoria}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.categoriaTp);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_categoria');
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

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

}