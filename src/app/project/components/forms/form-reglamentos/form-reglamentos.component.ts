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

@Component({
  selector: 'app-form-reglamentos',
  templateUrl: './form-reglamentos.component.html',
  styles: []
})
export class FormReglamentosComponent implements OnInit, OnDestroy {
  constructor(
    private reglamentosService: ReglamentosService,
    private fb: FormBuilder,
    private menuButtonsTableService: MenuButtonsTableService,
    private uploaderFilesService: UploaderFilesService,
    private commonUtils: CommonUtils,
    private errorTemplateHandler: ErrorTemplateHandler,

  ) {
    const currentYear = new Date().getFullYear();
    this.maxDate = new Date(currentYear, 11, 31);
  }
  
  reglamento: Reglamento = {};
  maxDate: Date;
  mode: string = '';
  showAsterisk: boolean = false;
  namesCrud!: NamesCrud;
  private subscription: Subscription = new Subscription();

  // Definición del formulario reactivo
  public fbForm: FormGroup = this.fb.group({
    Descripcion_regla: ['', [Validators.required, Validators.pattern(/^(?!\s*$).+/)]],
    anio: ['', Validators.required],
    vigencia: [true, Validators.required],
    files: [[], this.filesValidator.bind(this)]  // Validación personalizada de archivos
  });

  get modeForm() {
    return this.reglamentosService.modeForm;
  }

  ngOnInit(): void {
    // Configuración del contexto del menú
    this.menuButtonsTableService.setContext('reglamento', 'dialog');

    // Definir nombres CRUD
    this.namesCrud = {
      singular: 'reglamento',
      plural: 'reglamentos',
      articulo_singular: 'el reglamento',
      articulo_plural: 'los reglamentos',
      genero: 'masculino'
    };

    // Subscripciones
    this.subscription.add(this.fbForm.statusChanges.subscribe(status => {
      this.reglamentosService.stateForm = status as StateValidatorForm;
    }));

    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe(event => {
      if (event) this.filesChanged(event);
    }));
    this.subscription.add(this.uploaderFilesService.downloadDoc$.subscribe(file => {file && this.downloadDoc(file)}));
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( event => { event && this.filesChanged(event)} ));

    this.subscription.add(
      this.reglamentosService.modeCrud$.subscribe(crud => {
        if (crud && crud.mode) {
          this.showAsterisk = true;
          switch (crud.mode) {
            case 'create':
              console.log(crud.mode);
              this.createForm();
              break;
            case 'insert':
              console.log(crud.mode);
              this.insertForm(crud.resolve!, crud.reject!);
              break;
            case 'update':
            this.updateForm(crud.resolve!, crud.reject!);
            break;

              default:
              break;
          }
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.uploaderFilesService.updateValidatorFiles(null);
    this.uploaderFilesService.setFiles(null);
  }

  // Validador de archivos personalizado
  filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const formGroup = control.parent as FormGroup;
    if (!formGroup) return null;

    const files = formGroup.get('files')?.value;

    if (this.modeForm === 'create' || this.modeForm === 'edit') {
      if (files.length === 0) {
        return { required: true };
      }
    }
    return null;
  }

  // Manejo del cambio de archivos
  filesChanged(files: any): void {
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
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

  // Reinicia el formulario
  resetForm(): void {
    this.fbForm.reset({
      Descripcion_regla: '',
      anio: '',
      vigencia: false,
      files: []
    });
    this.showAsterisk = false;
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  // Crear formulario (nueva entrada)
  createForm(): void {
    this.resetForm();
  }

  // Insertar reglamento
  async insertForm(resolve: Function, reject: Function): Promise<void> {
    try {
      let params = {};
  
      // Siempre requerimos documentos
      const actionUploadDoc: ActionUploadDoc = await new Promise((res, rej) => {
        this.uploaderFilesService.setAction('upload', res, rej);
      });
  
      if (actionUploadDoc.success) {
        // Preparar los parámetros excluyendo "files" y agregando los documentos
        const { files, ...formData } = this.fbForm.value;
        params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload
        };
        console.log(params,  actionUploadDoc.docsToUpload);
        
      }
      console.log(params);

      // Insertar los reglamentos utilizando el servicio
      const inserted: DataInserted = await this.reglamentosService.insertReglamento(params);
  
      if (inserted.dataWasInserted) {
        // Generar mensaje de éxito y resolver la promesa
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted, 'creado', true, false);
        resolve({ success: true, dataInserted: inserted.dataInserted, messageGp });
        this.resetForm();  // Resetear el formulario tras el éxito
      }
  
    } catch (e) {
      // Rechazar la promesa en caso de error
      reject(e);
      this.resetForm();
    }
  }

  async updateForm(resolve: Function, reject: Function) {
  try {
    let params = {};

    // Verificar si hay documentos para subir o eliminar
    const hasDocumentsToUpload = this.fbForm.value.docsToUpload?.length > 0;
    const hasDocumentsToDelete = this.fbForm.value.docsToDelete?.length > 0;

    if (!hasDocumentsToUpload && !hasDocumentsToDelete) {
      // Si no hay documentos que manejar, excluimos el campo "files"
      const { files, ...formData } = this.fbForm.value;
      params = {
        ...formData,
        Cod_reglamento: this.reglamento.Cod_reglamento, // Código del reglamento actual
      };
    } else {
      // Si hay documentos que subir o eliminar, manejamos la lógica de archivos
      const actionUploadDoc: ActionUploadDoc = await new Promise((resolve, reject) => {
        this.uploaderFilesService.setAction('upload', resolve, reject);
      });

      if (actionUploadDoc.success) {
        // Excluimos el campo "files" y agregamos los documentos a subir/eliminar
        const { files, ...formData } = this.fbForm.value;
        params = {
          ...formData,
          docsToUpload: actionUploadDoc.docsToUpload,
          docsToDelete: actionUploadDoc.docsToDelete,
          Cod_reglamento: this.reglamento.Cod_reglamento, // Código del reglamento
        }
      }
      // } else {
      //   // Si hubo un error en la subida de documentos
      //   const messageGp = generateMessage(this.namesCrud, null, 'actualizado', false, false);
      //   reject({ e: actionUploadDoc.error, messageGp });
      //   this.resetForm(); // Reseteamos el formulario en caso de error
      //   return;
      // }
    }

    // Llamada al servicio para actualizar el reglamento con los parámetros preparados
    const updated = await this.reglamentosService.updateReglamento(params);

    if (updated.dataWasUpdated) {
      // Si la actualización fue exitosa
      const messageGp = generateMessage(this.namesCrud, updated.dataUpdated, 'actualizado', true, false);
      resolve({ success: true, dataWasUpdated: updated.dataWasUpdated, messageGp });
      this.resetForm(); // Resetea el formulario tras la actualización exitosa
    } else {
      // Si no se pudo actualizar
      const messageGp = generateMessage(this.namesCrud, null, 'actualizado', false, false);
      reject({ e: updated.error, messageGp });
      this.resetForm(); // Resetea el formulario en caso de fallo
    }
  } catch (e: any) {
    // Manejo de errores generales
    const messageGp = generateMessage(this.namesCrud, null, 'actualizado', false, false);
    reject({ e, messageGp });
    this.resetForm(); // Resetea el formulario en caso de error
  }
}


  changeState(): void {
    this.fbForm.controls['files'].updateValueAndValidity();
  }

}
