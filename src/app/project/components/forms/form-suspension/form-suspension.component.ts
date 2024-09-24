import { Component, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { ActionUploadDoc } from 'src/app/project/models/shared/ActionUploadDoc';
import { DataInserted } from 'src/app/project/models/shared/DataInserted';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { Suspension } from 'src/app/project/models/Suspension';
import { MenuButtonsTableService } from 'src/app/project/services/components/menu-buttons-table.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { SuspensionesService } from 'src/app/project/services/suspensiones.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-form-suspension',
  templateUrl: './form-suspension.component.html',
  styles: [
  ]
})
export class FormSuspensionComponent implements OnInit, OnDestroy{

  constructor(private suspensionesService: SuspensionesService,  
    private fb: FormBuilder,
    private menuButtonsTableService: MenuButtonsTableService,
    private uploaderFilesService: UploaderFilesService
  ){}

  
  showAsterisk: boolean = false;
  namesCrud!: NamesCrud;
  suspension: Suspension = {};
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.suspensionesService.modeFormSuspension;
  }
  public fbForm: FormGroup = this.fb.group({
    Descripcion_TipoSuspension: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
    files: [[], this.filesValidator.bind(this)]
  })

  ngOnInit(): void {
    this.menuButtonsTableService.setContext('form-susp','dialog');

    this.namesCrud = {
      singular: 'tipo de suspensión',
      plural: 'tipo de suspensión',
      articulo_singular: 'el tipo de suspensión',
      articulo_plural: 'los tipos de suspensiones',
      genero: 'masculino'
    };

    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.suspensionesService.stateFormSuspension = status as StateValidatorForm }))
    this.subscription.add(this.uploaderFilesService.validatorFiles$.subscribe( event => { event && this.filesChanged(event)} ));
    this.subscription.add(
      this.suspensionesService.modeCrud$.subscribe( crud => {
        if (crud && crud.mode) {
          this.showAsterisk = true;
          switch (crud.mode) {
            case 'create': this.createForm(); break;
            case 'insert': this.insertFormSusp(crud.resolve!, crud.reject!); break;
          
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

  filesChanged(files: any){
    this.fbForm.patchValue({ files });
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  resetForm(){
    this.suspension = {};
    this.fbForm.reset({
      Descripcion_TipoSuspension: '',
      files : []
    });
    this.showAsterisk = false;
    // this.uploaderFilesService.setAction('reset');
    this.fbForm.controls['files'].updateValueAndValidity();
  }

  createForm(){
    // this.resetForm();
  }

  async insertFormSusp(resolve: Function, reject: Function){
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

}
