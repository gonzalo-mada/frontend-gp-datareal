import {  effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Context, LabelComponent, ModeUploader, Module, NameComponent } from '../../models/shared/Context';
import { LoadinggpService } from './loadinggp.service';

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
  keyToast = 'main-gp'
  disabledButtonSeleccionarArchivos : boolean | null = null;
  loading : boolean = false ;

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

  public files: any[] = []; // los files en este arreglo son los que se muestran en el uploader
  public filesToDelete: any[] = []; //este arreglo se llena cuando el usuario elimina un file que esta subido a mongo
  public filesUploaded: any[] = []; //este arreglo se llena cuando son files que vienen cargados de mongo (show/edit)
  public filesFromModeSelect: any[] = []; //este arreglo se llena cuando el uploader se inicializa en modo select (agregar-programa)
  public filesFromModeCreateOrEdit: any[] = []; // este arreglo se llena cuando el uploader se inicializa dentro de un mantenedor (modo: create/edit/show)
  totalFileSize: number = 0;
  limitValueUploader: number = 10485760;

  constructor(private loadingGpService: LoadinggpService){
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
    this.actionSubject.next(null);
  }

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
    //esta funcion se llama cuando un mantenedor se destruye
    // console.log("me llamaron: resetFilesUploaded");
    this.filesUploaded = [];
    this.filesToDelete = [];
    this.filesFromModeCreateOrEdit = [];
  }

  resetUploader(){
    // console.log("me llamaron: resetUploader");
    this.files = [];
    this.filesToDelete = [];
    this.filesFromModeCreateOrEdit = [];
    this.filesFromModeSelect = [];
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

  setLoading(loading: boolean, showMessage = false){
    switch (loading) {
      case true:
        if (showMessage) {
          this.loading = true;
          this.loadingGpService.loading(true,{msgs: 'Cargando documentos. Espere, por favor...'})
        }else{
          this.loading = true;
          this.loadingGpService.loading(true)
        }
      break;

      case false:
        this.loading = false;
        this.loadingGpService.loading(false)
      break;
    }
  }

  setConfigModeUploader(){
    let mode = this.context().mode ;
    // console.log("--> MODE:",mode);
    switch (mode) {
      case 'show':
        this.files = this.filesUploaded
      break;
      case 'create':
        this.files = this.filesFromModeCreateOrEdit
      break;
      case 'edit':
        this.files = [...this.filesUploaded, ...this.filesFromModeCreateOrEdit]
      break;
      case 'select':
        this.files = this.filesFromModeSelect 
      break;
    }

    if (this.files.length !== 0) {
      this.totalFileSize = 0
      for (let i = 0; i < this.files.length; i++) {
        const element = this.files[i];
        this.totalFileSize += element.extras.pesoDocumento
      }
    }
    
  }

}
