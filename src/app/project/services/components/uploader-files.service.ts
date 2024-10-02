import {  effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Context, LabelComponent, Module, NameComponent } from '../../models/shared/Context';

type ActionUploader = 'upload' | 'reset'

interface LayoutUploader {
  stateButtonSeleccionarArchivos : boolean | null
}

@Injectable({
  providedIn: 'root'
})

export class UploaderFilesService {

  _context : Context = {
    module: undefined,
    component: {
      name: undefined,
      label: undefined
    }
  }

  context = signal<Context>(this._context);

  stateLayout : LayoutUploader = {
    stateButtonSeleccionarArchivos: null
  }

  private actionSubject = new BehaviorSubject<{action: ActionUploader , resolve?: Function, reject?: Function } | null>(null);
  actionUploader$ = this.actionSubject.asObservable();

  private contextUpdate = new BehaviorSubject<Context>(this._context);
  contextUpdate$ = this.contextUpdate.asObservable();

  private downloadDocSubject = new BehaviorSubject<{context: Context, file:any} | null>(null);
  downloadDoc$ = this.downloadDocSubject.asObservable();

  private validatorFilesSubject = new BehaviorSubject<{context: Context, files:any} | null>(null);
  validatorFiles$ = this.validatorFilesSubject.asObservable();

  private filesSubject = new Subject<any[] | null>();
  files$ = this.filesSubject.asObservable();

  constructor(){
      effect(()=>{
        this.onContextUpdate();
    })
  }

  onContextUpdate(){
    this._context = { ...this.context() };
    this.contextUpdate.next(this.context());
  }

  disabledButtonSeleccionar(){
    this.stateLayout.stateButtonSeleccionarArchivos = true;
  }

  enabledButtonSeleccionar(){
    this.stateLayout.stateButtonSeleccionarArchivos = false;
  }

  triggerDownloadDoc(context: Context, file: any){
    this.downloadDocSubject.next({context, file});
    this.downloadDocSubject.next(null);
  }

  updateValidatorFiles(context: Context, files: any){
    this.validatorFilesSubject.next({context, files});
    this.validatorFilesSubject.next(null);
  }

  resetValidatorFiles(){
    this.validatorFilesSubject.next(null);
  }

  setAction(action: ActionUploader, resolve?: Function, reject?: Function){
    this.actionSubject.next({action, resolve, reject});
    this.actionSubject.next(null);
  }

  setFiles(files: any[] | null){
    this.filesSubject.next(files);
  }

  setContext(moduleName: Module, name: NameComponent, label?: LabelComponent){
    this.context.update((context) => ({
        ...context,
        module: moduleName,
        component: {
          name: name,
          label: label
        }
    }))
  }

}
