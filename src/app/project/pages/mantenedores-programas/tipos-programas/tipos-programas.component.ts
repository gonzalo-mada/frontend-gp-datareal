import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { FormTiposProgramasService } from 'src/app/project/services/programas/tipos-programas/form.service';
import { TiposProgramasMainService } from 'src/app/project/services/programas/tipos-programas/main.service';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { CategoriasTpMainService } from 'src/app/project/services/programas/categorias-tp/main.service';

@Component({
  selector: 'app-tipos-programas',
  templateUrl: './tipos-programas.component.html',
  styles: []
})
export class TiposProgramasComponent implements OnInit, OnDestroy {

  constructor(
    public form: FormTiposProgramasService,
    public main: TiposProgramasMainService,
    public mainCategoriasTp: CategoriasTpMainService,
    private menuButtonsTableService: MenuButtonsTableService,
  ){}

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.main.setModeCrud('create') 
      : this.main.setModeCrud('delete-selected')
    }));
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }));
    await this.mainCategoriasTp.getCategoriasTp(false);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }

  submit() {
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

}
