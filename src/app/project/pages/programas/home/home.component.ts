import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Facultad } from 'src/app/project/models/programas/Facultad';
import { Programa } from 'src/app/project/models/programas/Programa';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { FacultadService } from 'src/app/project/services/programas/facultad.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private errorTemplateHandler: ErrorTemplateHandler,
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
  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    // await this.getProgramas();
    await this.getFacultades();
    this.menuButtonsTableService.setContext('programa','page');

    this.subscription.add(this.tableCrudService.onClickRefreshTable$.subscribe(() => this.getProgramas()));
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
            default: break;
          }
        }
      })
    );
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

  async getProgramasPorFacultad(cod_facultad: any){
    try {
      let params = { Cod_facultad : cod_facultad}
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
          severity: 'success',
          detail: this.programas.length > 1
           ? `Se han encontrado ${this.programas.length} programas.`
           : `Se ha encontrado ${this.programas.length} programa.`
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
    let cod_facultad = event.value;
    console.log("cod_facultad",cod_facultad);
    this.getProgramasPorFacultad(cod_facultad);
  }

}
