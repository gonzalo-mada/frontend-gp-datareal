import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { Jornada } from 'src/app/project/models/plan-de-estudio/Jornada';
import { JornadaService } from 'src/app/project/services/plan-de-estudio/jornada.service';

@Component({
  selector: 'app-jornada',
  templateUrl: './jornada.component.html',
  styles: [
  ]
})
export class JornadaComponent implements OnInit, OnDestroy {

  constructor(private confirmationService: ConfirmationService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private messageService: MessageService,
    private menuButtonsTableService: MenuButtonsTableService,
    private tableCrudService: TableCrudService,
    public jornadaService: JornadaService
  ){}

  jornadas: Jornada[] = [];
  jornada: Jornada = {};
  namesCrud! : NamesCrud;
  keyPopups: string = '';
  dialog: boolean = false;

  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.jornadaService.modeForm
  }

  set modeForm(_val){
    this.jornadaService.modeForm = _val;
  }

  async ngOnInit() {
    this.namesCrud = {
      singular: 'jornada',
      plural: 'jornadas',
      articulo_singular: 'la jornada',
      articulo_plural: 'las jornadas',
      genero: 'femenino'
    };
    this.keyPopups = 'jornadas'
    await this.getJornadas();
    console.log("Jornadas",this.jornadas);

    this.subscription.add(this.menuButtonsTableService.onClickButtonAgregar$.subscribe(() => this.createForm()));
    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getJornadas()));
    this.subscription.add(
      this.jornadaService.crudUpdate$.subscribe(crud => {
        if (crud && crud.mode) {
          if (crud.data) {
            this.jornada = {};
            this.jornada = crud.data
          }
            switch (crud.mode) {
              // case 'show': this.showForm(); break; 
              // case 'edit': this.editForm(); break;
              case 'insert': this.insertJornada(); break;
              // case 'update': this.updateReglamento(); break;
              // case 'delete': this.openConfirmationDelete(crud.data); break;
          }
        }
      })
    );
    this.menuButtonsTableService.setContext('jornada', 'dialog');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reset();
  }

  
  async getJornadas(){
    try {
      this.jornadas = <Jornada[]> await this.jornadaService.getJornadas();
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async insertJornada(){
    try {
      const actionForm: any = await new Promise((resolve, reject) => {
        this.jornadaService.setModeForm('insert',null, resolve, reject);
      })
      if (actionForm.success) {
        //insert exitoso
        this.getJornadas();
        this.messageService.add({
          key: this.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
        this.reset();
      }
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al guardar ${this.namesCrud.singular}`,
          message: e.detail.error.message.message
        });
    }finally{
      this.dialog = true
    }
  }

  async createForm(){
    try {
      this.reset();
      await new Promise((resolve,reject) => {
        this.jornadaService.setModeForm('create', null, resolve, reject);
      })
    } catch (e:any ) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: `Error al crear formulario de ${this.namesCrud.articulo_singular}`,
        message: e.message,
        }
      );
    }finally{
      this.dialog = true;
    }

  }

  reset() {
    this.tableCrudService.resetSelectedRows();
  }

  async submit() {
    try {
      
      if ( this.modeForm == 'create' ) {
        //modo creacion
        await this.insertJornada()
      }else{
        //modo edit
        //await this.updateJornada();
      }
    } catch (e:any) {
      const action = this.modeForm === 'create' ? 'guardar' : 'actualizar';
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al ${action} ${this.namesCrud.singular}`,
          message: e.message,
      });
      } finally {
        this.dialog = false;
      }
    }

}
