import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { JornadaMainService } from 'src/app/project/services/plan-de-estudio/jornadas/main.service';

@Component({
  selector: 'app-jornada',
  templateUrl: './jornada.component.html',
  styles: [
  ]
})

export class JornadaComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: JornadaMainService,
  ){}

  ngOnInit(): void {
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
			switch (action) {
				case 'agregar': this.main.setModeCrud('create');break;
				case 'eliminar': this.main.setModeCrud('delete-selected');break;
				case 'historial': this.main.setModeCrud('historial');break;
			} 
		}));
		this.main.setOrigen('jornadas');

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }
}