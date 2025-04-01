import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { filterDataFromArrayAsync, generateMessage, mergeNames, parseAsignaturas } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService, Message } from 'primeng/api';
import { RangoAG } from 'src/app/project/models/plan-de-estudio/RangoAG';
import { BackendPrerrequisitosService } from './backend.service';
import { FormPrerrequisitosService } from './form.service';
import { TablePrerrequisitosService } from './table.service';
import { Subject } from 'rxjs';
import { LoadinggpService } from '../../components/loadinggp.service';
import { DataExternal } from 'src/app/project/models/shared/DataExternal';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { Prerrequisito } from 'src/app/project/models/asignaturas/Prerrequisito';
import { FacultadesMainService } from '../../programas/facultad/main.service';

@Injectable({
  providedIn: 'root'
})
export class PrerrequisitosMainService {

    namesCrud: NamesCrud = {
        singular: 'prerrequisito de asignatura',
        plural: 'prerrequisitos de asignaturas',
        articulo_singular: 'el prerrequisito de asignatura',
        articulo_plural: 'los prerrequisitos de la asignatura',
        genero: 'masculino'
    };

    prerrequisitos: any[] = [];
    prerrequisito: Prerrequisito = {};

    message: any = {
        'facultad'  : 'No se encontraron programas para la facultad seleccionada.',
        'programa'  : 'No se encontraron planes de estudios para el programa seleccionado.',
        'plan'      : 'No se encontraron asignaturas con prerrequisitos para el plan de estudio seleccionado.',
        'asignaturas' : 'No se encontraron asignaturas con la opción "¿Tiene prerrequisitos?" habilitada para el plan de estudio seleccionado.',
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
    asignaturas_grouped: any[] = [];
    prerrequisitos_grouped: any[] = [];
    prerrequisitos_grouped_aux: any[] = [];

    dialogForm: boolean = false;
    needUpdateHistorial: boolean = false;
    openedFromPageMantenedor: boolean = false;


    private onActionToBD = new Subject<void>();
    onActionToBD$ = this.onActionToBD.asObservable();

    constructor(
        private backend: BackendPrerrequisitosService,
        private confirmationService: ConfirmationService,
        private form: FormPrerrequisitosService,
        private messageService: MessageServiceGP,
        private table: TablePrerrequisitosService,
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
        if (data) this.prerrequisito = { ...data };
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

    resetArraysWhenChangedDropdownFacultad(){
        this.programas_postgrado = [];
        this.planes = [];
    }

    resetArraysData(){
        this.programas_postgrado = [];
    }

    resetAndClearTables(){
        this.table.selectedAsignaturaRows = {};
        this.table.selectedPrerrequisitoRows = {};
        this.form.setAsignatura([]);
        this.form.setPrerrequisito([]);
        this.form.resetShowTables();
    }

    emitResetExpandedRows() {
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.prerrequisitos.length, this.namesCrud);
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

    async getAsignaturasPrerrequisitoHabilitado(showCountTableValues: boolean = true, needShowLoading = true){
        let valuesPrincipalControls = {
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform,
            cod_asignatura : this.cod_asignatura
        }
        let params = { cod_plan_estudio: this.form.cod_planestudio_selected, valuesPrincipalControls }
        const response = await this.backend.getAsignaturasPrerrequisitoHabilitado(params,needShowLoading);
        if (response) {
          this.asignaturas_grouped = [...response];
          if (this.asignaturas_grouped.length === 0 ) {
            this.resetAndClearTables();
            this.showMessageSinResultadosAsignaturas('f');
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
            if (this.form.modeForm === 'create') this.form.showTableAsignatura = true;
            this.clearMessagesSinResultados('f');
          }
        }
    }

    async getAsignaturasSimplificatedConTemaAgrupado(showCountTableValues: boolean = true, needShowLoading = true){
        let params = { cod_plan_estudio: this.form.cod_planestudio_selected }
        const response = await this.backend.getAsignaturasSimplificatedConTemaAgrupado(params,needShowLoading);
        if (response) {
          this.prerrequisitos_grouped = [...response];
          this.prerrequisitos_grouped_aux = [...response];
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

    async getAsignaturasConPrerrequisitos(showCountTableValues: boolean = true, needShowLoading = true): Promise<RangoAG[]> {
        let valuesPrincipalControls = {
            cod_facultad: this.cod_facultad_selected_notform, 
            cod_programa: this.cod_programa_postgrado_selected_notform, 
            cod_plan_estudio: this.cod_plan_estudio_selected_notform,
            cod_asignatura : this.cod_asignatura
        }
        let params = { cod_plan_estudio: this.cod_plan_estudio_selected_notform, valuesPrincipalControls }
        this.prerrequisitos = await this.backend.getAsignaturasConPrerrequisitos(params,needShowLoading);
        this.prerrequisitos.length !== 0 ? (this.showTable = true , this.clearMessagesSinResultados('m')) : (this.showTable = false , this.showMessageSinResultados('m'))
        if (showCountTableValues && this.prerrequisitos.length !== 0) this.countTableValues();
        return this.prerrequisitos
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
        this.form.setForm('show', this.prerrequisito);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async editForm() {
        this.form.resetForm();
        this.resetAndClearTables();
        this.form.setForm('edit', this.prerrequisito);
        await this.setDropdownsAndTablesForm();
        this.dialogForm = true;
    }

    async insertForm() {
        try {
            const data_log = await this.setDataToLog();
            const data_params = this.form.setParamsForm();
            let params = { ...data_params, data_log }
            const response = await this.backend.insertPrerrequisitos(params, this.namesCrud);
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
            const { data_asignaturas_old, data_prerrequisitos_old, ...filteredForm } = data_params as { [key: string]: any };
            let params = { 
                data_log, 
                ...filteredForm, 
                data_asignaturas_old: await filterDataFromArrayAsync(data_asignaturas_old),
                data_prerrequisitos_old: await filterDataFromArrayAsync(data_prerrequisitos_old)
            }
            const response = await this.backend.updatePrerrequisitos(params, this.namesCrud);
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

    async deleteRegisters(dataToDelete: RangoAG[]) {
        try {
            const response = await this.backend.deletePrerrequisitos(dataToDelete, this.namesCrud);
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
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_plural} <b>${this.prerrequisito.nombre_asignatura_completa}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = [];
                dataToDelete.push(this.prerrequisito);
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
            await this.getAsignaturasConPrerrequisitos(false);
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
                this.getAsignaturasPrerrequisitoHabilitado(false,false),
            ]);
            const responseTable1 = await this.setTableAsignatura()
            const responseTable2 = await this.setTablePrerrequisitos()
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
                    this.getAsignaturasPrerrequisitoHabilitado(false,false),
                    this.getAsignaturasSimplificatedConTemaAgrupado(false,false),
                ]);
                this.form.setControlsFormByDataExternal();
            }
        }
    }

    async setTableAsignatura(): Promise<boolean> {
        try {
            this.asignaturas_grouped.forEach(asign => {
                // se verifica si el key coincide con cod_asignatura del prerrequisito seleccionado
                if (asign.key === this.prerrequisito.cod_asignatura) {
                    this.table.selectedAsignaturaRows[asign.key] = {
                        partialChecked: false,
                        checked: true,
                    };
                }
        
                if (asign.children && asign.children.length > 0) {
                    // se itera sobre las asign hijas (temas)
                    asign.children.forEach((child: any) => {
                        // se recorre el arreglo de temas en prerrequisito seleccionado
                        this.prerrequisito.prerrequisitos?.forEach(pre => {
                            //si coincide cod_tema, se deja con checked activado
                            if (child.data.cod_tema === pre.asignatura.cod_tema) {
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
                    if (!allChildrenChecked && asign.key === this.prerrequisito.cod_asignatura) {
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
    
    async setTablePrerrequisitos(): Promise<boolean>{
        try {
            await this.getAsignaturasSimplificatedConTemaAgrupado(false,false);
            if (this.form.asignaturas_selected.length !== 0) {
                this.filterTablePrerrequisitosPorAsignSelected()
            }
    
            this.prerrequisitos_grouped.forEach(pre_g => {
                this.prerrequisito.prerrequisitos?.forEach(pre => {
    
                    if (pre_g.key === pre.prerrequisito.cod_asignatura) {
                        this.table.selectedPrerrequisitoRows[pre_g.key] = {
                            partialChecked: false,
                            checked: true,
                        };
                    }
                    
                    if (pre_g.children && pre_g.children.length > 0) {
                        // se itera sobre las asign hijas (temas)
                        pre_g.children.forEach((child: any) => {
                            // se recorre el arreglo de temas en prerrequisito seleccionado
                            this.prerrequisito.prerrequisitos?.forEach( pre  => {
                                if (child.data.cod_tema === pre.prerrequisito.cod_tema) {
                                    //si coincide cod_tema, se deja con checked activado
                                    this.table.selectedPrerrequisitoRows[child.key] = {
                                        partialChecked: false,
                                        checked: true,
                                    };
                                }
                            });
                        });
            
                        // validacion del estado de partialChecked y checked para las asign hijas (temas)
                        const allChildrenChecked = pre_g.children.every((child: any) =>
                            this.table.selectedPrerrequisitoRows[child.key]?.checked === true
                        );
    
                        if (!allChildrenChecked && pre_g.key === pre.prerrequisito.cod_asignatura) {
                            //si de las asign hijas no están todas seleccionadas, la asign padre queda con partialcheked activado
                            this.table.selectedPrerrequisitoRows[pre_g.key] = {
                                partialChecked: true, 
                                checked: false, 
                            };
                        }
                    }
                })
                
            })
            this.form.showTablePrerrequisitos = true;
            this.form.setPrerrequisitosOld(this.table.selectedPrerrequisitoRows,this.prerrequisitos_grouped);
            return true
        } catch (error) {
            return false
        }

    }

    async filterTablePrerrequisitosPorAsignSelected(){
        if (this.form.modeForm !== 'show') {
            //esta funcion se encarga de filtrar los prerequisitos que pueden ser seleccionados, sirve para que una asig no se tenga como prerrequisito a si misma
            this.form.showTablePrerrequisitos = false;

            // primero se filtra el arreglo que se envía al controlador excluyendo los elementos seleccionados
            const asignFiltradas = this.prerrequisitos_grouped_aux.map(item => {
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
            this.prerrequisitos_grouped = [...asignFiltradas];

            //luego se filtra el objeto que maneja el treetable de primeng 
            const asignSelected = Object.fromEntries(
                Object.entries(this.table.selectedPrerrequisitoRows).filter(([key, value]) =>
                    !this.form.asignaturas_selected.some(asignatura =>
                        key === asignatura.cod_asignatura || 
                        (key.startsWith(asignatura.cod_asignatura) && asignatura.cod_tema !== null && key.endsWith(asignatura.cod_tema)) 
                    )
                )
            );

            //se setea el objeto de las asign seleccionadas
            this.table.selectedPrerrequisitoRows = {...asignSelected}

            //se parsean las asign seleccionadas y se actualiza el formulario
            const parsedAsignaturas = parseAsignaturas(asignSelected, this.prerrequisitos_grouped)
            this.form.setPrerrequisito(parsedAsignaturas);

            if (this.form.asignaturas_selected.length !== 0) {
                this.form.showTablePrerrequisitos = true;
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

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' | 'plan' | 'asignaturas') {
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

    showMessageSinResultadosAsignaturas(key: 'm' | 'f'){
        this.showMessagesSinResultados(key, 'asignaturas')
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
            let facultadSelected_aux = this.mainFacultad.facultades.find( f => f.Cod_facultad === this.prerrequisito.cod_facultad);
            let programaSelected_aux = this.programas_postgrado.find( f => f.Cod_Programa === this.prerrequisito.cod_programa);
            let planSelected_aux = this.planes.find( f => f.cod_plan_estudio === this.prerrequisito.cod_plan_estudio);
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