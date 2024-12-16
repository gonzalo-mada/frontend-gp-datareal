import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RutValidator } from 'src/app/base/tools/validators/rut.validator';
import { EstadoMaestro } from 'src/app/project/models/programas/EstadoMaestro';
import { EstadosAcreditacion } from 'src/app/project/models/programas/EstadosAcreditacion';
import { Reglamento } from 'src/app/project/models/programas/Reglamento';
import { ModeForm } from 'src/app/project/models/shared/ModeForm';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { GPValidator } from 'src/app/project/tools/validators/gp.validators';
import { MessageServiceGP } from '../../components/message-service.service';
import { TipoPrograma } from 'src/app/project/models/programas/TipoPrograma';
import { UnidadAcademica } from 'src/app/project/models/programas/UnidadAcademica';
import { TipoGraduacion } from 'src/app/project/models/programas/TipoGraduacion';
import { Campus } from 'src/app/project/models/programas/Campus';
import { ModeDialog, Programa } from 'src/app/project/models/programas/Programa';

interface Director {
    nombre: string,
    rut: string
}

@Injectable({
    providedIn: 'root'
})

export class FormProgramaService {
    public fbForm!: FormGroup;
    public fbFormUpdate!: FormGroup;
    modeForm: ModeForm = undefined;
    stateForm: StateValidatorForm = undefined;
    stateFormUpdate: StateValidatorForm = undefined;
    
    //VARS SELECTED
    directorSelected: Director = {nombre: '' , rut: ''};
    directorAlternoSelected: Director = {nombre: '' , rut: ''};
    reglamentoSelected: string = '';
    estadoMaestroSelected: string = '';
    estadoAcreditacionSelected: string = '';
    estadoAcreditacionSiglaSelected: string = '';
    tipoProgramaSelected: string = '';
    tipoProgramaCategoriaSelected: string = '';
    campusSelected: string = '';
    tipoGraduacionSelected: string = '';
    unidadAcademicaSelected: string = '';
    unidadAcademicaFacultadSelected: string = '';
    nameProgramaAdded: string = '';
    codProgramaAdded: number = 0;
    activeIndexStepper: number | undefined = 0 ;
    activeIndexStateForm: number | undefined = 0;
    activeIndexAcordionAddPrograma: number | undefined = 0;
    showTableDirectores: boolean = false;
    showTableDirectoresAlternos: boolean = false;

    constructor(
        private fb: FormBuilder,
        private messageService: MessageServiceGP
    ){}

    initForm(): Promise<boolean>{
      return new Promise((success) => {
          this.fbForm = this.fb.group({
            //paso 1
            Centro_costo: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
            Nombre_programa: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            Grupo_correo: ['', [Validators.required, GPValidator.checkCorreoUV()]],
            Cod_Programa: ['', ],
            Codigo_SIES: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            Creditos_totales: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
            Horas_totales: ['', [Validators.required, GPValidator.regexPattern('solo_num')]],
            Titulo: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            Grado_academico: ['', [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            REXE: ['', [Validators.required, GPValidator.regexPattern('num_o_letras')]],
            
            //paso 2
            Tipo_programa: ['', [Validators.required]],
            Campus: ['', [Validators.required]],
            Unidad_academica: ['', [Validators.required]],
            Unidades_academicas_Selected: [''],
            EstadoMaestro: ['', [Validators.required]],
            Cod_EstadoMaestro: ['', [Validators.required]],
            Graduacion_Conjunta_Switch: [false],
            Instituciones: [{value:'', disabled: true}, [Validators.required]],
            Instituciones_Selected: [''],
            TipoGraduacion: [{value:'', disabled: true}, [Validators.required]],
            Certificacion_intermedia_Switch: [false],
            Certificacion_intermedia: [{value:'', disabled: true}, [Validators.required]],
            Certificacion_intermedia_Selected: [''],
            Cod_TipoGraduacion: [''],
      
            //paso 3 
            Cod_Reglamento: ['', [Validators.required]],
            Director: ['', [Validators.required, RutValidator.rut]],
            Director_selected: ['', [Validators.required, GPValidator.notSameDirectorsSelected()]],
            haveDirectorAlterno: [false],
            Director_alterno: ['', [RutValidator.rut, , GPValidator.notSameAsDirector('Director','Director_selected')]],
            DirectorAlterno_selected: ['',  GPValidator.requiredDirectorAlternoSelected()],
            Cod_acreditacion: ['', ],
      
            //file maestro
            file_maestro: [[], GPValidator.filesValidator('file_maestro',() => this.modeForm)],
          });
          this.fbFormUpdate = this.fb.group({});
          console.log("inicié formulario programa");
          success(true)
      })
    }

    resetForm(): void {
        this.fbForm.reset({
            Centro_costo: '',
            Nombre_programa: '',
            Grupo_correo: '',
            Cod_Programa: '',
            Codigo_SIES: '',
            Creditos_totales: '',
            Horas_totales: '',
            Titulo: '',
            Grado_academico: '',
            REXE: '',
            
            Tipo_programa: '',
            Campus: '',
            Unidad_academica: '',
            Unidades_academicas_Selected: '',
            EstadoMaestro: '',
            Cod_EstadoMaestro: '',
            Graduacion_Conjunta_Switch: false,
            Instituciones: '',
            Instituciones_Selected: '',
            TipoGraduacion:'',
            Certificacion_intermedia_Switch: false,
            Certificacion_intermedia: '',
            Certificacion_intermedia_Selected: '',
      
            Cod_Reglamento: '',
            Director: '',
            Director_selected: '',
            haveDirectorAlterno: false,
            Director_alterno: '',
            DirectorAlterno_selected: '',
            Cod_acreditacion: '',
      
            file_maestro: []
        })
        this.directorSelected = {nombre: '', rut: ''};
        this.directorAlternoSelected = {nombre: '', rut: ''};
        this.reglamentoSelected = '';
        this.estadoMaestroSelected = '';
        this.estadoAcreditacionSelected = '';
        this.estadoAcreditacionSiglaSelected = '';
        this.tipoProgramaSelected = '';
        this.tipoProgramaCategoriaSelected = '';
        this.campusSelected = '';
        this.tipoGraduacionSelected = '';
        this.unidadAcademicaSelected = '';
        this.unidadAcademicaFacultadSelected = '';
        this.nameProgramaAdded = '';
        this.codProgramaAdded = 0;
        this.activeIndexStepper = 0;
        this.activeIndexStateForm = 0;
        this.activeIndexAcordionAddPrograma = 0;
        this.fbForm.enable()
        this.fbForm.get('Instituciones')?.disable();
        this.fbForm.get('TipoGraduacion')?.disable();
        this.fbForm.get('Certificacion_intermedia')?.disable();
        console.log("resetee formulario programa");
        
    }

    setForm(form: Programa): void {
        this.fbForm.patchValue({
            ...form, 
            Graduacion_Conjunta_Switch: form.Graduacion_Conjunta === 1 ? true : false,
            Certificacion_intermedia_Switch: form.Certificacion_intermedia === 1 ? true : false,
        });
        // console.log("ASI QUEDA EL FORM",this.fbForm.value);
    }

    get stateStepOne() {
        if (
              this.fbForm.get('Centro_costo')!.invalid || 
              this.fbForm.get('Nombre_programa')!.invalid || 
              this.fbForm.get('Grupo_correo')!.invalid || 
              this.fbForm.get('Cod_Programa')!.invalid || 
              this.fbForm.get('Codigo_SIES')!.invalid || 
              this.fbForm.get('Creditos_totales')!.invalid || 
              this.fbForm.get('Horas_totales')!.invalid ||
              this.fbForm.get('Titulo')!.invalid ||
              this.fbForm.get('Grado_academico')!.invalid || 
              this.fbForm.get('REXE')!.invalid 
            ) {
          return false;
        } else {
          return true;
        }
    }
    
    get stateStepTwo() {
        if (
                this.fbForm.get('Tipo_programa')!.invalid || 
                this.fbForm.get('Campus')!.invalid || 
                this.fbForm.get('Unidad_academica')!.invalid || 
                this.fbForm.get('Cod_EstadoMaestro')!.invalid || 
                this.fbForm.get('Instituciones')!.invalid ||
                this.fbForm.get('TipoGraduacion')!.invalid ||
                this.fbForm.get('Certificacion_intermedia')!.invalid 
            ) {
            return false;
        } else {
            return true;
        }
    }
    
    get stateStepThree() {
        if (
                this.fbForm.get('Cod_Reglamento')!.invalid || 
                this.fbForm.get('Director_selected')!.invalid || 
                this.fbForm.get('DirectorAlterno_selected')!.invalid || 
                this.fbForm.get('Cod_acreditacion')!.invalid
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
    
    get stateFormPrograma() {
        return this.stateStepOne && this.stateStepTwo && this.stateStepThree && this.stateFileMaestro;
    }

    getValuesSelected(): void {
        let valuesSelected = {
          directorSelected: this.directorSelected,
          directorAlternoSelected: this.directorAlternoSelected,
          reglamentoSelected: this.reglamentoSelected,
          estadoMaestroSelected: this.estadoMaestroSelected,
          tipoProgramaSelected: this.tipoProgramaSelected,
          tipoProgramaCategoriaSelected: this.tipoProgramaCategoriaSelected,
          campusSelected: this.campusSelected,
          unidadAcademicaSelected: this.unidadAcademicaSelected,
          unidadAcademicaFacultadSelected: this.unidadAcademicaFacultadSelected,
          tipoGraduacionSelected: this.tipoGraduacionSelected,
        }
        console.log("valuesSelected",valuesSelected);
    }

    getValuesIndex(): void{
        let valuesIndex = {
          activeIndexStepper: this.activeIndexStepper,
          activeIndexStateForm: this.activeIndexStateForm,
          activeIndexAcordionAddPrograma: this.activeIndexAcordionAddPrograma
        }
        console.log("valuesIndex",valuesIndex);
    }

    updateFilesForm(files: any): void {
        this.fbForm.patchValue({ file_maestro: files });
        this.fbForm.controls['file_maestro'].updateValueAndValidity();
    }

    haveDirectorAlterno(dA: boolean){
        switch (dA) {
          case true: 
            this.fbForm.patchValue({haveDirectorAlterno: true});
            this.fbForm.get('DirectorAlterno_selected')?.updateValueAndValidity();
            this.activeIndexAcordionAddPrograma = 2; 
          break;
          case false:
            this.fbForm.patchValue({haveDirectorAlterno: false});
            this.fbForm.get('Director_alterno')?.reset();
            this.fbForm.get('DirectorAlterno_selected')?.reset();
            this.fbForm.get('DirectorAlterno_selected')?.updateValueAndValidity();
            this.showTableDirectoresAlternos = false;
            this.unsetSelectDirector('alterno'); 
            this.activeIndexAcordionAddPrograma = 1; 
          break;
        }
    }

    setSelectEstadoAcreditacion(eaSelected : EstadosAcreditacion){
      this.messageService.clear();
      if (eaSelected.Acreditado == 'SI') {
      this.estadoAcreditacionSelected = `Acreditado por: ${eaSelected.tiempo?.Cantidad_anios} años ( ${eaSelected.tiempo?.Fecha_inicio} - ${eaSelected.tiempo?.Fecha_termino} )`
      this.estadoAcreditacionSiglaSelected = eaSelected.Sigla!;
      }else{
      this.estadoAcreditacionSelected = 'No acreditado'
      this.estadoAcreditacionSiglaSelected = eaSelected.Sigla!;
      }
      this.fbForm.patchValue({ Cod_acreditacion: eaSelected.Cod_acreditacion })
      this.messageService.add({
        key: 'main',
        severity: 'info',
        detail: `Estado acreditación: "${eaSelected.Sigla}" seleccionado`,
      });
    }
    
    unsetSelectEstadoAcreditacion(eaSelected : EstadosAcreditacion){
      this.messageService.clear();
      this.fbForm.patchValue({ Cod_acreditacion: '' })
      this.estadoAcreditacionSelected = ''
      this.estadoAcreditacionSiglaSelected = ''
      this.messageService.add({
        key: 'main',
        severity: 'info',
        detail: `Estado acreditación: "${eaSelected.Sigla}" deseleccionado`,
      });
    }

    setSelectEstadoMaestro(emSelected : EstadoMaestro){
        this.fbForm.patchValue({ Cod_EstadoMaestro: emSelected.Cod_EstadoMaestro })
        this.estadoMaestroSelected = emSelected.Descripcion_EstadoMaestro!;
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

    unsetSelectReglamento(reglamentoSelected : Reglamento){
        this.messageService.clear();
        this.reglamentoSelected = '';
        this.fbForm.patchValue({ Cod_Reglamento: '' })
        this.messageService.add({
          key: 'main',
          severity: 'info',
          detail: `Reglamento: "${reglamentoSelected.Descripcion_regla}" deseleccionado`,
        });
    }

    setSelectDirector(mode: 'director' | 'alterno' , nombre: string, rut: string){
        switch (mode) {
          case 'director':
            this.directorSelected = {
              nombre: nombre,
              rut: rut
            }
            this.fbForm.patchValue({Director_selected: rut})
            this.fbForm.get('Director')?.disable();
          break;
          case 'alterno':
            this.directorAlternoSelected = {
              nombre: nombre,
              rut: rut
            }
            this.fbForm.patchValue({DirectorAlterno_selected: rut})
            this.fbForm.get('Director_alterno')?.disable();
          break;
        }
    }

    unsetSelectDirector(mode: 'director' | 'alterno'){
        switch (mode) {
          case 'director':
            this.directorSelected = {
              nombre: '',
              rut: ''
            }
            this.fbForm.patchValue({Director_selected: ''})
            this.fbForm.get('Director')?.enable();
            this.haveDirectorAlterno(false)
          break;
          case 'alterno':
            this.directorAlternoSelected = {
              nombre: '',
              rut: ''
            }
            this.fbForm.patchValue({DirectorAlterno_selected: ''})
            this.fbForm.get('Director_alterno')?.enable();
            // this.fbForm.get('DirectorAlterno_selected')?.reset();
          break;
        }
    }

    setSelectTipoPrograma(selectedTp: TipoPrograma){
        this.tipoProgramaSelected = selectedTp.Descripcion_tp!;
        this.tipoProgramaCategoriaSelected = selectedTp.Categoria?.Descripcion_categoria!;
    }

    setSelectCampus(selectedCampus: Campus){
        this.campusSelected = selectedCampus.Descripcion_campus!;
    }
    
    setSelectTipoGraduacion(selectedTipoGraduacion: TipoGraduacion){
        this.tipoGraduacionSelected = selectedTipoGraduacion.Descripcion_tipoColaborativa!;
    }

    setSelectUnidadAcademica(selectedTp: UnidadAcademica){
        this.unidadAcademicaSelected = selectedTp.Descripcion_ua!;
        this.unidadAcademicaFacultadSelected = selectedTp.Facultad?.Descripcion_facu!;
    }

    async setFormUpdate(modeDialog: ModeDialog, programa: Programa): Promise<boolean> {
      switch (modeDialog) {
        case 'nombre':
          this.fbFormUpdate = this.fb.group({
            Nombre_programa: [programa.Nombre_programa, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            files: [[]]
          });
        break;
        case 'grupo_correo':
          this.fbFormUpdate = this.fb.group({
            Grupo_correo: [programa.Grupo_correo, [Validators.required, GPValidator.checkCorreoUV()]],
            files: [[]]
          });  
        break;
        case 'créditos totales':  
          this.fbFormUpdate = this.fb.group({
            Creditos_totales: [programa.Creditos_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
            files: [[]]
          });
        break;
        case 'horas totales':
          this.fbFormUpdate = this.fb.group({
            Horas_totales: [programa.Horas_totales, [Validators.required, GPValidator.regexPattern('solo_num')]],
            files: [[]]
          }); 
        break;
        case 'título':
          this.fbFormUpdate = this.fb.group({
            Titulo: [programa.Titulo, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            files: [[]]
          }); 
        break;
        case 'grado académico':
          this.fbFormUpdate = this.fb.group({
            Grado_academico: [programa.Grado_academico, [Validators.required, GPValidator.regexPattern('num_y_letras')]],
            files: [[]]
          }); 
        break;
        case 'REXE':
          this.fbFormUpdate = this.fb.group({
            REXE: [programa.REXE, [Validators.required, GPValidator.regexPattern('num_o_letras')]],
            files: [[]]
          }); 
        break;
        case 'maestro':
          this.fbFormUpdate = this.fb.group({
            files: [[]]
          })  
        break;
        case 'reglamento':
          this.fbFormUpdate = this.fb.group({
            Cod_Reglamento: [programa.Cod_Reglamento, [Validators.required]],
            nombreReglamento: [programa.Descripcion_Reglamento],
          });  
        break;
        case 'director':
          this.fbFormUpdate = this.fb.group({
            Director: [programa.Director, [Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate(programa.Director!, programa.Director_alterno!)]],
            Director_selected: [programa.Director, [Validators.required]],
            nombreDirector: [programa.nombre_Director],
            files: [[]]
          });  
        break;
        case 'director alterno':
          this.fbFormUpdate = this.fb.group({
            Director_alterno: [programa.Director_alterno, [Validators.required, RutValidator.rut, GPValidator.notSameAsDirectorInUpdate(programa.Director!, programa.Director_alterno!)]],
            DirectorAlterno_selected: [programa.Director_alterno, [Validators.required]],
            nombreDirector_alterno: [programa.nombre_DirectorAlterno],
            files: [[]]
          });  
        break;
        case 'estado maestro':
          this.fbFormUpdate = this.fb.group({
            EstadoMaestro: [programa.Cod_EstadoMaestro, [Validators.required]],
            TipoSuspension: [''],
            files: [[]]
          });  
        break;
        case 'estado acreditación':
          this.fbFormUpdate = this.fb.group({
            Cod_acreditacion: [programa.Cod_acreditacion, [Validators.required]],
            nombreEstadoAcreditacion: [programa.Descripcion_acreditacion],
          });  
        break;
      }
      this.fbFormUpdate.statusChanges.subscribe(status => {
        this.stateFormUpdate = status as StateValidatorForm
      });
      return true
    }

    updateFilesFormUpdate(files: any){
      this.fbFormUpdate.patchValue({ files });
      this.fbFormUpdate.get('files')?.updateValueAndValidity();
    }
}