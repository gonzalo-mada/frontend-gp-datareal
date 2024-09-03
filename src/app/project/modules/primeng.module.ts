import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';

//prime gp
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { StepsModule } from 'primeng/steps';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { TableModule } from 'primeng/table'

@NgModule({
  declarations: [],
  providers: [ConfirmationService, MessageService],
  imports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MenuModule,
    CardModule,
    //primeng gp
    BadgeModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DialogModule,
    DropdownModule,
    FileUploadModule,
    InputTextareaModule,
    InputSwitchModule,
    MultiSelectModule,
    OverlayPanelModule,
    SelectButtonModule,
    StepsModule,
    TableModule,
    TabViewModule,
    ToastModule,
    ToolbarModule
  ],
  exports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MenuModule,
    CardModule,
    //primeng gp
    BadgeModule,
    ConfirmDialogModule,
    ConfirmPopupModule,
    DialogModule,
    DropdownModule,
    FileUploadModule,
    InputTextareaModule,
    InputSwitchModule,
    MultiSelectModule,
    OverlayPanelModule,
    SelectButtonModule,
    StepsModule,
    TableModule,
    TabViewModule,
    ToastModule,
    ToolbarModule
  ],
})
export class PrimengModule {}
