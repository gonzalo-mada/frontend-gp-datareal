import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
import { Campus } from 'src/app/project/models/programas/Campus';
import { ModeDialog, Programa, UpdatePrograma } from 'src/app/project/models/programas/Programa';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { CollectionsMongo } from 'src/app/project/models/shared/Context';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';
import { CertifIntermediaMainService } from 'src/app/project/services/programas/certificaciones-intermedias/main.service';
import { BackendProgramasService } from 'src/app/project/services/programas/programas/backend.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { FilesVerEditarProgramaService } from 'src/app/project/services/programas/programas/ver-editar/files.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';
import { TiposGraduacionesMainService } from 'src/app/project/services/programas/tipos-graduaciones/main.service';
import { TiposSuspensionesMainService } from 'src/app/project/services/programas/tipos-suspensiones/main.service';
import { groupDataTipoPrograma, groupDataUnidadesAcademicas } from 'src/app/project/tools/utils/dropwdown.utils';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Component({
  selector: 'app-form-programas-update',
  templateUrl: './form-programas-update.component.html',
  styles: [
  ]
})
export class FormProgramasUpdateComponent implements OnInit, OnChanges, OnDestroy {

  constructor(
    private backend: BackendProgramasService,
    private errorTemplateHandler: ErrorTemplateHandler,
    private files: FilesVerEditarProgramaService,
    public form: FormProgramaService,
    private messageService: MessageServiceGP,
    public main: VerEditarProgramaMainService,
    public mainTipoSuspension: TiposSuspensionesMainService,
    public mainTipoGraduacion: TiposGraduacionesMainService,
    public mainCertifIntermedia: CertifIntermediaMainService
  ){}

  @Input() mode: string = '';
  @Input() modeDialogInput: UpdatePrograma | undefined;
  @Input() programa!: Programa;
  @Input() refreshPrograma: boolean = false;
  @Output() formUpdated = new EventEmitter<ModeDialog>();
  @Output() resetDialog = new EventEmitter();

  selectedDirector: boolean = true;
  selectedDirectorAlterno: boolean = true;
  disabledSearchButton: boolean = true;
  directores: any[] = [];
  directoresAlternos: any[] = [];
  estadosAcreditacion: any[] = [];
  showAsterisk: boolean = true;
  private subscription: Subscription = new Subscription();

  async ngOnInit(){
  }

  async ngOnChanges(changes: SimpleChanges) {
    if ( changes['modeDialogInput'] && changes['modeDialogInput'].currentValue) {
      // console.log("MODE DIALOG: ",changes['modeDialogInput'].currentValue);
      this.main.showButtonSubmitUpdate = false;
      let modeDialogFromInput : UpdatePrograma = changes['modeDialogInput'].currentValue
      this.setForm(modeDialogFromInput.modeDialog , modeDialogFromInput.collection);
    }
  }

  ngOnDestroy(): void {
    if (this.subscription) this.subscription.unsubscribe();
  }

  async setForm(modeDialog: ModeDialog, collection: CollectionsMongo){
    this.main.dialogUpdateMode = modeDialog;
    this.main.reset();
    switch (modeDialog) {
      case 'director': await this.createFormDirector(); break;
      case 'director alterno': await this.createFormDirectorAlterno(); break;
      case 'estado maestro': await this.createFormEstadoMaestro(); break;
      case 'certificación intermedia': await this.createFormCertificacionIntermedia(); break;
      case 'graduación colaborativa': await this.createFormGraduacionColaborativa(); break;
      // case 'unidades académicas': await this.createUnidadesAcademicas(); break;
      default: 
        await this.main.createFormUpdate(modeDialog, collection); 
      break;
    }
    console.log("this.mode",this.mode);
    
  }

  changeTipoPrograma(event: any){
    let dataSelected : TipoPrograma = this.main.tiposProgramas.find( tp => tp.Cod_tipoPrograma === event.value )
    this.form.fbFormUpdate.get('Description_TP_New')?.patchValue(dataSelected.Descripcion_tp);
  }

  changeCampus(event: any){
    let dataSelected : Campus = this.main.campus.find( c => c.Cod_campus === event.value )!
    this.form.fbFormUpdate.get('Description_Campus_New')?.patchValue(dataSelected.Descripcion_campus);
  }

  changeTipoGraduacion(event: any){
    let dataSelected : TipoGraduacion = this.mainTipoGraduacion.tipos.find( c => c.Cod_TipoColaborativa === event.value )!
    this.form.fbFormUpdate.get('Description_TG_New')?.patchValue(dataSelected.Descripcion_tipoColaborativa);
  }

  changeInstituciones(event:any){
    this.form.fbFormUpdate.get('Instituciones')?.patchValue(event.value);
  }

  changeCertifIntermedias(event:any){
    this.form.fbFormUpdate.get('Certificacion_intermedia')?.patchValue(event.value);
  }

  changeUnidadAcad(event: any){
    this.form.fbForm.get('Unidades_academicas_Selected')?.patchValue(event.value);
  }

  async createFormDirector(){
    try {
      this.directores = [];
      this.directoresAlternos = [];
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'director');
      await this.form.setFormUpdate('director', this.programa);

      this.form.fbFormUpdate.get('Director_selected')?.value !== '' ? this.selectedDirector = true : this.selectedDirector = false
      this.checkDirectorSelected('director');

      const rut_director = this.programa.Director!.split('-');
      this.directores = await this.backend.getDirector({rut: parseInt(rut_director[0])},false,'director');
      this.directores.map( director => {
        if (director.rutcompleto === this.programa.Director) {
          director.isSelected = true;
          this.form.stateFormUpdate = 'VALID';
        }else{
          director.isSelected = false;
        }
      })

      this.form.fbForm.get('Director_selected')!.valueChanges.subscribe( value => {
        value === '' ? this.selectedDirector = false : this.selectedDirector = true
        this.form.fbFormUpdate.get('Director_selected')?.patchValue(value);
        this.form.fbFormUpdate.get('nombreDirector')?.patchValue(this.form.directorSelected.nombre);
        this.checkDirectorSelected('director');
      })

      this.main.dialogUpdate = true;

      const response = await this.main.setLoadDocsWithBinary(this.programa.Cod_Programa!,'director');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidator('files',() => this.mode as ModeForm)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.main.showButtonSubmitUpdate = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Director(a). Intente nuevamente.',
      });
    }
  }

  async createFormDirectorAlterno(){
    try {
      this.directores = [];
      this.directoresAlternos = [];
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'directorAlterno');
      await this.form.setFormUpdate('director alterno', this.programa);

      if (this.mode === 'show') this.form.fbFormUpdate.disable();
      
      if (this.form.fbFormUpdate.get('Director_alterno')?.value !== '0') {
        // si tiene director alterno
        this.selectedDirectorAlterno = true;
        const rut_director = this.programa.Director_alterno!.split('-');
        this.directoresAlternos = await this.backend.getDirector({rut: parseInt(rut_director[0])},false,'alterno');
        this.directoresAlternos.map( director => {
          if (director.rutcompleto === this.programa.Director_alterno) {
            director.isSelected = true;
            this.form.stateFormUpdate = 'VALID';
          }else{
            director.isSelected = false;
          }
        })
      }else{
        //no tiene director alterno
        this.form.unsetSelectDirectorFormUpdate('alterno');
        this.form.fbFormUpdate.get('Director_alterno')?.reset();
        this.form.fbFormUpdate.get('DirectorAlterno_selected')?.clearValidators();
        this.form.fbFormUpdate.get('Director_alterno')?.disable()
        this.main.disabledButtonSeleccionar();
        this.selectedDirectorAlterno = false;
        this.showAsterisk = false;
        this.disabledSearchButton = true;
      }

      this.form.fbForm.get('DirectorAlterno_selected')!.valueChanges.subscribe( value => {
        
        if (value === '' || value === null) {
          this.selectedDirectorAlterno = false
        }else{
          this.selectedDirectorAlterno = true
        }
        this.form.fbFormUpdate.get('DirectorAlterno_selected')?.patchValue(value);
        this.form.fbFormUpdate.get('nombreDirector_alterno')?.patchValue(this.form.directorAlternoSelected.nombre);
        this.checkDirectorSelected('alterno');
      })
      this.main.dialogUpdate = true;

      const response = await this.main.setLoadDocsWithBinary(this.programa.Cod_Programa!,'directorAlterno');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'haveDirectorAlterno',() => this.mode as ModeForm)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.main.showButtonSubmitUpdate = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Director(a) alterno(a). Intente nuevamente.',
      });
    }
  }

  async createFormCertificacionIntermedia(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'certificacion_intermedia');
      await this.form.setFormUpdate('certificación intermedia', this.programa);
      if (this.mode === 'show'){
        this.form.fbFormUpdate.get('Certificacion_intermedia_Switch')!.disable();
        this.form.fbFormUpdate.get('Certificacion_intermedia_old')!.enable();
      } 
      const cert_int_switch = this.form.fbFormUpdate.get('Certificacion_intermedia_Switch')!;
      if (!cert_int_switch.value) {
        this.form.fbFormUpdate.get('Certificacion_intermedia')?.disable()
        this.main.disabledButtonSeleccionar();
        this.showAsterisk = false; 
      }
      this.main.dialogUpdate = true;

      const response = await this.main.setLoadDocsWithBinary(this.programa.Cod_Programa!,'certificacion_intermedia');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'Certificacion_intermedia_Switch',() => this.mode as ModeForm)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.main.showButtonSubmitUpdate = true;
      } 
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Graduación colaborativa. Intente nuevamente.',
      });
    }
  }

  async createFormGraduacionColaborativa(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'graduacion_colaborativa');
      await this.form.setFormUpdate('graduación colaborativa', this.programa);
      if (this.mode === 'show'){
        this.form.fbFormUpdate.get('Graduacion_Conjunta_Switch')!.disable();
        this.form.fbFormUpdate.get('Cod_TipoGraduacion')!.disable();
        this.form.fbFormUpdate.get('Instituciones_old')!.enable();
      } 
      const grad_conj_switch = this.form.fbFormUpdate.get('Graduacion_Conjunta_Switch')!;
      if (!grad_conj_switch.value) {
        this.form.fbFormUpdate.get('Certificacion_intermedia')?.disable()
        this.form.fbFormUpdate.get('Cod_TipoGraduacion')?.disable()
        this.form.fbFormUpdate.get('Instituciones')?.disable()
        this.main.disabledButtonSeleccionar();
        this.showAsterisk = false; 
      }
      this.main.dialogUpdate = true;

      const response = await this.main.setLoadDocsWithBinary(this.programa.Cod_Programa!,'graduacion_colaborativa');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'Graduacion_Conjunta_Switch',() => this.mode as ModeForm)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.main.showButtonSubmitUpdate = true;
      } 
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Graduación colaborativa. Intente nuevamente.',
      });
    }
  }

  checkDirectorSelected(mode: 'director' | 'alterno'){
    switch (mode) {
      case 'director':
        if (this.selectedDirector) {
          this.form.fbFormUpdate.get('Director')?.disable()
          this.disabledSearchButton = true
        }else{
          this.form.fbFormUpdate.get('Director')?.enable()
          this.disabledSearchButton = false
        }
      break;
      case 'alterno':
        if (this.selectedDirectorAlterno) {
          this.disabledSearchButton = true
        }else{
          this.disabledSearchButton = false
        }
        this.form.fbFormUpdate.get('Director_alterno')?.disable()
      break;
    }
  }

  async searchDirector(tipo: string){
    if (tipo === 'director') {
      const inputRutDirector = this.form.fbFormUpdate.get('Director')!.value
      const rut_director = inputRutDirector.split('-')
      let result: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])}, undefined, 'director');
      if (result.length === 0 ) {
        //no se encontraron directores
        this.messageService.add({
          key: 'main',
          severity: 'warn',
          detail: `No se encontraron directores(as) con el RUT: ${inputRutDirector}.`
        });
      }else{
        this.directores = result;
      }
      
      
    }else{
      //tipo directoralterno
      const inputRutDirectorAlt = this.form.fbFormUpdate.get('Director_alterno')!.value
      const rut_director = inputRutDirectorAlt.split('-')
      let resultAlt: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])},undefined,'alterno');
      
      if (resultAlt.length === 0 ) {
        //no se encontraron directores
        this.messageService.add({
          key: 'main',
          severity: 'warn',
          detail: `No se encontraron directores(as) con el RUT: ${inputRutDirectorAlt}.`
        });
      }else{
        this.directoresAlternos = resultAlt;
      }
    }    
  }

  async createFormEstadoMaestro(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'estado_maestro');
      await this.form.setFormUpdate('estado maestro', this.programa);
      if (this.mode === 'show') this.form.fbFormUpdate.disable();

      if (this.programa.Cod_EstadoMaestro === 2 ) {
        this.form.fbFormUpdate.get('TipoSuspension')?.enable();
        let suspensionSelected = this.mainTipoSuspension.tipos_susp.filter( r => r.ID_TipoSuspension === this.programa.ID_TipoSuspension)
        this.form.fbFormUpdate.get('TipoSuspension')?.patchValue(suspensionSelected[0]);
        this.form.fbFormUpdate.get('TipoSuspension')?.setValidators([Validators.required, GPValidator.notMinusOneCategory()]);
        this.form.fbFormUpdate.get('TipoSuspension')?.updateValueAndValidity();
      }

      this.main.dialogUpdate = true;

      const response = await this.main.setLoadDocsWithBinary(this.programa.Cod_Programa!,'estado_maestro');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidator('files',() => this.mode as ModeForm)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.main.showButtonSubmitUpdate = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Estado maestro. Intente nuevamente.',
      });
    }
  }

  onEstadoMaestroChange(event: any){
    const tipoSuspensionControl = this.form.fbFormUpdate.get('TipoSuspension');
    const filesControl = this.form.fbFormUpdate.get('files');
    switch (event.value) {
      case 2: 
        tipoSuspensionControl?.enable();
        tipoSuspensionControl?.setValidators([Validators.required, GPValidator.notMinusOneCategory()]);
      break;

      default: 
        tipoSuspensionControl?.disable();
        tipoSuspensionControl?.clearValidators();
        tipoSuspensionControl?.reset();
      break;
    }
    tipoSuspensionControl?.updateValueAndValidity();
    filesControl?.setValidators([GPValidator.filesValidator('files',() => this.mode as ModeForm)]);
    filesControl?.updateValueAndValidity();
  }
 
  async submit(){
    this.main.programa = this.programa
    const response = await this.main.updateForm()
    this.formUpdated.emit(response)
  }

  test(){
    console.log("fbFormUpdate",this.form.fbFormUpdate.value);
    console.log("stateFormUpdate programaService: ",this.form.stateFormUpdate);
    
    Object.keys(this.form.fbFormUpdate.controls).forEach(key => {
      const control = this.form.fbFormUpdate.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  closeDialog(){
    this.resetDialog.emit();
    this.main.enabledButtonSeleccionar();
  }

  changeSwitchDirectorAlterno(event: any){
    if ( event.checked === false ) {
      this.form.unsetSelectDirectorFormUpdate('alterno');
      this.form.fbFormUpdate.get('Director_alterno')?.reset();
      this.form.fbFormUpdate.get('Director_alterno')?.disable();
      this.form.fbFormUpdate.get('DirectorAlterno_selected')?.disable();
      this.disabledSearchButton = true;
      this.directoresAlternos = [];
      this.showAsterisk = false;
      this.main.disabledButtonSeleccionar();
    }else{
      this.form.fbFormUpdate.get('Director_alterno')?.enable();
      this.form.fbFormUpdate.get('DirectorAlterno_selected')?.enable();
      this.form.fbFormUpdate.get('Director_alterno')?.setValidators([Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate('A',this.programa.Director!, this.programa.Director_alterno!)]);
      this.form.fbFormUpdate.get('DirectorAlterno_selected')?.setValidators([Validators.required]);
      this.form.fbFormUpdate.get('Director_alterno')?.updateValueAndValidity();
      this.form.fbFormUpdate.get('DirectorAlterno_selected')?.updateValueAndValidity();

      this.showAsterisk = true;
      this.disabledSearchButton = false;
      this.main.enabledButtonSeleccionar();
      
    }
    this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'haveDirectorAlterno',() => this.mode as ModeForm)]);
    this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
  }

  changeSwitchCI(event: any){
    const Certificacion_intermedia = this.form.fbFormUpdate.get('Certificacion_intermedia')!;

    switch (event.checked) {
      case true: 
        Certificacion_intermedia.enable(); 
        this.main.enabledButtonSeleccionar();
        this.showAsterisk = true; 
      break;
      case false : 
        Certificacion_intermedia.disable(); 
        this.main.disabledButtonSeleccionar();
        this.showAsterisk = false; 
      break;
    }
    this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'Certificacion_intermedia_Switch',() => this.mode as ModeForm)]);
    this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
  }

  changeSwitchGradConjunta(event: any){
    const tipo_graduacion = this.form.fbFormUpdate.get('Cod_TipoGraduacion')!;
    const instituciones = this.form.fbFormUpdate.get('Instituciones')!;

    switch (event.checked) {
      case true: 
        tipo_graduacion.enable(); 
        instituciones.enable(); 
        this.main.enabledButtonSeleccionar();
        this.showAsterisk = true; 
      break;
      case false : 
        tipo_graduacion.disable(); 
        instituciones.disable(); 
        this.main.disabledButtonSeleccionar();
        this.showAsterisk = false; 
      break;
    }
    this.form.fbFormUpdate.get('files')?.setValidators([GPValidator.filesValidatorWithStatus('files', 'Graduacion_Conjunta_Switch',() => this.mode as ModeForm)]);
    this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
  }

}
