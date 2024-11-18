import { Component, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';
import { generateMessage, mergeNames } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-suspension',
  templateUrl: './suspension.component.html',
  styles: [],
  providers: [SuspensionesService]
})
export class SuspensionComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    public suspensionesService: SuspensionesService,
    private tableCrudService: TableCrudService,
  ){}

  suspensiones: Suspension[] = [];
  suspension: Suspension = {};
  dialog: boolean = false;
  private subscription: Subscription = new Subscription();

  get modeForm(){
    return this.suspensionesService.modeForm
  }

  async ngOnInit() {
    await this.getSuspensiones();
    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe( () => this.getSuspensiones() ));
    this.subscription.add(this.menuButtonsTableService.onClickDeleteSelected$.subscribe(() => this.openConfirmationDeleteSelected(this.tableCrudService.getSelectedRows()) ))

    this.subscription.add(
      this.suspensionesService.crudUpdate$.subscribe( crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.suspensionesService.suspension = {};
            this.suspensionesService.suspension = crud.data
          }
          switch (crud.mode) {
            case 'show': this.showForm(); break;
            case 'edit': this.editForm(); break;
            case 'insert': this.insertSuspension(); break;
            case 'update': this.updateSuspension(); break;
            case 'delete': this.openConfirmationDelete(crud.data); break;

          }
        }
      })
    );
    this.menuButtonsTableService.setContext('suspension','dialog');
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
    this.reset();
  }

  async getSuspensiones(showCountTableValues: boolean = true){
    try {
      this.suspensiones = <Suspension[]> await this.suspensionesService.getSuspensiones();
      if (showCountTableValues) this.suspensionesService.countTableValues(this.suspensiones.length);          
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertSuspension(){
    try {
      let params = { ...this.suspensionesService.fbForm.value };
      const response = await this.suspensionesService.insertSuspension(params);
      if ( response.dataWasInserted ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.suspensionesService.namesCrud,response.dataInserted,'creado',true,false)
        });
      }
    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al agregar ${this.suspensionesService.namesCrud.singular}`,
          message: e.detail.error.message.message,
        });
    }finally{
      this.dialog = false;
      this.getSuspensiones(false);
      this.reset();
    }
  }

  async updateSuspension(){
    try {
      let params = {
        ...this.suspensionesService.fbForm.value,
        ID_TipoSuspension: this.suspension.ID_TipoSuspension,
        aux: this.suspensionesService.fbForm.get('aux')!.value
      };
      const response = await this.suspensionesService.updateSuspension(params);
      if ( response.dataWasUpdated ) {
        this.messageService.add({
          key: 'main-gp',
          severity: 'success',
          detail: generateMessage(this.suspensionesService.namesCrud,response.dataUpdated,'actualizado',true,false)
        });
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar ${this.suspensionesService.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.getSuspensiones(false);
      this.dialog = true
      this.reset();
    }
  }

  async deleteSuspension(dataToDelete: Suspension[]){
    try {
      const response = await this.suspensionesService.deleteSuspension({suspensionToDelete: dataToDelete});
      console.log("response",response);
      
      if (response.notDeleted.length !== 0) {
        for (let i = 0; i < response.notDeleted.length; i++) {
          const element = response.notDeleted[i];
          this.messageService.add({
            key: 'main-gp',
            severity: 'warn',
            summary:  `Error al eliminar ${this.suspensionesService.namesCrud.singular}`,
            detail: element.messageError,
            sticky: true
          });
        }
      }
      if (response.deleted.length !== 0) {
        const message = mergeNames(null,response.deleted,false,'data');
        if ( response.deleted.length > 1 ){
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.suspensionesService.namesCrud,message,'eliminados',true, true)
          });
        }else{
          this.messageService.add({
            key: 'main-gp',
            severity: 'success',
            detail: generateMessage(this.suspensionesService.namesCrud,message,'eliminado',true, false)
          });
        }
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al eliminar ${this.suspensionesService.namesCrud.singular}`,
          message: e.detail.error.message.message,
      });
    }finally{
      this.reset();
      this.getSuspensiones(false);
    }
  }

  createForm(){
    this.reset();
    this.suspensionesService.setModeCrud('create');
    this.dialog = true;
  }

  showForm(){
    this.reset();
    this.suspensionesService.fbForm.patchValue({...this.suspensionesService.suspension});
    this.suspensionesService.fbForm.disable();
    this.dialog = true;
  }

  editForm(){
    this.reset();
    this.suspensionesService.fbForm.patchValue({...this.suspensionesService.suspension});
    this.suspensionesService.fbForm.patchValue({aux: this.suspensionesService.suspension});
    this.dialog = true;
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.suspensionesService.resetForm();
  }

  async openConfirmationDeleteSelected(data: any){
    const message = mergeNames(this.suspensionesService.namesCrud,data,true,'Descripcion_TipoSuspension')
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
        try {
          await this.deleteSuspension(data);
        } catch (e:any) {
          this.errorTemplateHandler.processError(
            e, {
              notifyMethod: 'alert',
              summary: `Error al eliminar ${this.suspensionesService.namesCrud.singular}`,
              message: e.message,
          });
        }
      }
    })
  }

  async openConfirmationDelete(data: any){    
    this.confirmationService.confirm({
      header: 'Confirmar',
      message: `Es necesario confirmar la acción para eliminar ${this.suspensionesService.namesCrud.articulo_singular} <b>${data.Descripcion_TipoSuspension}</b>. ¿Desea confirmar?`,
      acceptLabel: 'Si',
      rejectLabel: 'No',
      icon: 'pi pi-exclamation-triangle',
      key: 'main-gp',
      acceptButtonStyleClass: 'p-button-danger p-button-sm',
      rejectButtonStyleClass: 'p-button-secondary p-button-text p-button-sm',
      accept: async () => {
          let dataToDelete = []
          dataToDelete.push(data);
          try {
            await this.deleteSuspension(dataToDelete);
          } catch (e:any) {
            this.errorTemplateHandler.processError(
              e, {
                notifyMethod: 'alert',
                summary: `Error al eliminar ${this.suspensionesService.namesCrud.singular}`,
                message: e.message,
            });
          }
      }
    })
  }

  submit() {
    this.modeForm === 'create' ? this.insertSuspension() : this.updateSuspension();
  }



}
