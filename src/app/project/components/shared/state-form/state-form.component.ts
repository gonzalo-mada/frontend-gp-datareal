import { Component, Input, OnInit } from '@angular/core';
import { FormAsignaturasService } from 'src/app/project/services/asignaturas/asignaturas/form.service';
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
    public formPlanDeEstudio: FormPlanDeEstudioService,
    public formAsignaturas: FormAsignaturasService
  ){}

  async ngOnInit() {
    switch (this.formName) {
      case 'programa':
        this.form = this.formPrograma;
        await this.setPrograma();
      break;

      case 'planDeEstudio':
        this.form = this.formPlanDeEstudio;
        await this.setPlanDeEstudio();
      break;

      case 'asignaturas':
        this.form = this.formAsignaturas;
        await this.setAsignaturas();
      break;
    
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
          { label: 'Grupo de correo', control: 'Grupo_correo' },
          { label: 'Título', control: 'Titulo' },
          { label: 'Grado académico', control: 'Grado_academico' },
          { label: 'Centro de responsabilidad', control: 'Centro_costo' },
          { label: 'Código SIES', control: 'Codigo_SIES' },
          { label: 'Créditos totales', control: 'Creditos_totales' },
          { label: 'Horas totales', control: 'Horas_totales' },
          { label: 'REXE / DEXE', control: 'REXE' },
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
          { label: 'Documentos maestros', control: 'file_maestro' },
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
          { label: 'Plan común', control: 'tiene_plan_comun' },
          { label: 'Rangos de aprobación', control: 'tiene_rango_aprob_g' },
          { label: 'Menciones', control: 'tiene_mencion' }
        ]
      },
      {
        step: 3,
        title: 'Paso 3',
        state: 'stateStepThree',
        fields: [
          { label: 'Reglamento', control: 'cod_reglamento' }
        ]
      },
      {
        step: 0,
        title: 'Documento adjunto',
        state: 'stateFileMaestro',
        fields: [
          { label: 'Documentos maestros', control: 'file_maestro' },
        ]
      }
    ]
  }

  async setAsignaturas(){
    return this.dataForm = [
      {
        step: 1,
        title: 'Paso 1',
        state: 'stateStepOne',
        fields: [
          { label: 'Programa', control: 'cod_programa' },
          { label: 'Plan de estudio', control: 'cod_plan_estudio' },
          { label: 'Modalidad', control: 'cod_modalidad' },
          { label: 'Régimen', control: 'cod_regimen' },
          { label: 'Tipo de evaluación', control: 'cod_tipo_evaluacion' },
          { label: 'Código asignatura', control: 'codigo_externo' },
          { label: 'Nombre', control: 'nombre_asignatura' },
          { label: 'Semestre', control: 'semestre' },
          { label: 'Duración', control: 'duracion' },
          { label: 'Máximo duración', control: 'max_duracion' },
          { label: 'Créditos', control: 'num_creditos' }
        ]
      },
      {
        step: 2,
        title: 'Paso 2',
        state: 'stateStepTwo',
        fields: [
          { label: 'Horas síncronas', control: 'horas_sincronas' },
          { label: 'Horas asíncronas', control: 'horas_asincronas' },
          { label: 'Horas presenciales', control: 'horas_presenciales' },
          { label: 'Horas indirectas', control: 'horas_indirectas' }
        ]
      },
      {
        step: 3,
        title: 'Paso 3',
        state: 'stateStepThree',
        fields: [
          { label: 'Menciones', control: 'tiene_mencion' },
          { 
            label: 'Mención seleccionada', 
            control: 'menciones',
            conditional: { field: 'tiene_mencion', value: 1 } 
          },
          { label: 'Evaluaciones intermedias', control: 'tiene_evaluacionintermedia' },
          { label: 'Prerrequisitos', control: 'tiene_prerequisitos' },
          { 
            label: 'Prerrequisitos seleccionados', 
            control: 'pre_requisitos' ,
            conditional: { field: 'tiene_prerequisitos', value: 1 }
          },
          { label: 'Tema', control: 'tiene_tema' },
          { 
            label: 'Temas seleccionados', 
            control: 'tema',
            conditional: { field: 'tiene_tema', value: 1 } 
          },
          { label: 'Colegiada', control: 'tiene_colegiada' },
          { 
            label: 'Tipo de colegiada', 
            control: 'cod_tipo_colegiada',
            conditional: { field: 'tiene_colegiada', value: 1 } 
          },
          { label: 'Obligatoria / Electiva', control: 'obligatoria_electiva' },
          { label: 'Articulable', control: 'tiene_articulacion' },
          { label: 'Paralela / Secuencial', control: 'tiene_secuencialidad' },
          { 
            label: 'Asign. secuenciales', 
            control: 'secuencialidad',
            conditional: { field: 'tiene_secuencialidad', value: 1 }  
          },
          { 
            label: 'Asign. paralelas', 
            control: 'paralelidad',
            conditional: { field: 'tiene_secuencialidad', value: 0 }  
          },
        ]
      },
      {
        step: 0,
        title: 'Documento adjunto',
        state: 'stateFileMaestro',
        fields: [
          { label: 'Documentos maestros', control: 'file_maestro' },
        ]
      }
    ]
  }
  

}
