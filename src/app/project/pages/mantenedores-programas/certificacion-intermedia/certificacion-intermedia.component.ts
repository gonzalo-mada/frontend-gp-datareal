import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';

@Component({
  selector: 'app-certificacion-intermedia',
  templateUrl: './certificacion-intermedia.component.html',
  styles: [],
})
export class CertificacionIntermediaComponent implements OnInit, OnDestroy {

  private subscription: Subscription = new Subscription();

  constructor(
    private menuButtonsTableService: MenuButtonsTableService,
    public main: CertifIntermediaMainService,
  ){}

  ngOnInit(): void {
    this.subscription.add(this.menuButtonsTableService.actionClickButton$.subscribe( action => { 
      action==='agregar' 
      ? this.main.setModeCrud('create') 
      : this.main.setModeCrud('delete-selected')
    }));
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.main.reset();
  }
  
}
