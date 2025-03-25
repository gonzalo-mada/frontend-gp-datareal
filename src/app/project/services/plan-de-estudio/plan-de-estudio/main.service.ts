import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendPlanesDeEstudiosService } from './backend.service';
import { ConfirmationService, Message } from 'primeng/api';
import { MessageServiceGP } from '../../components/message-service.service';
import { Router } from '@angular/router';
import { TablePlanesDeEstudiosService } from './table.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { FormPlanDeEstudioService } from './form.service';
import { Programa } from 'src/app/project/models/programas/Programa';
import { HistorialActividadService } from '../../components/historial-actividad.service';

@Injectable({
    providedIn: 'root'
})

export class PlanDeEstudioMainService {
  namesCrud: NamesCrud = {
    singular: 'plan de estudio',
    plural: 'planes de estudios',
    articulo_singular: 'el plan de estudio',
    articulo_plural: 'los planes de estudios',
    genero: 'masculino',
  };

	message: any = {
    'facultad': 'No se encontraron programas para la facultad seleccionada.',
    'programa': 'No se encontraron planes de estudios para el programa seleccionado.',
  }
  messagesMantenedor: Message[] = [];
  messagesFormulario: Message[] = [];

  mode: ModeForm;
  planesDeEstudios: PlanDeEstudio[] = [];
  programas_postgrado: Programa[] = [];
  planDeEstudio: PlanDeEstudio = {};
  cod_plan_estudio: number = 0;
  cod_facultad_selected: number = 0;
  cod_programa_postgrado_selected: number = 0;

  showTable: boolean = false
  disabledDropdownPrograma: boolean = true


  constructor(
    private backend: BackendPlanesDeEstudiosService,
    private confirmationService: ConfirmationService,
    private form: FormPlanDeEstudioService,
    private messageService: MessageServiceGP,
    private router: Router,
    private table: TablePlanesDeEstudiosService,
    private historialActividad: HistorialActividadService
  ){}

  async setModeCrud(mode: ModeForm, data?: PlanDeEstudio | null){
    this.form.modeForm = mode;
    if (data) this.planDeEstudio = {...data};
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
    value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.planesDeEstudios.length, this.namesCrud);
  }

  async getPlanesDeEstudiosMergedPorPrograma(showCountTableValues: boolean = true){
    let params = { Cod_Programa: this.cod_programa_postgrado_selected }
    const response = await this.backend.getPlanesDeEstudiosMergedPorPrograma(params);
    if (response) {
      this.planesDeEstudios = [...response];
      if (this.planesDeEstudios.length === 0 ) {
          this.showTable = false
    this.showMessageSinResultadosPlanes('m');
      }else{
        if (showCountTableValues){
    this.messageService.add({
      key: 'main',
      severity: 'info',
      detail: this.planesDeEstudios.length > 1
        ? `${this.planesDeEstudios.length} planes de estudios cargados.`
        : `${this.planesDeEstudios.length} plan de estudio cargado.`
    });
        }
    this.clearMessagesSinResultados('m');
    this.showTable = true
      }
    }
    // console.log("this.planes",this.planesDeEstudios);
    
  }

  async getProgramasPorFacultad(){
    let params = { Cod_facultad: this.cod_facultad_selected }
    const response = await this.backend.getProgramasPorFacultad(params);
    if (response) {
      this.programas_postgrado = [...response];
      if (this.programas_postgrado.length === 0 ) {
        this.disabledDropdownPrograma = true;
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
      }
    }
  }


  reset(){
      this.planesDeEstudios = [];
      this.showTable = false;
      this.cod_programa_postgrado_selected = 0;
      this.cod_facultad_selected = 0;
      this.clearAllMessages();
  }

  createForm(){
      this.router.navigate([`/planes/add/`])
  }

  showForm(){
      const cod_planDeEstudio = this.planDeEstudio.cod_plan_estudio;
      this.router.navigate([`/planes/show/${cod_planDeEstudio}`])
  }

  editForm(){
    const cod_planDeEstudio = this.planDeEstudio.cod_plan_estudio;
    this.router.navigate([`/planes/edit/${cod_planDeEstudio}`])
  }

  async deletePlanDeEstudio(dataToDelete: PlanDeEstudio[]){
    try {
      const response = await this.backend.deletePlanDeEstudio(dataToDelete,this.namesCrud);
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
      this.getPlanesDeEstudiosMergedPorPrograma();
      this.historialActividad.refreshHistorialActividad();
      this.table.resetSelectedRows();
    }
  }

  async openConfirmationDelete(){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para <b>eliminar</b> ${this.namesCrud.articulo_singular}: <b>${this.planDeEstudio.nombre_plan_estudio_completo}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        let dataToDelete = []
        dataToDelete.push(this.planDeEstudio);
        await this.deletePlanDeEstudio(dataToDelete);
      }
    })
  }

  async openConfirmationDeleteSelected(){
    const data = this.table.selectedRows;
    const message = mergeNames(this.namesCrud,data,true,'nombre_plan_estudio_completo'); 
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
        await this.deletePlanDeEstudio(data);
      }
    })
  }

  clearAllMessages(){
    this.messagesMantenedor = [];
    this.messagesFormulario = [];
  }

  clearMessagesSinResultados(key: 'm' | 'f'){
    key === 'm' ? this.messagesMantenedor = [] : this.messagesFormulario = [];
  }

  showMessagesSinResultados(key: 'm' | 'f', messageType: 'facultad' | 'programa') {
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

	resetWhenChangedDropdownFacultad(){
		this.showTable = false;
		this.cod_programa_postgrado_selected = 0;
	}

  openHistorialActividad(){
    this.historialActividad.showDialog = true;
  }

  setOrigen(origen: string){
    this.historialActividad.setOrigen(origen);
  }

}