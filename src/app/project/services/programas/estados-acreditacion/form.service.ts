import { Injectable } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormEstadosAcreditacionService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    showAsterisk: boolean = false;
    yearsDifference: number | null = null;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Acreditado: [false],
            Nombre_ag_acredit: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]], //string
            Evaluacion_interna: [false], // si/no
            Fecha_informe: ['', [Validators.required]], //date
            tiempo: this.fb.group({
              Cod_tiempoacredit: [],
              Fecha_inicio: [{value:'', disabled: true}, [Validators.required]],
              Fecha_termino: [{value:'', disabled: true}, [Validators.required]],
              Cantidad_anios: [{disabled: true}, [GPValidator.notValueNegativeYearsAcredit(),GPValidator.notUpTo15YearsAcredit()]]
            }), //number , positivo
            files: [[], this.filesValidator.bind(this)],
            aux: []
          });
        return true;
    }

    filesValidator(control: AbstractControl): { [key: string]: boolean } | null {
        const formGroup = control.parent as FormGroup;
    
        if (!formGroup) return null
        
        const isAcreditado = formGroup.get('Acreditado')?.value === true;
        const files = formGroup.get('files')?.value || [];
    
        const isCreatingOrEditing = this.modeForm === 'create' || this.modeForm === 'edit';
    
        if (isAcreditado && isCreatingOrEditing && files.length === 0) {
            return { required: true };
        }
    
        return null;
      }

    resetForm(): void {
        this.fbForm.reset({
            Acreditado: false,
            Nombre_ag_acredit: '',
            Evaluacion_interna: false,
            Fecha_informe: '',
            tiempo: {
              Cod_tiempoacredit: '',
              Fecha_inicio: '',
              Fecha_termino: '',
              Cantidad_anios: ''
            },
            files: [],
            aux: ''
          });
          this.fbForm.get('aux')?.enable();
          this.fbForm.get('Acreditado')?.enable();
          this.fbForm.get('Nombre_ag_acredit')?.disable();
          this.fbForm.get('Evaluacion_interna')?.enable();
          this.fbForm.get('Fecha_informe')?.enable();
          this.fbForm.get('tiempo.Fecha_inicio')?.disable();
          this.fbForm.get('tiempo.Fecha_termino')?.disable();
          this.fbForm.get('tiempo.Cantidad_anios')?.disable();
          this.showAsterisk = false;
          this.yearsDifference = null;
          this.fbForm.controls['files'].updateValueAndValidity();
    }

    setForm(mode:'show' | 'edit', data: EstadosAcreditacion): void{
        this.fbForm.patchValue({
            ...data,
            Acreditado: data.Acreditado === 'SI' ? true : false,
            Evaluacion_interna: data.Evaluacion_interna === 'SI' ? true : false,
        });
        if (data.Fecha_informe === '01-01-1900') this.fbForm.get('Fecha_informe')?.reset();
        if (data.tiempo?.Fecha_inicio === '01-01-1900') this.fbForm.get('tiempo.Fecha_inicio')?.reset();
        if (data.tiempo?.Fecha_termino === '01-01-1900') this.fbForm.get('tiempo.Fecha_termino')?.reset();
        
        if (mode === 'show') {
            this.fbForm.disable();
            this.showAsterisk = false
            this.yearsDifference = data.tiempo?.Cantidad_anios!
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
            this.yearsDifference = data.tiempo?.Cantidad_anios === 0 ? null : data.tiempo?.Cantidad_anios!
            if (data.Acreditado === 'SI') {
                this.enableForm();
            }else{
                this.disableForm();
            }
        }
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ files });
        this.fbForm.controls['files'].updateValueAndValidity();
    }

    enableForm(){
        this.fbForm.get('Nombre_ag_acredit')?.enable();
        this.showAsterisk = true;
        this.fbForm.get('tiempo.Fecha_inicio')?.enable();
        this.fbForm.get('tiempo.Fecha_termino')?.enable();
    }
    
    disableForm(){
        this.fbForm.get('Nombre_ag_acredit')?.disable();
        this.yearsDifference = null;
        this.showAsterisk = false;
        this.fbForm.get('tiempo.Fecha_inicio')?.disable();
        this.fbForm.get('tiempo.Fecha_termino')?.disable();
    }


}