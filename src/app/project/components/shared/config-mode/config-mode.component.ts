import { Component } from '@angular/core';
import { ConfigModeService } from '../../../services/components/config-mode.service';
import { OverlayPanel } from 'primeng/overlaypanel';

@Component({
  selector: 'app-config-mode',
  templateUrl: './config-mode.component.html',
  styles: [
  ]
})
export class ConfigModeComponent {
  constructor(public configModeService: ConfigModeService){}

  visible: boolean = false;

  get mode(): boolean {
    return this.configModeService.config().isPostgrado;
  }

  set mode(_val: boolean) {
    this.configModeService.config.set({isPostgrado: _val})
  }

  onConfigButtonClick(){
    this.visible = true; 
  }


}
