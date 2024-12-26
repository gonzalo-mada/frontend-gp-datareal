import { Injectable } from '@angular/core';
import { BackendProgramasService } from './backend.service';
import { ConfirmationService } from 'primeng/api';
import { Programa } from 'src/app/project/models/programas/Programa';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { MessageServiceGP } from '../../components/message-service.service';
import { TableProgramasService } from './table.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})

export class ProgramaMainService {

    namesCrud: NamesCrud = {
        singular: 'programa',
        plural: 'programas',
        articulo_singular: 'el programa',
        articulo_plural: 'los programas',
        genero: 'masculino'
    };
    mode: ModeForm = undefined;

    programas: Programa[] = [];
    programa: Programa = {};
    cod_programa: number = 0;
    cod_facultad_selected: number = 0;
    loadedProgramas: boolean = false;

    constructor(
        private backend: BackendProgramasService,
        private confirmationService: ConfirmationService,
        private messageService: MessageServiceGP,
        private router: Router,
        private table: TableProgramasService 

    ){}

    async setModeCrud(mode: ModeForm, data?: Programa | null, from?: CollectionsMongo | null ){
        if (data) this.programa = {...data};
        switch (mode) {
            case 'create': this.createForm(); break;
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'delete': this.openConfirmationDelete(); break;
            case 'delete-selected': await this.openConfirmationDeleteSelected(); break;
        }
    }

    countTableValues(value?: number){
      value ? this.backend.countTableRegisters(value,this.namesCrud) : this.backend.countTableRegisters(this.programas.length, this.namesCrud);
    }

    reset(){
        this.programas = [];
        this.cod_facultad_selected = 0;
        this.loadedProgramas = false;
    }

    createForm(){
        this.router.navigate([`/programa/add/`])
    }

    showForm(){
        const cod_programa = this.programa.Cod_Programa;
        this.router.navigate([`/programa/show/${cod_programa}`])
    }

    editForm(){
        const cod_programa = this.programa.Cod_Programa;
        this.router.navigate([`/programa/edit/${cod_programa}`])
    }

    async getProgramasPorFacultadMerged(){
      let params = { Cod_facultad: this.cod_facultad_selected }
      const response = await this.backend.getProgramasPorFacultadMerged(params);
      if (response) {
        this.programas = [...response];
        if (this.programas.length === 0 ) {
            this.loadedProgramas = false;
            this.messageService.add({
              key: 'main',
              severity: 'warn',
              detail: `No se encontraron programas para la facultad seleccionada.`
            });
        }else{
            this.messageService.add({
              key: 'main',
              severity: 'info',
              detail: this.programas.length > 1
                ? `${this.programas.length} programas listados.`
                : `${this.programas.length} programa listado.`
            });
            this.loadedProgramas = true;
        }
      }
    }

    async deletePrograma(dataToDelete: Programa[]){
      try {
        const response = await this.backend.deleteProgramaBackend(dataToDelete,this.namesCrud);
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
        this.getProgramasPorFacultadMerged();
        this.table.resetSelectedRows();
      }
    }

    async openConfirmationDelete(){
      this.confirmationService.confirm({
        header: 'Confirmar',
        message: `Es necesario confirmar la acción para <b>eliminar</b> ${this.namesCrud.articulo_singular}: <b>${this.programa.Nombre_programa}</b>. ¿Desea confirmar?`,
        acceptLabel: 'Si',
        rejectLabel: 'No',
        icon: 'pi pi-exclamation-triangle',
        key: 'main-gp',
        acceptButtonStyleClass: 'p-button-danger p-button-sm',
        rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
        accept: async () => {
          let dataToDelete = []
          dataToDelete.push(this.programa);
          await this.deletePrograma(dataToDelete);
        }
      })
    }

    async openConfirmationDeleteSelected(){
      const data = this.table.selectedRows;
      const message = mergeNames(this.namesCrud,data,true,'Nombre_programa'); 
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