import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-programas-update',
  templateUrl: './form-programas-update.component.html',
  styles: [
  ]
})
export class FormProgramasUpdateComponent implements OnInit, OnDestroy {

  constructor(
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    public programasService: ProgramasService,
    private uploaderFilesService: UploaderFilesService
  ){}


  @Input() modeDialog: ModeDialog;
  @Input() programa!: Programa;

  public fbForm!: FormGroup;
  showForm: boolean = false
  namesCrud!: NamesCrud;

  private subscription: Subscription = new Subscription();

  async ngOnInit(){
    if (this.modeDialog) {
      switch (this.modeDialog) {
        case 'Programa': await this.createFormPrograma(); break;
        case 'Título': await this.createFormTitulo(); break;
        case 'Grado académico': await this.createFormGradoAcademico(); break;
        case 'REXE': await this.createFormREXE(); break;
        default:
          break;
      }
      this.programasService.stateFormUpdate = this.fbForm.status as StateValidatorForm;
    }

    this.namesCrud = {
      singular: 'programa',
      plural: 'programas',
      articulo_singular: 'el programa',
      articulo_plural: 'los programas',
      genero: 'masculino'
    };
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'editar-programa') {
          this.filesChanged(from.files)
        }
      }
    }));

    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.label) {
          switch (from.context.component.label) {
            case 'Maestro': this.downloadDoc(from.file,'maestro'); break;
            case 'Director': this.downloadDoc(from.file,'director'); break;
            case 'Director alterno': this.downloadDoc(from.file,'directorAlterno'); break;
            case 'Estado maestro': this.downloadDoc(from.file,'estado_maestro'); break;
            case 'Grado académico': this.downloadDoc(from.file,'grado_academico'); break;
            case 'REXE': this.downloadDoc(from.file,'REXE'); break;
            case 'Título': this.downloadDoc(from.file,'titulo'); break;
          }
        }else{
          switch (from.context.component.name) {
            case 'reglamentos': this.downloadDoc(from.file,'reglamentos'); break;
            case 'estado-acreditacion': this.downloadDoc(from.file,'estados_acreditacion'); break;
          }
        }
      }
    }));
    
    this.subscription.add(this.fbForm.statusChanges.subscribe(status => {
      this.programasService.stateFormUpdate = status as StateValidatorForm
    }));

    this.subscription.add(
      this.programasService.formUpdate$.subscribe( form => {
        console.log("form",form);
        
        if (form && form.mode){
          switch (form.mode) {
            case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          }
        }
    }));

  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async createFormPrograma(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Programa');
      this.fbForm = this.fb.group({
        Nombre_programa: [this.programa.Nombre_programa, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        Grupo_correo: [this.programa.Grupo_correo, [Validators.required, GPValidator.checkCorreoUV()]],
        Creditos_totales: [this.programa.Creditos_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
        Horas_totales: [this.programa.Horas_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
        files: [[], this.filesValidator.bind(this)]
      })
      this.showForm = true
      //todo: falta carpeta de archivos de update programa 
      // await this.loadDocsWithBinary('titulo');
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Programa. Intente nuevamente.',
      });
    }
  }

  async createFormTitulo(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Título');
      this.fbForm = this.fb.group({
        Titulo: [this.programa.Titulo, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        files: [[], this.filesValidator.bind(this)]
      })
      this.showForm = true

      await this.loadDocsWithBinary('titulo');

    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Título. Intente nuevamente.',
      });
    }
  }

  async createFormGradoAcademico(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Grado académico');
      this.fbForm = this.fb.group({
        Grado_academico: [this.programa.Grado_academico, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        files: [[], this.filesValidator.bind(this)]
      })
      this.showForm = true

      await this.loadDocsWithBinary('grado_academico');

    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Grado académico. Intente nuevamente.',
      });
    }
  }

  async createFormREXE(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','REXE');
      this.fbForm = this.fb.group({
        REXE: [this.programa.REXE, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        files: [[], this.filesValidator.bind(this)]
      })
      this.showForm = true

      await this.loadDocsWithBinary('REXE');

    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de REXE. Intente nuevamente.',
      });
    }
  }


  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) {
        return null;
    }
    const files = formGroup.get('files')?.value;
    
    if (files.length === 0 ) {
      return { required: true };
    }

    return null;
  }

  filesChanged(files: any): void {
    this.fbForm.patchValue({ files });
    this.fbForm.get('files')?.updateValueAndValidity();
  }

  async loadDocsWithBinary(from: 'titulo' | 'REXE' | 'grado_academico' | 'estado_maestro' | 'director' | 'directorAlterno' | 'maestro'){
    try {
      this.uploaderFilesService.setLoading(true,true);
      const files = await this.programasService.getDocumentosWithBinary(this.programa.Cod_Programa!,from);
      this.uploaderFilesService.setFiles(files);
      this.filesChanged(files); 
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      });
    }finally{
      this.uploaderFilesService.setLoading(false); 
    }
  }

  async downloadDoc(documento: any, from: string) {
    try {
      let blob: Blob = await this.programasService.getArchiveDoc(documento.id, from);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento',
          message: e.detail.error.message.message
      });
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {};

      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload',resolve,reject);
      });

      if (actionUploadDoc.success) {
        const { files, ...formData } = this.fbForm.value ; 
        params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          modeUpdate: this.modeDialog,
          auxForm: this.programa
        }
      }

      const updated = await this.programasService.updatePrograma(params)
      
      if ( updated.dataWasUpdated ) {
        const messageGp = generateMessage(this.namesCrud, updated.dataUpdated , 'actualizado', true,false)
        resolve({success:true , dataWasUpdated: updated.dataWasUpdated, messageGp})
        //todo: el resetForm.
        // this.resetForm()
      }
      

    } catch (e) {
      reject(e)
    }
  }

  test(){
    console.log("errores:");
    
    Object.keys(this.fbForm.controls).forEach(key => {
      const control = this.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }


}
