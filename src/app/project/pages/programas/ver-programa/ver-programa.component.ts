import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { Programa } from 'src/app/project/models/Programa';
import { ProgramasService } from 'src/app/project/services/programas.service';

@Component({
  selector: 'app-ver-programa',
  templateUrl: './ver-programa.component.html',
  styles: [
  ]
})
export class VerProgramaComponent implements OnInit {

  constructor(private activatedRoute: ActivatedRoute,
    private programasService: ProgramasService
  ){}

  programa: Programa = {};
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.activatedRoute.params.subscribe( ({cod_programa}) => console.log("jeje",cod_programa))
    this.subscription.add(
      this.programasService.formUpdate$.subscribe( form => {
        console.log("form",form);
        
        if (form && form.mode) {
          if (form.data) {
            this.programa = {};
            this.programa = form.data
          }
          switch (form.mode) {
            case 'show': this.showForm(form.resolve! , form.reject!); break;
            // case 'edit': this.editForm(); break;
            default:
              break;
          }
        }
      })
    );
  }

  async showForm(resolve: Function, reject: Function){
    try {
      console.log("data:::::",this.programa);
      this.programasService.resetModeCrud();
      resolve(true);
    } catch (e) {
      reject(e);
    }
  }

  

}
