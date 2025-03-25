import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { Subject } from 'rxjs';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { BackendCertifIntermediasPEService } from './backend.service';
import { TableCertifIntermediasPEService } from './table.service';
import { FormCertifIntermediasPEService } from './form.service';
import { CertificacionIntermediaPE } from 'src/app/project/models/plan-de-estudio/CertificacionIntermediaPE';
import { LoadinggpService } from '../../components/loadinggp.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { FacultadesMainService } from '../../programas/facultad/main.service';

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

    certificaciones: CertificacionIntermediaPE[] = [];
    certificacion: CertificacionIntermediaPE = {};
    planes: PlanDeEstudio[] = [];

    message: any = {
        'facultad'  : 'No se encontraron programas para la facultad seleccionada.',
        'programa'  : 'No se encontraron planes de estudios para el programa seleccionado.',
        'plan'      : 'No se encontraron certificaciones intermedias para el plan de estudio seleccionado.',
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
    certificaciones_pe: any[] = [];

    cod_programa_selected: number = 0;

    programas_postgrado: any[] = [];
    certificaciones_by_programa: any[] = [];
    asignaturas: any[] = [];
    
    //MODAL
    dialogForm: boolean = false
    needUpdateHistorial: boolean = false;


    private onInsertedData = new Subject<void>();
    onInsertedData$ = this.onInsertedData.asObservable();

    constructor(
        private backend: BackendCertifIntermediasPEService,
        private confirmationService: ConfirmationService,
        private form: FormCertifIntermediasPEService,
        private messageService: MessageServiceGP,
        private table: TableCertifIntermediasPEService,
        private systemService: LoadinggpService,
        private historialActividad: HistorialActividadService,
        private mainFacultad: FacultadesMainService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: CertificacionIntermediaPE | null){
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
            case 'historial': await this.openHistorialActividad(); break;
        }
    }

    async reset(){
        this.form.resetForm();
        this.table.resetSelectedRows();
        this.clearAllMessages();
        this.resetArraysData();
    }

    resetDropdownsFilterTable(){
        this.disabledDropdownPrograma = true
        this.disabledDropdownPlanEstudio = true
        this.cod_facultad_selected_notform = 0;
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
        this.programas_postgrado_notform = [];
        this.planes_notform = [];
        this.showTable = false
    }

    resetArraysData(){
        this.programas_postgrado = [];
        this.certificaciones_by_programa = [];
        this.asignaturas = [];
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.certificaciones.length, this.namesCrud);
    }

    async getProgramasPostgradoConCertifIntermediaPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_facultad: this.form.cod_facultad_selected_postgrado }
        const response = await this.backend.getProgramasPostgradoConCertifIntermediaPorFacultad(params,needShowLoading);
        if (response) {
            this.programas_postgrado = [...response];
            if (this.programas_postgrado.length === 0 ) {
                this.form.setStatusControlProgramaPostgrado(false);
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
              this.form.setStatusControlProgramaPostgrado(true);
              this.clearMessagesSinResultados('f');
            }
        }
    }

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.form.cod_programa_postgrado_selected }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params,needShowLoading);
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

    async getAsignaturasConTemaAgrupado(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { cod_plan_estudio: this.form.cod_planestudio_selected }
        const response = await this.backend.getAsignaturasConTemaAgrupado(params,needShowLoading);
        
        if (response) {
            this.asignaturas = [...response];
            if (this.asignaturas.length === 0 ) {
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
                if (this.form.modeForm === 'create') this.form.showTableAsignatura = true;
                this.clearMessagesSinResultados('f')
            }
        }
    }

    async getCertificacionIntermedia_Prog(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.form.cod_programa_postgrado_selected }
        const response = await this.backend.getCertificacionIntermedia_Prog(params,needShowLoading);
        if (response) {
          this.certificaciones_by_programa = [...response];
          if (this.certificaciones_by_programa.length === 0 ) {
            this.showMessageSinResultadosCertif('f')
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.certificaciones_by_programa.length > 1
                    ? `${this.certificaciones_by_programa.length} certificaciones intermedias cargadas.`
                    : `${this.certificaciones_by_programa.length} certificación intermedia cargada.`
                });
            }
            this.clearMessagesSinResultados('f')
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

    async getCertificacionesIntermediasPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true): Promise<any>{
        let valuesPrincipalControls = {cod_facultad: this.cod_facultad_selected_notform, cod_programa: this.cod_programa_postgrado_selected_notform, cod_plan_estudio: this.cod_plan_estudio_selected_notform}
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform, valuesPrincipalControls }
        this.certificaciones = await this.backend.getCertificacionesIntermediasPorPlanDeEstudio(params,needShowLoading);
        this.certificaciones.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.certificaciones.length !== 0) this.countTableValues();
        return this.certificaciones
    }
    //FIN FUNCIONES PARA TABLA DE MANTENEDOR

    async createForm(){
        await this.reset();
        await this.setPrincipalsControls();
        this.dialogForm = true;
    }

    async showForm(){
        this.form.resetForm();
        await this.form.setForm('show',this.certificacion);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async editForm(){
        this.form.resetForm();
        await this.form.setForm('edit',this.certificacion);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            const data_log = await this.setDataToLog();
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.insertAsignaturasToCertifIntermedia(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted.certificacion,'creado',true,false)
                });
                this.emitInsertedData();
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
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.updateAsignaturasToCertifIntermedia(params,this.namesCrud);
            if ( response && response.dataWasUpdated ) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                });
                this.emitInsertedData();
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: CertificacionIntermediaPE[]){
        try {
            const response = await this.backend.deleteAsignaturasToCertifIntermedia(dataToDelete,this.namesCrud);
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
                this.emitInsertedData();
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
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.certificacion.descripcion_certif_intermedia}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.certificacion);
                await this.deleteRegisters(dataToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'descripcion_certif_intermedia');
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

    async setDropdownsFilterTable(dataInserted: any){
        this.disabledDropdownPrograma = false;
        this.disabledDropdownPlanEstudio = false;
        this.cod_facultad_selected_notform = dataInserted.cod_facultad;
        this.cod_programa_postgrado_selected_notform = dataInserted.cod_programa;
        this.cod_plan_estudio_selected_notform = dataInserted.cod_plan_estudio;
        await this.getProgramasPorFacultadNotForm(false);
        await this.getPlanesDeEstudiosPorProgramaNotForm(false);
        await this.getCertificacionesIntermediasPorPlanDeEstudio(false);
    }

    async setDropdownsAndTablesForm(){
        this.systemService.loading(true);
        await this.setPrincipalsControls();
        this.form.setDisabledPrincipalControls();
        this.setTableCertifIntermedia();
        this.systemService.loading(false);
    }

    async setPrincipalsControls(){
        if (this.form.modeForm !== 'create') {
            await Promise.all([
                this.getProgramasPostgradoConCertifIntermediaPorFacultad(false,false),
                this.getCertificacionIntermedia_Prog(false,false),
                this.getPlanesDeEstudiosPorPrograma(false,false),
                this.getAsignaturasConTemaAgrupado(false,false),
            ]);
            const responseTable1 = await this.setTableAsignatura();
            if (responseTable1) {
                this.form.showTableAsignatura = true;
            }
        }else{
            if (this.form.dataExternal.data === true) {
                this.form.setDataExternal(this.form.dataExternal);
                this.form.setValuesVarsByDataExternal();
                await Promise.all([
                    this.getProgramasPostgradoConCertifIntermediaPorFacultad(false,false),
                    this.getCertificacionIntermedia_Prog(false,false),
                    this.getPlanesDeEstudiosPorPrograma(false,false),
                    this.getAsignaturasConTemaAgrupado(false,false),
                ]);
                this.form.setControlsFormByDataExternal();
            }
        }
    }

    setTableCertifIntermedia(){
        switch (this.form.modeForm) {
            case 'show':
                this.certificaciones_by_programa = this.certificaciones_by_programa.filter( prog => prog.Cod_CertificacionIntermedia === this.certificacion.cod_certif_intermedia)
            break;

            case 'edit':
                let valueIndex: number = 0;
                this.certificaciones_by_programa.forEach((cert , index) => {
                    if (cert.Cod_CertificacionIntermedia === this.certificacion.cod_certif_intermedia) {
                        valueIndex = index
                    }
                });
                this.table.selectedCertifIntermediaRows = [this.certificaciones_by_programa[valueIndex]];
            break;
        }
    }

    async setTableAsignatura(): Promise<boolean>{
        try {
            this.asignaturas.forEach(asign => {
                this.certificacion.asignaturas?.forEach(men => {
                    if (asign.key === men.cod_asignatura) {
                        this.table.selectedAsignaturaRows[asign.key] = {
                            partialChecked: false,
                            checked: true,
                        }
                    }
    
                    if (asign.children && asign.children.length > 0) {
                        // se itera sobre las asign hijas (temas)
                        asign.children.forEach((child: any) => {
                            // se recorre el arreglo de temas en prerrequisito seleccionado
                            this.certificacion.asignaturas?.forEach( c_a  => {
                                if (child.data.cod_tema === c_a.cod_tema) {
                                    //si coincide cod_tema, se deja con checked activado
                                    this.table.selectedAsignaturaRows[child.key] = {
                                        partialChecked: false,
                                        checked: true,
                                    };
                                }
                            });
                        });
            
                        // validacion del estado de partialChecked y checked para las asign hijas (temas)
                        const allChildrenChecked = asign.children.every((child: any) =>
                            this.table.selectedAsignaturaRows[child.key]?.checked === true
                        );
    
                        if (!allChildrenChecked && asign.key === men.cod_asignatura) {
                            //si de las asign hijas no están todas seleccionadas, la asign padre queda con partialcheked activado
                            this.table.selectedAsignaturaRows[asign.key] = {
                                partialChecked: true, 
                                checked: false, 
                            };
                        }
                    }
                })
            })
            return true
        } catch (error) {
            return false
        }
    }

    resetArraysWhenChangedDropdownPrograma(){
        this.planes = [];
        this.certificaciones_by_programa = [];
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
        this.needUpdateHistorial = need;
    }

    async setDataToLog(needAux = false){
        const dataPrincipalControls = await this.form.getDataPrincipalControls();
        let dataToLog_aux ;
        if (needAux) {
            //se necesita obtener valores anteriores para el log
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.certificacion.cod_facultad);
            let programaSelected_aux = this.programas_postgrado.find( f => f.Cod_Programa === this.certificacion.cod_programa);
            let planSelected_aux = this.planes.find( f => f.cod_plan_estudio === this.certificacion.cod_plan_estudio);
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