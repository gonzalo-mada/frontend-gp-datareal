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
import { TableFacultadComponent } from '../components/tables/table-facultad/table-facultad.component';
import { TableTiposProgramasComponent } from '../components/tables/table-tipos-programas/table-tipos-programas.component';
import { TableCategoriasTpComponent } from '../components/tables/table-categorias-tp/table-categorias-tp.component';
import { FormCategoriasTpComponent } from '../components/forms/form-categorias-tp/form-categorias-tp.component';
import { TableUnidadesAcademicasComponent } from '../components/tables/table-unidades-academicas/table-unidades-academicas.component';

const componentsGp = [
  CardComponent,
  DialogComponent,
  DialogVisorPdfComponent,
  FormCategoriasTpComponent,
  MenuButtonsTableComponent,
  UploaderFilesComponent,
  TableCampusComponent,
  TableCategoriasTpComponent,
  TableFacultadComponent,
  TableTiposProgramasComponent,
  TableUnidadesAcademicasComponent
]

@NgModule({
  declarations: [
    //pipes
    FileSizePipe,
    FileExtensionPipe,
    ...componentsGp    
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
    ...componentsGp
  ],
})
export class SharedModule {}
