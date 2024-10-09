import {  effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Context, LabelComponent, ModeUploader, Module, NameComponent } from '../../models/shared/Context';

type ActionUploader = 'upload' | 'reset'


@Injectable({
  providedIn: 'root'
})

export class UploaderFilesService {

  _context : Context = {
    mode: undefined, 
    module: undefined,
    component: {
      name: undefined,
      label: undefined
    }
  }

  context = signal<Context>(this._context);

  disabledButtonSeleccionarArchivos : boolean | null = null;

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

  public files: any[] = [];
  public filesToUpload : any[] = [];
  public filesUploaded: any[] = [];
  private auxComponent : string = '';

  constructor(){
      effect(()=>{
        this.onContextUpdate();
    })
  }

  onContextUpdate(){
    this._context = { ...this.context() };
    this.contextUpdate.next(this.context());
    this.setConfigModeUploader();
  }

  disabledButtonSeleccionar(){
    this.disabledButtonSeleccionarArchivos = true;
  }

  enabledButtonSeleccionar(){
    this.disabledButtonSeleccionarArchivos = false;
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
    // this.actionSubject.next(null);
  }

  // setFiles(files: any[] | null){
  //   this.filesSubject.next(files);
  // }

  setFiles(newFiles: any[] | null) {
    // console.log("newFiles",newFiles);
    this.resetFilesUploaded();

    if (newFiles === null) {
      this.resetFilesUploaded();
    }else{
      newFiles.forEach( file => {
        this.filesUploaded.push(file)
      })
    }
    this.setConfigModeUploader();
    
  }

  resetFilesUploaded(){
    this.files = [];
    this.filesUploaded = [];
  }

  resetUploader(){
    this.files = [];
    this.filesToUpload = [];
    this.filesUploaded = [];
  }

  setContext(modeUploader: ModeUploader, moduleName: Module, name: NameComponent, label?: LabelComponent){
    this.context.update((context) => ({
        ...context,
        mode: modeUploader,
        module: moduleName,
        component: {
          name: name,
          label: label
        }
    }))
  }

  setConfigModeUploader(){
    let mode = this.context().mode ;
    let component = this.context().component.name
    // this.auxComponent = component!;
    // if ( this.auxComponent === component){
    //   this.filesToUpload = [];
    // } 
    switch (mode) {
      case 'show':
        this.files = this.filesUploaded
      break;
      case 'create':
        this.files = this.filesToUpload
      break;
      case 'edit':
        this.files = [...this.filesUploaded, ...this.filesToUpload]
      break;
      case 'select':
        this.files = this.filesToUpload
      break;
    }
  }

}
