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

@Injectable({
    providedIn: 'root'
})

export class ArticulacionesMainService {

    namesCrud: NamesCrud = {
        singular: 'articulación',
        plural: 'articulaciones',
        articulo_singular: 'la articulación con el programa',
        articulo_plural: 'las articulaciones con los programas',
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
    disabledDropdownPrograma: boolean = true
    disabledDropdownPlanEstudio: boolean = true
    showTable: boolean = false
    wasFilteredTable: boolean = false;
    


    programas_postgrado_notform: any[] = [];
    planes_notform: any[] = [];

    programas_postgrado: any[] = [];
    programas_pregrado: any[] = [];
    asignaturas_pregrado: any[] = [];

    //MODAL
    dialogForm: boolean = false

    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendArticulacionesService,
        private confirmationService: ConfirmationService,
        private form: FormArticulacionesService,
        private messageService: MessageServiceGP,
        private table: TableArticulacionesService,
        private systemService: LoadinggpService,
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
        this.form.hideDropdowns();
        this.clearAllMessages();
    }

    resetElementsMantenedor(){
        this.disabledDropdownPrograma = true
        this.disabledDropdownPlanEstudio = true
        this.cod_programa_postgrado_selected_notform = 0;
        this.cod_plan_estudio_selected_notform = 0;
        this.cod_facultad_selected_notform = 0;
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
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform }
        this.articulaciones = await this.backend.getArticulacionesPorPlanDeEstudio(params,this.namesCrud);
        this.articulaciones.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues) this.countTableValues();
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
            this.clearMessagesSinResultados('f');
            this.form.setStatusControlPlanEstudioPostgrado(true);
          }
        }
        
    }

    async getAsignaturasPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { Cod_plan_estudio: this.form.cod_plan_estudio_selected }
        const response = await this.backend.getAsignaturasPorPlanDeEstudio(params,needShowLoading);
        if (response) {
          this.asignaturas_postgrado = [...response];
          if (this.asignaturas_postgrado.length === 0 ) {
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
            this.clearMessagesSinResultados('f');
          }
        }
    }

    async getAsignaturasPorProgramaPregrado(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { codPrograma: this.form.cod_programa_selected_pregrado }
        console.log("params",params);
        
        const response = await this.backend.getAsignaturasPorProgramaPregrado(params,needShowLoading);
        if (response) {
          this.asignaturas_pregrado = [...response];
          if (this.asignaturas_pregrado.length === 0 ) {
            this.form.setStatusControlAsignaturasPregrado(false);
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
            this.clearMessagesSinResultados('f');
          }
        }
        // console.log("this.asignaturas",this.asignaturas);
    }

    async createForm(){
        await this.reset();
        this.dialogForm = true;
    }

    async showForm(){
        await this.reset();
        this.form.fbForm.patchValue({Cod_Facultad_Postgrado_Selected: this.cod_facultad_selected_notform});
        this.form.setForm('show',this.articulacion);
        await this.setTables();
        this.form.showTables = true;
        this.dialogForm = true;
    }

    async editForm(){
        await this.reset();
        this.form.fbForm.patchValue({Cod_Facultad_Postgrado_Selected: this.cod_facultad_selected_notform});
        this.form.setForm('edit',this.articulacion);
        await this.setTables();
        this.form.showTables = true;
        this.dialogForm = true;
    }

    async insertForm(){
        try {
            const params = this.form.setParamsForm();
            const response = await this.backend.insertArticulacion(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud,response.dataInserted,'creado',true,false)
                });
                this.emitActionToBD();
            }
        }catch (error) {
            console.log(error);
        }finally{
            this.dialogForm = false;
            if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getArticulacionesPorPlanDeEstudio(false);
            this.reset()
        }
    }

    async updateForm(){
        try {
            const params = this.form.setParamsForm();
            let paramsWithCodArticulacion = { 
                ...params,
                Cod_Articulacion: this.articulacion.Cod_Articulacion
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
            if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getArticulacionesPorPlanDeEstudio(false);
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
            // if ( !this.wasFilteredTable) await this.setDropdownsFilterTable();
            this.getArticulacionesPorPlanDeEstudio(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.articulacion.Descripcion_programa_pregrado}</b>. ¿Desea confirmar?`,
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
        const message = mergeNames(this.namesCrud,data,true,'Descripcion_programa_pregrado');
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

    async setTables(){
        this.systemService.loading(true);
        this.form.cod_programa_postgrado_selected = this.articulacion.Cod_Programa_Postgrado_Selected!;
        this.form.cod_facultad_selected_pregrado = this.articulacion.Cod_Facultad_Selected!;
        this.form.cod_programa_selected_pregrado = this.articulacion.Cod_programa_pregrado!;
        this.form.cod_plan_estudio_selected = this.articulacion.Cod_plan_estudio!;
        // this.table.selectedAsignaturaRows = [...this.articulacion.Asignaturas!]
        await Promise.all([
            this.getProgramasPregradoPorFacultad(false,false),
            this.getAsignaturasPorProgramaPregrado(false,false),
            this.getPlanesDeEstudiosPorPrograma(false,false),
            
        ]);
        this.setTablePrograma();
        this.systemService.loading(false);
    }

    setTablePrograma(){
        switch (this.form.modeForm) {
            case 'show':
                this.programas_pregrado = this.programas_pregrado.filter( prog => prog.codPrograma === this.articulacion.Cod_programa_pregrado!)
            break;

            case 'edit':
                let valueIndex: number = 0;
                this.programas_pregrado.forEach((prog , index) => {
                    if (prog.codPrograma === this.articulacion.Cod_programa_pregrado) {
                        valueIndex = index
                    }
                });
                // this.table.selectedProgramaRows = [this.programas_pregrado[valueIndex]];
            break;
        }
    }

    async setDropdownsFilterTable(){
        console.log("me llamaron setDropdownsFilterTable");
        
        this.disabledDropdownPrograma = false;
        this.disabledDropdownPlanEstudio = false;
        this.cod_facultad_selected_notform = this.form.cod_facultad_selected_postgrado;
        this.cod_programa_postgrado_selected_notform = this.form.cod_programa_postgrado_selected;
        this.cod_plan_estudio_selected_notform = this.form.cod_plan_estudio_selected;
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

}