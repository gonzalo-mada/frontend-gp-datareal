import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { BackendProgramasService } from 'src/app/project/services/programas/programas/backend.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { FilesVerEditarProgramaService } from 'src/app/project/services/programas/programas/ver-editar/files.service';
import { VerEditarProgramaMainService } from 'src/app/project/services/programas/programas/ver-editar/main.service';
import { ReglamentosMainService } from 'src/app/project/services/programas/reglamentos/main.service';
import { TiposSuspensionesMainService } from 'src/app/project/services/programas/tipos-suspensiones/main.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
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
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private files: FilesVerEditarProgramaService,
    public form: FormProgramaService,
    private messageService: MessageServiceGP,
    private router: Router,
    public reglamentosMainService: ReglamentosMainService,
    public mainTipoSuspension: TiposSuspensionesMainService,
    public main: VerEditarProgramaMainService
  ){}

  @Input() modeDialogInput: ModeDialog;
  @Input() programa!: Programa;
  @Output() formUpdated = new EventEmitter<string>();
  @Output() resetDialog = new EventEmitter();

  public fbForm!: FormGroup;
  showForm: boolean = false
  selectedReglamento: boolean = true;
  selectedDirector: boolean = true;
  selectedDirectorAlterno: boolean = true;
  selectedEstadoAcreditacion: boolean = true;
  directores: any[] = [];
  directoresAlternos: any[] = [];
  estadosMaestros: any[] = [];
  suspensiones: any[] = [];
  estadosAcreditacion: any[] = [];
  showSuspension: boolean = false;
  showButtonSubmit: boolean = false;
  private subscription: Subscription = new Subscription();

  async ngOnInit(){
    this.fbForm = this.fb.group({});

    await this.getData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ( changes['modeDialogInput'] && changes['modeDialogInput'].currentValue) {
      console.log("MODE DIALOG: ",changes['modeDialogInput'].currentValue);
      this.showButtonSubmit = false;
      let modeDialogFromInput : ModeDialog = changes['modeDialogInput'].currentValue
      this.setForm(modeDialogFromInput);
    }
    
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  async setForm(modeDialog: ModeDialog){
    this.main.dialogUpdateMode = modeDialog;
    switch (modeDialog) {
      case 'nombre': await this.createFormNombre(); break;
      case 'grupo_correo': this.createFormGrupoCorreo(); break;
      case 'créditos totales': this.createFormCreditosTotales(); break;
      case 'horas totales': this.createFormHorasTotales(); break;
      case 'título': this.createFormTitulo(); break;
      case 'grado académico': this.createFormGradoAcademico(); break;
      case 'REXE': this.createFormREXE(); break;
      case 'maestro': this.createFormDocsMaestro(); break;
      case 'reglamento': this.createFormReglamento(); break;
      case 'director': this.createFormDirector(); break;
      case 'director alterno': this.createFormDirectorAlterno(); break;
      case 'estado maestro': this.createFormEstadoMaestro(); break;
      case 'estado acreditación': this.createFormEstadoAcreditacion(); break;
      default: break;
    }

  }

  async getData(){
    try {
      await Promise.all([this.getEstadosMaestros(),this.mainTipoSuspension.getTiposSuspensiones(false)]);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async getEstadosMaestros(){
    this.estadosMaestros = await this.backend.getEstadosMaestros(false);
  }

  async createFormNombre(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'nombre_programa');
      await this.form.setFormUpdate('nombre', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('nombre_programa');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de nombre de programa. Intente nuevamente.',
      });
    }
  }

  async createFormGrupoCorreo(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'grupo_correo');
      await this.form.setFormUpdate('grupo_correo', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('grupo_correo');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Programa. Intente nuevamente.',
      });
    }
  }

  async createFormCreditosTotales(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'creditos_totales');
      await this.form.setFormUpdate('créditos totales', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('creditos_totales');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de créditos totales de programa. Intente nuevamente.',
      });
    }
  }

  async createFormHorasTotales(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'horas_totales');
      await this.form.setFormUpdate('horas totales', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('horas_totales');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de horas totales de programa. Intente nuevamente.',
      });
    }
  }

  async createFormTitulo(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'titulo');
      await this.form.setFormUpdate('título', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('titulo');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Título. Intente nuevamente.',
      });
    }
  }

  async createFormGradoAcademico(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'grado_academico');
      await this.form.setFormUpdate('grado académico', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('grado_academico');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Grado académico. Intente nuevamente.',
      });
    }
  }

  async createFormREXE(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'REXE');
      await this.form.setFormUpdate('REXE', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('REXE');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de REXE. Intente nuevamente.',
      });
    }
  }

  async createFormDocsMaestro(){
    try {
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'maestro');
      await this.form.setFormUpdate('maestro', this.programa);
      this.main.dialogUpdate = true;
      const response = await this.loadDocsWithBinary('maestro');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Documentos maestros. Intente nuevamente.',
      });
    }
  }

  async createFormReglamento(){
    try {
      this.reglamentosMainService.emitResetExpandedRows();
      await this.form.setFormUpdate('reglamento', this.programa);
      this.form.fbForm.get('Cod_Reglamento')!.valueChanges.subscribe( value => {
        this.form.fbFormUpdate.get('Cod_Reglamento')?.patchValue(value);
        this.form.fbFormUpdate.get('nombreReglamento')?.patchValue(this.form.reglamentoSelected);
      })
      this.main.dialogUpdate = true;
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Reglamentos. Intente nuevamente.',
      });
    }
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
      this.directores = await this.backend.getDirector({rut: parseInt(rut_director[0])},false);
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

      const response = await this.loadDocsWithBinary('director');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
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

      this.form.fbFormUpdate.get('DirectorAlterno_selected')?.value !== '' ? this.selectedDirectorAlterno = true : this.selectedDirectorAlterno = false
      this.checkDirectorSelected('alterno');

      const rut_director = this.programa.Director_alterno!.split('-');
      this.directoresAlternos = await this.backend.getDirector({rut: parseInt(rut_director[0])},false);
      this.directoresAlternos.map( director => {
        if (director.rutcompleto === this.programa.Director_alterno) {
          director.isSelected = true;
          this.form.stateFormUpdate = 'VALID';
        }else{
          director.isSelected = false;
        }
      })

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

      const response = await this.loadDocsWithBinary('directorAlterno');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Director(a) alterno(a). Intente nuevamente.',
      });
    }
  }

  checkDirectorSelected(mode: 'director' | 'alterno'){
    switch (mode) {
      case 'director':
        this.selectedDirector ? this.form.fbFormUpdate.get('Director')?.disable() : this.form.fbFormUpdate.get('Director')?.enable()
      break;
      case 'alterno':
        this.selectedDirectorAlterno ? this.form.fbFormUpdate.get('Director_alterno')?.disable() : this.form.fbFormUpdate.get('Director_alterno')?.enable()
      break;
    }
  }

  async searchDirector(tipo: string){
    if (tipo === 'director') {
      const inputRutDirector = this.form.fbFormUpdate.get('Director')!.value
      const rut_director = inputRutDirector.split('-')
      let result: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])});
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
      let resultAlt: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])});
      
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
      this.showSuspension = false
      await this.files.setContextUploader('edit', 'programa', 'ver/editar-programa', 'estado_maestro');
      await this.form.setFormUpdate('estado maestro', this.programa);

      if (this.programa.Cod_EstadoMaestro === 2 ) {
        let suspensionSelected = this.mainTipoSuspension.tipos_susp.filter( r => r.ID_TipoSuspension === this.programa.ID_TipoSuspension)
        this.form.fbFormUpdate.get('TipoSuspension')?.patchValue(suspensionSelected[0]);
        this.form.fbFormUpdate.get('TipoSuspension')?.setValidators([Validators.required, GPValidator.notMinusOneCategory()]);
        this.form.fbFormUpdate.get('TipoSuspension')?.updateValueAndValidity();
        this.showSuspension = true;
      }

      this.main.dialogUpdate = true;

      const response = await this.loadDocsWithBinary('estado_maestro');
      if (response) {
        this.form.fbFormUpdate.get('files')?.setValidators([this.filesValidator.bind(this)]);
        this.form.fbFormUpdate.get('files')?.updateValueAndValidity();
        this.showButtonSubmit = true;
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Estado maestro. Intente nuevamente.',
      });
    }
  }

  async createFormEstadoAcreditacion(){
    try {
      this.estadosAcreditacion = await this.backend.getEstadosAcreditacion(false);
      this.estadosAcreditacion.map( eA => {
        if (eA.Cod_acreditacion === this.programa.Cod_acreditacion) {
          eA.isSelected = true; 
          this.form.stateFormUpdate = 'VALID';
        }else{
          eA.isSelected = false; 
        }
      })

      this.form.fbForm.get('Cod_acreditacion')!.valueChanges.subscribe( value => {
        this.form.fbFormUpdate.get('Cod_acreditacion')?.patchValue(value);
        this.form.fbFormUpdate.get('nombreEstadoAcreditacion')?.patchValue(this.form.estadoAcreditacionSiglaSelected);
      })

      this.main.dialogUpdate = true;
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Estado acreditación. Intente nuevamente.',
      });
    }
  }

  onEstadoMaestroChange(event: any){
    const tipoSuspensionControl = this.form.fbFormUpdate.get('TipoSuspension');
    const filesControl = this.form.fbFormUpdate.get('files');
    switch (event.value) {
      case 2: 
        this.showSuspension = true;
        tipoSuspensionControl?.setValidators([Validators.required, GPValidator.notMinusOneCategory()]);
      break;

      default: 
        this.showSuspension = false;
        tipoSuspensionControl?.clearValidators();
        tipoSuspensionControl?.reset();
      break;
    }
    tipoSuspensionControl?.updateValueAndValidity();
    filesControl?.setValidators([this.filesValidator.bind(this)]);
    filesControl?.updateValueAndValidity();
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

  async loadDocsWithBinary(from: 'titulo' | 'REXE' | 'grado_academico' | 'estado_maestro' | 'director' | 'directorAlterno' | 'maestro' | 'nombre_programa' | 'grupo_correo' | 'creditos_totales' | 'horas_totales'){
    return this.main.setLoadDocsWithBinary(this.programa.Cod_Programa!,from)
  }

  async submit(){
    this.main.programa = this.programa
    const response = await this.main.updateForm()
    this.formUpdated.emit(response)
  }

  test(){
    console.log("fbFormUpdate",this.form.fbFormUpdate.value);
    console.log("stateFormUpdate programaService: ",this.form.stateFormUpdate);
    
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbFormUpdate.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  redirectToEstadosAcreditacion(){
    this.router.navigate(['/mantenedores/estadosAcreditacion']);
  }

  closeDialog(){
    this.resetDialog.emit();
  }

}
