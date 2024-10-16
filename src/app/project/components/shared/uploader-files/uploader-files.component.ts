import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileUtils } from '../../../tools/utils/file.utils';
import { FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UploaderFilesService } from '../../../services/components/uploader-files.service';
import { Context } from '../../../models/shared/Context';

@Component({
  selector: 'app-uploader-files',
  templateUrl: './uploader-files.component.html',
  styles: [
  ]
})

export class UploaderFilesComponent implements OnInit, OnDestroy {

  @ViewChild('uploader') uploader!: FileUpload;
  @Input() mode: string = '';
  // @Input() context!: Context;

  docsToUpload : any[] = [];
  leyendas: any[] = [];
  files: any[] = [];
  filesToDelete : any[] = [];

  dialogVisorPDF: boolean = false;
  doc: any ;
  extrasDocs: any;
  context!: Context;

  private subscription: Subscription = new Subscription();

  constructor(private fileUtils: FileUtils, 
              private messageService: MessageService,
              public uploaderFilesService: UploaderFilesService
  ){}

  
  
  get disabled(): boolean | null {
    return this.uploaderFilesService.disabledButtonSeleccionarArchivos;
  }

  async ngOnInit() {
    this.leyendas = [
      { label: ' Archivo en línea' , icon:'pi-cloud' , color:'estado-cloud'},
      { label: ' Archivo por subir' , icon:'pi-cloud-upload' , color:'estado-upload'}
    ];
    this.subscription.add(this.uploaderFilesService.contextUpdate$.subscribe( context => {
      if (context) {
        if (context.module && context.component) {
          // console.log("CONTEXT FROM UPLOADER",context);       
          this.context = context;
        }
      }
    }))
    this.subscription.add(this.uploaderFilesService.actionUploader$.subscribe( updateUploader => {
      // console.log("updateUploader",updateUploader);
      if (updateUploader) {
        switch (updateUploader.action) {
          case 'upload': this.newUploadHandler(updateUploader.resolve! , updateUploader.reject!); break;
          case 'reset': this.resetQueueUploader(this.context);
        }
      }
    }));
    // this.subscription.add(this.uploaderFilesService.files$.subscribe(files => { files && ( this.files = files ) } ));
  }


  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    // console.log("me destrui");
    // this.test();
  }

  choose(callback: any){
    callback();
  }

  onSelect(event: any, uploader: FileUpload){
    // Filtrar los archivos nuevos, verificando que no estén ya en la lista
    const uniqueFiles = event.currentFiles.filter((newFile: File) => {
      return !this.uploaderFilesService.files.some(fileWithComment => fileWithComment.nombre === newFile.name && fileWithComment.extras.pesoDocumento === newFile.size);
    });

    // Si no hay archivos únicos (ya existen), mostrar mensaje de error y remover el último archivo
    if (uniqueFiles.length == 0) {
      let lastFile = event.currentFiles[event.currentFiles.length - 1 ];
      this.messageService.add({
        key: 'uploader-files',
        severity: 'error',
        detail: `El documento con nombre ${lastFile.name} ya existe.`,
      });

      // Buscar y remover el archivo duplicado del uploader
      const fileIndex = uploader.files.findIndex(file => file === lastFile);
      if (fileIndex !== -1) {
        uploader.remove(event.originalEvent, fileIndex);
      }
    }
    
    // Agregar los archivos únicos a la lista 'files'
    uniqueFiles.forEach((newFile: File) => {  
      const fileToSelect = {
        nombre: newFile.name , 
        tipo: newFile.type, 
        extras:{pesoDocumento: newFile.size ,comentarios:''} , 
        origFile: newFile , 
        from: this.context.component.label,
        mode: this.context.mode
      }
    
      if (this.context.mode !== 'select') {
        this.uploaderFilesService.filesFromModeCreateOrEdit.push(fileToSelect)
      } else {
        this.uploaderFilesService.filesFromModeSelect.push(fileToSelect)
      }
      // this.uploaderFilesService.setFiles(this.files);
      
    });    
    // this.filesChange.emit(this.files)
    this.uploaderFilesService.setConfigModeUploader();    
    this.uploaderFilesService.updateValidatorFiles(this.context,this.uploaderFilesService.files);
    
  }

  async newUploadHandler(resolve: Function, reject: Function){
    try {
      this.docsToUpload = [];
      if (this.uploaderFilesService.files.length != 0) {
        //subieron docs
        
        for (let i = 0; i < this.uploaderFilesService.files.length; i++) {
          const doc = this.uploaderFilesService.files[i];        
          if (!doc.id) {
            //modo subir nuevo archivo
            
            let file: any = await this.fileUtils.onSelectFile(doc.origFile);
    
            const extras = {
              pesoDocumento: doc.extras.pesoDocumento,
              comentarios: doc.extras.comentarios
            };
  
            let documento: any = {
              nombre: `${file.filename}.${file.format}`,
              archivo: file.binary,
              tipo: file.format,
              extras: extras,
              from: doc.from
            };
            this.docsToUpload.push(documento)
            
          }else{
            //modo actualizar archivo

            const extras = {
              pesoDocumento: doc.extras.pesoDocumento,
              comentarios: doc.extras.comentarios
            };
            
            let documento: any = {
              id: doc.id,
              nombre: `${doc.nombre}`,
              dataBase64: doc.dataBase64,
              tipo: doc.tipo,
              extras: extras,
              from: doc.from
            };
            
            this.docsToUpload.push(documento)
          }
        }
        resolve({success: true, docsToUpload: this.docsToUpload, docsToDelete: this.filesToDelete})
      }else{
        resolve({success: true , docsToUpload: this.docsToUpload = [], docsToDelete: this.filesToDelete })
      }
    } catch (e) {
      reject(e);
    }
  }

  onCommentChange(index: number, comment: string) {
    this.uploaderFilesService.files[index].extras.comentarios = comment;
  }

  async onRemoveTemplatingFile(file: any, uploader: FileUpload, index: number) { 
    if (file.id) {
      this.filesToDelete.push(file);
      this.uploaderFilesService.filesUploaded.splice(index, 1);
    }else{
      //eliminar de memoria navegador
      uploader.files = uploader.files.filter((f) => f != file.origFile);
      if (file.mode !== 'select') {
        this.uploaderFilesService.filesFromModeCreateOrEdit = this.uploaderFilesService.filesFromModeCreateOrEdit.filter((f) => f.origFile != file.origFile);
      } else {
        this.uploaderFilesService.filesFromModeSelect = this.uploaderFilesService.filesFromModeSelect.filter((f) => f.origFile != file.origFile);
      }
    }
    this.uploaderFilesService.setConfigModeUploader();
    this.uploaderFilesService.updateValidatorFiles(this.context, this.uploaderFilesService.files);
  }

  cancelDeleteFile(file: any, uploader: FileUpload, index: number){
    const fileExists = this.uploaderFilesService.files.some(existingFile => existingFile.nombre === file.nombre);
    if (!fileExists) {
      if (file.id) {
        this.uploaderFilesService.filesUploaded.push(file);
      }else{
        if (file.mode !== 'select') {
          this.uploaderFilesService.filesFromModeCreateOrEdit.push(file);
        } else {
          this.uploaderFilesService.filesFromModeSelect.push(file);
        }
      }
      this.filesToDelete.splice(index, 1);
    } else {
      this.messageService.add({
        key: 'uploader-files',
        severity: 'error',
        detail: `El documento con nombre ${file.nombre} no es posible cancelar su eliminación ya que está como documento adjunto.`,
      });
    }
    this.uploaderFilesService.setConfigModeUploader();
    this.uploaderFilesService.updateValidatorFiles(this.context, this.uploaderFilesService.files);
  }

  resetQueueUploader(context: Context){
    console.log("me llamaron reset queue uploader desde:", context);
    this.filesToDelete = []; 
    this.docsToUpload = [];  
    this.uploader?.clear();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.resetUploader();
  }

  showVisorPDF(event: any){   
    this.dialogVisorPDF = true;
    this.doc = event;
  }

  downloadDoc(event: any){
    this.uploaderFilesService.triggerDownloadDoc(this.context, event);
  }

  test(){
    console.log("FILES:",this.uploaderFilesService.files);
    console.log("FILES UPLOADED:",this.uploaderFilesService.filesUploaded);
    console.log("FILES SELECT:",this.uploaderFilesService.filesFromModeSelect);
    console.log("FILES CREATE OR EDIT:",this.uploaderFilesService.filesFromModeCreateOrEdit);
    
  }

}
