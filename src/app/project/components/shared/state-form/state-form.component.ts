import { Component } from '@angular/core';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';

@Component({
  selector: 'app-state-form',
  templateUrl: './state-form.component.html',
  styleUrls: ['./state-form.component.css']
})
export class StateFormComponent  {
  constructor(
    public form: FormProgramaService
  ){
    this.dataForm = [
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
      // {
      //   step: 3,
      //   title: 'Paso 3',
      //   state: 'stateStepThree',
      //   fields: [
      //     { 
      //       titleAccordion: 'Reglamento:',
      //       forms: [
      //         { label: 'Reglamento seleccionado', control: 'Cod_Reglamento' }
      //       ]
      //     },
      //     { 
      //       titleAccordion: 'Director:',
      //       forms: [
      //         { label: 'Director seleccionado', control: 'Director_selected' },
      //       ]
      //     },
      //     { 
      //       titleAccordion: 'Director alterno:',
      //       forms: [
      //         { label: 'Director alterno seleccionado', control: 'DirectorAlterno_selected' },
      //       ]
      //     },
      //     { 
      //       titleAccordion: 'Estado acreditación:',
      //       forms: [
      //         { label: 'Estado acreditación seleccionado', control: 'Cod_acreditacion' }
      //       ]
      //     },
      //   ]
      // }
    ]
  }

  dataForm: any[] = [];

  getStateClass(state: boolean): string {
    return state ? 'state-badge state-valid' : 'state-badge state-invalid';
  }
  
  getStateText(state: boolean): string {
    return state ? 'válido' : 'inválido';
  }
  

}
