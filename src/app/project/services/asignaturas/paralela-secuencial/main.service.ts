import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { filterDataFromArrayAsync, generateMessage, mergeNames, parseAsignaturas } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { Subject } from 'rxjs';
import { LoadinggpService } from '../../components/loadinggp.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { BackendParalelaSecuencialService } from './backend.service';
import { FormParalelaSecuencialService } from './form.service';
import { TableParalelaSecuencialService } from './table.service';
import { ParalelaSecuencial } from 'src/app/project/models/asignaturas/ParalelaSecuencial';
import { FacultadesMainService } from '../../programas/facultad/main.service';

@Injectable({
  providedIn: 'root'
})
export class ParalelaSecuencialMainService {

    namesCrud: NamesCrud = {
        singular: 'secuencialidad y paralelidad de asignatura',
        plural: 'secuencialidades y paralelidades de asignaturas',
        articulo_singular: 'la secuencialidad y paralelidad de asignatura',
        articulo_plural: 'las secuencialidades y paralelidades  de la asignatura',
        genero: 'femenino'
    };

    paralelidades_secuencialidades: any[] = [];
    paralelidad_secuencialidad: ParalelaSecuencial = {};

    message: any = {
        'facultad'  : 'No se encontraron programas para la facultad seleccionada.',
        'programa'  : 'No se encontraron planes de estudios para el programa seleccionado.',
        'plan'      : 'No se encontraron asignaturas con sus secuencialidades o paralelidades para el plan de estudio seleccionado.',
        'asignaturas_sec' : 'No se encontraron asignaturas secuenciales para el plan de estudio seleccionado.',
        'asignaturas_par' : 'No se encontraron asignaturas paralelas para el plan de estudio seleccionado.',
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    //VARS PARA FILTROS DE TABLA
    cod_facultad_selected_notform: number = 0;
    cod_programa_postgrado_selected_notform: number = 0;
    cod_plan_estudio_selected_notform: number = 0;
    cod_asignatura: string = '';
    showTable: boolean = false
    disabledDropdownPrograma: boolean = true
    disabledDropdownPlanEstudio: boolean = true
    programas_postgrado_notform: any[] = [];
    planes_notform: any[] = [];

    programas_postgrado: any[] = [];
    planes: any[] = [];
    opt_secuencial_paralela: any[] = [
        {label: 'PARALELA' , value: 0},
        {label: 'SECUENCIAL' , value: 1}
    ];
    asignaturas_grouped: any[] = [];
    asign_sec_par: any[] = [];
    asign_sec_par_aux: any[] = [];

    dialogForm: boolean = false;
    needUpdateHistorial: boolean = false;
    openedFromPageMantenedor: boolean = false;

    openedFrom!: 'crud_asign' | 'mantenedor' ;

    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendParalelaSecuencialService,
        private confirmationService: ConfirmationService,
        private form: FormParalelaSecuencialService,
        private messageService: MessageServiceGP,
        private table: TableParalelaSecuencialService,
        private systemService: LoadinggpService,
        private historialActividad: HistorialActividadService,        
        private mainFacultad: FacultadesMainService
    ) { 
        this.form.initForm();
    }

    get modeForm() {
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: ParalelaSecuencial | null) {
        this.form.modeForm = mode;
        if (data) this.paralelidad_secuencialidad = { ...data };
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
        this.cod_asignatura = '';
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
    resetArraysWhenChangedDropdownPlanDeEstudio(){
        this.asignaturas_grouped = [];
    }

    resetArraysWhenChangedDropdownFacultad(){
        this.programas_postgrado = [];
        this.planes = [];
    }

    resetArraysData(){
        this.programas_postgrado = [];
    }

    resetAndClearTables(){
        this.table.selectedAsignaturaRows = {};
        this.table.selectedParalelaSecuencialRows = {};
        this.form.setAsignatura([]);
        this.form.setParalelaSecuencial([]);
        this.form.resetShowTables();
    }

    emitResetExpandedRows() {
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.paralelidades_secuencialidades.length, this.namesCrud);
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

    async getAsignaturasParalelaSecuencial(showCountTableValues: boolean = true, needShowLoading = true){
        let valuesPrincipalControls = {
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform,
            cod_asignatura : this.cod_asignatura
        }
        let params = { 
            cod_plan_estudio: this.form.cod_planestudio_selected, 
            tipo_paralela_secuencial: this.form.cod_paralela_secuencial_selected, 
            valuesPrincipalControls 
        }
        const response = await this.backend.getAsignaturasParalelaSecuencial(params,needShowLoading);
        if (response) {
          this.asignaturas_grouped = [...response];
          if (this.asignaturas_grouped.length === 0 ) {
            this.resetAndClearTables();
            this.form.cod_paralela_secuencial_selected === 1 ? this.showMessageSinResultadosAsignaturasSecuenciales('f') : this.showMessageSinResultadosAsignaturasParalelas('f');
            
          }else{
            if (showCountTableValues){
                this.messageService.add({
                  key: 'main',
                  severity: 'info',
                  detail: this.asignaturas_grouped.length > 1
                    ? `${this.asignaturas_grouped.length} asignaturas cargadas.`
                    : `${this.asignaturas_grouped.length} asignatura cargada.`
                });
            }
            this.clearMessagesSinResultados('f');
            if (this.form.modeForm === 'create') this.form.showTableAsignatura = true;
          }
        }
    }

    async getAsignaturasParalelaSecuencialNotFiltered(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { 
            cod_plan_estudio: this.form.cod_planestudio_selected, 
            tipo_paralela_secuencial: this.form.cod_paralela_secuencial_selected, 
        }
        const response = await this.backend.getAsignaturasParalelaSecuencial(params,needShowLoading);
        if (response) {
          this.asign_sec_par = [...response];
          this.asign_sec_par_aux = [...response];
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

    async getAsignaturasSecuencialesParalelasGroupedNotForm(showCountTableValues: boolean = true, needShowLoading = true): Promise<ParalelaSecuencial[]> {
        let valuesPrincipalControls = {
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform,
            cod_asignatura : this.cod_asignatura
        }
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform, valuesPrincipalControls }
        this.paralelidades_secuencialidades = await this.backend.getAsignaturasSecuencialesParalelasGrouped(params,needShowLoading);
        this.paralelidades_secuencialidades.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.paralelidades_secuencialidades.length !== 0 ) this.countTableValues();
        return this.paralelidades_secuencialidades
    }

    //FIN FUNCIONES PARA TABLA DE MANTENEDOR

    async createForm() {
        await this.reset();
        this.resetAndClearTables();
        await this.setPrincipalsControls();
        this.dialogForm = true;
    }

    async showForm() {
        this.form.resetForm();
        this.resetAndClearTables();
        this.form.setForm('show', this.paralelidad_secuencialidad);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async editForm() {
        this.form.resetForm();
        this.resetAndClearTables();
        this.form.setForm('edit', this.paralelidad_secuencialidad);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async insertForm() {
        try {
            const data_log = await this.setDataToLog();
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.insertParalelaSecuencial(params, this.namesCrud);
            if (response && response.dataWasInserted) {
                this.messageService.add({
                    key: 'main',
                    severity: 'success',
                    detail: generateMessage(this.namesCrud, response.dataInserted.prerr, 'creado', true, false)
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
            const data_params = this.form.setParamsForm();
            const { data_asignaturas_old, data_paralelasecuencial_old, ...filteredForm } = data_params as { [key: string]: any };
            
            let params = { 
                data_log, 
                ...filteredForm, 
                data_asignaturas_old: await filterDataFromArrayAsync(data_asignaturas_old),
                data_paralelasecuencial_old: await filterDataFromArrayAsync(data_paralelasecuencial_old)
            }
            const response = await this.backend.updateParalelaSecuencial(params, this.namesCrud);
            if (response && response.dataWasUpdated && response.dataWasUpdated !== 0) {
                if (response.dataWasUpdated === 1) {
                    this.messageService.add({
                        key: 'main',
                        severity: 'success',
                        detail: generateMessage(this.namesCrud, response.dataUpdated.prerr, 'actualizado', true, false)
                    });
                    this.emitActionToBD();
                }else{
                    this.messageService.add({
                        key: 'main',
                        severity: 'info',
                        detail: generateMessage(this.namesCrud, response.dataUpdated.prerr, 'actualizado', false, false)
                    });
                }
            }
        } catch (error) {
            console.log(error);
        } finally {
            this.dialogForm = false;
            if (this.needUpdateHistorial) this.historialActividad.refreshHistorialActividad();
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: ParalelaSecuencial[]) {
        try {
            const response = await this.backend.deleteParalelaSecuencial(dataToDelete, this.namesCrud);
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
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_plural} <b>${this.paralelidad_secuencialidad.nombre_asignatura_completa}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = [];
                dataToDelete.push(this.paralelidad_secuencialidad);
                await this.deleteRegisters(dataToDelete);
            }
        });
    }

    async openConfirmationDeleteSelected() {
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud, data, true, 'nombre_asignatura_completa');
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
        this.onActionToBD.next();
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
            await this.getAsignaturasSecuencialesParalelasGroupedNotForm(false);
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
                this.getAsignaturasParalelaSecuencial(false,false),
            ]);
            
            const responseTable1 = await this.setTableAsignatura()
            const responseTable2 = await this.setTableSecuencialidadParalelidad()
            if (responseTable1 && responseTable2) {
                this.form.showTableAsignatura = true;
            }

        }else{
            if (this.form.dataExternal.data === true) {
                this.form.setDataExternal(this.form.dataExternal);
                this.form.setValuesVarsByDataExternal();
                await Promise.all([
                    this.getProgramasPorFacultad(false,false),
                    this.getPlanesDeEstudiosPorPrograma(false,false),
                    this.getAsignaturasParalelaSecuencial(false,false),
                    this.getAsignaturasParalelaSecuencialNotFiltered(false,false),
                    
                ]);
                this.form.setControlsFormByDataExternal();
            }
        }
    }

    async setTableAsignatura(): Promise<boolean> {
        try {
            console.log("this.asignaturas_grouped setTableAsignatura",this.asignaturas_grouped);
            console.log("this.paralelidad_secuencialidad setTableAsignatura",this.paralelidad_secuencialidad);
            
            this.asignaturas_grouped.forEach(asign => {
                // se verifica si el key coincide con cod_asignatura del prerrequisito seleccionado
                if (asign.key === this.paralelidad_secuencialidad.cod_asignatura) {
                    this.table.selectedAsignaturaRows[asign.key] = {
                        partialChecked: false,
                        checked: true,
                    };
                }
        
                if (asign.children && asign.children.length > 0) {
                    // se itera sobre las asign hijas (temas)
                    asign.children.forEach((child: any) => {
                        // se recorre el arreglo de temas en prerrequisito seleccionado
                        if (this.paralelidad_secuencialidad.paralelidad === 1) {
                            this.paralelidad_secuencialidad.paralelas?.forEach(pre => {
                                //si coincide cod_tema, se deja con checked activado
                                if (child.data.cod_tema === pre.asignatura.cod_tema) {
                                    this.table.selectedAsignaturaRows[child.key] = {
                                        partialChecked: false,
                                        checked: true,
                                    };
                                }
                            });
                        }else{
                            this.paralelidad_secuencialidad.secuenciales?.forEach(pre => {
                                //si coincide cod_tema, se deja con checked activado
                                if (child.data.cod_tema === pre.asignatura.cod_tema) {
                                    this.table.selectedAsignaturaRows[child.key] = {
                                        partialChecked: false,
                                        checked: true,
                                    };
                                }
                            });
                        }
                    });
    
                    // validacion del estado de partialChecked y checked para las asign hijas (temas)
                    const allChildrenChecked = asign.children.every((child: any) =>
                        this.table.selectedAsignaturaRows[child.key]?.checked === true
                    );
                    if (!allChildrenChecked && asign.key === this.paralelidad_secuencialidad.cod_asignatura) {
                        //si de las asign hijas no están todas seleccionadas, la asign padre queda con partialcheked activado
                        this.table.selectedAsignaturaRows[asign.key] = {
                            partialChecked: true, 
                            checked: false, 
                        };
                    }
                }
            });
            this.form.setAsignaturasOld(this.table.selectedAsignaturaRows,this.asignaturas_grouped);
            return true
        } catch (error) {
            return false
        }
    }
    
    async setTableSecuencialidadParalelidad(): Promise<boolean>{
        try {
            await this.getAsignaturasParalelaSecuencialNotFiltered(false,false)
            
            if (this.form.asignaturas_selected.length !== 0) {
                await this.filterTableSecuencialidadParalelidadPorAsignSelected('setTableSecuencialidadParalelidad')
            }
    
            this.asign_sec_par.forEach(pre_g => {
                if (this.paralelidad_secuencialidad.paralelidad === 1) {
                    this.paralelidad_secuencialidad.paralelas?.forEach(pre => {
        
                        if (pre_g.key === pre.sec_par.cod_asignatura) {
                            this.table.selectedParalelaSecuencialRows[pre_g.key] = {
                                partialChecked: false,
                                checked: true,
                            };
                        }
                        
                        if (pre_g.children && pre_g.children.length > 0) {
                            // se itera sobre las asign hijas (temas)
                            pre_g.children.forEach((child: any) => {
                                // se recorre el arreglo de temas en prerrequisito seleccionado
                                this.paralelidad_secuencialidad.paralelas?.forEach( pre  => {
                                    if (child.data.cod_tema === pre.sec_par.cod_tema) {
                                        //si coincide cod_tema, se deja con checked activado
                                        this.table.selectedParalelaSecuencialRows[child.key] = {
                                            partialChecked: false,
                                            checked: true,
                                        };
                                    }
                                });
                            });
                
                            // validacion del estado de partialChecked y checked para las asign hijas (temas)
                            const allChildrenChecked = pre_g.children.every((child: any) =>
                                this.table.selectedParalelaSecuencialRows[child.key]?.checked === true
                            );
        
                            if (!allChildrenChecked && pre_g.key === pre.sec_par.cod_asignatura) {
                                //si de las asign hijas no están todas seleccionadas, la asign padre queda con partialcheked activado
                                this.table.selectedParalelaSecuencialRows[pre_g.key] = {
                                    partialChecked: true, 
                                    checked: false, 
                                };
                            }
                        }
                    })
                }else{
                    this.paralelidad_secuencialidad.secuenciales?.forEach(pre => {
        
                        if (pre_g.key === pre.sec_par.cod_asignatura) {
                            this.table.selectedParalelaSecuencialRows[pre_g.key] = {
                                partialChecked: false,
                                checked: true,
                            };
                        }
                        
                        if (pre_g.children && pre_g.children.length > 0) {
                            // se itera sobre las asign hijas (temas)
                            pre_g.children.forEach((child: any) => {
                                // se recorre el arreglo de temas en prerrequisito seleccionado
                                this.paralelidad_secuencialidad.secuenciales?.forEach( pre  => {
                                    if (child.data.cod_tema === pre.sec_par.cod_tema) {
                                        //si coincide cod_tema, se deja con checked activado
                                        this.table.selectedParalelaSecuencialRows[child.key] = {
                                            partialChecked: false,
                                            checked: true,
                                        };
                                    }
                                });
                            });
                
                            // validacion del estado de partialChecked y checked para las asign hijas (temas)
                            const allChildrenChecked = pre_g.children.every((child: any) =>
                                this.table.selectedParalelaSecuencialRows[child.key]?.checked === true
                            );
        
                            if (!allChildrenChecked && pre_g.key === pre.sec_par.cod_asignatura) {
                                //si de las asign hijas no están todas seleccionadas, la asign padre queda con partialcheked activado
                                this.table.selectedParalelaSecuencialRows[pre_g.key] = {
                                    partialChecked: true, 
                                    checked: false, 
                                };
                            }
                        }
                    })
                }
                
            })
            this.form.showTableParalelaSecuencial = true;
            this.form.setParalelasecuencial_old(this.table.selectedParalelaSecuencialRows,this.asign_sec_par);
            return true
        } catch (error) {
            return false
        }
    }

    async filterTableSecuencialidadParalelidadPorAsignSelected(llamado_desde: string){
        
        //esta funcion se encarga de filtrar las asign que pueden ser seleccionadas
        //solo se activa en modo: create y edit
        if (this.form.modeForm !== 'show') {

            this.form.showTableParalelaSecuencial = false;
            
            // primero se filtra el arreglo que se envía al controlador excluyendo los elementos seleccionados
            const asignFiltradas = this.asign_sec_par_aux.map(item => {
                // si la asign principal coincide con las asignaturas seleccionadas
                const matchAsign = this.form.asignaturas_selected.find(selected => selected.cod_asignatura === item.key);

                if (!matchAsign) {
                    // no coincide, mantener la asign 
                    return item;
                }

                // si la asign tiene hijos (temas), verificar si alguno coincide con el filtro
                if (item.children && item.children.length > 0) {
                    const filteredTemas = item.children.filter((child: any) =>
                        !this.form.asignaturas_selected.some(selected =>
                            selected.cod_asignatura === child.data.cod_asignatura &&
                            (selected.cod_tema === null || selected.cod_tema === child.data.cod_tema)
                        )
                    );

                    // Si hay temas restantes, actualizar los temas
                    if (filteredTemas.length > 0) {
                        return { ...item, children: filteredTemas, expanded: false };
                    } else {
                        return null; // Excluir todos los temas si todos los temas coinciden
                    }
                }

                // Forzar expanded: false para los elementos sin hijos que coinciden
                return null
            }).filter(item => item !== null); // se eliminan finalmente las asign encontradas

            //se setea el arreglo de la tabla
            this.asign_sec_par = [...asignFiltradas];

            //luego se filtra el objeto que maneja el treetable de primeng 
            const asignSelected = Object.fromEntries(
                Object.entries(this.table.selectedParalelaSecuencialRows).filter(([key, value]) =>
                    !this.form.asignaturas_selected.some(asignatura =>
                        key === asignatura.cod_asignatura || 
                        (key.startsWith(asignatura.cod_asignatura) && asignatura.cod_tema !== null && key.endsWith(asignatura.cod_tema)) 
                    )
                )
            );

            //se setea el objeto de las asign seleccionadas
            this.table.selectedParalelaSecuencialRows = {...asignSelected}
            
            //se parsean las asign seleccionadas y se actualiza el formulario
            const parsedAsignaturas = parseAsignaturas(asignSelected, this.asign_sec_par)
            this.form.setParalelaSecuencial(parsedAsignaturas);

            //finalmente, en el caso de no haber ninguna asign seleccionada, no se muestra la tabla 
            if (this.form.asignaturas_selected.length !== 0) {
                this.form.showTableParalelaSecuencial = true;
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

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' | 'plan' | 'asignaturas_sec' | 'asignaturas_par') {
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

    showMessageSinResultadosAsignaturasSecuenciales(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'asignaturas_sec')
    }

    showMessageSinResultadosAsignaturasParalelas(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'asignaturas_par')
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
        this.openedFromPageMantenedor = need;
        this.needUpdateHistorial = need;
    }

    async setDataToLog(needAux = false){
        const dataPrincipalControls = await this.form.getDataPrincipalControls();
        let dataToLog_aux ;
        if (needAux) {
            //se necesita obtener valores anteriores para el log
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.paralelidad_secuencialidad.cod_facultad);
            let programaSelected_aux = this.programas_postgrado.find( f => f.Cod_Programa === this.paralelidad_secuencialidad.cod_programa);
            let planSelected_aux = this.planes.find( f => f.cod_plan_estudio === this.paralelidad_secuencialidad.cod_plan_estudio);
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