import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { DataUpdated } from 'src/app/project/models/shared/DataUpdated';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-suspension',
  templateUrl: './form-suspension.component.html',
  styles: [
  ]
})
export class FormSuspensionComponent implements OnInit, OnDestroy{

  constructor(
    private fb: FormBuilder,
    public suspensionesService: SuspensionesService,  
  ){}
  
  showAsterisk: boolean = false;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.suspensionesService.modeForm;
  }

  ngOnInit(): void {
    this.subscription.add(this.suspensionesService.fbForm.statusChanges.subscribe(status => { this.suspensionesService.stateForm = status as StateValidatorForm }))
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

}
