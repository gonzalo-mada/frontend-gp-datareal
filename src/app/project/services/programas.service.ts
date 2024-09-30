import { effect, Injectable, signal } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { Programa } from '../models/Programa'
import { BehaviorSubject, Subject } from 'rxjs';
import { EstadosAcreditacion } from '../models/EstadosAcreditacion';
import { EstadoMaestro } from '../models/EstadoMaestro';
import { Suspension } from '../models/Suspension';
import { ModeForm } from '../models/shared/ModeForm';
import { StateValidatorForm } from '../models/shared/StateValidatorForm';
import { Reglamento } from '../models/Reglamento';
@Injectable({
  providedIn: 'root'
})
export class ProgramasService {

  modeForm: ModeForm = undefined;
  stateForm: StateValidatorForm = undefined;

  _programa: Programa = {
    Cod_Programa: undefined,
    Centro_costo: '',
    Nombre_programa: '',
    Tipo_programa: undefined,
    Titulo: '',
    Director: '',
    Nombre_Director: '',
    Director_alterno: '',
    Nombre_Director_alterno: '',
    Rexe: '',
    Codigo_SlES: '',
    ID_Reglamento: undefined,
    Cod_acreditacion: undefined,
    Creditos_totales: undefined,
    Horas_totales: undefined,
    Grupo_correo: '',
    Estado_maestro: undefined,
    Campus: undefined,
    Unidad_academica: undefined,
    Codigo_FlN700: undefined,
    Grado_academico: '',
    EstadosAreditacion: undefined,
    EstadoMaestro: undefined,
    Suspension: undefined,
    EstadosAcreditacion: undefined,
    Reglamento: undefined
  }

  programa = signal<Programa>(this._programa);

  private programaUpdate = new Subject<Programa>();
  programaUpdate$ = this.programaUpdate.asObservable();

  private buttonClickRefreshTableEA = new Subject<void>();
  buttonRefreshTableEA$ = this.buttonClickRefreshTableEA.asObservable();

  private buttonClickRefreshTableSusp = new Subject<void>();
  buttonRefreshTableSusp$ = this.buttonClickRefreshTableSusp.asObservable();

  private buttonClickRefreshTableReglamento = new Subject<void>();
  buttonRefreshTableReglamento$ = this.buttonClickRefreshTableReglamento.asObservable();

  private actionDirectorSelected = new Subject<boolean>();
  actionDirectorSelected$ = this.actionDirectorSelected.asObservable();

  private actionDirectorAlternoSelected = new Subject<boolean>();
  actionDirectorAlternoSelected$ = this.actionDirectorAlternoSelected.asObservable();

  private crudUpdate = new BehaviorSubject<{mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function} | null>(null);
  crudUpdate$ = this.crudUpdate.asObservable();

  private formUpdate = new BehaviorSubject<{mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function  } | null>(null);
  formUpdate$ = this.formUpdate.asObservable();

  constructor(private invoker: InvokerService) { 
    effect(() => {
      this.onProgramaUpdate();
    })
  }

  setModeCrud(mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.crudUpdate.next({mode, data, resolve, reject});
    // this.crudUpdate.next(null);
  }

  setModeForm(mode: ModeForm, data?: Programa | null, resolve?: Function, reject?: Function){
    this.modeForm = mode;
    this.formUpdate.next({mode, data, resolve, reject});
    this.formUpdate.next(null);
  }

  resetModeCrud(){
    this.crudUpdate.next(null);
  }

  emitButtonRefreshTableEA(){
    this.buttonClickRefreshTableEA.next();
  }

  emitButtonRefreshTableSusp(){
    this.buttonClickRefreshTableSusp.next();
  }

  emitButtonRefreshTableReg(){
    this.buttonClickRefreshTableReglamento.next();
  }

  setSelectEstadoAcreditacion(eaSelected : EstadosAcreditacion){
    this.programa.update((programa) => ({
      ...programa,
      Cod_acreditacion: eaSelected.Cod_acreditacion,
      EstadosAreditacion: eaSelected
    }))
  }

  setSelectEstadoMaestro(emSelected : EstadoMaestro){
    this.programa.update((programa) => ({
      ...programa,
      Estado_maestro: emSelected.Cod_EstadoMaestro,
      EstadoMaestro: emSelected
    }))
  }

  setSelectSuspension(suspSelected : Suspension | undefined){
    this.programa.update((programa) => ({
      ...programa,
      Suspension: suspSelected
    }))
  }

  setSelectReglamento(reglamentoSelected : Reglamento | undefined){
    this.programa.update((programa) => ({
      ...programa,
      Reglamento: reglamentoSelected
    }))
  }

  onProgramaUpdate(){
    this._programa = { ...this.programa() };
    this.programaUpdate.next(this.programa());
  }

  signalGetDirector(){
    return this.programa().Nombre_Director || '';
  }

  signalGetDirectorAlterno(){
    return this.programa().Nombre_Director_alterno || '';
  }

  triggerDirectorSelected(){
    this.actionDirectorSelected.next(true);
    this.actionDirectorSelected.next(false);
  }

  triggerDirectorAlternoSelected(){
    this.actionDirectorAlternoSelected.next(true);
    this.actionDirectorAlternoSelected.next(false);
  }

  async getTiposProgramas(){
    return await this.invoker.httpInvoke('tiposprogramas/getTiposProgramas');
  }

  async getCampus(){
    return await this.invoker.httpInvoke('campus/logica_getCampus');
  }

  async getUnidadesAcademicas(){
    return await this.invoker.httpInvoke('unidadesAcademicas/logica_getUnidadesAcademicas');
  }

  async getDirector(params: any){
    return await this.invoker.httpInvoke('programas/getDirector', params);
  }

  async getInstituciones(){
    return await this.invoker.httpInvoke('programas/getInstituciones');
  }

  async getProgramas(){
    return await this.invoker.httpInvoke('programas/getProgramas');
  }

  async getEstadosAcreditacion(){
    return await this.invoker.httpInvoke('estados_acreditacion/getEstadosAcreditacion');
  }

}
