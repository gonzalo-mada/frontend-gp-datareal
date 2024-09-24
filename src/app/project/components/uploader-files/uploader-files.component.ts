import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FileUtils } from '../../tools/utils/file.utils';
import { FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { Subscription } from 'rxjs';
import { UploaderFilesService } from '../../services/components/uploader-files.service';

@Component({
  selector: 'app-uploader-files',
  templateUrl: './uploader-files.component.html',
  styles: [
  ]
})

export class UploaderFilesComponent implements OnInit, OnDestroy {

  @ViewChild('uploader') uploader!: FileUpload;
  @Input() mode: string = '';
  @Input() from: any = {}

  docsToUpload : any[] = [];
  leyendas: any[] = [];
  files: any[] = [];
  filesToDelete : any[] = [];

  dialogVisorPDF: boolean = false;
  doc: any ;
  extrasDocs: any;

  private subscription: Subscription = new Subscription();

  constructor(private fileUtils: FileUtils, 
              private messageService: MessageService,
              private uploaderFilesService: UploaderFilesService
  ){}
  
  
  get disabled(): boolean | null {
    return this.uploaderFilesService.stateLayout.stateButtonSeleccionarArchivos;
  }

  async ngOnInit() {
    this.leyendas = [
      { label: ' Archivo en línea' , icon:'pi-cloud' , color:'estado-cloud'},
      { label: ' Archivo por subir' , icon:'pi-cloud-upload' , color:'estado-upload'}
    ];

    this.subscription.add(this.uploaderFilesService.actionUploader$.subscribe( updateUploader => {
      // console.log("updateUploader",updateUploader);
      if (updateUploader) {
        switch (updateUploader.action) {
          case 'upload': this.newUploadHandler(updateUploader.resolve! , updateUploader.reject!); break;
          case 'reset': this.resetQueueUploader();
        }
      }
    }));
    this.subscription.add(this.uploaderFilesService.files$.subscribe(files => { files && ( this.files = files ) } ));
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  choose(callback: any){
    callback();
  }

  onSelect(event: any, uploader: FileUpload){
    const uniqueFiles = event.currentFiles.filter((newFile: File) => {
      return !this.files.some(fileWithComment => fileWithComment.nombre === newFile.name && fileWithComment.extras.pesoDocumento === newFile.size);
    });

    if (uniqueFiles.length == 0) {
      let lastFile = event.currentFiles[event.currentFiles.length - 1 ];
      this.messageService.add({
        key: 'uploader-files',
        severity: 'error',
        detail: `El documento con nombre ${lastFile.name} ya existe.`,
      });
      const fileIndex = uploader.files.findIndex(file => file === lastFile);
      if (fileIndex !== -1) {
        uploader.remove(event.originalEvent, fileIndex);
      }
    }
      
    uniqueFiles.forEach((newFile: File) => {  
      const fileToSelect = {
        nombre: newFile.name , 
        tipo: newFile.type, 
        extras:{pesoDocumento: newFile.size ,comentarios:''} , 
        origFile: newFile , 
        from: this.from.section
      }
    
      this.files.push(fileToSelect)
      
    });

    // this.filesChange.emit(this.files)    
    this.uploaderFilesService.updateValidatorFiles(this.files);
    
  }

  async newUploadHandler(resolve: Function, reject: Function){
    try {
      if (this.files.length != 0) {
        //subieron docs
        
        for (let i = 0; i < this.files.length; i++) {
          const doc = this.files[i];        
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
    }finally{
      this.resetQueueUploader();
    }
  }

  onCommentChange(index: number, comment: string) {
    this.files[index].extras.comentarios = comment;
  }

  async onRemoveTemplatingFile(file: any, uploader: FileUpload, index: number) {
    if (file.id) {
      this.filesToDelete.push(file);
      this.files.splice(index, 1);
    }else{
      //eliminar de memoria navegador
      uploader.files = uploader.files.filter((f) => f != file.origFile);
      this.files.splice(index, 1);
    }
    // this.filesChange.emit(this.files)
    this.uploaderFilesService.updateValidatorFiles(this.files);
  }

  cancelDeleteFile(file: any, uploader: FileUpload, index: number){
    const fileExists = this.files.some(existingFile => existingFile.nombre === file.nombre);
    if (!fileExists) {
      this.files.push(file);
      this.filesToDelete.splice(index, 1);
    } else {
      this.messageService.add({
        key: 'uploader-files',
        severity: 'error',
        detail: `El documento con nombre ${file.nombre} no es posible cancelar su eliminación ya que está como documento adjunto.`,
      });
    }
    this.uploaderFilesService.updateValidatorFiles(this.files);
  }

  resetQueueUploader(){   
    this.files = []; 
    this.filesToDelete = []; 
    this.docsToUpload = [];  
    this.uploader?.clear();
  }

  showVisorPDF(event: any){   
    this.dialogVisorPDF = true;
    this.doc = event;
  }

  downloadDoc(event: any){
    this.uploaderFilesService.triggerDownloadDoc(event);
  }

}
