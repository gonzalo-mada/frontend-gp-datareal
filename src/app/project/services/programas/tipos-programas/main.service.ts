import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { CategoriaTp } from 'src/app/project/models/programas/CategoriaTp';
import { BackendTiposProgramasService } from './backend.service';
import { FormTiposProgramasService } from './form.service';
import { TableTiposProgramasService } from './table.service';
import { HistorialActividadService } from '../../components/historial-actividad.service';

@Injectable({
    providedIn: 'root'
})

export class TiposProgramasMainService {

    namesCrud: NamesCrud = {
        singular: 'tipo de programa',
        plural: 'tipos de programas',
        articulo_singular: 'el tipo de programa',
        articulo_plural: 'los tipos de programas',
        genero: 'masculino'
    };

    tiposProg: TipoPrograma[] = [];
    tipoProg: TipoPrograma = {};
    categorias: CategoriaTp[] = [];

    //MODAL
    dialogForm: boolean = false

    constructor(
        private backend: BackendTiposProgramasService,
        private confirmationService: ConfirmationService,
        private form: FormTiposProgramasService,
        private messageService: MessageServiceGP,
        private table: TableTiposProgramasService,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: TipoPrograma | null){
        this.form.modeForm = mode;
        if (data) this.tipoProg = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'historial': await this.openHistorialActividad(); break;
        }
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.tiposProg.length, this.namesCrud);
    }

    reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    async getTiposProgramas(showCountTableValues: boolean = true): Promise<TipoPrograma[]>{
        this.tiposProg = await this.backend.getTiposProgramas(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.tiposProg;
    }

    async getCategoriasTp(): Promise<CategoriaTp[]>{
        this.categorias = await this.backend.getCategoriasTp();
        return this.categorias;
    }

    async createForm(){
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.tipoProg);
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.tipoProg);
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertTipoPrograma(params, this.namesCrud);
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
            this.getTiposProgramas(false);
            this.reset();
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                Cod_tipoPrograma: this.tipoProg.Cod_tipoPrograma
            }
            const response = await this.backend.updateTipoPrograma(params,this.namesCrud);
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
            this.getTiposProgramas(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: TipoPrograma[]){
        try {
            const response = await this.backend.deleteTipoPrograma(dataToDelete,this.namesCrud);
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
            this.getTiposProgramas(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.tipoProg.Descripcion_tp}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.tipoProg);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_tp');
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

    async openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

    async refreshHistorialActividad(){
        await this.historialActividad.refreshHistorialActividad();
    }

}