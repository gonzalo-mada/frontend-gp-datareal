import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { EstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';

@Component({
  selector: 'app-form-estados-acreditacion',
  templateUrl: './form-estados-acreditacion.component.html',
  styles: [
  ]
})
export class FormEstadosAcreditacionComponent implements OnInit, OnDestroy {

  constructor(public configModeService: ConfigModeService,
              private commonUtils: CommonUtils,
              private errorTemplateHandler: ErrorTemplateHandler, 
              public estadosAcreditacionService: EstadosAcreditacionService, 
              private uploaderFilesService: UploaderFilesService,
  ){}
  
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.estadosAcreditacionService.modeForm
  }
    
  ngOnInit() {
    this.uploaderFilesService.disabledButtonSeleccionar();
    this.subscription.add(this.estadosAcreditacionService.fbForm.statusChanges.subscribe( status => { this.estadosAcreditacionService.stateForm = status as StateValidatorForm}));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'estado-acreditacion') {
          this.estadosAcreditacionService.filesChanged(from.files)
        }
      }
    }));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(from => {
      if (from) {
        if (from.context.component.name === 'estado-acreditacion') {
          this.downloadDoc(from.file)
        }
      }
    }));
    this.subscription.add(this.estadosAcreditacionService.fbForm.get('tiempo.Fecha_inicio')?.valueChanges.subscribe(() => this.calculateYearsDifference()));
    this.subscription.add(this.estadosAcreditacionService.fbForm.get('tiempo.Fecha_termino')?.valueChanges.subscribe(() => this.calculateYearsDifference()));
    this.subscription.add(this.estadosAcreditacionService.fbForm.get('Acreditado')?.valueChanges.subscribe(status => {
      if (status === false) {
        this.uploaderFilesService.disabledButtonSeleccionar();
      }
    }))
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
    this.uploaderFilesService.enabledButtonSeleccionar();
  }

  changeSwitch(event: any){
    const inputAcred = this.estadosAcreditacionService.fbForm.get('Nombre_ag_acredit');
    const fechaInicio = this.estadosAcreditacionService.fbForm.get('tiempo.Fecha_inicio');
    const fechaFin = this.estadosAcreditacionService.fbForm.get('tiempo.Fecha_termino');
    const inputCantidadAnios = this.estadosAcreditacionService.fbForm.get('tiempo.Cantidad_anios');

    switch (event.checked) {
      case 'SI':
        inputAcred?.enable();
        fechaInicio?.enable();
        fechaFin?.enable();
        inputCantidadAnios?.enable();
        this.estadosAcreditacionService.showAsterisk = true;
        this.uploaderFilesService.enabledButtonSeleccionar();
      break;
      case 'NO':
        inputAcred?.patchValue('Comisión Nacional de Acreditación CNA Chile');
        inputAcred?.disable();
        fechaInicio?.disable();
        fechaFin?.disable();
        inputCantidadAnios?.disable();
        this.estadosAcreditacionService.yearsDifference = null;
        this.estadosAcreditacionService.showAsterisk = false;
        this.uploaderFilesService.disabledButtonSeleccionar();
      break
      default:
        inputAcred?.disable();
        fechaInicio?.disable();
        fechaFin?.disable();
        inputCantidadAnios?.disable();
        inputAcred?.reset();
        fechaInicio?.reset();
        fechaFin?.reset();
        this.estadosAcreditacionService.yearsDifference = null;
        this.estadosAcreditacionService.showAsterisk = false;
        this.uploaderFilesService.disabledButtonSeleccionar();
      break;
    }
    this.estadosAcreditacionService.fbForm.controls['files'].updateValueAndValidity();
  }

  calculateYearsDifference(): void {
    const startDate = this.estadosAcreditacionService.fbForm.get('tiempo.Fecha_inicio')?.value;
    const endDate = this.estadosAcreditacionService.fbForm.get('tiempo.Fecha_termino')?.value;

    if (startDate && endDate ) {
      
      const start = new Date(this.parseDate(startDate));
      const end = new Date(this.parseDate(endDate));
      
      let years = end.getFullYear() - start.getFullYear();
 
      if (
        end.getMonth() < start.getMonth() ||
        (end.getMonth() === start.getMonth() && end.getDate() < start.getDate())
      ) {
        years -= 1;
      }

      this.estadosAcreditacionService.yearsDifference = years;      
      this.estadosAcreditacionService.fbForm.patchValue({ tiempo: {Cantidad_anios: this.estadosAcreditacionService.yearsDifference}});
      this.estadosAcreditacionService.fbForm.get('tiempo.Cantidad_anios')?.updateValueAndValidity();
      
      
    } else {
      this.estadosAcreditacionService.yearsDifference = null;
      this.estadosAcreditacionService.fbForm.get('tiempo.Cantidad_anios')?.reset();
      this.estadosAcreditacionService.fbForm.get('tiempo.Cantidad_anios')?.updateValueAndValidity();
    }
  }

  async downloadDoc(documento: any) {
    try {
      let blob: Blob = await this.estadosAcreditacionService.getArchiveDoc(documento.id);
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

  test(){
    Object.keys(this.estadosAcreditacionService.fbForm.controls).forEach(key => {
      const control = this.estadosAcreditacionService.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  parseDate(dateString: string) {
    // Dividir la cadena de fecha en día, mes y año
    if ( typeof dateString === 'string') {
      const [day, month, year] = dateString.split('-').map(Number);
      // Crear un nuevo objeto Date (año, mes - 1, día)
      return new Date(year, month - 1, day);
    }else{
      return dateString;
    }

  }

}
