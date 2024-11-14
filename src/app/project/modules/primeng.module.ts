import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { CardModule } from 'primeng/card';

//prime gp
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { BadgeModule } from 'primeng/badge';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CalendarModule } from 'primeng/calendar';
import { ChipModule } from 'primeng/chip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { InputSwitchModule } from 'primeng/inputswitch';
import { MultiSelectModule } from 'primeng/multiselect';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonModule } from 'primeng/skeleton';
import { StepperModule } from 'primeng/stepper';
import { StepsModule } from 'primeng/steps';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';

const primeGp = [
  AccordionModule,
  AutoCompleteModule,
  BadgeModule,
  BreadcrumbModule,
  CalendarModule,
  ChipModule,
  ConfirmDialogModule,
  ConfirmPopupModule,
  DialogModule,
  DividerModule,
  DropdownModule,
  FileUploadModule,
  InputGroupAddonModule, 
  InputGroupModule,
  InputNumberModule,
  InputTextareaModule,
  InputSwitchModule,
  MultiSelectModule,
  OverlayPanelModule,
  SelectButtonModule,
  SidebarModule,
  SkeletonModule,
  StepsModule,
  StepperModule,
  TableModule,
  TabViewModule,
  TagModule,
  ToastModule,
  ToolbarModule
]

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
    ...primeGp
  ],
  exports: [
    CommonModule,
    ButtonModule,
    InputTextModule,
    MenuModule,
    CardModule,
    //primeng gp
    ...primeGp
  ],
})
export class PrimengModule {}
