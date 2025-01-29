import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { FormJornadaService } from 'src/app/project/services/plan-de-estudio/jornadas/form.service';
import { JornadaMainService } from 'src/app/project/services/plan-de-estudio/jornadas/main.service';

@Component({
  selector: 'app-form-jornadas',
  templateUrl: './form-jornadas.component.html',
  styles: [
  ]
})

export class FormJornadasComponent implements OnInit, OnDestroy{

  private subscription: Subscription = new Subscription();

  constructor(
    public form: FormJornadaService,
    public main: JornadaMainService,
  ){}

  async ngOnInit(){
    this.subscription.add(this.form.fbForm.statusChanges.subscribe(status => { this.form.stateForm = status as StateValidatorForm}))
  }

  ngOnDestroy():void{
    this.subscription.unsubscribe();
  }

  async submit(){
    this.main.modeForm === 'create' ? this.main.setModeCrud('insert') : this.main.setModeCrud('update')
  } 
}