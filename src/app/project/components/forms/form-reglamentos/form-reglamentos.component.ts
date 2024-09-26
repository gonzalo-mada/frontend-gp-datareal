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
    private uploaderFilesService: UploaderFilesService
  ) {
    const currentYear = new Date().getFullYear();
    this.maxDate = new Date(currentYear, 11, 31);
  }
  
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
      this.reglamentosService.stateFormReglamento = status as StateValidatorForm;
    }));

    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe(event => {
      if (event) this.filesChanged(event);
    }));

    this.subscription.add(
      this.reglamentosService.modeCrud$.subscribe(crud => {
        if (crud && crud.mode) {
          this.showAsterisk = true;
          switch (crud.mode) {
            case 'create':
              this.createForm();
              break;
            case 'insert':
              this.insertFormReglamento(crud.resolve!, crud.reject!);
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

  // Reinicia el formulario
  resetForm(): void {
    this.fbForm.reset({
      Descripcion_regla: '',
      anio: '',
      vigencia: true,
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
  async insertFormReglamento(resolve: Function, reject: Function): Promise<void> {
    try {
      let params = {};
      
      const actionUploadDoc: ActionUploadDoc = await new Promise((res, rej) => {
        this.uploaderFilesService.setAction('upload', res, rej);
      });

      if (actionUploadDoc.success) {
        params = {
          ...this.fbForm.value,
          docsToUpload: actionUploadDoc.docsToUpload
        };
      }

      const inserted: DataInserted = await this.reglamentosService.insertReglamento(params);

      if (inserted.dataWasInserted) {
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted, 'creado', true, false);
        resolve({ success: true, dataInserted: inserted.dataInserted, messageGp });
        this.resetForm();
      }

    } catch (e) {
      reject(e);
      this.resetForm();
    }
  }

  changeState(): void {
    this.fbForm.controls['files'].updateValueAndValidity();
  }

}
