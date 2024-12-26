import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { AsignaturasPlancomun } from 'src/app/project/models/plan-de-estudio/AsignaturasPlancomun';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendAsignaturasPlancomunService } from './backend.service';
import { ConfirmationService } from 'primeng/api';
import { FormAsignaturasPlancomunService } from './form.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { TableAsignaturasPlancomunService } from './table.service';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Injectable({
    providedIn: 'root'
})

export class AsignaturasPlancomunMainService {

    namesCrud: NamesCrud = {
        singular: 'asignatura para plan común',
        plural: 'asignaturas para plan común',
        articulo_singular: 'la asignatura para plan común',
        articulo_plural: 'las asignaturas para plan común',
        genero: 'femenino'
    }

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

    asignaturas_plancomun: AsignaturasPlancomun[] = [];
    asignatura_plancomun: AsignaturasPlancomun = {};
    planes: PlanDeEstudio[] = [];
    programas_postgrado: any[] = [];

    showTables: boolean = false; 
    showDropdownSelectProgramaPostgrado: boolean = false;
    showDropdownSelectPlanEstudio: boolean = false;
    cod_facultad_selected_postgrado: number = 0;
    cod_programa_postgrado_selected: number = 0;
    cod_planestudio_selected: number = 0;

    //MODAL
    dialogForm: boolean = false

    private onInsertedData = new Subject<void>();
    onInsertedData$ = this.onInsertedData.asObservable();

    constructor(
        private backend: BackendAsignaturasPlancomunService,
        private confirmationService: ConfirmationService,
        private form: FormAsignaturasPlancomunService,
        private messageService: MessageServiceGP,
        private table: TableAsignaturasPlancomunService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: AsignaturasPlancomun | null){
        this.form.modeForm = mode;
        if (data) this.asignatura_plancomun = {...data};
        
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
        this.form.resetForm();
        this.table.emitResetExpandedRows();
        this.table.resetSelectedRows();
        this.resetValuesSelected();
        this.hideElements();
    }

    resetValuesSelected(){
        this.cod_programa_postgrado_selected = 0;
        this.cod_planestudio_selected = 0;
        this.asignaturas_plancomun = [];
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

    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.asignaturas_plancomun.length, this.namesCrud);
    }

    async getProgramasPorFacultad(showCountTableValues: boolean = true, needShowLoading = true){
		let params = { Cod_facultad: this.cod_facultad_selected_postgrado }
		const response = await this.backend.getProgramasPorFacultad(params,needShowLoading);
		if (response) {
		  this.programas_postgrado = [...response];
		  if (this.programas_postgrado.length === 0 ) {
            this.showDropdownSelectProgramaPostgrado = false;
			  this.messageService.add({
				key: 'main',
				severity: 'warn',
				detail: `No se encontraron programas para la facultad seleccionada.`
			  });
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
            this.showDropdownSelectProgramaPostgrado = true
		  }
		}
	}

    async getPlanesDeEstudiosPorPrograma(showCountTableValues: boolean = true){
        let params = { Cod_Programa: this.cod_programa_postgrado_selected }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.showDropdownSelectPlanEstudio = false;
              this.messageService.add({
                key: 'main',
                severity: 'warn',
                detail: `No se encontraron planes de estudios para el programa seleccionado.`
              });
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
            this.showDropdownSelectPlanEstudio = true;
          }
        }
    }

    async getAsignaturasPorPlanDeEstudio(showCountTableValues: boolean = true){
        let params = { Cod_plan_estudio: this.cod_planestudio_selected }
        const response = await this.backend.getAsignaturasPorPlanDeEstudio(params);
        if (response) {
            this.asignaturas_plancomun = [...response];
            if (this.asignaturas_plancomun.length === 0 ) {
                this.showTables = false;
                this.messageService.add({
                    key: 'main',
                    severity: 'warn',
                    detail: `No se encontraron asignaturas para el plan de estudio seleccionado.`
                });
            }else{
                if (showCountTableValues){
                    this.messageService.add({
                    key: 'main',
                    severity: 'info',
                    detail: this.asignaturas_plancomun.length > 1
                        ? `${this.asignaturas_plancomun.length} asignaturas cargadas.`
                        : `${this.asignaturas_plancomun.length} asignatura cargada.`
                    });
                }
                this.showTables = true;
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
			  this.messageService.add({
				key: 'main',
				severity: 'warn',
				detail: `No se encontraron programas para la facultad seleccionada.`
			  });
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
              this.messageService.add({
                key: 'main',
                severity: 'warn',
                detail: `No se encontraron planes de estudios para el programa seleccionado.`
              });
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
          }
        }
    }

    async getAsignaturasPlanComunPorPlanDeEstudio(showCountTableValues: boolean = true, needShowLoading = true): Promise<AsignaturasPlancomun[]>{
        //todo: falta para llenar la tabla
        this.asignaturas_plancomun = []
        return this.asignaturas_plancomun
    }

    async createForm(){
        await this.reset();
        this.dialogForm = true;
    }

    async showForm(){
        await this.reset();
        this.form.setForm('show',this.asignatura_plancomun);
        await this.setTables();
        this.showElements();
        this.dialogForm = true;
    }

    async editForm(){
        await this.reset();
        this.form.setForm('edit',this.asignatura_plancomun);
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
            this.getAsignaturasPlanComunPorPlanDeEstudio(false);
            this.reset()
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                Cod_Articulacion: this.asignatura_plancomun.Cod_plan_estudio
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
            // this.getArticulaciones(false);
            this.reset();
        }
    }

    async deleteRegisters(dataToDelete: AsignaturasPlancomun[]){
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
            // this.getArticulaciones(false);
            this.reset();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
            header: 'Confirmar',
            message: `Es necesario confirmar la acción para eliminar ${this.namesCrud.articulo_singular} <b>${this.asignatura_plancomun.Cod_plan_estudio}</b>. ¿Desea confirmar?`,
            acceptLabel: 'Si',
            rejectLabel: 'No',
            icon: 'pi pi-exclamation-triangle',
            key: 'main-gp',
            acceptButtonStyleClass: 'p-button-danger p-button-sm',
            rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
            accept: async () => {
                let dataToDelete = []
                dataToDelete.push(this.asignatura_plancomun);
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

    async setTables(){

    }

    resetArraysWhenChangedDropdownFacultad(){
        this.programas_postgrado = [];
        this.planes = [];
        this.asignaturas_plancomun = [];
    }

    resetArraysWhenChangedDropdownPrograma(){
        this.planes = [];
        this.asignaturas_plancomun = [];
    }

    resetArraysWhenChangedDropdownPE(){
        this.asignaturas_plancomun = [];
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

    
}