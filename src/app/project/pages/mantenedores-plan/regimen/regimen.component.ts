import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { RegimenMainService } from 'src/app/project/services/plan-de-estudio/regimen/main.service';

@Component({
  selector: 'app-regimen',
  templateUrl: './regimen.component.html',
  styles: []
})
export class RegimenComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: RegimenMainService
  ) {}

  ngOnInit(): void {
		this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => {
			switch (action) {
				case 'agregar': this.main.setModeCrud('create');break;
				case 'eliminar': this.main.setModeCrud('delete-selected');break;
				case 'historial': this.main.setModeCrud('historial');break;
			} 
		}));
    this.main.setOrigen('regimenes');
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }
}