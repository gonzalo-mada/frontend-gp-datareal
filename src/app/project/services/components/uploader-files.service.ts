import {  effect, Injectable, signal } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { CollectionsMongo, Context, ModeUploader, Module, NameComponent } from '../../models/shared/Context';
import { LoadinggpService } from './loadinggp.service';

export type ActionUploader = 'upload' | 'uploaded' | 'reset' | 'delete-uploaded' | 'delete-selected' | 'select' | 'cancel-delete'
// acciones -> upload: usuario solicita subir | uploaded: docs descargados desde mongo | reset: resetea uploader | 
// acciones -> delete-uploaded: usuario desea eliminar archivos subidos en mongo | delete-selected: usuario elimina archivos en cola 
// acciones -> select: usuario selecciona archivos | cancel-delete: usuario cancela eliminacion de archivos en mongo

@Injectable({
  providedIn: 'root'
})

export class UploaderFilesService {

  _context : Context = {
    mode: undefined, 
    module: undefined,
    component: {
      name: undefined,
      collection: undefined
    }
  }

  context = signal<Context>(this._context);
  keyToast = 'main'
  disabledButtonSeleccionarArchivos : boolean | null = null;
  loading : boolean = false ;

  private actionSubject = new BehaviorSubject<{action: ActionUploader , resolve?: Function, reject?: Function } | null>(null);
  actionUploader$ = this.actionSubject.asObservable();

  private contextUpdate = new BehaviorSubject<Context>(this._context);
  contextUpdate$ = this.contextUpdate.asObservable();

  private downloadDocSubject = new BehaviorSubject<{context: Context, file:any, mode: 'g' | 'd' | 'b', resolve?: Function, reject?: Function} | null>(null);
  downloadDoc$ = this.downloadDocSubject.asObservable();

  private validatorFilesSubject = new BehaviorSubject<{action: ActionUploader, context: Context, files:any} | null>(null);
  validatorFiles$ = this.validatorFilesSubject.asObservable();

  private filesSubject = new Subject<any[] | null>();
  files$ = this.filesSubject.asObservable();

  public files: any[] = []; // los files en este arreglo son los que se muestran en el uploader
  public filesToDelete: any[] = []; //este arreglo se llena cuando el usuario elimina un file que esta subido a mongo
  public filesUploaded: any[] = []; //este arreglo se llena cuando son files que vienen cargados de mongo (show/edit)
  public filesSelected: any[] = []; // este arreglo se llena cuando el uploader se inicializa dentro de un mantenedor (modo: create/edit/show)
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

  async triggerDownloadDoc(context: Context, file: any, mode: 'g' | 'd' | 'b', resolve?: Function, reject?: Function){
    // g: para solo obtener archivo | d: para descargar
    this.downloadDocSubject.next({ context, file, mode, resolve, reject });
    this.downloadDocSubject.next(null);
  }

  updateValidatorFiles(action: ActionUploader, context: Context, files: any){
    this.validatorFilesSubject.next({action, context, files});
    // this.validatorFilesSubject.next(null);
  }

  resetValidatorFiles(){
    this.validatorFilesSubject.next(null);
  }

  setAction(action: ActionUploader, resolve?: Function, reject?: Function){
    this.actionSubject.next({action, resolve, reject});
    if (action === 'reset') this.actionSubject.next(null);
  }

  async updateFilesFromMongo(files: any): Promise<boolean>{
    return new Promise((success) => {
      this.updateValidatorFiles('uploaded',this.context(),{filesUploaded: files})
      success(true)
    })
  }

  resetFilesUploaded(){
    //esta funcion se llama cuando un mantenedor se destruye
    // console.log("me llamaron: resetFilesUploaded");
    this.filesUploaded = [];
    this.filesToDelete = [];
  }

  resetUploader(){
    // console.log("me llamaron: resetUploader");
    this.files = [];
    this.filesToDelete = [];
    this.filesUploaded = [];
    this.filesSelected = [];
  }

  newSetContext(modeUploader: ModeUploader, moduleName: Module, name: NameComponent, collection?: CollectionsMongo): Promise<boolean> {
    this.context.update((context) => ({
      ...context,
      mode: modeUploader,
      module: moduleName,
      component: {
          name: name,
          collection: collection
      }
    }));
    return Promise.resolve(true);
  }

  setLoading(loading: boolean, showMessage = false, showSkeleton = true, mode?: 'g' | 'd' | 'b'){
    switch (loading) {
      case true:
        if (showMessage) {
          showSkeleton ? this.loading = true : this.loading = false;
          // this.loadingGpService.loading(true,{msgs: 'Cargando documentos. Espere, por favor...'})
          this.loadingGpService.loading(true,{msgs: `${ mode && mode === 'b' ? 'Adjutando documento(s). Espere, por favor...' : 'Cargando documento(s). Espere, por favor...'}`})
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

  async setConfigModeUploader(): Promise<any[]>{
    return new Promise(async (success) => {
      let mode = this.context().mode ;
      // console.log("--> MODE:",mode);
      switch (mode) {
        case 'show':
          this.files = this.filesUploaded
        break;
        case 'create':
          this.files = this.filesSelected
        break;
        case 'edit':
          this.files = [...this.filesUploaded, ...this.filesSelected]
        break;
        case 'select':
          this.files = this.filesSelected 
        break;
      }
  
      if (this.files.length !== 0) {
        this.totalFileSize = 0
        for (let i = 0; i < this.files.length; i++) {
          const element = this.files[i];
          this.totalFileSize += element.extras.pesoDocumento
        }
      }
      success(this.files)
    })
  }

}
