import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { Subject } from 'rxjs';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { BackendCertifIntermediasPEService } from './backend.service';
import { TableCertifIntermediasPEService } from './table.service';
import { FormCertifIntermediasPEService } from './form.service';

@Injectable({
    providedIn: 'root'
})

export class CertifIntermediasPEMainService {

    namesCrud: NamesCrud = {
        singular: 'certificación intermedia',
        plural: 'certificaciones intermedias',
        articulo_singular: 'la certificación intermedia',
        articulo_plural: 'las certificaciones intermedias',
        genero: 'femenino'
    }

    articulaciones: Articulacion[] = [];
    articulacion: Articulacion = {};
    planes: PlanDeEstudio[] = [];

    message: any = {
        'facultad'  : 'No se encontraron programas para la facultad seleccionada.',
        'programa'  : 'No se encontraron planes de estudios para el programa seleccionado.',
        'plan'      : 'No se encontraron asignaturas para el plan de estudio seleccionado.',
        'certif'    : 'No se encontraron certificaciones intermedias para el programa seleccionado.',
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    //VARS PARA FILTROS DE TABLA
    cod_facultad_selected_notform: number = 0;
    cod_programa_postgrado_selected_notform: number = 0;
    cod_plan_estudio_selected_notform: number = 0;
    showTable: boolean = false
    disabledDropdownPrograma: boolean = true
    disabledDropdownPlanEstudio: boolean = true
    programas_postgrado_notform: any[] = [];
    planes_notform: any[] = [];
    wasFilteredTable: boolean = false;
    certificaciones_pe: any[] = [];

    cod_planestudio_selected: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_programa_selected: number = 0;
    cod_facultad_selected_postgrado: number = 0;

    showTables: boolean = false; 
    showDropdownSelectProgramaPostgrado: boolean = false;
    showDropdownSelectPlanEstudio: boolean = false;

    programas_postgrado: any[] = [];
    certificaciones: any[] = [];
    asignaturas: any[] = [];

    //MODAL
    dialogForm: boolean = false

    private onInsertedData = new Subject<void>();
    onInsertedData$ = this.onInsertedData.asObservable();

    constructor(
        private backend: BackendCertifIntermediasPEService,
        private confirmationService: ConfirmationService,
        private form: FormCertifIntermediasPEService,
        private messageService: MessageServiceGP,
        private table: TableCertifIntermediasPEService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Articulacion | null){
        this.form.modeForm = mode;
        if (data) this.articulacion = {...data};
        
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

    async reset(){
        this.wasFilteredTable = false;
        this.form.resetForm();
        this.table.emitResetExpandedRows();
        this.table.resetSelectedRows();
        this.resetValuesSelected();
        this.hideElements();
        this.clearAllMessages();
    }

    resetValuesSelected(){
        this.cod_planestudio_selected = 0;
        this.cod_programa_postgrado_selected = 0;
        this.cod_programa_selected = 0;
        this.certificaciones = [];
        this.asignaturas = [];
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.articulaciones.length, this.namesCrud);
    }

    async getProgramasPostgradoConCertifIntermediaPorFacultad(showCountTableValues: boolean = true){
        let params = { Cod_facultad: this.cod_facultad_selected_postgrado }
        const response = await this.backend.getProgramasPostgradoConCertifIntermediaPorFacultad(params);
        if (response) {
            this.programas_postgrado = [...response];
            if (this.programas_postgrado.length === 0 ) {
                this.showDropdownSelectProgramaPostgrado = false;
                this.showMessageSinResultadosPrograma('f');
            }else{
              if (showCountTableValues){
                  this.messageService.add({
                    key: 'main',
                    severity: 'info',
                    detail: this.programas_postgrado.length > 1
                      ? `${this.programas_postgrado.length} programas cargados.`
                      : `${this.programas_postgrado.length} programa cargado.`
                  });
              }
              this.showDropdownSelectProgramaPostgrado = true
              this.clearMessagesSinResultados('f');
            }
        }
    }

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true){
        let params = { Cod_Programa: this.cod_programa_postgrado_selected }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.showMessageSinResultadosPlanes('f');
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.planes.length > 1
                    ? `${this.planes.length} planes de estudios cargados.`
                    : `${this.planes.length} plan de estudio cargado.`
                });
            }
            this.clearMessagesSinResultados('f');
          }
        }
    }

    async getAsignaturasPorPlanDeEstudio(showCountTableValues: boolean = true){
        let params = { Cod_plan_estudio: this.cod_planestudio_selected }
        const response = await this.backend.getAsignaturasPorPlanDeEstudio(params);
        if (response) {
            this.asignaturas = [...response];
            if (this.asignaturas.length === 0 ) {
                this.showTables = false;
                this.showMessageSinResultados('f')
            }else{
                if (showCountTableValues){
                    this.messageService.add({
                    key: 'main',
                    severity: 'info',
                    detail: this.asignaturas.length > 1
                        ? `${this.asignaturas.length} asignaturas cargadas.`
                        : `${this.asignaturas.length} asignatura cargada.`
                    });
                }
                this.showTables = true;
                this.clearMessagesSinResultados('f')
            }
        }
    }

    async getCertificacionIntermedia_Prog(showCountTableValues: boolean = true){
        let params = { Cod_Programa: this.cod_programa_postgrado_selected }
        const response = await this.backend.getCertificacionIntermedia_Prog(params);
        if (response) {
          this.certificaciones = [...response];
          if (this.certificaciones.length === 0 ) {
            this.showMessageSinResultadosCertif('f')
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.certificaciones.length > 1
                    ? `${this.certificaciones.length} certificaciones intermedias cargadas.`
                    : `${this.certificaciones.length} certificación intermedia cargada.`
                });
            }
            this.clearMessagesSinResultados('f')
          }
        }
        
    }

    async getProgramasPorFacultadNotForm(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.cod_facultad_selected_notform }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas_postgrado_notform = [...response];
		  if (this.programas_postgrado_notform.length === 0 ) {
			  this.disabledDropdownPrograma = true;
			  this.disabledDropdownPlanEstudio = true;
			  this.showTable = false
              this.showMessageSinResultadosPrograma('m');
		  }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.programas_postgrado_notform.length > 1
                    ? `${this.programas_postgrado_notform.length} programas cargados.`
                    : `${this.programas_postgrado_notform.length} programa cargado.`
                });
            }
            this.clearMessagesSinResultados('m');
            this.disabledDropdownPrograma = false;
		  }
		}
	}

    async getPlanesDeEstudiosPorProgramaNotForm(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.cod_programa_postgrado_selected_notform }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params,needShowLoading);
        if (response) {
          this.planes_notform = [...response];
          if (this.planes_notform.length === 0 ) {
            this.disabledDropdownPlanEstudio = true;
            this.showMessageSinResultadosPrograma('m');
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.planes_notform.length > 1
                    ? `${this.planes_notform.length} planes de estudios cargados.`
                    : `${this.planes_notform.length} plan de estudio cargado.`
                });
            }
            this.disabledDropdownPlanEstudio = false;
            this.clearMessagesSinResultados('m');
          }
        }
    }

    async getCertificacionesPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true): Promise<any>{
        //todo: pendiente esta funcion para llenar tabla.
        //todo: pone el return
    }

    async createForm(){
        await this.reset();
        this.dialogForm = true;
    }

    async showForm(){
        await this.reset();
        this.form.setForm('show',this.articulacion);
        await this.setTables();
        this.showElements();
        this.dialogForm = true;
    }

    async editForm(){
        await this.reset();
        this.form.setForm('edit',this.articulacion);
        await this.setTables();
        this.showElements();
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            let params = { ...this.form.fbForm.value };
            const response = await this.backend.insertArticulacion(params, this.namesCrud);
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
            if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getCertificacionesPorPlanDeEstudio(false)
            this.reset()
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                Cod_Articulacion: this.articulacion.Cod_Articulacion
            }
            const response = await this.backend.updateArticulacion(params,this.namesCrud);
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
            if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getCertificacionesPorPlanDeEstudio(false)
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: Articulacion[]){
        try {
            const response = await this.backend.deleteArticulacion(dataToDelete,this.namesCrud);
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
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.articulacion.Cod_Articulacion}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.articulacion);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Cod_Articulacion');
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

    emitInsertedData(){
        this.onInsertedData.next();
    }

    resetDropdownsFilterTable(){
        this.disabledDropdownPrograma = true
        this.disabledDropdownPlanEstudio = true
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
        this.programas_postgrado_notform = [];
        this.planes_notform = [];
        this.cod_facultad_selected_notform = 0;
        this.showTable = false
    }

    async setTables(){
        this.cod_programa_postgrado_selected = this.articulacion.Cod_Programa_Postgrado_Selected!;
        // this.cod_planestudio_selected = this.articulacion.Cod_Facultad_Selected!;
        this.cod_programa_selected = this.articulacion.Cod_programa_pregrado!;
        this.table.selectedAsignaturaRows = [...this.articulacion.Asignaturas!]
        await Promise.all([
            this.getCertificacionIntermedia_Prog(false),
            this.getPlanesDeEstudiosPorPrograma(false)
            
        ]);
        this.setTablePrograma();
    }

    setTablePrograma(){
        // switch (this.form.modeForm) {
        //     case 'show':
        //         this.programas = this.programas.filter( prog => prog.codPrograma === this.articulacion.Cod_programa_pregrado!)
        //     break;

        //     case 'edit':
        //         let valueIndex: number = 0;
        //         this.programas.forEach((prog , index) => {
        //             if (prog.codPrograma === this.articulacion.Cod_programa_pregrado) {
        //                 valueIndex = index
        //             }
        //         });
        //         this.table.selectedProgramaRows = [this.programas[valueIndex]];
        //     break;
        // }
    }

    showElements(){
        this.showDropdownSelectProgramaPostgrado = true;
        this.showDropdownSelectPlanEstudio = true;
        this.showTables = true;
    }

    hideElements(){
        this.showDropdownSelectProgramaPostgrado = false;
        this.showDropdownSelectPlanEstudio = false;
        this.showTables = false;
    }

    resetArraysWhenChangedDropdownPrograma(){
        this.planes = [];
        this.certificaciones = [];
        this.asignaturas = [];
    }

    resetArraysWhenChangedDropdownPE(){
        this.asignaturas = [];
    }

    resetArraysWhenChangedDropdownFacultad(){
        this.programas_postgrado = [];
        this.planes = [];
        this.asignaturas = [];
    }

    resetWhenChangedDropdownFacultadNotForm(){
        this.showTable = false
        this.disabledDropdownPlanEstudio = true;
        this.disabledDropdownPrograma = true;
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
    }

    resetWhenChangedDropdownProgramaNotForm(){
        this.showTable = false
        this.disabledDropdownPlanEstudio = true;
        this.cod_plan_estudio_selected_notform = 0;
    }

    async setDropdownsFilterTable(){
        this.disabledDropdownPrograma = false;
        this.disabledDropdownPlanEstudio = false;
        this.cod_facultad_selected_notform = this.cod_facultad_selected_postgrado;
        this.cod_programa_postgrado_selected_notform = this.cod_programa_postgrado_selected;
        this.cod_plan_estudio_selected_notform = this.cod_planestudio_selected;
        await this.getProgramasPorFacultadNotForm(false);
        await this.getPlanesDeEstudiosPorProgramaNotForm(false);
    }

    clearAllMessages(){
        this.messagesMantenedor = [];
        this.messagesFormulario = [];
    }

    clearMessagesSinResultados(key: 'm' | 'f'){
        key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
    }

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' | 'plan' | 'certif') {
        const message = { severity: 'warn', detail: this.message[messageType] };
        key === 'm' ? this.messagesMantenedor = [message] : this.messagesFormulario = [message];
        this.messageService.add({
            key: 'main',
            severity: 'warn',
            detail: this.message[messageType]
        });
    }

    showMessageSinResultadosPrograma(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'facultad')
    }

    showMessageSinResultadosPlanes(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'programa')
    }

    showMessageSinResultados(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'plan')
    }

    showMessageSinResultadosCertif(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'certif')
    }


}