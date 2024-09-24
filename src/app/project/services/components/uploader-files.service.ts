import {  Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

type ActionUploader = 'upload' | 'reset'

interface LayoutUploader {
  stateButtonSeleccionarArchivos : boolean | null
}

@Injectable({
  providedIn: 'root'
})

export class UploaderFilesService {

  stateLayout : LayoutUploader = {
    stateButtonSeleccionarArchivos: null
  }

  private actionSubject = new BehaviorSubject<{action: ActionUploader , resolve?: Function, reject?: Function } | null>(null);
  actionUploader$ = this.actionSubject.asObservable();

  private downloadDocSubject = new Subject<{file:any}>();
  downloadDoc$ = this.downloadDocSubject.asObservable();

  private validatorFilesSubject = new Subject<{file:any} | null>();
  validatorFiles$ = this.validatorFilesSubject.asObservable();

  private filesSubject = new Subject<any[] | null>();
  files$ = this.filesSubject.asObservable();

  disabledButtonSeleccionar(){
    this.stateLayout.stateButtonSeleccionarArchivos = true;
  }

  enabledButtonSeleccionar(){
    this.stateLayout.stateButtonSeleccionarArchivos = false;
  }

  triggerDownloadDoc(file: any){
    this.downloadDocSubject.next(file);
  }

  updateValidatorFiles(files: any){
    this.validatorFilesSubject.next(files);
    this.validatorFilesSubject.next(null);
  }

  setAction(action: ActionUploader, resolve?: Function, reject?: Function){
    this.actionSubject.next({action, resolve, reject});
    this.actionSubject.next(null);
  }

  setFiles(files: any[] | null){
    this.filesSubject.next(files);
  }

}
