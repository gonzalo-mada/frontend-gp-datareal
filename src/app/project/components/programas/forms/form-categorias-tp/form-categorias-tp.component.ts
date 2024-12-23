import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormCategoriasTpService } from 'src/app/project/services/programas/categorias-tp/form.service';
import { CategoriasTpMainService } from 'src/app/project/services/programas/categorias-tp/main.service';

@Component({
  selector: 'app-form-categorias-tp',
  templateUrl: './form-categorias-tp.component.html',
  styles: [
  ]
})
export class FormCategoriasTpComponent implements OnInit, OnDestroy {
  
  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormCategoriasTpService,
    public main: CategoriasTpMainService
  ){}

  async ngOnInit() {
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm }))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  async submit(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  }

}
