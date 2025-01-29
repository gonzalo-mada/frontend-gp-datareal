import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Campus } from 'src/app/project/models/programas/Campus';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';

@Injectable({
    providedIn: 'root'
})

export class FormCampusService {

    public fbForm!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    showAsterisk: boolean = true;
    
    constructor(private fb: FormBuilder){}

    async initForm(): Promise<boolean>{
        this.fbForm = this.fb.group({
            estadoCampus: [1, Validators.required],
            descripcionCampus: ['', [Validators.required , GPValidator.regexPattern('num_y_letras')]],
            files: [[], this.filesValidator.bind(this)],
            aux: ['']
        });
        return true;
    }

    resetForm(): void {
        this.fbForm.reset({
            estadoCampus: 1,
            descripcionCampus: '',
            files: [],
            aux: ''
        });
        this.fbForm.enable();
        this.fbForm.get('files')?.updateValueAndValidity();
        this.showAsterisk = true;
    }

    setForm(mode:'show' | 'edit' ,data: Campus): void{
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
    
        const state = formGroup.get('estadoCampus')?.value;
        const files = formGroup.get('files')?.value; 
        
        if ( this.modeForm === 'create' || this.modeForm === 'edit' ){
          if (files.length === 0 && state === 1 ) {
            return { required: true };
          }
        }
        return null;
        
    }
}