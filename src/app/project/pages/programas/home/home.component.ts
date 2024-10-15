import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Programa } from 'src/app/project/models/Programa';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: [
  ]
})
export class HomeComponent implements OnInit, OnDestroy {

  constructor(private errorTemplateHandler: ErrorTemplateHandler,
    private menuButtonsTableService: MenuButtonsTableService,
    private router: Router, 
    public programasService: ProgramasService,
    private tableCrudService: TableCrudService)
  {}

  programas: any[] = [];
  programa: Programa = {};
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    await this.getProgramas();
    this.namesCrud = {
      singular: 'programa',
      plural: 'programas',
      articulo_singular: 'el programa',
      articulo_plural: 'los programas',
      genero: 'masculino'
    };
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

  async getProgramas(){
    try {
      this.programas = await this.programasService.getProgramas();
      
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

}
