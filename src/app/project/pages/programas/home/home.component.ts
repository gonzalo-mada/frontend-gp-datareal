import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Facultad } from 'src/app/project/models/programas/Facultad';
import { Programa } from 'src/app/project/models/programas/Programa';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FacultadService } from 'src/app/project/services/programas/facultad.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(
    private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private facultadService: FacultadService,
    private menuButtonsTableService: MenuButtonsTableService,
    private messageService: MessageService,
    private router: Router, 
    public programasService: ProgramasService,
    private tableCrudService: TableCrudService)
  {}

  programas: any[] = [];
  programa: Programa = {};
  facultades: Facultad[] = [];
  loadedProgramas: boolean = false;
  cod_facultad: number = 0;
  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    // await this.getProgramas();
    await this.getFacultades();
    this.menuButtonsTableService.setContext('programa','page');

    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getProgramasPorFacultad()));
    this.subscription.add(
      this.programasService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.programa = {};
            this.programa = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'delete': this.openConfirmationDelete(this.programa); break;
            default: break;
          }
        }
      })
    );
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.tableCrudService.resetSelectedRows();
  }

  async getFacultades(){
    try {
      this.facultades = <Facultad[]> await this.facultadService.getFacultades();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener facultades. Intente nuevamente.',
      });
    }
  }

  async getProgramas(){
    try {
      this.programas = await this.programasService.getProgramas();
      this.loadedProgramas = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener programas. Intente nuevamente.',
      });
    }
  }

  async getProgramasPorFacultad(){
    try {
      let params = { Cod_facultad : this.cod_facultad}
      this.programas = await this.programasService.getProgramasPorFacultad(params);

      if (this.programas.length === 0 ) {
        this.loadedProgramas = false;
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'warn',
          detail: `No se encontraron programas para la facultad seleccionada.`
        });
      }else{
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'info',
          detail: this.programas.length > 1
           ? `${this.programas.length} programas listados.`
           : `${this.programas.length} programa listado.`
        });
        this.loadedProgramas = true;
      }


    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener programas. Intente nuevamente.',
      });
    }
  }

  showForm(){
    const cod_programa = this.programa.Cod_Programa;
    this.router.navigate([`/programa/show/${cod_programa}`])
  }

  editForm(){
    const cod_programa = this.programa.Cod_Programa;
    this.router.navigate([`/programa/edit/${cod_programa}`])
  }

  changeFacultad(event: any){
    this.cod_facultad = event.value;
    this.getProgramasPorFacultad();
  }

  async openConfirmationDelete(data: any){
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para <b>eliminar</b> ${this.programasService.namesCrud.articulo_singular}: <b>${data.Nombre_programa}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.programasService.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let dataToDelete = []
          dataToDelete.push(data);
          try {
            await this.deletePrograma(dataToDelete);
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${this.programasService.namesCrud.singular}`,
                message: e.message,
            });
          } 
      }
    })
  }

  async openConfirmationDeleteSelected(dataSelected: any){
    const message = mergeNames(this.programasService.namesCrud,dataSelected,true,'Nombre_programa'); 
    this.confirmationService.confirm({
      header: "Confirmar",
      message: `Es necesario confirmar la acción para eliminar ${message}. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: this.programasService.keyPopups,
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
        try {
          await this.deletePrograma(dataSelected);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.programasService.namesCrud.singular}`,
              message: e.message,
          });
        }
      }
    })
  }

  async deletePrograma(dataToDelete: Programa[]){
    try {
      const deleted:{ dataWasDeleted: boolean, dataDeleted: [] } = await this.programasService.deletePrograma(dataToDelete);
      const message = mergeNames(null,deleted.dataDeleted,false,'Nombre_programa');
      if ( deleted.dataWasDeleted ) {
        this.getProgramasPorFacultad();
        if ( dataToDelete.length > 1 ){
          this.messageService.add({
            key: this.programasService.keyPopups,
            severity: 'success',
            detail: generateMessage(this.programasService.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: this.programasService.keyPopups,
            severity: 'success',
            detail: generateMessage(this.programasService.namesCrud,message,'eliminado',true, false)
          });
        }
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.programasService.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }
  }

}
