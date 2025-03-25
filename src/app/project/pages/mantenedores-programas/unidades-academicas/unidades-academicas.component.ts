import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { FormUnidadesAcadService } from 'src/app/project/services/programas/unidades-academicas/form.service';
import { UnidadesAcadMainService } from 'src/app/project/services/programas/unidades-academicas/main.service';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Component({
  selector: 'app-unidades-academicas',
  templateUrl: './unidades-academicas.component.html',
  styles: []
})
export class UnidadesAcademicasComponent implements OnInit, OnDestroy {

  constructor(
    public form: FormUnidadesAcadService,
    public main: UnidadesAcadMainService,
    private menuButtonsTableService: MenuButtonsTableService,
  ){}

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
      switch (action) {
        case 'agregar': this.main.setModeCrud('create');break;
        case 'eliminar': this.main.setModeCrud('delete-selected');break;
        case 'historial': this.main.setModeCrud('historial');break;
      } 
    }));
    this.main.setOrigen('unidades_academicas');
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }

  submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

  changeFacultad(event: any){
    let dataSelected = this.main.facultades.find( f => f.Cod_facultad === event.value );
		this.form.fbForm.get('Facultad.Descripcion_facu')?.patchValue(dataSelected?.Descripcion_facu);
  }
}
