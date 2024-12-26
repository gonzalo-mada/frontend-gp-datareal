import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { MessageServiceGP } from '../../components/message-service.service';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';

@Injectable({
    providedIn: 'root'
})

export class FormPlanDeEstudioService {
    public fbForm!: FormGroup;
    public fbFormUpdate!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    stateFormUpdate: StateValidatorForm = undefined;
    activeIndexStepper: number | undefined = 0 ;
    activeIndexStateForm: number | undefined = 0;

    //VALUES SELECTED
    cod_programa_selected: number = 0;
    estadoPlanEstudioSelected: string = '';
    modalidadSelected: string = '';
    reglamentoSelected: string = '';

    showMessageCI: boolean = false;
    showMessageArticulacion: boolean = false;
    showMessagePlanComun: boolean = false;


    constructor(
        private fb: FormBuilder,
        private messageService: MessageServiceGP
    ){}

    initForm(): Promise<boolean>{
        return new Promise((success) => {
            this.fbForm = this.fb.group({
                //paso 1
                Cod_Facultad_Selected: ['', [Validators.required]],
                Cod_Programa: ['', [Validators.required]],
                Cod_Regimen: ['', [Validators.required]],
                Plan_Comun_Switch: [false],
                Menciones_Switch: [false],
                Menciones: ['', [Validators.required]],
                Cod_Jornada: ['', [Validators.required]],
                Cod_Modalidad: ['', [Validators.required]],
                Cod_Estado: ['', [Validators.required]],
                Cod_RangosAprobacion: ['', [Validators.required]],
                Cod_Reglamento: ['', [Validators.required]],

                //paso 2
                Cupo_Minimo: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
                REXE: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],
                Articulaciones_Switch: [false],
                Articulaciones: ['', [Validators.required]],
                Certificacion_Intermedia_Switch: [false],
                Certificaciones_Intermedias: ['', [Validators.required]],

                file_maestro: [[], GPValidator.filesValidator('file_maestro',() => this.modeForm)],
            });
            this.fbFormUpdate = this.fb.group({});
            console.log("inicié formulario plan de estudio");
            this.resetForm();
            success(true)
        });
    }

    resetForm(resetFacultadSelected = true): void{
        const codFacultadSeleccionado = this.fbForm.get('Cod_Facultad_Selected')?.value;

        this.fbForm.reset({
            //paso 1
            Cod_Programa: '',
            Cod_Regimen: '',
            Plan_Comun: '',
            Menciones_Switch: false,
            Menciones: '',
            Cod_Jornada: '',
            Cod_Modalidad: '',
            Cod_Estado: '',
            Cod_RangosAprobacion: '',
            Cod_Reglamento: '',

            //paso 2
            Cupo_Minimo: '',
            REXE: '',
            Articulaciones_Switch: false,
            Articulaciones: '',
            Certificacion_Intermedia_Switch: false,
            Certificaciones_Intermedias: '',

            file_maestro: []
        });
        if(!resetFacultadSelected){
            this.fbForm.get('Cod_Facultad_Selected')?.setValue(codFacultadSeleccionado);
        }
        this.showMessageCI = false;
        this.showMessageArticulacion = false;
        this.showMessagePlanComun = false;
        this.fbForm.enable()
        this.fbForm.get('Articulaciones')?.disable();
        this.fbForm.get('Certificaciones_Intermedias')?.disable();
        this.resetFileMaestro();
        this.resetValuesSelected();
        console.log("resetee formulario plan de estudio");
    }

    resetFileMaestro(){
        this.fbForm.get('file_maestro')?.clearValidators();
        this.fbForm.get('file_maestro')?.setValidators([GPValidator.filesValidator('file_maestro',() => this.modeForm)]);
        this.fbForm.get('file_maestro')?.updateValueAndValidity();
    }

    resetValuesSelected(){
        this.cod_programa_selected = 0;
    }

    get stateStepOne() {
        if (
              this.fbForm.get('Cod_Programa')!.invalid || 
              this.fbForm.get('Cod_Estado')!.invalid || 
              this.fbForm.get('Cod_Modalidad')!.invalid || 
              this.fbForm.get('Cod_Jornada')!.invalid || 
              this.fbForm.get('Cod_Regimen')!.invalid || 
              this.fbForm.get('Cupo_Minimo')!.invalid || 
              this.fbForm.get('REXE')!.invalid ||
              this.fbForm.get('Certificacion_intermedia')!.invalid 
            ) {
          return false;
        } else {
          return true;
        }
    }

    get stateStepTwo() {
        if (
                this.fbForm.get('Cod_Reglamento')!.invalid || 
                this.fbForm.get('Cod_RangosAprobacion')!.invalid || 
                this.fbForm.get('Menciones')!.invalid 
            ) {
            return false;
        } else {
            return true;
        }
    }

    get stateFileMaestro(){
        if (this.fbForm.get('file_maestro')!.invalid) {
          return false;
        }else{
          return true;
        }
    }

    get stateFormPlanDeEstudio() {
        return this.stateStepOne && this.stateStepTwo && this.stateFileMaestro;
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
    }

    setSelectEstadoPlanEstudio(estado: any){
        // this.fbForm.patchValue({ Cod_Estado: estado.Cod_estado })
        this.estadoPlanEstudioSelected = estado.Descripcion_estado
    }

    setSelectModalidad(modalidad: any){
        this.modalidadSelected = modalidad.Descripcion_modalidad
    }

    setSelectJornada(jornada: any){
        this.modalidadSelected = jornada.Descripcion_jornada
    }

    setSelectRegimen(regimen: any){
        this.modalidadSelected = regimen.Descripcion_regimen
    }

    setSelectReglamento(reglamentoSelected : Reglamento){
        this.messageService.clear();
        this.reglamentoSelected = reglamentoSelected!.Descripcion_regla!;
        this.fbForm.patchValue({ Cod_Reglamento: reglamentoSelected?.Cod_reglamento })
        this.messageService.add({
          key: 'main',
          severity: 'info',
          detail: `Reglamento: "${reglamentoSelected!.Descripcion_regla}" seleccionado`,
        });
    }
  
    unsetSelectReglamento(reglamentoSelected?: Reglamento){
      this.reglamentoSelected = '';
      this.fbForm.patchValue({ Cod_Reglamento: '' })
      if (reglamentoSelected) {
        this.messageService.clear();
        this.messageService.add({
          key: 'main',
          severity: 'info',
          detail: `Reglamento: "${reglamentoSelected.Descripcion_regla}" deseleccionado`,
        });
      }
    }

    
}