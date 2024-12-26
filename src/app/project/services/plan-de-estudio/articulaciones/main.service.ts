import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MessageServiceGP } from '../../components/message-service.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { ConfirmationService } from 'primeng/api';
import { BackendArticulacionesService } from './backend.service';
import { FormArticulacionesService } from './form.service';
import { TableArticulacionesService } from './table.service';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { Subject } from 'rxjs';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { Articulacion } from 'src/app/project/models/plan-de-estudio/Articulacion';
@Injectable({
    providedIn: 'root'
})

export class ArticulacionesMainService {

    namesCrud: NamesCrud = {
        singular: 'articulación',
        plural: 'articulaciones',
        articulo_singular: 'la articulación',
        articulo_plural: 'las articulaciones',
        genero: 'femenino'
    }

    articulaciones: Articulacion[] = [];
    articulacion: Articulacion = {};
    planes: PlanDeEstudio[] = []

    cod_facultad_selected: number = 0;
    cod_programa_selected: number = 0;
    showTables: boolean = false; 
    showDropdownSelectFacultad: boolean = false;

    programas: any[] = [];
    asignaturas: any[] = [];

    //MODAL
    dialogForm: boolean = false

    private onInsertedData = new Subject<void>();
    onInsertedData$ = this.onInsertedData.asObservable();

    constructor(
        private backend: BackendArticulacionesService,
        private confirmationService: ConfirmationService,
        private form: FormArticulacionesService,
        private messageService: MessageServiceGP,
        private table: TableArticulacionesService
    ){
        this.form.initForm();
    }

    get modeForm(){
        return this.form.modeForm;
    }

    async setModeCrud(mode: ModeForm, data?: Articulacion | null){
        this.form.modeForm = mode;
        if (data) this.articulacion = {...data};
        // console.log("this.articulacion",this.articulacion);
        
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
        this.cod_facultad_selected = 0;
        this.cod_programa_selected = 0;
        this.programas = [];
        this.asignaturas = [];
    }
    
    emitResetExpandedRows(){
        this.table.emitResetExpandedRows();
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.articulaciones.length, this.namesCrud);
    }

    async getPlanesDeEstudios(showCountTableValues: boolean = true): Promise<PlanDeEstudio[]>{
        // this.tipos = await this.backend.getPlanesDeEstudios(this.namesCrud);
        this.planes.push({Cod_plan_estudio: 1})
        this.planes.push({Cod_plan_estudio: 2})
        if (showCountTableValues) this.countTableValues();
        return this.planes;
    }

    async getArticulaciones(showCountTableValues: boolean = true): Promise<Articulacion[]>{
        this.articulaciones = await this.backend.getArticulaciones(this.namesCrud);
        if (showCountTableValues) this.countTableValues();
        return this.articulaciones;
    }

    async getProgramasPregradoPorFacultad(showCountTableValues: boolean = true){
        let params = { codFacultad: this.cod_facultad_selected }
        const response = await this.backend.getProgramasPregradoPorFacultad(params);
        if (response) {
          this.programas = [...response];
          if (this.programas.length === 0 ) {
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
                  detail: this.programas.length > 1
                    ? `${this.programas.length} programas cargados.`
                    : `${this.programas.length} programa cargado.`
                });
            }
          }
        }
        // console.log("this.programas",this.programas);
        
    }

    async getAsignaturasPorProgramaPregrado(showCountTableValues: boolean = true){
        let params = { codPrograma: this.cod_programa_selected }
        const response = await this.backend.getAsignaturasPorProgramaPregrado(params);
        if (response) {
          this.asignaturas = [...response];
          if (this.asignaturas.length === 0 ) {
              this.messageService.add({
                key: 'main',
                severity: 'warn',
                detail: `No se encontraron asignaturas para el programa seleccionado.`
              });
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
            this.getArticulaciones(false);
            this.reset()
        }
    }

    async updateForm(){
        try {
            let params = { 
                ...this.form.fbForm.value,
                Cod_Articulacion: this.articulacion.Cod_Articulacion
            }
            console.log("params",params);

            const response = await this.backend.updateArticulacion(params,this.namesCrud);
            console.log("response",response);
            
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
            this.getArticulaciones(false);
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
            this.getArticulaciones(false);
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

    async setTables(){
        this.cod_facultad_selected = this.articulacion.Cod_Facultad_Selected!;
        this.cod_programa_selected = this.articulacion.Cod_programa_pregrado!;
        this.table.selectedAsignaturaRows = [...this.articulacion.Asignaturas!]
        await Promise.all([
            this.getProgramasPregradoPorFacultad(false),
            this.getAsignaturasPorProgramaPregrado(false)
        ]);
        this.setTablePrograma();
    }

    setTablePrograma(){
        switch (this.form.modeForm) {
            case 'show':
                this.programas = this.programas.filter( prog => prog.codPrograma === this.articulacion.Cod_programa_pregrado!)
            break;

            case 'edit':
                let valueIndex: number = 0;
                this.programas.forEach((prog , index) => {
                    if (prog.codPrograma === this.articulacion.Cod_programa_pregrado) {
                        valueIndex = index
                    }
                });
                this.table.selectedProgramaRows = [this.programas[valueIndex]];
            break;
        }
    }

    showElements(){
        this.showDropdownSelectFacultad = true;
        this.showTables = true;
    }

    hideElements(){
        this.showDropdownSelectFacultad = false;
        this.showTables = false;
    }


}