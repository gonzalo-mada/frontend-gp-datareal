import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})


export class ActionsCrudService {

  //Maneja las filas seleccionadas en la tabla
  private selectedRowsSubject = new BehaviorSubject<any[]>([]);
  selectedRows$ = this.selectedRowsSubject.asObservable();

  //Maneja los atributos extras para los docs
  private extrasDocsSubject = new BehaviorSubject<any>(null);
  extrasDocs$ = this.extrasDocsSubject.asObservable();

  //Maneja los files para los docs
  private filesSubject = new BehaviorSubject<any>(null);
  files$ = this.filesSubject.asObservable();

  // Maneja la acción de un nuevo registro (botón + Agregar)
  private actionNewRegisterSubject = new BehaviorSubject<boolean>(false);
  actionNewRegister$ = this.actionNewRegisterSubject.asObservable();

  //Maneja la acción de eliminar seleccionados (botón Eliminar seleccionados)
  private actionDeleteSelectedSubject = new BehaviorSubject<boolean>(false);
  actionDeleteSelected$ = this.actionDeleteSelectedSubject.asObservable();

  //Maneja la acción de restablecer las filas seleccionadas
  private actionResetSelectedSubject = new BehaviorSubject<boolean>(false);
  actionResetSelectedRows$ = this.actionResetSelectedSubject.asObservable();

  //Maneja la acción de restablecer las filas seleccionadas
  private actionRefreshTableSubject = new BehaviorSubject<boolean>(false);
  actionRefreshTable$ = this.actionRefreshTableSubject.asObservable();

  //Maneja la acción de setear el modo del crud
  private actionModeSubject  = new BehaviorSubject<{ data: any; mode: string } | null>(null);
  actionMode$ = this.actionModeSubject.asObservable();

  //Maneja la promesa que ejecuta la carga de archivos del uploader
  private actionUploadDocsSubject = new BehaviorSubject<{ resolve: Function; reject: Function } | null>(null);
  actionUploadDocs$ = this.actionUploadDocsSubject.asObservable();

  //Maneja la acción para resetear la cola de archivos del uploader
  private actionResetQueueUploaderSubject = new BehaviorSubject<boolean>(false);
  actionResetQueueUploader$ = this.actionResetQueueUploaderSubject.asObservable();

  //Maneja la promesa que elimina documento en linea del uploader
  private actionDeleteDocUploaderSubject = new BehaviorSubject<{ file:any , resolve: Function; reject: Function } | null>(null);
  actionDeleteDocUploader$ = this.actionDeleteDocUploaderSubject.asObservable();

  //Maneja la acción descargar un archivo desde el uploader
  private actionDownloadDocSubject = new BehaviorSubject< {file:any} | null >(null);
  actionDownloadDoc$ = this.actionDownloadDocSubject.asObservable();

  //Maneja la actualizacion del validador para archivos del formulario
  private updateValidatorFilesSubject = new BehaviorSubject< {files:any} | null >(null);
  updateValidatorFiles$ = this.updateValidatorFilesSubject.asObservable();



  constructor() { }

  //Setea filas seleccionadas
  setSelectedRows(rows: any[]) {    
    this.selectedRowsSubject.next(rows);
  }

  //Obtiene filas seleccionadas
  getSelectedRows(){
    return this.selectedRowsSubject.getValue();
  }

  //Setea los extra docs
  setExtrasDocs(extrasDocs: any) {
    this.extrasDocsSubject.next(extrasDocs);
  }

  //Obtiene los extra docs
  getExtrasDocs() {
    return this.extrasDocsSubject.getValue();
  }

  //Setea los archivos 
  setFiles(files: any) {
    this.filesSubject.next(files);
  }

  //Obtiene los archivos
  getFiles() {
    return this.filesSubject.getValue();
  }

  //Dispara la acción de eliminar seleccionados
  triggerDeleteAction() {
    this.actionDeleteSelectedSubject.next(true);
    this.actionDeleteSelectedSubject.next(false);
  }

  //Dispara la acción de restablecer filas seleccionadas
  triggerResetSelectedRowsAction(){
    this.actionResetSelectedSubject.next(true);
    this.actionResetSelectedSubject.next(false);
  }

  //Dispara la acción de nuevo registro
  triggerNewRegisterAction(){
    this.actionNewRegisterSubject.next(true);
    this.actionNewRegisterSubject.next(false);
  }

  //Dispara la acción con el modo del crud
  triggerModeAction(data: any, mode: string) {
    this.actionModeSubject.next({ data, mode });
    this.actionModeSubject.next(null); //reset
  }

  //Dispara la acción para refrescar la tabla
  triggerRefreshTableAction(){
    this.actionRefreshTableSubject.next(true);
    this.actionRefreshTableSubject.next(false);
  }

  //Dispara la acción para cargar documentos
  triggerUploadDocsAction(input:{resolve: Function, reject: Function} | null) {
    this.actionUploadDocsSubject.next(input);
  }

  //Dispara la acción para resetear la cola del uploader
  triggerResetQueueUploaderAction(){
    this.actionResetQueueUploaderSubject.next(true);
    this.actionResetQueueUploaderSubject.next(false);
  }

  //Dispara la acción para eliminar un archivo en línea del uploader
  triggerDeleteDocUplaoderAction( input: {file: any, resolve: Function, reject: Function} | null ){
    this.actionDeleteDocUploaderSubject.next(input);
  }

  //Dispara la acción para descargar un archivo en linea del uploader
  triggerDownloadDocUploaderAction(file:any){
    this.actionDownloadDocSubject.next(file);
    this.actionDownloadDocSubject.next(null);
  }

  //Actualiza el validador de archivos para el formulario
  updateValidatorFiles(files:any){
    this.updateValidatorFilesSubject.next(files);
    this.updateValidatorFilesSubject.next(null);
  }
  



}
