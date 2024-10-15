import { Component, OnInit } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { InitService } from 'src/app/base/services/init.service';
import { ThemeService } from 'src/app/base/services/theme.service';
import { WindowService } from 'src/app/base/services/window.service';
import { LoadinggpService } from '../../../services/components/loadinggp.service';
import { SystemService } from 'src/app/base/services/system.service';

@Component({
  selector: 'app-loadinggp',
  templateUrl: './loadinggp.component.html',
  styleUrls: ['./loadinggp.component.css'],
})
export class LoadinggpComponent implements OnInit{
  constructor(
    private config: InitService,
    private loadingGpService: LoadinggpService,
    private systemService: SystemService,
    private spinnerService: NgxSpinnerService,
    private windowService: WindowService,
    private themeService: ThemeService,
  ){}


  loading: any = {
    msgs: this.config.get('system.name'),
  };
  theme: string = this.config.get('system.theme.themes.default');

  ngOnInit() {
    if (this.windowService.getItemSessionStorage('theme') != '') {
      this.theme = this.windowService.getItemSessionStorage('theme');
    }
    this.themeService.theme$.subscribe((e: any) => {
      this.theme = e.theme;
    });

    this.loadingGpService.loading$.subscribe(async (e: any) => {
      var t: any = await this.systemService.translate(['loading']);
      if (e.active) {
        this.loading.msgs = e.hasOwnProperty('msgs') ? e.msgs : t['loading'];
        this.spinnerService.show('gp',{
          bdColor: e.hasOwnProperty('bdColor')
            ? e.bdColor
            : this.config.get(`spinner_loading.${this.theme}.bdColor`),
          color: e.hasOwnProperty('color')
            ? e.color
            : this.config.get(`spinner_loading.${this.theme}.color`),
          size: 'medium',
          fullScreen: true, 
        });
      } else this.spinnerService.hide('gp');
    });
  }

}
