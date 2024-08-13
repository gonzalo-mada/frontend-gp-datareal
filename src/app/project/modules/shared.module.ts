import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PrimengModule } from './primeng.module';
import { TranslateModule } from '@ngx-translate/core';
//pipes
import { FileSizePipe } from '../tools/pipes/file-size.pipe';
import { FileExtensionPipe } from '../tools/pipes/file-extension.pipe';
// components base to gp
import { FormIsvalidComponent } from 'src/app/base/components/form-isvalid/form-isvalid.component';
import { FormControlComponent } from 'src/app/base/components/form-control/form-control.component';
//components gp
import { CardComponent } from '../components/card/card.component';
import { MenuButtonsTableComponent } from '../components/menu-buttons-table/menu-buttons-table.component';
import { DialogComponent } from '../components/dialog/dialog.component';
import { UploaderFilesComponent } from '../components/uploader-files/uploader-files.component';
import { TableCampusComponent } from '../components/tables/table-campus/table-campus.component';
import { DialogVisorPdfComponent } from '../components/dialog-visor-pdf/dialog-visor-pdf.component';

@NgModule({
  declarations: [
    CardComponent,
    MenuButtonsTableComponent,
    DialogComponent,
    DialogVisorPdfComponent,
    UploaderFilesComponent,
    TableCampusComponent,
    //pipes
    FileSizePipe,
    FileExtensionPipe,
    
  ],
  imports: [
    CommonModule,
    PrimengModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    //components base to gp
    FormIsvalidComponent,
    FormControlComponent,
  ],
  exports: [
    CommonModule,
    PrimengModule,
    FormsModule,
    TranslateModule,
    ReactiveFormsModule,
    //pipes
    FileSizePipe,
    FileExtensionPipe,
    //components base to gp
    FormIsvalidComponent,
    FormControlComponent,
    //components gp
    CardComponent,
    DialogComponent,
    DialogVisorPdfComponent,
    MenuButtonsTableComponent,
    UploaderFilesComponent,
    TableCampusComponent,

  ],
})
export class SharedModule {}
