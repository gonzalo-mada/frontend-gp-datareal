import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { ActionUploadDoc, EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ConfigModeService } from 'src/app/project/services/components/config-mode.service';
import { EstadosAcreditacionService } from 'src/app/project/services/programas/estados-acreditacion.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
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
              private fb: FormBuilder,
              private uploaderFilesService: UploaderFilesService,
  ){}
  // @Input() visibleUploader: boolean = false;
  
  yearsDifference: number | null = null;
  showAsterisk: boolean = false;
  estadoAcreditacion: EstadosAcreditacion = {};
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.estadosAcreditacionService.modeForm
  }

  public fbForm : FormGroup = this.fb.group({
    Acreditado: [false],
    Certificado: [false],
    Nombre_ag_acredit: [{value:'', disabled: true}, [Validators.required , GPValidator.regexPattern('num_y_letras')]], //string
    Nombre_ag_certif: [{value:'', disabled: true}, [Validators.required , GPValidator.regexPattern('num_y_letras')]], //string
    Evaluacion_interna: [false], // si/no
    Fecha_informe: ['', [Validators.required]], //date
    tiempo: this.fb.group({
      Cod_tiempoacredit: [],
      Fecha_inicio: [{value:'', disabled: true}, [Validators.required]],
      Fecha_termino: [{value:'', disabled: true}, [Validators.required]],
      Cantidad_anios: [{disabled: true}, [GPValidator.notValueNegativeYearsAcredit(),GPValidator.notUpTo15YearsAcredit()]]
    }), //number , positivo
    files: [[], this.filesValidator.bind(this)]
  })

  
  ngOnInit() {
    this.namesCrud = {
      singular: 'estado de acreditación',
      plural: 'estados de acreditación',
      articulo_singular: 'el estado de acreditación',
      articulo_plural: 'los estados de acreditación',
      genero: 'masculino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe( status => { this.estadosAcreditacionService.stateForm = status as StateValidatorForm}));
    this.subscription.add(
      this.estadosAcreditacionService.formUpdate$.subscribe( form => {
        if (form && form.mode){
          if (form.data) {
            this.estadoAcreditacion = {};
            this.estadoAcreditacion = form.data;
            console.log("data",this.estadoAcreditacion);
            
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
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( from => {
      if (from) {
        if (from.context.component.name === 'estado-acreditacion') {
          this.filesChanged(from.files)
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
    this.subscription.add(this.fbForm.get('tiempo.Fecha_inicio')?.valueChanges.subscribe(() => this.calculateYearsDifference()))
    this.subscription.add(this.fbForm.get('tiempo.Fecha_termino')?.valueChanges.subscribe(() => this.calculateYearsDifference()))
    this.subscription.add(this.fbForm.get('Acreditado')?.valueChanges.subscribe(status => {
      if (status === null) {
        this.uploaderFilesService.disabledButtonSeleccionar();
      }
    }))
    this.subscription.add(this.fbForm.get('Certificado')?.valueChanges.subscribe(status => {
      if (status === null) {
        this.uploaderFilesService.disabledButtonSeleccionar();
      }
    }))

    //NUEVO.
    
  }
  
  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setFiles(null);
    this.uploaderFilesService.enabledButtonSeleccionar();
  }

  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;

    if (!formGroup) {
        return null;
    }
    const isPostgrado = this.configModeService.config().isPostgrado;
    const isAcreditado = formGroup.get('Acreditado')?.value === 'SI';
    const isCertificado = formGroup.get('Certificado')?.value === 'SI';
    const acreditado = this.estadoAcreditacion.Acreditado === 'SI';
    const certificado = this.estadoAcreditacion.Certificado === 'SI';
    const files = formGroup.get('files')?.value || [];

    // console.log(isAcreditado,isCertificado,acreditado,certificado);
    

    // Determinar si el archivo es requerido basándonos en la modalidad y el tipo de switch
    const needsFiles = (isPostgrado && ( isAcreditado || acreditado )  ) || (!isPostgrado && ( isCertificado || certificado ) );
    const isCreatingOrEditing = this.modeForm === 'create' || this.modeForm === 'edit';


    // Validar si se requieren archivos
    if (needsFiles && isCreatingOrEditing && files.length === 0) {
        return { required: true };
    }

    return null;
  }

  createForm(resolve: Function, reject: Function){
    try {   
      this.uploaderFilesService.setContext('create','mantenedores','estado-acreditacion');
      this.resetForm();
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  async showForm(resolve: Function, reject: Function){
    try {
      this.uploaderFilesService.setContext('show','mantenedores','estado-acreditacion');
      this.fbForm.patchValue({...this.estadoAcreditacion});
      this.yearsDifference = this.estadoAcreditacion.tiempo?.Cantidad_anios!;
      this.fbForm.get('Acreditado')?.disable();
      this.fbForm.get('Certificado')?.disable();
      this.fbForm.get('Evaluacion_interna')?.disable();
      this.fbForm.get('Nombre_ag_acredit')?.disable();
      this.fbForm.get('Nombre_ag_certif')?.disable();
      this.showAsterisk = false;
      await this.loadDocsWithBinary(this.estadoAcreditacion);
      resolve(true)
    } catch (e) {      
      reject(e)
    }
  }

  async editForm(resolve: Function, reject: Function){
    try {
      this.uploaderFilesService.setContext('edit','mantenedores','estado-acreditacion');
      const isPostgrado = this.configModeService.config().isPostgrado

      const formValues =  this.estadoAcreditacion;
      
      if (formValues.tiempo?.Fecha_inicio === '01-01-1900' && formValues.tiempo?.Fecha_termino === '01-01-1900') {
        formValues.tiempo.Fecha_inicio = undefined;
        formValues.tiempo.Fecha_termino = undefined;
      }
      this.fbForm.patchValue(formValues);
      this.yearsDifference = this.estadoAcreditacion.tiempo?.Cantidad_anios == 0 ? null : this.estadoAcreditacion.tiempo?.Cantidad_anios!
      this.fbForm.get('Evaluacion_interna')?.enable()
      this.enableSwitch();

      if (isPostgrado) {
        switch (this.estadoAcreditacion.Acreditado) {
          case 'SI': this.enableForm('acred'); break;
          case 'NO': this.disableForm('acred'); break;
        }
      }else{
        switch (this.estadoAcreditacion.Certificado) {
          case 'SI': this.enableForm('certif'); break;
          case 'NO': this.disableForm('certif'); break;
        }
      }            
      await this.loadDocsWithBinary(this.estadoAcreditacion);
      resolve(true)
    } catch (e) {
      reject(e)
    }
  }

  enableSwitch(){
    this.fbForm.get('Acreditado')?.disabled ? this.fbForm.get('Acreditado')?.enable() : this.fbForm.get('Acreditado')?.enable();
    this.fbForm.get('Certificado')?.disabled ? this.fbForm.get('Certificado')?.enable() : this.fbForm.get('Certificado')?.enable();
  }

  enableForm(typeForm : 'acred' | 'certif'){
    
    if (typeForm === 'acred') {
      this.fbForm.get('Nombre_ag_acredit')?.enable();
    } else {
      //certif
      this.fbForm.get('Nombre_ag_certif')?.enable();
    }
    this.showAsterisk = true;
    this.fbForm.get('tiempo.Fecha_inicio')?.enable();
    this.fbForm.get('tiempo.Fecha_termino')?.enable();
    this.uploaderFilesService.enabledButtonSeleccionar();
  }

  disableForm(typeForm : 'acred' | 'certif'){
    if (typeForm === 'acred') {
      this.fbForm.get('Nombre_ag_acredit')?.disable();
    } else {
      //certif
      this.fbForm.get('Nombre_ag_certif')?.disable();
    }
    this.yearsDifference = null;
    this.showAsterisk = false;
    this.fbForm.get('tiempo.Fecha_inicio')?.disable();
    this.fbForm.get('tiempo.Fecha_termino')?.disable();
    this.uploaderFilesService.disabledButtonSeleccionar();
  }

  async insertForm(resolve: Function, reject: Function){
    try {
      let params = {};

      const { Acreditado, Certificado } = this.fbForm.value
      if ( (Acreditado == null || Acreditado == false) && (Certificado == null || Certificado == false )) {
        //no requiero docs
        const { files, tiempo: { Cantidad_anios }, ...formData } = this.fbForm.value ;
        params = {...formData};
      }else{
        // si requiero docs
        
        const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
          this.uploaderFilesService.setAction('upload',resolve,reject);
        });

        if (actionUploadDoc.success) {
          const { files, ...formData } = this.fbForm.value ; 
          params = {
            ...formData,
            docsToUpload: actionUploadDoc.docsToUpload
          }
        }
      }
      console.log("params",params);
      
      const inserted = await this.estadosAcreditacionService.insertEstadoAcreditacion(params)
      
      if ( inserted.dataWasInserted ) {
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted , 'creado', true,false)
        resolve({success:true , dataInserted: inserted.dataInserted , messageGp})
        this.resetForm()
      }
    } catch (e) {
      const messageGp = generateMessage(this.namesCrud, null, 'creado', false,false)
      reject({e , messageGp})
      this.resetForm()
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {};
      const { switchAcreditado, switchCertificado } = this.fbForm.value

      if (switchAcreditado == 'NO' && switchCertificado == 'NO') {
        //no requiero docs
        const { files, ...formData } = this.fbForm.value ;
        params = {
          ...formData,
          Cod_acreditacion: this.estadoAcreditacion.Cod_acreditacion,
          Cod_tiempoacredit: this.estadoAcreditacion.tiempo?.Cod_tiempoacredit
        };
      }else{

        const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
          this.uploaderFilesService.setAction('upload',resolve,reject);
        });

        if (actionUploadDoc.success) {
          const { files, ...formData } = this.fbForm.value ; 
          params = {
            ...formData,
            docsToUpload: actionUploadDoc.docsToUpload,
            docsToDelete: actionUploadDoc.docsToDelete,
            Cod_acreditacion: this.estadoAcreditacion.Cod_acreditacion,
            Cod_tiempoacredit: this.estadoAcreditacion.tiempo?.Cod_tiempoacredit
          }
        }
      }


      const updated = await this.estadosAcreditacionService.updateEstadoAcreditacion(params)
      if ( updated.dataWasUpdated ) {
        const messageGp = generateMessage(this.namesCrud, null , 'actualizado', true,false)
        resolve({success:true , dataWasUpdated: updated.dataWasUpdated, messageGp})
        this.resetForm()
      }
    } catch (e) {
      const messageGp = generateMessage(this.namesCrud, null, 'actualizado', false,false)
      reject({e, messageGp})
      this.resetForm();
    }
  }

  resetForm(){
    this.fbForm.reset();
    this.yearsDifference = null
    this.fbForm.get('Acreditado')?.enable();
    this.fbForm.get('Certificado')?.enable();
    this.fbForm.get('Nombre_ag_acredit')?.disable();
    this.fbForm.get('Nombre_ag_certif')?.disable();
    this.fbForm.get('Evaluacion_interna')?.enable();
    this.fbForm.get('Fecha_informe')?.enable();
    this.fbForm.get('tiempo.Fecha_inicio')?.disable();
    this.fbForm.get('tiempo.Fecha_termino')?.disable();
    this.showAsterisk = false;
    this.fbForm.reset({
      files: []
    });
    this.uploaderFilesService.setAction('reset');
    this.uploaderFilesService.resetValidatorFiles();
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  changeSwitch(nameSwitch:string , event: any){
    const inputAcred = this.fbForm.get('Nombre_ag_acredit');
    const fechaInicio = this.fbForm.get('tiempo.Fecha_inicio');
    const fechaFin = this.fbForm.get('tiempo.Fecha_termino');
    const inputCantidadAnios = this.fbForm.get('tiempo.Cantidad_anios');
    const inputCertif = this.fbForm.get('Nombre_ag_certif');

    if (nameSwitch === 'acred') {
      switch (event.checked) {
        case 'SI':
          inputAcred?.value == 'N/A' ? inputAcred?.reset() :  inputAcred?.value
          inputAcred?.enable();
          fechaInicio?.enable();
          fechaFin?.enable();
          inputCantidadAnios?.enable();
          this.showAsterisk = true;
          this.uploaderFilesService.enabledButtonSeleccionar();
        break;
        case 'NO':
          inputAcred?.value == 'N/A' ? inputAcred?.reset() :  inputAcred?.value
          inputAcred?.disable();
          fechaInicio?.disable();
          fechaFin?.disable();
          inputCantidadAnios?.disable();
          this.yearsDifference = null;
          this.showAsterisk = false;
          this.uploaderFilesService.disabledButtonSeleccionar();
        break
      }
    }else if (nameSwitch === 'certif'){
      //switch -> certif
      switch (event.checked) {
        case 'SI':
          inputCertif?.enable();
          fechaInicio?.enable();
          fechaFin?.enable();
          inputCantidadAnios?.enable();
          this.showAsterisk = true;
          this.uploaderFilesService.enabledButtonSeleccionar();
        break;
      
        case 'NO':
          inputCertif?.disable();
          fechaInicio?.disable();
          fechaFin?.disable();
          inputCantidadAnios?.disable();
          this.yearsDifference = null;
          this.showAsterisk = false;
          this.uploaderFilesService.disabledButtonSeleccionar();
        break;
        
      }
    }else{
      inputAcred?.disable();
      fechaInicio?.disable();
      fechaFin?.disable();
      inputCertif?.disable();
      inputCantidadAnios?.disable();
      inputAcred?.reset();
      inputCertif?.reset();
      fechaInicio?.reset();
      fechaFin?.reset();
      this.yearsDifference = null;
      this.showAsterisk = false;
      this.uploaderFilesService.disabledButtonSeleccionar();
    }
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  calculateYearsDifference(): void {
    const startDate = this.fbForm.get('tiempo.Fecha_inicio')?.value;
    const endDate = this.fbForm.get('tiempo.Fecha_termino')?.value;

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

      this.yearsDifference = years;      
      this.fbForm.patchValue({ tiempo: {Cantidad_anios: this.yearsDifference}});
      this.fbForm.get('tiempo.Cantidad_anios')?.updateValueAndValidity();
      
      
    } else {
      this.yearsDifference = null;
      this.fbForm.get('tiempo.Cantidad_anios')?.reset();
      this.fbForm.get('tiempo.Cantidad_anios')?.updateValueAndValidity();
    }
  }

  async loadDocsWithBinary(estadoAcreditacion: EstadosAcreditacion){
    try {
      this.uploaderFilesService.setLoading(true,true);
      const files = await this.estadosAcreditacionService.getDocumentosWithBinary({Cod_acreditacion: estadoAcreditacion.Cod_acreditacion});
      this.uploaderFilesService.setFiles(files);
      this.filesChanged(files);
      return files;
    } catch (e: any) {
        this.errorTemplateHandler.processError(e, {
          notifyMethod: 'alert',
          summary: 'Error al obtener documentos',
          message: e.detail.error.message.message
        }
      );
    }finally{
      this.uploaderFilesService.setLoading(false); 
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

  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  test(){
    Object.keys(this.fbForm.controls).forEach(key => {
      const control = this.fbForm.get(key);
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
