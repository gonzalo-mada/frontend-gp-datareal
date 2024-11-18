import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoriaTp } from 'src/app/project/models/programas/CategoriaTp';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { CategoriasTpService } from 'src/app/project/services/programas/categorias-tp.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-categorias-tp',
  templateUrl: './form-categorias-tp.component.html',
  styles: [
  ]
})
export class FormCategoriasTpComponent implements OnInit, OnDestroy {
  
  constructor(public categoriasTpService: CategoriasTpService){}

  private subscription: Subscription = new Subscription();

  async ngOnInit() {
    this.subscription.add(this.categoriasTpService.fbForm.statusChanges.subscribe(status => { this.categoriasTpService.stateForm = status as StateValidatorForm }))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
