import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { RangoAG } from 'src/app/project/models/plan-de-estudio/RangoAG';
import { BackendRangosAGService } from './backend.service';
import { FormRangosAGService } from './form.service';
import { TableRangosAGService } from './table.service';
import { Subject } from 'rxjs';
import { LoadinggpService } from '../../components/loadinggp.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { FacultadesMainService } from '../../programas/facultad/main.service';

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

    message: any = {
        'facultad'  : 'No se encontraron programas para la facultad seleccionada.',
        'programa'  : 'No se encontraron planes de estudios con la opción "¿Tiene rangos de aprobación?" habilitada para el programa seleccionado.',
        'plan'      : 'No se encontraron rangos de aprobación para el plan de estudio seleccionado.',
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];
    column_tableBD: string = 'RA'

    //VARS PARA FILTROS DE TABLA
    cod_facultad_selected_notform: number = 0;
    cod_programa_postgrado_selected_notform: number = 0;
    cod_plan_estudio_selected_notform: number = 0;
    showTable: boolean = false
    disabledDropdownPrograma: boolean = true
    disabledDropdownPlanEstudio: boolean = true
    programas_postgrado_notform: any[] = [];
    planes_notform: any[] = [];

    programas_postgrado: any[] = [];
    planes: any[] = [];

    dialogForm: boolean = false;
    needUpdateHistorial: boolean = false;
    openedFromPageMantenedor: boolean = false;

    private onInsertedData = new Subject<void>();
    onInsertedData$ = this.onInsertedData.asObservable();

    constructor(
        private backend: BackendRangosAGService,
        private confirmationService: ConfirmationService,
        private form: FormRangosAGService,
        private messageService: MessageServiceGP,
        private table: TableRangosAGService,
        private systemService: LoadinggpService,
        private historialActividad: HistorialActividadService,
        private mainFacultad: FacultadesMainService
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
            case 'historial': await this.openHistorialActividad(); break;
        }
    }

    async reset() {
        this.form.resetForm();
        this.table.resetSelectedRows();
        this.clearAllMessages();
        this.resetArraysData();
    }

    resetDropdownsFilterTable(){
        this.clearAllMessages();
        this.disabledDropdownPrograma = true
        this.disabledDropdownPlanEstudio = true
        this.cod_facultad_selected_notform = 0;
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
        this.programas_postgrado_notform = [];
        this.planes_notform = [];
        this.showTable = false
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

    resetArraysWhenChangedDropdownPrograma(){
        this.planes = [];
    }

    resetArraysWhenChangedDropdownFacultad(){
        this.programas_postgrado = [];
        this.planes = [];
    }

    resetArraysData(){
        this.programas_postgrado = [];
    }

    emitResetExpandedRows() {
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.rangosAG.length, this.namesCrud);
    }

    async getProgramasPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.form.cod_facultad_selected_postgrado }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas_postgrado = [...response];
		  if (this.programas_postgrado.length === 0 ) {
            this.form.setStatusControlProgramaPostgrado(false)
            this.showMessageSinResultadosPrograma('f');
		  }else{
            if (showCountTableValues) {
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.programas_postgrado.length > 1
                    ? `${this.programas_postgrado.length} programas cargados.`
                    : `${this.programas_postgrado.length} programa cargado.`
                });
            }
            this.form.setStatusControlProgramaPostgrado(true)
            this.clearMessagesSinResultados('f');
		  }
		}
	}

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.form.cod_programa_postgrado_selected, columna: this.column_tableBD, valor: 1}
        const response = await this.backend.getPlanesDeEstudiosColumnaPorPrograma(params,needShowLoading);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.form.setStatusControlPlanEstudioPostgrado(false);
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
            this.form.setStatusControlPlanEstudioPostgrado(true);
            this.clearMessagesSinResultados('f');
          }
        }
    }

    //INICIO FUNCIONES PARA TABLA DE MANTENEDOR
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
        let params = { Cod_Programa: this.cod_programa_postgrado_selected_notform, columna: this.column_tableBD, valor: 1 }
        const response = await this.backend.getPlanesDeEstudiosColumnaPorPrograma(params,needShowLoading);
        if (response) {
          this.planes_notform = [...response];
          if (this.planes_notform.length === 0 ) {
            this.disabledDropdownPlanEstudio = true;
            this.showMessageSinResultadosPlanes('m');
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

    async getRangosAprobacion(showCountTableValues: boolean = true, needShowLoading = true): Promise<RangoAG[]> {
        let valuesPrincipalControls = {cod_facultad: this.cod_facultad_selected_notform, cod_programa: this.cod_programa_postgrado_selected_notform, cod_plan_estudio: this.cod_plan_estudio_selected_notform}
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform, valuesPrincipalControls }
        this.rangosAG = await this.backend.getRangosAprobacionPorPlanDeEstudio(params,needShowLoading);
        this.rangosAG.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.rangosAG.length !== 0) this.countTableValues();
        return this.rangosAG
    }

    //FIN FUNCIONES PARA TABLA DE MANTENEDOR

    async createForm() {
        await this.reset();
        await this.setPrincipalsControls();
        this.dialogForm = true;
    }

    async showForm() {
        this.form.resetForm();
        this.form.setForm('show', this.rangoAG);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async editForm() {
        this.form.resetForm();
        this.form.setForm('edit', this.rangoAG);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async insertForm() {
        try {
            const data_log = await this.setDataToLog();
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.insertRangoAprobacion(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud, response.dataInserted.grado, 'creado', true, false)
                });
                this.emitActionToBD();
                this.setDropdownsFilterTable(response.dataInserted)
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async updateForm() {
        try {
            const data_log = await this.setDataToLog(true);
            const params = this.form.setParamsForm();
            let paramsWithCod = {
                ...params,
                data_log,
                Cod_RangoAprobG: this.rangoAG.Cod_RangoAprobG
            }
            const response = await this.backend.updateRangoAprobacion(paramsWithCod, this.namesCrud);
            if (response && response.dataWasUpdated) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud, response.dataUpdated, 'actualizado', true, false)
                });
                this.emitActionToBD();
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
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
                this.emitActionToBD();
            }
        } catch (error) {
            console.log(error);
        } finally {
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
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

    emitActionToBD(){
        this.onInsertedData.next();
    }

    async setDropdownsFilterTable(dataInserted: any){
        //esta funcion permite setear automaticamente los dropdowns que están en la pagina del mantenedor
        if (this.openedFromPageMantenedor) {
            this.disabledDropdownPrograma = false;
            this.disabledDropdownPlanEstudio = false;
            this.cod_facultad_selected_notform = dataInserted.cod_facultad;
            this.cod_programa_postgrado_selected_notform = dataInserted.cod_programa;
            this.cod_plan_estudio_selected_notform = dataInserted.cod_plan_estudio;
            await this.getProgramasPorFacultadNotForm(false);
            await this.getPlanesDeEstudiosPorProgramaNotForm(false);
            await this.getRangosAprobacion(false);
        }
    }

    async setDropdownsAndTablesForm(){
        //funcion para setear automaticamente los dropdowns principales del formulario 
        this.systemService.loading(true);
        await this.setPrincipalsControls();
        this.form.setDisabledPrincipalControls();
        this.systemService.loading(false);
    }

    async setPrincipalsControls(){
        if (this.form.modeForm !== 'create') {
            await Promise.all([
                this.getProgramasPorFacultad(false,false),
                this.getPlanesDeEstudiosPorPrograma(false,false),
            ]);
        }else{
            if (this.form.dataExternal.data === true) {
                console.log("entre a este caso!");
                
                this.form.setDataExternal(this.form.dataExternal);
                this.form.setValuesVarsByDataExternal();
                await Promise.all([
                    this.getProgramasPorFacultad(false,false),
                    this.getPlanesDeEstudiosPorPrograma(false,false),
                ]);
                this.form.setControlsFormByDataExternal();
            }
        }
        
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

    setVarsNotFormByDataExternal(dataExternal: DataExternal){
        this.cod_facultad_selected_notform = dataExternal.cod_facultad!;
        this.cod_programa_postgrado_selected_notform = dataExternal.cod_programa!;
        this.cod_plan_estudio_selected_notform = dataExternal.cod_plan_estudio!;
    }

    async openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

    setNeedUpdateHistorial(need: boolean){
        this.openedFromPageMantenedor = need;
        this.needUpdateHistorial = need;
    }

    async setDataToLog(needAux = false){
        const dataPrincipalControls = await this.form.getDataPrincipalControls();
        let dataToLog_aux ;
        if (needAux) {
            //se necesita obtener valores anteriores para el log
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.rangoAG.cod_facultad);
            let programaSelected_aux = this.programas_postgrado.find( f => f.Cod_Programa === this.rangoAG.cod_programa);
            let planSelected_aux = this.planes.find( f => f.cod_plan_estudio === this.rangoAG.cod_plan_estudio);
            dataToLog_aux = { facultadSelected_aux: facultadSelected_aux!.Descripcion_facu, programaSelected_aux: programaSelected_aux!.Nombre_programa_completo, planSelected_aux: planSelected_aux!.nombre_plan_estudio_completo }
        }
        let facultadSelected = this.mainFacultad.facultades.find( f => f.Cod_facultad === dataPrincipalControls.cod_facultad);
        let programaSelected = this.programas_postgrado.find( f => f.Cod_Programa === dataPrincipalControls.cod_programa);
        let planSelected = this.planes.find( f => f.cod_plan_estudio === dataPrincipalControls.cod_plan_estudio);
        let dataToLog = { facultadSelected: facultadSelected!.Descripcion_facu, programaSelected: programaSelected!.Nombre_programa_completo, planSelected: planSelected!.nombre_plan_estudio_completo }

        if (needAux) {
            return { ...dataToLog_aux , ...dataToLog}
        }else{
            return dataToLog
        }
    }

}