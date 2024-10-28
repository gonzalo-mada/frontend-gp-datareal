import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { Suspension } from 'src/app/project/models/programas/Suspension';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { DataUpdated } from 'src/app/project/models/shared/DataUpdated';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { Context } from 'src/app/project/models/shared/Context';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-suspension',
  templateUrl: './form-suspension.component.html',
  styles: [
  ]
})
export class FormSuspensionComponent implements OnInit, OnDestroy{

  constructor(private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    public suspensionesService: SuspensionesService,  
    private uploaderFilesService: UploaderFilesService
  ){}
  
  showAsterisk: boolean = false;
  namesCrud!: NamesCrud;
  suspension: Suspension = {};
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.suspensionesService.modeForm;
  }

  public fbForm: FormGroup = this.fb.group({
    Descripcion_TipoSuspension: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
    files: [[], this.filesValidator.bind(this)],
    aux: ['']
  })

  ngOnInit(): void {
    
    this.namesCrud = {
      singular: 'tipo de suspensión',
      plural: 'tipo de suspensión',
      articulo_singular: 'el tipo de suspensión',
      articulo_plural: 'los tipos de suspensiones',
      genero: 'masculino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.suspensionesService.stateForm = status as StateValidatorForm }))
    this.subscription.add(
      this.suspensionesService.formUpdate$.subscribe( form => {
        if (form && form.mode) {
          if (form.data) {
            this.suspension = {};
            this.suspension = form.data;
          }
          switch (form.mode) {
            case 'create': this.createForm(form.resolve! , form.reject!); break;
            case 'show': this.showForm(form.resolve! , form.reject!); break;
            case 'edit': this.editForm(form.resolve! , form.reject!); break;
            case 'insert': this.insertForm(form.resolve!, form.reject!); break;
            case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          }
        }
      })
    );
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'suspension') {
          this.filesChanged(from.files)
        }
      }
    }));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.name === 'suspension') {
          this.downloadDoc(from.file)
        }
      }
    }));

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
  }

  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
        return null;
    }
    const files = formGroup.get('files')?.value;

    if ( this.modeForm === 'create' || this.modeForm === 'edit' ){
      if (files.length === 0 ) {
        return { required: true };
      }
    }
    return null;
  }

  createForm(resolve: Function, reject: Function){
    try {
      this.uploaderFilesService.setContext('create','mantenedores','suspension')
      this.resetForm();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  async showForm(resolve: Function, reject: Function){
    try {
      this.uploaderFilesService.setContext('show','mantenedores','suspension')
      this.fbForm.patchValue({...this.suspension});
      this.fbForm.get('Descripcion_TipoSuspension')?.disable();
      this.showAsterisk = false;
      await this.loadDocsWithBinary(this.suspension);
      resolve(true)
    } catch (e) {      
      reject(e)
    }
  }

  async editForm(resolve: Function, reject: Function){
    try {
      this.uploaderFilesService.setContext('edit','mantenedores','suspension')
      this.fbForm.patchValue({...this.suspension});
      this.fbForm.patchValue({aux: this.suspension});
      this.fbForm.get('Descripcion_TipoSuspension')?.enable();
      this.showAsterisk = true;
      await this.loadDocsWithBinary(this.suspension);
      resolve(true)
    } catch (e) {      
      reject(e)
    }
  }

  async insertForm(resolve: Function, reject: Function){
    try {
      let params = {};
      
      const actionUploadDoc: ActionUploadDoc = await new Promise((res, rej) => {
        this.uploaderFilesService.setAction('upload',res,rej);
      });

      if (actionUploadDoc.success) {
        params = {
          ...this.fbForm.value,
          docsToUpload: actionUploadDoc.docsToUpload
        }
      };

      const inserted: DataInserted = await this.suspensionesService.insertSuspension(params);
      
      if (inserted.dataWasInserted) {
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted, 'creado', true,false);
        resolve({success:true , dataInserted: inserted.dataInserted , messageGp})
        this.resetForm()
      }

    } catch (e) {
      reject(e)
      this.resetForm()
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {};
      
      const actionUploadDoc: ActionUploadDoc = await new Promise((res, rej) => {
        this.uploaderFilesService.setAction('upload',res,rej);
      });

      if (actionUploadDoc.success) {
        params = {
          ...this.fbForm.value,
          ID_TipoSuspension: this.suspension.ID_TipoSuspension,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          aux: this.fbForm.get('aux')!.value
        }
      };

      const updated: DataUpdated = await this.suspensionesService.updateSuspension(params);
      
      if (updated.dataWasUpdated) {
        const messageGp = generateMessage(this.namesCrud, updated.dataUpdated, 'actualizado', true,false);
        resolve({success:true , dataInserted: updated.dataUpdated , messageGp})
        this.resetForm()
      }

    } catch (e) {
      reject(e)
      this.resetForm()
    }
  }



  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  resetForm(){
    this.fbForm.reset({
      Descripcion_TipoSuspension: '',
      files : []
    });
    this.fbForm.get('Descripcion_TipoSuspension')!.enable();
    this.showAsterisk = false;
    this.uploaderFilesService.setAction('reset');
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  async loadDocsWithBinary(suspension: Suspension){
    try {
      this.uploaderFilesService.setLoading(true,true);
      const files = await this.suspensionesService.getDocumentosWithBinary({ID_TipoSuspension: suspension.ID_TipoSuspension});
      this.uploaderFilesService.setFiles(files);
      this.filesChanged(files);
      return files;
    } catch (e: any) {
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        summary: 'Error al obtener documentos',
        message: e.detail.error.message.message
      });
    }finally{
      this.uploaderFilesService.setLoading(false);
    }
  }

  async downloadDoc(documento: any) {
    try {
      let blob: Blob = await this.suspensionesService.getArchiveDoc(documento.id);
      this.commonUtils.downloadBlob(blob, documento.nombre);      
    } catch (e:any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: 'Error al descargar documento',
          message: e.detail.error.message.message,
      });
    }
  }





}
