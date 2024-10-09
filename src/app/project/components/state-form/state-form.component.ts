import { Component, OnDestroy, OnInit } from '@angular/core';
import { ProgramasService } from '../../services/programas.service';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.css']
})
export class StateFormComponent  {
  constructor(
    public programasService: ProgramasService
  ){}


}
