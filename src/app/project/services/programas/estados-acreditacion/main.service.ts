import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { BackendEstadosAcreditacionService } from './backend.service';
import { FilesEstadosAcreditacionService } from './files.service';
import { FormEstadosAcreditacionService } from './form.service';
import { TableEstadosAcreditacionService } from './table.service';
import { HistorialActividadService } from '../../components/historial-actividad.service';
@Injectable({
    providedIn: 'root'
})

export class EstadosAcreditacionMainService {

    namesCrud: NamesCrud = {
        singular: 'estado de acreditación',
        plural: 'estados de acreditación',
        articulo_singular: 'el estado de acreditación',
        articulo_plural: 'los estados de acreditación',
        genero: 'masculino'
      }

    estados: EstadosAcreditacion[] = [];
    estado: EstadosAcreditacion = {};

    //MODAL
    dialogForm: boolean = false;

    constructor(
        private backend: BackendEstadosAcreditacionService,
        private confirmationService: ConfirmationService,
        private files: FilesEstadosAcreditacionService,
        private form: FormEstadosAcreditacionService,
        private messageService: MessageServiceGP,
        private table: TableEstadosAcreditacionService,
        private historialActividad: HistorialActividadService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: EstadosAcreditacion | null){
        this.form.modeForm = mode;
        if (data) this.estado = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'rowExpandClick': await this.clickRowExpandTablePrograma(); break;
            case 'historial': this.openHistorialActividad(); break;
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
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.estados.length, this.namesCrud);
    }

    async getEstadosAcreditacion(showCountTableValues: boolean = true): Promise<EstadosAcreditacion[]>{
        this.estados = await this.backend.getEstadosAcreditacion(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.estados;
    }

    async createForm(){
        await this.files.setContextUploader('create','servicio','estado-acreditacion')
        this.table.emitResetExpandedRows();
        this.form.resetForm();
        this.form.fbForm.get('Nombre_ag_acredit')?.clearValidators();
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','estado-acreditacion')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('show',this.estado);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.estado);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','estado-acreditacion')
        this.files.resetLocalFiles();
        this.form.resetForm();
        this.form.setForm('edit',this.estado);
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.estado);
    }

    async insertForm(){
        try {
            const params = await this.setForm('insert');
            const response = await this.backend.insertEstadoAcreditacion(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
                this.table.emitRefreshTablesEA();
            }
            
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            this.getEstadosAcreditacion(false);
            this.reset();
        }
    }

    async updateForm(){
        try {
            const params = await this.setForm('update');
            const response = await this.backend.updateEstadoAcreditacion(params, this.namesCrud);
            if ( response && response.dataWasUpdated && response.dataWasUpdated !== 0 ) {
                if (response.dataWasUpdated === 1) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                    });
                    this.table.emitRefreshTablesEA();
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
            this.getEstadosAcreditacion(false);
            this.reset();
        }
    }

    async setForm(mode: 'insert' | 'update'): Promise<Object> {
        let params = {};
        const { Acreditado } = this.form.fbForm.value;
        switch (mode) {
            case 'insert':
                if (Acreditado === false) {
                    const { files, tiempo: { Cantidad_anios }, ...formData } = this.form.fbForm.value ;
                    params = {...formData};
                }else{
                    const responseUploader = await this.files.setActionUploader('upload');
                    if (responseUploader) {
                        const { files, ...formData } = this.form.fbForm.value ;
                        params = {
                          ...formData,
                          docsToUpload: responseUploader.docsToUpload
                        }
                    }
                }
            break;

            case 'update':
                if (Acreditado === false) {
                    const { files, ...formData } = this.form.fbForm.value;
                    params = {
                        ...formData,
                        Cod_acreditacion: this.estado.Cod_acreditacion,
                        Cod_tiempoacredit: this.estado.tiempo?.Cod_tiempoacredit,
                    }
                }else{
                    const responseUploader = await this.files.setActionUploader('upload');
                    if (responseUploader) {
                        const { files, ...formData } = this.form.fbForm.value ;
                        params = {
                          ...formData,
                          Cod_acreditacion: this.estado.Cod_acreditacion,
                          Cod_tiempoacredit: this.estado.tiempo?.Cod_tiempoacredit,
                          docsToUpload: responseUploader.docsToUpload,
                          docsToDelete: responseUploader.docsToDelete
                        }
                    }
                }
            break;
        }
        return params;
    }

    async deleteRegisters(dataToDelete: EstadosAcreditacion[]){
        try {
            const response = await this.backend.deleteEstadoAcreditacion(dataToDelete,this.namesCrud);
            console.log("response-->",response);
            
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
            this.getEstadosAcreditacion(false);
            this.table.emitRefreshTablesEA();
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.estado.Sigla}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.estado);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Sigla');
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

    calculateYearsDifference(): void {
        const startDate = this.form.fbForm.get('tiempo.Fecha_inicio')?.value;
        const endDate = this.form.fbForm.get('tiempo.Fecha_termino')?.value;
    
        if (startDate && endDate ) {
          
          const start = new Date(this.parseDate(startDate));
          const end = new Date(this.parseDate(endDate));
          
          let years = end.getFullYear() - start.getFullYear();
     
          if (
            end.getMonth() < start.getMonth() ||
            (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
          ) {
            years -= 1;
          }
    
          this.form.yearsDifference = years;      
          this.form.fbForm.patchValue({ tiempo: {Cantidad_anios: this.form.yearsDifference}});
          this.form.fbForm.get('tiempo.Cantidad_anios')?.updateValueAndValidity();
          
          
        } else {
          this.form.yearsDifference = null;
          this.form.fbForm.get('tiempo.Cantidad_anios')?.reset();
          this.form.fbForm.get('tiempo.Cantidad_anios')?.updateValueAndValidity();
        }
    }

    parseDate(dateString: string) {
        // Dividir la cadena de fecha en día, mes y año
        if ( typeof dateString === 'string') {
          const [day, month, year] = dateString.split('-').map(Number);
          return new Date(year, month - 1, day);
        }else{
          return dateString;
        }
    }

    disabledButtonSeleccionar(){
        this.files.disabledButtonSeleccionar();
    }

    enabledButtonSeleccionar(){
        this.files.enabledButtonSeleccionar();
    }

    changeSwitch(event: any){
        const inputAcred = this.form.fbForm.get('Nombre_ag_acredit');
        const fechaInicio = this.form.fbForm.get('tiempo.Fecha_inicio');
        const fechaFin = this.form.fbForm.get('tiempo.Fecha_termino');
        const inputCantidadAnios = this.form.fbForm.get('tiempo.Cantidad_anios');
    
        switch (event.checked) {
          case true:
            inputAcred?.enable();
            fechaInicio?.enable();
            fechaFin?.enable();
            inputCantidadAnios?.enable();
            this.form.showAsterisk = true;
            this.enabledButtonSeleccionar();
          break;
          case false:
            inputAcred?.patchValue('Comisión Nacional de Acreditación CNA Chile');
            inputAcred?.disable();
            fechaInicio?.disable();
            fechaFin?.disable();
            inputCantidadAnios?.disable();
            this.form.yearsDifference = null;
            this.form.showAsterisk = false;
            this.disabledButtonSeleccionar();
          break
        }
        this.form.fbForm.controls['files'].updateValueAndValidity();
    }

    async clickRowExpandTablePrograma(){
        await this.files.setContextUploader('show','servicio','estado-acreditacion');
        this.files.resetLocalFiles();
        await this.files.loadDocsWithBinary(this.estado)
    }

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

}