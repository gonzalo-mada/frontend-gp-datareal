import { Injectable } from '@angular/core';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { BackendPlanesDeEstudiosService } from './backend.service';
import { ConfirmationService } from 'primeng/api';
import { MessageServiceGP } from '../../components/message-service.service';
import { Router } from '@angular/router';
import { TablePlanesDeEstudiosService } from './table.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { PlanDeEstudio } from 'src/app/project/models/plan-de-estudio/PlanDeEstudio';
import { FormPlanDeEstudioService } from './form.service';

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
    mode: ModeForm;
    planesDeEstudios: PlanDeEstudio[] = [];
    planDeEstudio: PlanDeEstudio = {};
    cod_planDeEstudio: number = 0;

    constructor(
        private backend: BackendPlanesDeEstudiosService,
        private confirmationService: ConfirmationService,
        private form: FormPlanDeEstudioService,
        private messageService: MessageServiceGP,
        private router: Router,
        private table: TablePlanesDeEstudiosService
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
        }
    }

    countTableValues(value?: number){
        value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.planesDeEstudios.length, this.namesCrud);
    }

    reset(){
        this.planesDeEstudios = [];
    }

    createForm(){
        this.router.navigate([`/planes/add/`])
    }

    showForm(){
        const cod_planDeEstudio = this.planDeEstudio.Cod_plan_estudio;
        this.router.navigate([`/planes/show/${cod_planDeEstudio}`])
    }

    editForm(){
        const cod_planDeEstudio = this.planDeEstudio.Cod_plan_estudio;
        this.router.navigate([`/planes/edit/${cod_planDeEstudio}`])
    }

    async deletePrograma(dataToDelete: PlanDeEstudio[]){
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
        //   this.getProgramasPorFacultad();
          this.table.resetSelectedRows();
        }
    }

    async openConfirmationDelete(){
        this.confirmationService.confirm({
          header: 'Confirmar',
          message: `Es necesario confirmar la acción para <b>eliminar</b> ${this.namesCrud.articulo_singular}: <b>${this.planDeEstudio.Cod_plan_estudio}</b>. ¿Desea confirmar?`,
          acceptLabel: 'Si',
          rejectLabel: 'No',
          icon: 'pi pi-exclamation-triangle',
          key: 'main-gp',
          acceptButtonStyleClass: 'p-button-danger p-button-sm',
          rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
          accept: async () => {
            let dataToDelete = []
            dataToDelete.push(this.planDeEstudio);
            await this.deletePrograma(dataToDelete);
          }
        })
    }

    async openConfirmationDeleteSelected(){
        const data = this.table.selectedRows;
        const message = mergeNames(this.namesCrud,data,true,'Cod_plan_estudio'); 
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
            await this.deletePrograma(data);
          }
        })
    }

}