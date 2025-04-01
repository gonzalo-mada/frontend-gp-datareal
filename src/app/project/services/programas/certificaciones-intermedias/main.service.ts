import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { FormCertifIntermediaService } from './form.service';
import { BackendCertifIntermediaService } from './backend.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { TableCertifIntermediaService } from './table.service';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';
import { Subject } from 'rxjs';
import { HistorialActividadService } from '../../components/historial-actividad.service';
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

    private onInsertedData = new Subject<void>();
    onInsertedData$ = this.onInsertedData.asObservable();

    constructor(
        private backend: BackendCertifIntermediaService,
        private confirmationService: ConfirmationService,
        private form: FormCertifIntermediaService,
        private messageService: MessageServiceGP,
        private table: TableCertifIntermediaService,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
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
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.certificaciones.length, this.namesCrud);
    }

    async getCertificacionesIntermedias(showCountTableValues: boolean = true): Promise<CertificacionIntermedia[]>{
        this.certificaciones = await this.backend.getCertificacionIntermedia(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.certificaciones;
    }

    async getCertificacionIntermediaPrograma(codPrograma: number, showCountTableValues: boolean = true): Promise<CertificacionIntermedia[]>{
        let params = { Cod_Programa: codPrograma}
        this.certificaciones = await this.backend.getCertificacionIntermediaPrograma(params,this.namesCrud,false);
        if (showCountTableValues) this.countTableValues();
        return this.certificaciones;
    }

    async createForm(){
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        this.form.setForm('show',this.certificacion);
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        this.form.setForm('edit',this.certificacion);
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertCertificacionIntermedia(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
                this.emitInsertedData();
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getCertificacionesIntermedias(false);
            this.reset();
        }
    }

    async updateForm(){
        try {
            let params = {
                ...this.form.fbForm.value,
                Cod_CertificacionIntermedia: this.certificacion.Cod_CertificacionIntermedia,
            };
            const response = await this.backend.updateCertificacionIntermedia(params, this.namesCrud);
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
            this.getCertificacionesIntermedias(false);
            this.reset();
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
            this.reset();
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

    emitInsertedData(){
        this.onInsertedData.next();
    }

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

}