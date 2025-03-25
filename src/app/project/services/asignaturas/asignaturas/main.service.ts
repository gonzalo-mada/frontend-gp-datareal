import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendAsignaturasService } from './backend.service';
import { ConfirmationService, Message } from 'primeng/api';
import { FormAsignaturasService } from './form.service';
import { MessageServiceGP } from '../../components/message-service.service';
import { Router } from '@angular/router';
import { TableAsignaturasService } from './table.service';
import { Asignatura } from 'src/app/project/models/asignaturas/Asignatura';
import { Programa } from 'src/app/project/models/programas/Programa';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { HistorialActividadService } from '../../components/historial-actividad.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Injectable({
    providedIn: 'root'
})


export class AsignaturasMainService {

    namesCrud: NamesCrud = {
        singular: 'asignatura',
        plural: 'asignaturas',
        articulo_singular: 'la asignatura',
        articulo_plural: 'las asignaturas',
        genero: 'femenino',
    }

	message: any = {
        'facultad': 'No se encontraron programas para la facultad seleccionada.',
        'programa': 'No se encontraron planes de estudios para el programa seleccionado.',
        'plan':     'No se encontraron asignaturas para el plan de estudio seleccionado.'
    }
    messagesMantenedor: Message[] = [];
    messagesFormulario: Message[] = [];

    mode: ModeForm;
    asignaturas: Asignatura[] = [];
    asignatura: Asignatura = {};
    cod_asignatura: string = '';
    programas_postgrado: Programa[] = [];
    planes: PlanDeEstudio[] = [];

    op_asign: any[] = [];
    menciones_asign: any[] = [];
    temas_asign: any[] = [];

    showTable: boolean = false;
    disabledDropdownPrograma: boolean = true;
    disabledDropdownPlanDeEstudio: boolean = true;
    cod_facultad_selected: number = 0;
    cod_programa_selected: number = 0;
    cod_planestudio_selected: number = 0;

    constructor(
        private backend: BackendAsignaturasService,
        private confirmationService: ConfirmationService,
        private form: FormAsignaturasService,
        private messageService: MessageServiceGP,
        private router: Router,
        private table: TableAsignaturasService,
        private historialActividad: HistorialActividadService
    ){}

    async setModeCrud(mode: ModeForm, data?: Asignatura | null){
        this.form.modeForm = mode;
        if (data) this.asignatura = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'delete': this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
            case 'historial': this.openHistorialActividad(); break;
        }
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.asignaturas.length, this.namesCrud);
    }
    
    reset(){
        this.asignaturas = [];
        this.showTable = false;
        this.cod_facultad_selected = 0;
        this.cod_programa_selected = 0;
        this.cod_planestudio_selected = 0;
        this.clearAllMessages();
    }

    resetWhenChangedDropdownFacultad(){
		this.showTable = false;
		this.cod_programa_selected = 0;
        this.cod_planestudio_selected = 0;
	}

    resetWhenChangedDropdownPrograma(){
		this.showTable = false;
		this.cod_planestudio_selected = 0;
	}

    async getProgramasPorFacultad(){
        let params = { Cod_facultad: this.cod_facultad_selected }
        const response = await this.backend.getProgramasPorFacultad(params);
        if (response) {
          this.programas_postgrado = [...response];
          if (this.programas_postgrado.length === 0 ) {
            this.disabledDropdownPrograma = true;
            this.disabledDropdownPlanDeEstudio = true;
            this.showTable = false
            this.showMessageSinResultadosPrograma('m');
          }else{
            this.messageService.add({
                key: 'main',
                severity: 'info',
                detail: this.programas_postgrado.length > 1
                ? `${this.programas_postgrado.length} programas cargados.`
                : `${this.programas_postgrado.length} programa cargado.`
            });
            this.clearMessagesSinResultados('m');
            this.disabledDropdownPrograma = false;
            this.disabledDropdownPlanDeEstudio = false;
          }
        }
    }

    async getPlanesDeEstudiosPorPrograma(){
        let params = { Cod_Programa: this.cod_programa_selected }
        const response = await this.backend.getPlanesDeEstudiosPorPrograma(params);
        if (response) {
          this.planes = [...response];
          if (this.planes.length === 0 ) {
            this.disabledDropdownPlanDeEstudio = true;
            this.showTable = false
            this.showMessageSinResultadosPlanes('m');
          }else{
            this.messageService.add({
                key: 'main',
                severity: 'info',
                detail: this.planes.length > 1
                ? `${this.planes.length} planes de estudios cargados.`
                : `${this.planes.length} plan de estudio cargado.`
            });
            this.clearMessagesSinResultados('m');
            this.disabledDropdownPlanDeEstudio = false;
          }
        }
    }

    async getAsignaturasMergedPorPlanDeEstudio(){
        let params = { cod_plan_estudio: this.cod_planestudio_selected }
        const response = await this.backend.getAsignaturasMergedPorPlanDeEstudio(params);
        if (response) {
          this.asignaturas = [...response];
          if (this.asignaturas.length === 0 ) {
            this.showTable = false
            this.showMessageSinResultadosAsignaturas('m');
          }else{
            this.messageService.add({
                key: 'main',
                severity: 'info',
                detail: this.asignaturas.length > 1
                ? `${this.asignaturas.length} asignaturas cargadas.`
                : `${this.asignaturas.length} asignatura cargada.`
            });
            this.clearMessagesSinResultados('m');
            this.showTable = true;
          }
        }
    }

    async getAsignaturasToOverlay(mode: 'pre_req' | 'secuenciales' | 'paralelas' | string, cod_asignatura: string){
        this.op_asign = [];
        let params = { cod_asignatura: cod_asignatura }
        let response = undefined ;
        switch (mode) {
            case 'pre_req':
                response = await this.backend.getPreRequisitosPorAsignatura(params);
                if (response) this.op_asign = [...response];
            break;

            case 'secuenciales':
                response = await this.backend.getAsignsSecuencialesParalelasPorAsignatura(params);
                if (response) this.op_asign = [...response];
            break;

            case 'paralelas':
                response = await this.backend.getAsignsSecuencialesParalelasPorAsignatura(params);
                if (response) this.op_asign = [...response];
            break;

            case 'articulaciones':
                response = await this.backend.getArticulacionesPorAsignatura(params);
                if (response) this.op_asign = [...response];
            break;

        }
    }
    
    async getMencionesPorAsignatura(cod_asignatura: string){
        this.menciones_asign = [];
        let params = { cod_asignatura: cod_asignatura }
        const response = await this.backend.getMencionesPorAsignatura(params);
        if (response) this.menciones_asign = [...response];
        // console.log("menciones_asign",this.menciones_asign);
    }

    async getTemasPorAsignatura(cod_asignatura: string){
        this.temas_asign = [];
        let params = { cod_asignatura: cod_asignatura }
        const response = await this.backend.getTemasPorAsignatura(params);
        if (response) this.temas_asign = [...response];
        // console.log("menciones_asign",this.menciones_asign);
    }

    async deleteAsignatura(dataToDelete: Asignatura[]){
        try {
          const response = await this.backend.deleteAsignatura(dataToDelete,this.namesCrud);
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
          this.getAsignaturasMergedPorPlanDeEstudio();
          this.historialActividad.refreshHistorialActividad();
          this.table.resetSelectedRows();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
          header: 'Confirmar',
          message: `Es necesario confirmar la acción para <b>eliminar</b> ${this.namesCrud.articulo_singular}: <b>${this.asignatura.nombre_asignatura_completa}</b>. ¿Desea confirmar?`,
          acceptLabel: 'Si',
          rejectLabel: 'No',
          icon: 'pi pi-exclamation-triangle',
          key: 'main-gp',
          acceptButtonStyleClass: 'p-button-danger p-button-sm',
          rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
          accept: async () => {
            let dataToDelete = []
            dataToDelete.push(this.asignatura);
            await this.deleteAsignatura(dataToDelete);
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
            await this.deleteAsignatura(data);
          }
        })
    }

    createForm(){
        this.router.navigate([`/asignaturas/add/`])
    }

    showForm(){
        const cod_asignatura = this.asignatura.cod_asignatura;
        this.router.navigate([`/asignaturas/show/${cod_asignatura}`])
    }

    editForm(){
        const cod_asignatura = this.asignatura.cod_asignatura;
        this.router.navigate([`/asignaturas/edit/${cod_asignatura}`])
    }

	clearAllMessages(){
        this.messagesMantenedor = [];
        this.messagesFormulario = [];
    }

	clearMessagesSinResultados(key: 'm' | 'f'){
        key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
    }

    showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa' | 'plan') {
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
        this.showMessagesSinResultados(key, 'plan')
    }

    openHistorialActividad(){
        this.historialActividad.showDialog = true;
    }
    
    setOrigen(origen: string){
        this.historialActividad.setOrigen(origen);
    }
}