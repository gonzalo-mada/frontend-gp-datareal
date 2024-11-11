import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { ProgramasService } from 'src/app/project/services/programas/programas.service';
import { SuspensionesService } from 'src/app/project/services/programas/suspensiones.service';
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
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,
    private fb: FormBuilder,
    private messageService: MessageService,
    private router: Router,
    public programasService: ProgramasService,
    public suspensionesService: SuspensionesService,
    private uploaderFilesService: UploaderFilesService
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
  namesCrud: NamesCrud =  {
    singular: 'programa',
    plural: 'programas',
    articulo_singular: 'el programa',
    articulo_plural: 'los programas',
    genero: 'masculino'
  };
  reglamentos: Reglamento[] = [];
  directores: any[] = [];
  directoresAlternos: any[] = [];
  estadosMaestros: any[] = [];
  suspensiones: any[] = [];
  estadosAcreditacion: any[] = [];
  showSuspension: boolean = false;
  newTipoSuspensionDialog: boolean = false;
  modeDialog!: ModeDialog;
  dialog: boolean = false;
  showButtonSubmit: boolean = false;
  private subscription: Subscription = new Subscription();

  async ngOnInit(){
    this.fbForm = this.fb.group({});

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
    
    this.fbForm.statusChanges.subscribe(status => {
      this.programasService.stateFormUpdate = status as StateValidatorForm
    });

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
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
  }

  setForm(modeDialog: ModeDialog){
    this.modeDialog = modeDialog;
    switch (modeDialog) {
      case 'nombre': this.createFormNombre(); break;
      case 'grupo_correo': this.createFormGrupoCorreo(); break;
      case 'créditos totales': this.createFormCreditosTotales(); break;
      case 'horas totales': this.createFormHorasTotales(); break;
      case 'título': this.createFormTitulo(); break;
      case 'grado académico': this.createFormGradoAcademico(); break;
      case 'REXE': this.createFormREXE(); break;
      // case 'documentos maestros': this.createFormDocsMaestro(); break;
      case 'reglamento': this.createFormReglamento(); break;
      case 'director': this.createFormDirector(); break;
      case 'director alterno': this.createFormDirectorAlterno(); break;
      case 'estado maestro': this.createFormEstadoMaestro(); break;
      case 'estado acreditación': this.createFormEstadoAcreditacion(); break;
      default: break;
    }
    this.fbForm.statusChanges.subscribe(status => {
      this.programasService.stateFormUpdate = status as StateValidatorForm
    });

  }

  async getData(){
    try {
      await Promise.all([this.getEstadosMaestros(),this.getSuspensiones()]);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener los registros. Intente nuevamente.',
      });
    }
  }

  async getEstadosMaestros(){
    try {
      this.estadosMaestros = await this.programasService.getEstadosMaestros(false);
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener estados maestros. Intente nuevamente.',
      });
    }
  }

  async getSuspensiones(){
    try {
      this.suspensiones = await this.programasService.getSuspensiones(false);
      this.suspensiones.push({ID_TipoSuspension: -1, Descripcion_TipoSuspension: 'Añadir nuevo tipo de suspensión'})
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al obtener tipos de suspensiones. Intente nuevamente.',
      });
    }
  }

  async createFormNombre(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Nombre programa');
      this.fbForm = this.fb.group({
        Nombre_programa: [this.programa.Nombre_programa, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        files: [[]]
      })

      this.dialog = true;
      
      await this.loadDocsWithBinary('nombre_programa');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de nombre de programa. Intente nuevamente.',
      });
    }
  }

  async createFormGrupoCorreo(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Grupo correo');
      this.fbForm = this.fb.group({
        Grupo_correo: [this.programa.Grupo_correo, [Validators.required, GPValidator.checkCorreoUV()]],
        files: [[]]
      })

      this.dialog = true;
      
      await this.loadDocsWithBinary('grupo_correo');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();
      
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Programa. Intente nuevamente.',
      });
    }
  }

  async createFormCreditosTotales(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Créditos totales');
      this.fbForm = this.fb.group({
        Creditos_totales: [this.programa.Creditos_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
        files: [[]]
      })

      this.dialog = true;
      
      await this.loadDocsWithBinary('creditos_totales');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();
      
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de créditos totales de programa. Intente nuevamente.',
      });
    }
  }

  async createFormHorasTotales(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Horas totales');
      this.fbForm = this.fb.group({
        Horas_totales: [this.programa.Horas_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
        files: [[]]
      })

      this.dialog = true;
      
      await this.loadDocsWithBinary('horas_totales');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();
      
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de horas totales de programa. Intente nuevamente.',
      });
    }
  }

  async createFormTitulo(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Título');
      this.fbForm = this.fb.group({
        Titulo: [this.programa.Titulo, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        files: [[]]
      })

      this.dialog = true;

      await this.loadDocsWithBinary('titulo');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;

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
        files: [[]]
      })

      this.dialog = true;

      await this.loadDocsWithBinary('grado_academico');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;

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
        REXE: [this.programa.REXE, [Validators.required, GPValidator.regexPattern('num_o_letras')]],
        files: [[]]
      })
      
      this.dialog = true;

      await this.loadDocsWithBinary('REXE');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;

    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de REXE. Intente nuevamente.',
      });
    }
  }

  async createFormDocsMaestro(){
    try {
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Maestro');
      this.fbForm = this.fb.group({
        REXE: [this.programa.REXE, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
        files: [[], this.filesValidator.bind(this)]
      })
      
      this.dialog = true;
      await this.loadDocsWithBinary('maestro');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Documentos maestros. Intente nuevamente.',
      });
    }
  }

  async createFormReglamento(){
    try {
      this.fbForm = this.fb.group({
        Cod_Reglamento: [this.programa.Cod_Reglamento, [Validators.required]],
        nombreReglamento: [this.programa.Descripcion_Reglamento],
      });

      this.reglamentos = await this.programasService.getReglamentos(false);
      this.reglamentos.map( reglamento => {
        if (reglamento.Cod_reglamento === this.programa.Cod_Reglamento) {
          reglamento.isSelected = true;
          this.programasService.stateFormUpdate = 'VALID';
        }else{
          reglamento.isSelected = false;
        }
      })

      this.programasService.fbForm.get('Cod_Reglamento')!.valueChanges.subscribe( value => {
        this.fbForm.get('Cod_Reglamento')?.patchValue(value);
        this.fbForm.get('nombreReglamento')?.patchValue(this.programasService.reglamentoSelected);
      })
      this.dialog = true;
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
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Director');
      this.fbForm = this.fb.group({
        Director: [this.programa.Director, [Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate(this.programa.Director!, this.programa.Director_alterno!)]],
        Director_selected: [this.programa.Director, [Validators.required]],
        nombreDirector: [this.programa.nombre_Director],
        files: [[], this.filesValidator.bind(this)]
      })

      this.fbForm.get('Director_selected')?.value !== '' ? this.selectedDirector = true : this.selectedDirector = false
      this.checkDirectorSelected('director');

      const rut_director = this.programa.Director!.split('-');
      this.directores = await this.programasService.getDirector({rut: parseInt(rut_director[0])},false);
      this.directores.map( director => {
        if (director.rutcompleto === this.programa.Director) {
          director.isSelected = true;
          this.programasService.stateFormUpdate = 'VALID';
        }else{
          director.isSelected = false;
        }
      })

      this.programasService.fbForm.get('Director_selected')!.valueChanges.subscribe( value => {
        value === '' ? this.selectedDirector = false : this.selectedDirector = true
        this.fbForm.get('Director_selected')?.patchValue(value);
        this.fbForm.get('nombreDirector')?.patchValue(this.programasService.directorSelected.nombre);
        this.checkDirectorSelected('director');
      })

      this.dialog = true;

      await this.loadDocsWithBinary('director');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;

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
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Director alterno');
      this.fbForm = this.fb.group({
        Director_alterno: [this.programa.Director_alterno, [Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate(this.programa.Director!, this.programa.Director_alterno!)]],
        DirectorAlterno_selected: [this.programa.Director_alterno, [Validators.required]],
        nombreDirector_alterno: [this.programa.nombre_DirectorAlterno],
        files: [[]]
      })

      this.fbForm.get('DirectorAlterno_selected')?.value !== '' ? this.selectedDirectorAlterno = true : this.selectedDirectorAlterno = false
      this.checkDirectorSelected('alterno');

      const rut_director = this.programa.Director_alterno!.split('-');
      this.directoresAlternos = await this.programasService.getDirector({rut: parseInt(rut_director[0])},false);
      this.directoresAlternos.map( director => {
        if (director.rutcompleto === this.programa.Director_alterno) {
          director.isSelected = true;
          this.programasService.stateFormUpdate = 'VALID';
        }else{
          director.isSelected = false;
        }
      })

      this.programasService.fbForm.get('DirectorAlterno_selected')!.valueChanges.subscribe( value => {
        if (value === '' || value === null) {
          this.selectedDirectorAlterno = false
        }else{
          this.selectedDirectorAlterno = true
        }
        this.fbForm.get('DirectorAlterno_selected')?.patchValue(value);
        this.fbForm.get('nombreDirector_alterno')?.patchValue(this.programasService.directorAlternoSelected.nombre);
        this.checkDirectorSelected('alterno');
      })
      this.dialog = true;

      await this.loadDocsWithBinary('directorAlterno');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;

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
        this.selectedDirector ? this.fbForm.get('Director')?.disable() : this.fbForm.get('Director')?.enable()
      break;
      case 'alterno':
        console.log("this.selectedDirectorAlterno",this.selectedDirectorAlterno);
        
        this.selectedDirectorAlterno ? this.fbForm.get('Director_alterno')?.disable() : this.fbForm.get('Director_alterno')?.enable()
      break;
      default:
        break;
    }
  }

  async searchDirector(tipo: string){
    try {
      
      if (tipo === 'director') {
        const inputRutDirector = this.fbForm.get('Director')!.value
        const rut_director = inputRutDirector.split('-')
        let result: any[] = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
        if (result.length === 0 ) {
          //no se encontraron directores
          this.messageService.add({
            key: this.programasService.keyPopups,
            severity: 'warn',
            detail: `No se encontraron directores(as) con el RUT: ${inputRutDirector}.`
          });
        }else{
          this.directores = result;
        }
        
        
      }else{
        //tipo directoralterno
        const inputRutDirectorAlt = this.fbForm.get('Director_alterno')!.value
        const rut_director = inputRutDirectorAlt.split('-')
        let resultAlt: any[] = await this.programasService.getDirector({rut: parseInt(rut_director[0])});
        
        if (resultAlt.length === 0 ) {
          //no se encontraron directores
          this.messageService.add({
            key: this.programasService.keyPopups,
            severity: 'warn',
            detail: `No se encontraron directores(as) con el RUT: ${inputRutDirectorAlt}.`
          });
        }else{
          this.directoresAlternos = resultAlt;
        }
      }
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al buscar director(a). Intente nuevamente.',
      });
      
    }
    
  }

  async createFormEstadoMaestro(){
    try {
      this.showSuspension = false
      this.uploaderFilesService.setContext('edit','programa','editar-programa','Estado maestro');
      this.fbForm = this.fb.group({
        EstadoMaestro: [this.programa.Cod_EstadoMaestro, [Validators.required]],
        TipoSuspension: [''],
        files: [[]]
      })

      if (this.programa.Cod_EstadoMaestro === 2 ) {
        let suspensionSelected = this.suspensiones.filter( r => r.ID_TipoSuspension === this.programa.ID_TipoSuspension)
        this.fbForm.get('TipoSuspension')?.patchValue(suspensionSelected[0]);
        this.fbForm.get('TipoSuspension')?.setValidators([Validators.required, GPValidator.notMinusOneCategory()]);
        this.fbForm.get('TipoSuspension')?.updateValueAndValidity();
        this.showSuspension = true;
      }

      this.dialog = true;

      await this.loadDocsWithBinary('estado_maestro');
      this.fbForm.get('files')?.setValidators([this.filesValidator.bind(this)]);
      this.fbForm.get('files')?.updateValueAndValidity();

      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Estado maestro. Intente nuevamente.',
      });
    }
  }

  async createFormEstadoAcreditacion(){
    try {
      this.fbForm = this.fb.group({
        Cod_acreditacion: [this.programa.Cod_acreditacion, [Validators.required]],
        nombreEstadoAcreditacion: [this.programa.Descripcion_acreditacion],
      })

      this.estadosAcreditacion = await this.programasService.getEstadosAcreditacion(false);
      this.estadosAcreditacion.map( eA => {
        if (eA.Cod_acreditacion === this.programa.Cod_acreditacion) {
          eA.isSelected = true; 
          this.programasService.stateFormUpdate = 'VALID';
        }else{
          eA.isSelected = false; 
        }
      })


      this.programasService.fbForm.get('Cod_acreditacion')!.valueChanges.subscribe( value => {
        this.fbForm.get('Cod_acreditacion')?.patchValue(value);
        this.fbForm.get('nombreEstadoAcreditacion')?.patchValue(this.programasService.estadoAcreditacionSiglaSelected);
      })

      this.dialog = true;
      this.showButtonSubmit = true;
    } catch (error) {
      this.errorTemplateHandler.processError(error, {
        notifyMethod: 'alert',
        message: 'Hubo un error al crear el formulario de Estado acreditación. Intente nuevamente.',
      });
    }
  }

  onEstadoMaestroChange(event: any){
    const tipoSuspensionControl = this.fbForm.get('TipoSuspension');
    const filesControl = this.fbForm.get('files');
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

  onSuspensionChange(event: any){    
    if (event.value.ID_TipoSuspension === -1) {
      this.newTipoSuspensionDialog = true;
    }
  }

  async submitNewSuspension(){
    try {
      const actionForm: any = await new Promise((resolve: Function, reject: Function) => {
        this.suspensionesService.setModeForm('insert',null,resolve, reject);
      })
      
      if (actionForm.success) {
        await this.getSuspensiones();
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'success',
          detail: actionForm.messageGp
        });
        this.fbForm.get('TipoSuspension')?.patchValue(this.suspensiones[this.suspensiones.length - 2]);
      }else{
        this.getSuspensiones();
        this.errorTemplateHandler.processError(
          actionForm, {
            notifyMethod: 'alert',
            summary: actionForm.messageGp,
            message: actionForm.e.detail.error.message,
        });
      }
      this.newTipoSuspensionDialog = false;
    } catch (e: any) {
      
      this.newTipoSuspensionDialog = false;
      this.errorTemplateHandler.processError(e, {
        notifyMethod: 'alert',
        message: e.detail.error.message
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

  async loadDocsWithBinary(from: 'titulo' | 'REXE' | 'grado_academico' | 'estado_maestro' | 'director' | 'directorAlterno' | 'maestro' | 'nombre_programa' | 'grupo_correo' | 'creditos_totales' | 'horas_totales'){
    try {
      this.uploaderFilesService.setLoading(true,true);
      const files = await this.programasService.getDocumentosWithBinary(this.programa.Cod_Programa!,from,false);
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


  async submit(){
    try {
      let params = {};
      let updated;

      if (this.modeDialog !== 'reglamento' && this.modeDialog !== 'estado acreditación') {
        // requiere docs
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
        updated = await this.programasService.updatePrograma(params)
      }else{
        const { files, ...formData } = this.fbForm.value;
        params = {
          ...formData,
          modeUpdate: this.modeDialog,
          auxForm: this.programa
        }
        updated = await this.programasService.updatePrograma(params)
      }
      
      if ( updated.dataWasUpdated ) {
        const messageGp = generateMessage(this.namesCrud, updated.dataUpdated , 'actualizado', true,false)
        this.messageService.add({
          key: this.programasService.keyPopups,
          severity: 'success',
          detail: messageGp
        });
        this.formUpdated.emit(this.modeDialog)
        //todo: el resetForm.
        // this.resetForm()
      }
      

    } catch (e: any) {
      this.errorTemplateHandler.processError(
        e, {
          notifyMethod: 'alert',
          summary: `Error al actualizar`,
          message: e.detail.error.message.message
        });
    }finally{
      this.dialog = false
    }
  }

  test(){
    console.log("fbForm",this.fbForm.value);
    console.log("stateFormUpdate programaService: ",this.programasService.stateFormUpdate);
    
    Object.keys(this.fbForm.controls).forEach(key => {
      const control = this.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
  }

  redirectToReglamento(){
    this.router.navigate(['/mantenedores/reglamentos']);
  }

  redirectToEstadosAcreditacion(){
    this.router.navigate(['/mantenedores/estadosAcreditacion']);
  }




  closeDialog(){
    this.resetDialog.emit();
  }


}
