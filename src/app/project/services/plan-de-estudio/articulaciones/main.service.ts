import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { BackendArticulacionesService } from './backend.service';
import { FormArticulacionesService } from './form.service';
import { TableArticulacionesService } from './table.service';
import { Subject } from 'rxjs';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
import { LoadinggpService } from '../../components/loadinggp.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { FacultadesMainService } from '../../programas/facultad/main.service';

@Injectable({
    providedIn: 'root'
})

export class ArticulacionesMainService {

    namesCrud: NamesCrud = {
        singular: 'articulación',
        plural: 'articulaciones',
        articulo_singular: 'la articulación con la asignatura',
        articulo_plural: 'las articulaciones con las asignaturas',
        genero: 'femenino'
    }

    message: any = {
        'facultad': 'No se encontraron programas para la facultad de postgrado seleccionada.',
        'programa': 'No se encontraron planes de estudios para el programa de postgrado seleccionado.',
        'plan': 'No se encontraron articulaciones para el plan de estudio de postgrado seleccionado.',
        'asignaturas': 'No se encontraron asignaturas para el plan de estudio de postgrado seleccionado.',
        'facultad-pre': 'No se encontraron programas para la facultad de pregrado seleccionada.',
        'programa-pre': 'No se encontraron asignaturas para el programa de pregrado seleccionado.',
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    articulaciones: Articulacion[] = [];
    articulacion: Articulacion = {};
    planes: PlanDeEstudio[] = [];
    asignaturas_postgrado: any[] = [];

    //VARS ELEMENTS MANTENEDOR (DROPDOWNS FILTER TABLE / SHOWTABLE)
    cod_facultad_selected_notform: number = 0;
    cod_programa_postgrado_selected_notform: number = 0;
    cod_plan_estudio_selected_notform: number = 0;
    cod_asignatura: string = '';
    disabledDropdownPrograma: boolean = true
    disabledDropdownPlanEstudio: boolean = true
    showTable: boolean = false


    programas_postgrado_notform: any[] = [];
    planes_notform: any[] = [];

    programas_postgrado: any[] = [];
    programas_pregrado: any[] = [];
    asignaturas_pregrado: any[] = [];

    //MODAL
    dialogForm: boolean = false
    needUpdateHistorial: boolean = false;


    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendArticulacionesService,
        private confirmationService: ConfirmationService,
        private form: FormArticulacionesService,
        private messageService: MessageServiceGP,
        private table: TableArticulacionesService,
        private systemService: LoadinggpService,
        private historialActividad: HistorialActividadService,
        private mainFacultad: FacultadesMainService
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
            case 'historial': await this.openHistorialActividad(); break;
        }
    }

    async reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
        // this.form.resetValuesVarsSelected();
        this.clearAllMessages();
        this.resetArraysData();
    }

    resetDropdownsFilterTable(){
        this.disabledDropdownPrograma = true
        this.disabledDropdownPlanEstudio = true
        this.cod_facultad_selected_notform = 0;
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
        this.cod_asignatura = '';
        this.programas_postgrado_notform = [];
        this.planes_notform = [];
        this.showTable = false
    }

    resetArraysWhenChangedDropdownFacultadPostgrado(){
        this.programas_postgrado = [];
        this.planes = [];
        this.asignaturas_postgrado = [];
    }

    resetArraysWhenChangedDropdownProgramaPostgrado(){
        this.planes = [];
        this.asignaturas_postgrado = [];
    }

    resetArraysWhenChangedDropdownFacultadPregrado(){
        this.programas_pregrado = [];
        this.asignaturas_pregrado = [];
    }

    resetArraysWhenChangedDropdownProgramaPregrado(){
        this.asignaturas_pregrado = [];
    }

    resetArraysData(){
        this.programas_postgrado = [];
        this.programas_pregrado = [];
        this.asignaturas_pregrado = [];
        this.asignaturas_postgrado = [];
    }

    resetWhenChangedDropdownFacultadNotForm(){
        this.showTable = false
        this.disabledDropdownPlanEstudio = true;
        this.disabledDropdownPrograma = true;
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
    }

    resetWhenChangedDropdownProgramaNotForm(){
        this.showTable = false;
        this.disabledDropdownPlanEstudio = true;
        this.cod_plan_estudio_selected_notform = 0;
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.articulaciones.length, this.namesCrud);
    }

    //INICIO FUNCIONES DE CONSULTAS PARA TABLA PRINCIPAL (TABLA MANTENEDOR)
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
            this.clearMessagesSinResultados('m');
            this.disabledDropdownPlanEstudio = false;
          }
        }
    }

    async getArticulacionesPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true): Promise<Articulacion[]>{
        let valuesPrincipalControls = { 
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform,
            cod_asignatura : this.cod_asignatura
        }
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform , valuesPrincipalControls}
        this.articulaciones = await this.backend.getArticulacionesPorPlanDeEstudio(params,this.namesCrud, needShowLoading);
        this.articulaciones.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.articulaciones.length !== 0) this.countTableValues();
        return this.articulaciones;
    }
    //FIN FUNCIONES DE CONSULTAS PARA TABLA PRINCIPAL (TABLA MANTENEDOR)

    async getProgramasPostgradoPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.form.cod_facultad_selected_postgrado }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas_postgrado = [...response];
		  if (this.programas_postgrado.length === 0 ) {
            this.form.setStatusControlProgramaPostgrado(false);
            this.form.setArrowColor('facultad_to_programas_left','red');
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
            this.form.setStatusControlProgramaPostgrado(true);
            this.form.setArrowColor('facultad_to_programas_left','green');
            this.clearMessagesSinResultados('f');
		  }
		}
	}

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.form.cod_programa_selected_postgrado }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params,needShowLoading);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.form.setStatusControlPlanEstudioPostgrado(false);
            this.form.setArrowColor('programas_to_planestudio_left','red');
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
            this.form.setArrowColor('programas_to_planestudio_left','green');
            this.clearMessagesSinResultados('f');
          }
        }
        
    }

    async getAsignaturasPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { cod_plan_estudio: this.form.cod_plan_estudio_selected }
        const response = await this.backend.getAsignaturasPorPlanDeEstudio(params,needShowLoading);
        if (response) {
          this.asignaturas_postgrado = [...response];
          if (this.asignaturas_postgrado.length === 0 ) {
            this.form.setArrowColor('planestudio_to_table_left','red');
            this.showMessageSinResultadosAsignaturas('f');
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.asignaturas_postgrado.length > 1
                    ? `${this.asignaturas_postgrado.length} asignaturas cargadas.`
                    : `${this.asignaturas_postgrado.length} asignatura cargada.`
                });
            }
            this.form.setArrowColor('planestudio_to_table_left','green');
            this.clearMessagesSinResultados('f');
          }
        }
    }

    async getProgramasPregradoPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { codFacultad: this.form.cod_facultad_selected_pregrado }
        const response = await this.backend.getProgramasPregradoPorFacultad(params,needShowLoading);
        if (response) {
          this.programas_pregrado = [...response];
          if (this.programas_pregrado.length === 0 ) {
            this.form.setStatusControlProgramaPregrado(false);
            this.form.setArrowColor('facultad_to_programas_right','red');
            this.showMessageSinResultadosProgramasPre('f');
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.programas_pregrado.length > 1
                    ? `${this.programas_pregrado.length} programas cargados.`
                    : `${this.programas_pregrado.length} programa cargado.`
                });
            }
            this.form.setStatusControlProgramaPregrado(true);
            this.form.setArrowColor('facultad_to_programas_right','green');
            this.clearMessagesSinResultados('f');
          }
        }
    }

    async getAsignaturasPorProgramaPregrado(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { codPrograma: this.form.cod_programa_selected_pregrado , nombreCarrera: this.form.nombre_programa_selected_pregrado, cod_facultad_pregrado: this.form.cod_facultad_selected_pregrado}
        const response = await this.backend.getAsignaturasPorProgramaPregrado(params,needShowLoading);
        if (response) {
          this.asignaturas_pregrado = [...response];
          if (this.asignaturas_pregrado.length === 0 ) {
            this.form.setStatusControlAsignaturasPregrado(false);
            this.form.setArrowColor('programas_to_asignaturas_right','red');
            this.showMessageSinResultadosAsignaturasPre('f');
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.asignaturas_pregrado.length > 1
                    ? `${this.asignaturas_pregrado.length} asignaturas cargadas.`
                    : `${this.asignaturas_pregrado.length} asignatura cargada.`
                });
            }
            this.form.setStatusControlAsignaturasPregrado(true);
            this.form.setArrowColor('programas_to_asignaturas_right','green');
            this.clearMessagesSinResultados('f');
          }
        }
        // console.log("this.asignaturas",this.asignaturas);
    }

    async createForm(){
        await this.reset();
        await this.setPrincipalsControls();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        await this.form.setForm('show',this.articulacion);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        await this.form.setForm('edit',this.articulacion);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            const data_log = await this.setDataToLog();
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.insertArticulacion(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted.asignatura,'creado',true,false)
                });
                this.emitActionToBD();
                this.setDropdownsFilterTable(response.dataInserted)
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset()
        }
    }

    async updateForm(){
        try {
            const data_log = await this.setDataToLog(true);
            const params = this.form.setParamsForm();
            let paramsWithCodArticulacion = { 
                ...params,
                data_log,
                cod_articulacion: this.articulacion.cod_articulacion
            }
            const response = await this.backend.updateArticulacion(paramsWithCodArticulacion,this.namesCrud);
            if ( response && response.dataWasUpdated ) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
                this.emitActionToBD();
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
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
                this.emitActionToBD();
            }
        } catch (error) {
            console.log(error);
        }finally{
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.articulacion.asignatura_postgrado?.nombre_asignatura_completa}</b>. ¿Desea confirmar?`,
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
        const message = mergeNames(this.namesCrud,data,true,'nombre_asignatura_completa');
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

    emitActionToBD(){
        this.onActionToBD.next();
    }

    async setDropdownsFilterTable(dataInserted: any){
        //esta funcion permite setear automaticamente los dropdowns que están en la pagina del mantenedor
        this.disabledDropdownPrograma = false;
        this.disabledDropdownPlanEstudio = false;
        this.cod_facultad_selected_notform = dataInserted.cod_facultad;
        this.cod_programa_postgrado_selected_notform = dataInserted.cod_programa;
        this.cod_plan_estudio_selected_notform = dataInserted.cod_plan_estudio;
        await this.getProgramasPorFacultadNotForm(false);
        await this.getPlanesDeEstudiosPorProgramaNotForm(false);
        await this.getArticulacionesPorPlanDeEstudio(false);
    }

    async setDropdownsAndTablesForm(){
        //funcion para setear automaticamente los dropdowns principales del formulario 
        this.systemService.loading(true);
        await this.setPrincipalsControls();
        this.table.selectedAsignaturaPregrado = [...this.articulacion.asignaturas_pregrado!]
        this.form.setAsignaturaArticuladas([...this.articulacion.asignaturas_pregrado!])
        this.form.setDisabledPrincipalControls();
        this.setTableAsignaturasPostgrado();
        this.systemService.loading(false);
    }

    async setPrincipalsControls(){
        if (this.form.modeForm !== 'create') {
            await Promise.all([
                this.getProgramasPostgradoPorFacultad(false,false),
                this.getPlanesDeEstudiosPorPrograma(false,false),
                this.getAsignaturasPorPlanDeEstudio(false,false),
            ]);
        }else{
            if (this.form.dataExternal.data === true) {
                this.form.setDataExternal(this.form.dataExternal);
                this.form.setValuesVarsByDataExternal();
                await Promise.all([
                    this.getProgramasPostgradoPorFacultad(false,false),
                    this.getPlanesDeEstudiosPorPrograma(false,false),
                    this.getAsignaturasPorPlanDeEstudio(false,false),
                ]);
                this.form.setControlsFormByDataExternal();
                this.form.openedFromMantenedorAsignatura = false;
                if (this.form.dataExternal.cod_asignatura && this.form.dataExternal.cod_asignatura !== '') {
                    this.disabledAsignaturaSelected()
                }
            }
        }
        
    }

    disabledAsignaturaSelected(){
        //esta funcion se ejecuta cuando el formulario es creado desde el mantenedor de asignatura
        this.asignaturas_postgrado = this.asignaturas_postgrado.filter( asign => asign.cod_asignatura === this.form.dataExternal?.cod_asignatura);
        this.form.setAsignaturaPostgrado(this.asignaturas_postgrado[0])
        if (this.asignaturas_postgrado.length === 1) {
            //este if es para asignaturas que no tienen tema
            // al no tener tema, es solo una asignatura, por lo que queda seleccionada automaticamente
            let valueIndex: number = 0;
            this.asignaturas_postgrado.forEach((asign , index) => {
                if (asign.cod_asignatura === this.form.dataExternal?.cod_asignatura) {
                    valueIndex = index
                }
            });
            this.table.selectedAsignaturasPostgrado = [this.asignaturas_postgrado[valueIndex]];
            this.form.asignaturaHaveTemas = false;
        }else{
            this.form.asignaturaHaveTemas = true;
        }
        this.form.openedFromMantenedorAsignatura = true; 
    }

    setTableAsignaturasPostgrado(){
        switch (this.form.modeForm) {
            case 'show':
                this.asignaturas_postgrado = this.asignaturas_postgrado.filter( asign => asign.cod_asignatura === this.articulacion.asignatura_postgrado?.cod_asignatura)
            break;

            case 'edit':
                let valueIndex: number = 0;
                this.asignaturas_postgrado.forEach((asign , index) => {
                    if (asign.cod_asignatura === this.articulacion.asignatura_postgrado?.cod_asignatura) {
                        valueIndex = index
                    }
                });
                this.table.selectedAsignaturasPostgrado = [this.asignaturas_postgrado[valueIndex]];
            break;
        }
    }

    clearAllMessages(){
        this.messagesMantenedor = [];
        this.messagesFormulario = [];
    }

    clearMessagesSinResultados(key: 'm' | 'f'){
        key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
    }

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' | 'plan' | 'asignaturas' | 'facultad-pre' | 'programa-pre') {
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

    showMessageSinResultadosAsignaturas(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'asignaturas')
    }

    showMessageSinResultadosProgramasPre(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'facultad-pre')
    }

    showMessageSinResultadosAsignaturasPre(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'programa-pre')
    }

    showMessageSinResultados(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'plan')
    }

    deleteRowAsignaturasPregradoSelected(index: number){
        this.table.selectedAsignaturaPregrado.splice(index, 1);
        this.form.setAsignaturaArticuladas([...this.table.selectedAsignaturaPregrado])
    }

    setVarsNotFormByDataExternal(dataExternal: DataExternal){
        this.cod_facultad_selected_notform = dataExternal.cod_facultad!;
        this.cod_programa_postgrado_selected_notform = dataExternal.cod_programa!;
        this.cod_plan_estudio_selected_notform = dataExternal.cod_plan_estudio!;
        this.cod_asignatura = dataExternal.cod_asignatura!;
    }

    async openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }

    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }

    setNeedUpdateHistorial(need: boolean){
        this.needUpdateHistorial = need;
    }

    async setDataToLog(needAux = false){
        const dataPrincipalControls = await this.form.getDataPrincipalControls();
        let dataToLog_aux ;
        if (needAux) {
            //se necesita obtener valores anteriores para el log
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.articulacion.cod_facultad);
            let programaSelected_aux = this.programas_postgrado.find( f => f.Cod_Programa === this.articulacion.cod_programa);
            let planSelected_aux = this.planes.find( f => f.cod_plan_estudio === this.articulacion.cod_plan_estudio);
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