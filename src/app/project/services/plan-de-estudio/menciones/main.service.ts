import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Mencion } from 'src/app/project/models/plan-de-estudio/Mencion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { FormMencionesService } from './form.service';
import { FilesMencionesService } from './files.service';
import { BackendMencionesService } from './backend.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { TableMencionesService } from './table.service';
import { LoadinggpService } from '../../components/loadinggp.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { FacultadesMainService } from '../../programas/facultad/main.service';

@Injectable({
  providedIn: 'root'
})
export class MencionesMainService {
    namesCrud: NamesCrud = {
        singular: 'mención',
        plural: 'menciones',
        articulo_singular: 'la mención',
        articulo_plural: 'las menciones',
        genero: 'femenino'
    }
    namesCrud_asign: NamesCrud = {
        singular: 'asignatura de la mención',
        plural: 'asignatura de las menciones',
        articulo_singular: 'la asignatura de la mención',
        articulo_plural: 'las asignatura de las menciones',
        genero: 'femenino'
    }
    message: any = {
        'facultad': 'No se encontraron programas para la facultad seleccionada.',
        'programa': 'No se encontraron planes de estudios para el programa seleccionado.',
        'plan': 'No se encontraron menciones para el plan de estudio seleccionado.',
        'asign': 'No se encontraron menciones para la asignatura.',
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    programas: any[] = [];
    planes: any[] = [];
    menciones: Mencion[] = [];
    mencion: Mencion = {};
    asignaturas: any[] = [];
    menciones_form_incluir : any[] = [];

    //MODAL
    dialogForm: boolean = false
    dialogAssociateForm: boolean = false
    needUpdateHistorial: boolean = false;


    //VARS ELEMENTS MANTENEDOR (DROPDOWNS FILTER TABLE / SHOWTABLE)
    cod_facultad_selected_notform: number = 0;
    cod_programa_postgrado_selected_notform: number = 0;
    cod_plan_estudio_selected_notform: number = 0;
    cod_asignatura: string = '';
    showTable: boolean = false
    disabledDropdownPrograma: boolean = true
    disabledDropdownPlanEstudio: boolean = true
    programas_postgrado_notform: any[] = [];
    planes_notform: any[] = [];
    wasFilteredTable: boolean = false;

    openedFrom!: 'crud_asign' | 'crud_pe' | 'mantenedor' ;

    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendMencionesService,
        private confirmationService: ConfirmationService,
        private files: FilesMencionesService,
        private form: FormMencionesService,
        private messageService: MessageServiceGP,
        private table: TableMencionesService,
        private systemService: LoadinggpService,
        private historialActividad: HistorialActividadService,
        private mainFacultad: FacultadesMainService
    ){
        this.form.initForm();
        this.files.initFiles();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Mencion | null){
        this.form.modeForm = mode;
        if (data) this.mencion = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': await this.showForm(); break;
            case 'edit': await this.editForm(); break;
            case 'insert': await this.insertForm(); break;
            case 'update': await this.updateForm(); break;
            case 'delete': await this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'historial': await this.openHistorialActividad(); break;
            // case 'rowExpandClick': await this.clickRowExpandTablePrograma(); break;
        }
    }

    async reset(){
        this.files.resetLocalFiles();
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
        this.cod_asignatura = '';
        this.programas_postgrado_notform = [];
        this.planes_notform = [];
        this.showTable = false
    }

    resetArraysData(){
        this.programas = [];
        this.planes = [];
        this.asignaturas = [];
    }

    resetArraysWhenChangedDropdownFacultad(){
        this.programas = [];
        this.planes = [];
        this.asignaturas = [];
    }

    resetArraysWhenChangedDropdownPrograma(){
        this.planes = [];
        this.asignaturas = [];
    }

    resetArraysWhenChangedDropdownPlanEstudio(){
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

    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.menciones.length, this.namesCrud);
    }

    async getProgramasPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.form.cod_facultad_selected }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas = [...response];
		  if (this.programas.length === 0 ) {
            this.form.setStatusControlPrograma(false);
            this.showMessageSinResultadosPrograma('f');
		  }else{
            if (showCountTableValues) {
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.programas.length > 1
                    ? `${this.programas.length} programas cargados.`
                    : `${this.programas.length} programa cargado.`
                });
            }
            this.form.setStatusControlPrograma(true);
            this.clearMessagesSinResultados('f');
		  }
		}
	}

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_Programa: this.form.cod_programa_selected }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params,needShowLoading);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.form.setStatusControlPlanEstudio(false);
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
            this.form.setStatusControlPlanEstudio(true);
            this.clearMessagesSinResultados('f');
          }
        }
    }

    async getAsignaturasMencionHabilitada(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { cod_plan_estudio: this.form.cod_plan_estudio }
        const response = await this.backend.getAsignaturasMencionHabilitada(params, needShowLoading);
        if (response) {
            this.asignaturas = [...response];
            if (this.asignaturas.length === 0 ) {
                this.form.setStatusControlAsignaturas(false);
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
                this.form.setStatusControlAsignaturas(true);
                if (this.form.modeForm === 'create') this.form.showTableAsignatura = true;
                this.clearMessagesSinResultados('f')
            }
        }
    }

    //INICIO FUNCIONES PARA PAGINA PRINCIPAL MANTENEDORES
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

    async getMencionesPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true): Promise<Mencion[]> {
        let valuesPrincipalControls = { 
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform
        }
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform, valuesPrincipalControls }
        this.menciones = await this.backend.getMencionesConAsignaturasPorPlanDeEstudio(params, needShowLoading);
        this.menciones.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.menciones.length !== 0) this.countTableValues();
        return this.menciones;
    }

    async getMencionesPorAsignatura(showCountTableValues: boolean = true, needShowLoading = true): Promise<Mencion[]> {
        let valuesPrincipalControls = { 
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform
        }
        let params = { cod_asignatura: this.cod_asignatura , valuesPrincipalControls}
        this.menciones = await this.backend.getMencionesPorAsignatura(params, needShowLoading);
        this.menciones.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.menciones.length !== 0 ) this.countTableValues();
        return this.menciones;
    }

    async getMenciones(){
        if (this.openedFrom === 'crud_asign') {
            await this.getMencionesPorAsignatura(false);
        }else{
            await this.getMencionesPorPlanDeEstudio(false);
        }
    }
    //FIN FUNCIONES PARA PAGINA PRINCIPAL MANTENEDORES
            
    async createForm(){
        await this.reset();
		this.table.resetTables();
        await this.files.setContextUploader('create','servicio','menciones');
        await this.setPrincipalsControls();
		this.openedFrom === 'crud_asign' ? (this.form.activeTab = 4) : (this.form.activeTab = 0)
        this.dialogForm = true;
    }

    async showForm(){
        await this.files.setContextUploader('show','servicio','menciones');
        this.files.resetLocalFiles();
        this.table.resetTables();
        this.form.resetForm();
        this.form.setForm('show',this.mencion);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.mencion);
    }

    async editForm(){
        await this.files.setContextUploader('edit','servicio','menciones');
        this.files.resetLocalFiles();
        this.table.resetTables();
        this.form.resetForm();
        this.form.setForm('edit',this.mencion);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
        await this.files.loadDocsWithBinary(this.mencion);
    }

    async insertForm(){
        try {
            if (this.openedFrom === 'crud_asign') {
                let formData = this.form.getFormToCrudAsign();
                const response = await this.backend.insertMencionPorAsignatura(formData, this.namesCrud);
                if (response && response.dataWasInserted) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud,response.dataInserted.mencion,'incluido',true,false)
                    });
                    this.emitActionToBD();
                }
            }else{
                const data_log = await this.setDataToLog();
                const responseParams = this.form.setParamsForm();
                const responseUploader = await this.files.setActionUploader('upload');
                if (responseUploader) {
                    let params = {
                        ...responseParams,
                        data_log,
                        docsToUpload: responseUploader.docsToUpload
                    };
                    console.log("params",params);
                    
                    const response = await this.backend.insertMencion(params, this.namesCrud);
                    if (response && response.dataWasInserted) {
                        this.messageService.add({
                            key: 'main',
                            severity: 'success',
                            detail: generateMessage(this.namesCrud,response.dataInserted.mencion,'creado',true,false)
                        });
                        this.emitActionToBD();
                        this.setDropdownsFilterTable(response.dataInserted)
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async updateForm(){
        try {
            const data_log = await this.setDataToLog(true);
            const responseUploader = await this.files.setActionUploader('upload');
            if (responseUploader){
                const { files, ...formData } =  this.form.fbForm.value;
                let params = { 
                    ...formData, 
                    data_log,
                    cod_mencion: this.mencion.cod_mencion,
                    cod_mencion_pe: this.mencion.cod_mencion_pe,
                    docsToUpload: responseUploader.docsToUpload, 
                    docsToDelete: responseUploader.docsToDelete  
                }
                const response = await this.backend.updateMencion(params, this.namesCrud);
                if (response && response.dataWasUpdated) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud,response.dataUpdated,'actualizado',true,false)
                    });
                    this.emitActionToBD();
                }
            }
        } catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async deleteMenciones(dataToDelete: Mencion[]){
        try {
            let response = []
            if (this.openedFrom !== 'crud_asign') {
                response = await this.backend.deleteMencion(dataToDelete,this.namesCrud);
            }else{
                response = await this.backend.deleteMencionAsign(dataToDelete,this.namesCrud);
            }
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
                    detail: generateMessage(this.openedFrom !== 'crud_asign' ? this.namesCrud : this.namesCrud_asign, message,'eliminados',true, true)
                });
                }else{
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.openedFrom !== 'crud_asign' ? this.namesCrud : this.namesCrud_asign, message,'eliminado',true, false)
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
            message: `Es necesario confirmar la acción para eliminar ${this.openedFrom === 'crud_asign' ? 'la asignatura de ' : ''} ${this.namesCrud.articulo_singular} <b>${this.mencion.nombre_mencion}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let mencionToDelete = []
                mencionToDelete.push(this.mencion);
                await this.deleteMenciones(mencionToDelete);
            }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'nombre_mencion');
        this.confirmationService.confirm({
            header: "Confirmar",
            message: `Es necesario confirmar la acción para eliminar ${this.openedFrom === 'crud_asign' ? 'la asignatura de ' : ''} ${message}. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                await this.deleteMenciones(data);
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
        await this.getMencionesPorPlanDeEstudio(false);
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
                this.getAsignaturasMencionHabilitada(false,false),
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
                    this.getProgramasPorFacultad(false,false),
                    this.getPlanesDeEstudiosPorPrograma(false,false),
                    this.getAsignaturasMencionHabilitada(false,false),
                ]);
                this.form.setControlsFormByDataExternal();
                if (this.openedFrom === 'crud_asign') {
                    this.form.needShowMenciones = true;
                    await this.setFormIncluirMencionAsignatura();
                }else{
                    this.form.needShowMenciones = false;
                }
                this.form.fbForm.controls['menciones'].updateValueAndValidity();
            }
        }
    }

    async setTableAsignatura(): Promise<boolean>{
        try {
            this.asignaturas.forEach(asign => {
                this.mencion.asignaturas?.forEach(men => {
                    if (asign.key === men.cod_asignatura) {
                        this.table.selectedAsignaturaRows[asign.key!] = {
                            partialChecked: false,
                            checked: true,
                        }
                    }
    
                    if (asign.children && asign.children.length > 0) {
                        // se itera sobre las asign hijas (temas)
                        asign.children.forEach((child: any) => {
                            // se recorre el arreglo de temas en prerrequisito seleccionado
                            this.mencion.asignaturas?.forEach( m_a  => {
                                if (child.data.cod_tema === m_a.cod_tema) {
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
                            this.table.selectedAsignaturaRows[asign.key!] = {
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

    async setFormIncluirMencionAsignatura(){
        let params = { cod_plan_estudio: this.form.cod_plan_estudio }
        this.menciones_form_incluir = await this.backend.getMencionesPorPlanDeEstudioSinAsign(params,false);
        this.asignaturas = this.asignaturas.filter( asign => asign.key === this.form.dataExternal?.cod_asignatura);
        this.form.setDisabledFormByIncluirMencionAsignatura()
    }

    clearAllMessages(){
        this.messagesMantenedor = [];
        this.messagesFormulario = [];
    }

    clearMessagesSinResultados(key: 'm' | 'f'){
        key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
    }

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' | 'plan' | 'asign' ) {
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
        console.log("this.openedFrom",this.openedFrom);
        
        if (this.openedFrom !== 'crud_asign') {
            this.showMessagesSinResultados(key, 'plan')
        }else{
            this.showMessagesSinResultados(key, 'asign')
        }
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
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.mencion.cod_facultad);
            let programaSelected_aux = this.programas.find( f => f.Cod_Programa === this.mencion.cod_programa);
            let planSelected_aux = this.planes.find( f => f.cod_plan_estudio === this.mencion.cod_plan_estudio);
            dataToLog_aux = { facultadSelected_aux: facultadSelected_aux!.Descripcion_facu, programaSelected_aux: programaSelected_aux!.Nombre_programa_completo, planSelected_aux: planSelected_aux!.nombre_plan_estudio_completo }
        }
        let facultadSelected = this.mainFacultad.facultades.find( f => f.Cod_facultad === dataPrincipalControls.cod_facultad);
        let programaSelected = this.programas.find( f => f.Cod_Programa === dataPrincipalControls.cod_programa);
        let planSelected = this.planes.find( f => f.cod_plan_estudio === dataPrincipalControls.cod_plan_estudio);
        let dataToLog = { facultadSelected: facultadSelected!.Descripcion_facu, programaSelected: programaSelected!.Nombre_programa_completo, planSelected: planSelected!.nombre_plan_estudio_completo }

        if (needAux) {
            return { ...dataToLog_aux , ...dataToLog}
        }else{
            return dataToLog
        }
    }

}