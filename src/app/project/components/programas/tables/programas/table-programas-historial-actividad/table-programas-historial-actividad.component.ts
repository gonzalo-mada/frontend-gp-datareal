import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';


@Component({
  selector: 'app-table-programas-historial-actividad',
  templateUrl: './table-programas-historial-actividad.component.html',
  styles: [
  ]
})
export class TableProgramasHistorialActividadComponent implements OnInit, OnDestroy {

  @Input() data: any[] = [];
  @Input() mode: string = '';

  dataKeyTable: string = ''
  private subscription: Subscription = new Subscription();

  ngOnInit(): void {
    this.dataKeyTable = 'Cod_Programa';
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
