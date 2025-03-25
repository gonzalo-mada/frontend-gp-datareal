import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormUnidadesAcadService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    showAsterisk: boolean = true;
    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Descripcion_ua: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
            Facultad: this.fb.group({
              Cod_facultad: ['', Validators.required],
              Descripcion_facu: [''],
            }),
            files: [[], this.filesValidator.bind(this)],
            aux: ['']
        });
        return true;
    }

    resetForm(){
        this.fbForm.reset({
            Descripcion_ua: '',
            Facultad: {
                Cod_facultad: '',
                Descripcion_facu: ''
            },
            files: [],
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('files')?.updateValueAndValidity();
        this.showAsterisk = true;
    }

    setForm(mode:'show' | 'edit', data: UnidadAcademica){
        this.fbForm.patchValue({...data});
        if (mode === 'show') {
            this.fbForm.disable();
        }
        if (mode === 'edit') {
            this.fbForm.patchValue({aux: data});
        }
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ files });
        this.fbForm.controls['files'].updateValueAndValidity();
    }

    changeState(event: any){
        event.checked ? this.showAsterisk = true : this.showAsterisk = false
        this.fbForm.controls['files'].updateValueAndValidity();
    }

    filesValidator(control: any): { [key: string]: boolean } | null {   
        const formGroup = control.parent as FormGroup;
    
        if (!formGroup) return null
    
        const files = formGroup.get('files')?.value; 
        
        if ( this.modeForm === 'create' || this.modeForm === 'edit' ){
          if (files.length === 0 ) {
            return { required: true };
          }
        }
        return null;
        
    }
}