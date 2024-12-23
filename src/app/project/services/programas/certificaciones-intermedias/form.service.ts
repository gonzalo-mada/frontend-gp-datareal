import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CertificacionIntermedia } from 'src/app/project/models/programas/CertificacionIntermedia';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormCertifIntermediaService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;

    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            Descripcion_certif_inter: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
            files: [],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            Descripcion_certif_inter: '',
            files: [],
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('files')?.updateValueAndValidity();
    }

    setForm(mode:'show' | 'edit' ,data: CertificacionIntermedia): void{
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
}