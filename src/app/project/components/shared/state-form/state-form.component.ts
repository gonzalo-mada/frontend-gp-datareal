import { Component, Input, OnInit } from '@angular/core';
import { FormPlanDeEstudioService } from 'src/app/project/services/plan-de-estudio/plan-de-estudio/form.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.css']
})
export class StateFormComponent implements OnInit  {
  @Input() formName: string = '';
  form: any;
  dataForm: any[] = [];

  constructor(
    public formPrograma: FormProgramaService,
    public formPlanDeEstudio: FormPlanDeEstudioService
  ){}

  async ngOnInit() {
    if (this.formName === 'programa'){
      this.form = this.formPrograma;
      await this.setPrograma();
    } 
    if (this.formName === 'planDeEstudio'){
      this.form = this.formPlanDeEstudio;
      await this.setPlanDeEstudio();
    } 
  }


  getStateClass(state: boolean): string {
    return state ? 'state-badge state-valid' : 'state-badge state-invalid';
  }
  
  getStateText(state: boolean): string {
    return state ? 'válido' : 'inválido';
  }

  async setPrograma(){
    return this.dataForm = [
      {
        step: 1,
        title: 'Paso 1',
        state: 'stateStepOne',
        fields: [
          { label: 'Nombre de programa', control: 'Nombre_programa' },
          { label: 'Correo LDAP', control: 'Grupo_correo' },
          { label: 'Título', control: 'Titulo' },
          { label: 'Grado académico', control: 'Grado_academico' },
          { label: 'Centro costo', control: 'Centro_costo' },
          { label: 'Código SIES', control: 'Codigo_SIES' },
          { label: 'Créditos totales', control: 'Creditos_totales' },
          { label: 'Horas totales', control: 'Horas_totales' },
          { label: 'REXE', control: 'REXE' },
        ]
      },
      {
        step: 2,
        title: 'Paso 2',
        state: 'stateStepTwo',
        fields: [
          { label: 'Tipo de programa', control: 'Tipo_programa' },
          { label: 'Campus', control: 'Campus' },
          { label: 'Estado maestro', control: 'Cod_EstadoMaestro' },
          { label: 'Unidad académica', control: 'Unidad_academica' },
          { 
            label: 'Tipo de graduación', 
            control: 'TipoGraduacion', 
            conditional: { field: 'Graduacion_Conjunta_Switch', value: true }
          },
          { 
            label: 'Instituciones', 
            control: 'Instituciones', 
            conditional: { field: 'Graduacion_Conjunta_Switch', value: true }
          },
          { 
            label: 'Certificaciones intermedias', 
            control: 'Certificacion_intermedia', 
            conditional: { field: 'Certificacion_intermedia_Switch', value: true }
          },
        ]
      },
      {
        step: 3,
        title: 'Paso 3',
        state: 'stateStepThree',
        fields: [
          { label: 'Reglamento seleccionado', control: 'Cod_Reglamento' },
          { label: 'Director seleccionado', control: 'Director_selected' },
          { 
            label: 'Director alterno seleccionado', 
            control: 'DirectorAlterno_selected', 
            conditional: { field: 'haveDirectorAlterno', value: true }  
          }
        ]
      },
      {
        step: 0,
        title: 'Documento adjunto',
        state: 'stateFileMaestro',
        fields: [
          { label: 'Documento maestro', control: 'file_maestro' },
        ]
      }
    ]
  }

  async setPlanDeEstudio(){
    return this.dataForm = [
      {
        step: 1,
        title: 'Paso 1',
        state: 'stateStepOne',
        fields: [
          { label: 'Programa', control: 'cod_programa' },
          { label: 'Estado', control: 'cod_estado' },
          { label: 'Modalidad', control: 'cod_modalidad' },
          { label: 'Jornada', control: 'cod_jornada' },
          { label: 'Régimen', control: 'cod_regimen' },
          { label: 'Cupo mínimo', control: 'cupo_minimo' },
          { label: 'REXE', control: 'rexe' },

          // { label: 'Plan común', control: 'Grupo_correo' },
          // { label: 'Menciones', control: 'Titulo' },
          // { label: 'Rangos de aprobación', control: 'Horas_totales' },
          // { label: 'Reglamento', control: 'REXE' },
        ]
      },
      {
        step: 2,
        title: 'Paso 2',
        state: 'stateStepTwo',
        fields: [
          { label: 'Certificaciones intermedias', control: 'tiene_certificacion' },
          { label: 'Articulaciones', control: 'tiene_articulacion' },
          { label: 'Plan común', control: 'tiene_plan_comun' }
        ]
      },
      {
        step: 3,
        title: 'Paso 3',
        state: 'stateStepThree',
        fields: [
          { label: 'Reglamento', control: 'cod_reglamento' },
          { label: 'Rangos de aprobación', control: 'Cod_RangosAprobacion' },
          { 
            label: 'Menciones', 
            control: 'menciones', 
            conditional: { field: 'tiene_mencion', value: true }
          }
        ]
      },
      {
        step: 0,
        title: 'Documento adjunto',
        state: 'stateFileMaestro',
        fields: [
          { label: 'Documento maestro', control: 'file_maestro' },
        ]
      }
    ]
  }
  

}
