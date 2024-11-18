import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ReglamentosService } from 'src/app/project/services/programas/reglamentos.service';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';

@Component({
  selector: 'app-form-reglamentos',
  templateUrl: './form-reglamentos.component.html',
  styles: []
})
export class FormReglamentosComponent implements OnInit, OnDestroy {
  constructor(
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    public reglamentosService: ReglamentosService,
    private uploaderFilesService: UploaderFilesService,
  ){}

  maxDate!: Date;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.reglamentosService.modeForm;
  }
  

  ngOnInit(): void {
    this.subscription.add(this.reglamentosService.fbForm.statusChanges.subscribe(status => { this.reglamentosService.stateForm = status as StateValidatorForm;}));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'reglamentos') {
          this.reglamentosService.filesChanged(from.files)
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
    const currentYear = new Date().getFullYear();
    this.maxDate = new Date(currentYear, 11, 31);
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
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