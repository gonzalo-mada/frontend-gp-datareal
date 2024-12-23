import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonUtils } from 'src/app/base/tools/utils/common.utils';
import { DocMongo } from 'src/app/project/models/shared/DocMongo';

@Component({
  selector: 'app-dialog-visor-pdf',
  templateUrl: './dialog-visor-pdf.component.html',
  styles: [
  ]
})
export class DialogVisorPdfComponent implements OnChanges {
  
  @Input() visible: boolean = false;
  @Input() archivo!: DocMongo;
  @Input() id!: string;
  @Output() visibleChange = new EventEmitter<boolean>();

  constructor(private commonUtils : CommonUtils){}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['archivo'] && changes['archivo'].currentValue){
      console.log("archivo-->",this.archivo);
      
      setTimeout(() => {
        this.commonUtils.visorPDF(this.archivo.file, this.id, '800px', '100%', true);
      }, 100);
    }
  }

  download(){
    this.commonUtils.downloadBlob( this.fileToBlob(this.archivo) , this.archivo.data?.nombre!);
  }

  print() {
    if (this.archivo) {
      var iframe = document.getElementById(
        `pdfvisor_${this.id}`,
      ) as HTMLIFrameElement;
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    }
  }

  private fileToBlob(file: any) {
    if (this.archivo.data!.id) {
      return new Blob([file], { type: file.tipo });
    }else{
      return new Blob([file], { type: file.type });
    }
  }

  onChange(){
    this.visible == false ? true : false;
    this.visibleChange.emit(this.visible);
  }

}
