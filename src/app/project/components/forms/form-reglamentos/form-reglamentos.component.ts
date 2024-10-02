import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ReglamentosService } from 'src/app/project/services/reglamentos.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Reglamento } from 'src/app/project/models/Reglamento';
import { Context } from 'src/app/project/models/shared/Context';

@Component({
  selector: 'app-form-reglamentos',
  templateUrl: './form-reglamentos.component.html',
  styles: []
})
export class FormReglamentosComponent implements OnInit, OnDestroy {
  constructor(
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private menuButtonsTableService: MenuButtonsTableService,
    private reglamentosService: ReglamentosService,
    private uploaderFilesService: UploaderFilesService,

  ){}
  
  reglamento: Reglamento = {};
  maxDate!: Date;
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.reglamentosService.modeForm;
  }
  
  // Definición del formulario reactivo
  public fbForm: FormGroup = this.fb.group({
    Descripcion_regla: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    anio: ['', Validators.required],
    vigencia: [false],
    files: [[], this.filesValidator.bind(this)]  // Validación personalizada de archivos
  });

  ngOnInit(): void {
    this.uploaderFilesService.setContext('mantenedores','reglamentos');
    this.namesCrud = {
      singular: 'reglamento',
      plural: 'reglamentos',
      articulo_singular: 'el reglamento',
      articulo_plural: 'los reglamentos',
      genero: 'masculino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.reglamentosService.stateForm = status as StateValidatorForm;}));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'reglamentos') {
          this.filesChanged(from.files)
        }
      }
    }));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.name === 'reglamentos') {
          this.downloadDoc(from.file)
        }
      }
    }));
    this.subscription.add(
      this.reglamentosService.formUpdate$.subscribe( form => {
        if (form && form.mode){
          if (form.data) {
            this.reglamento = {};
            this.reglamento = form.data;
          }
          switch (form.mode) {
            case 'create': this.createForm(form.resolve! , form.reject!); break;
            case 'show': this.showForm(form.resolve! , form.reject!); break;
            case 'edit': this.editForm(form.resolve! , form.reject!); break;
            case 'insert': this.insertForm(form.resolve! , form.resolve!); break;
            case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          
          }
        }
    }));
    
    const currentYear = new Date().getFullYear();
    this.maxDate = new Date(currentYear, 11, 31);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
  }

  // Validador de archivos personalizado
  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
        return null;
    }
    const files = formGroup.get('files')?.value;

    if ( this.modeForm == 'create' ){
      if (files.length === 0 ) {
        return { required: true };
      }
    }else if ( this.modeForm == 'edit'){
      if (files.length === 0 ) {
        return { required: true };
      }
    }
    return null;
  }

  // Crear formulario (nueva entrada)
  createForm(resolve: Function, reject: Function){
    try {
      this.resetForm();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  async showForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.reglamento});
      this.fbForm.get('Descripcion_regla')?.disable();
      this.fbForm.get('vigencia')?.disable();
      this.fbForm.get('anio')?.disable();
      await this.loadDocsWithBinary(this.reglamento);
      resolve(true)
    } catch (e) {      
      reject(e)
    }  
  }

  async editForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.reglamento});
      this.fbForm.get('Descripcion_regla')?.enable();
      this.fbForm.get('vigencia')?.enable();
      this.fbForm.get('anio')?.enable();
      await this.loadDocsWithBinary(this.reglamento);
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  // Insertar reglamento
  async insertForm(resolve: Function, reject: Function): Promise<void> {
    try {
      let params = {};
  
      // Siempre requerimos documentos
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload', resolve, reject);
      });
  
      if (actionUploadDoc.success) {
        // Preparar los parámetros excluyendo "files" y agregando los documentos
        const { files, ...formData } = this.fbForm.value;
        params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload
        };
      }
      // Insertar los reglamentos utilizando el servicio      
      const inserted: DataInserted = await this.reglamentosService.insertReglamento(params);
  
      if (inserted.dataWasInserted) {
        // Generar mensaje de éxito y resolver la promesa
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted, 'creado', true, false);
        resolve({ success: true, dataInserted: inserted.dataInserted, messageGp });
        this.resetForm();  // Resetear el formulario tras el éxito
      }
  
    } catch (e) {
      reject(e)
      this.resetForm()
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
            Cod_reglamento: this.reglamento.Cod_reglamento,
          }
      }


      const updated = await this.reglamentosService.updateReglamento(params)
      if ( updated.dataWasUpdated ) {
        const messageGp = generateMessage(this.namesCrud, null , 'actualizado', true,false)
        resolve({success:true , dataWasUpdated: updated.dataWasUpdated, messageGp})
        this.resetForm()
      }
    } catch (e) {
      reject(e)
      this.resetForm();
    }
  }


  resetForm(): void {
    this.fbForm.reset({
      Descripcion_regla: '',
      anio: '',
      vigencia: false,
      files: []
    });
    this.fbForm.get('Descripcion_regla')?.enable();
    this.fbForm.get('anio')?.enable();
    this.fbForm.get('vigencia')?.enable();
    this.uploaderFilesService.setAction('reset');
    this.uploaderFilesService.resetValidatorFiles();
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  filesChanged(files: any): void {
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  async loadDocsWithBinary(reglamento: Reglamento){
    try {    
      const files = await this.reglamentosService.getDocumentosWithBinary(reglamento.Cod_reglamento!)  
      this.uploaderFilesService.setFiles(files);      
      this.filesChanged(files);
      return files
    } catch (e:any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      });
    }
  }

  async downloadDoc(documento: any) {
    try {
      let blob: Blob = await this.reglamentosService.getArchiveDoc(documento.id);
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



}