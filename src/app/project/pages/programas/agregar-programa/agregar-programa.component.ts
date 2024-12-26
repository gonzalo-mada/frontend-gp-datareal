import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { TableCrudService } from 'src/app/project/services/components/table-crud.service';
import { UploaderFilesService } from 'src/app/project/services/components/uploader-files.service';
import { Router } from '@angular/router';
import { ReglamentosMainService } from 'src/app/project/services/programas/reglamentos/main.service';
import { AgregarProgramaMainService } from 'src/app/project/services/programas/programas/agregar-programa/main.service';
import { BackendProgramasService } from 'src/app/project/services/programas/programas/backend.service';
import { FormProgramaService } from 'src/app/project/services/programas/programas/form.service';
import { MessageServiceGP } from 'src/app/project/services/components/message-service.service';

@Component({
  selector: 'app-agregar-programa',
  templateUrl: './agregar-programa.component.html',
  styleUrls: ['./agregar-programa.component.css']
})
export class AgregarProgramaComponent implements OnInit, OnDestroy {
  constructor(
    public agregarProgramaMainService: AgregarProgramaMainService,
    private backend: BackendProgramasService,
    public form: FormProgramaService,
    private messageService: MessageServiceGP,
    public reglamentosMainService: ReglamentosMainService,
    private router: Router,
    private tableCrudService: TableCrudService,
    private uploaderFilesService: UploaderFilesService 
  ){}

  get contentWrapperClass() {
    return this.agregarProgramaMainService.disposition ? 'col-12 lg:col-9' : 'col-12';
  }
  
  get sidebarClass() {
    return 'col-3';  
  }
  
  directores: any[] = [];
  directoresAlternos: any[] = [];
  
  confirmAddPrograma: boolean = false;
  showAsterisk: boolean = false;
  sidebarVisible2: boolean = false;

  
  private subscription: Subscription = new Subscription();


  ngOnInit(): void {
    this.subscription.add(this.form.fbForm.get('Director_selected')?.valueChanges.subscribe( (value) => {
      if (value !== '') {
        this.agregarProgramaMainService.haveDirectorAlterno()
      }
      
    }));
    this.agregarProgramaMainService.setModeCrud('create');

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.reset();
  }

  async searchDirector(tipo: string){
      if (tipo === 'director') {
        const inputRutDirector = this.form.fbForm.get('Director')!.value
        const rut_director = inputRutDirector.split('-')
        let result: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])},undefined,'director');
        if (result.length === 0 ) {
          //no se encontraron directores
          this.messageService.add({
            key: 'main',
            severity: 'warn',
            detail: `No se encontraron directores(as) con el RUT: ${inputRutDirector}.`
          });
          this.form.showTableDirectores = false;
        }else{
          this.directores = result;
          this.form.showTableDirectores = true;
        }
        
        
      }else{
        //tipo directoralterno
        const inputRutDirectorAlt = this.form.fbForm.get('Director_alterno')!.value
        const rut_director = inputRutDirectorAlt.split('-')
        let resultAlt: any[] = await this.backend.getDirector({rut: parseInt(rut_director[0])},undefined,'alterno');

        if (resultAlt.length === 0 ) {
          //no se encontraron directores
          this.messageService.add({
            key: 'main',
            severity: 'warn',
            detail: `No se encontraron directores(as) con el RUT: ${inputRutDirectorAlt}.`
          });
          this.form.showTableDirectoresAlternos = false;
        }else{
          this.directoresAlternos = resultAlt;
          this.form.showTableDirectoresAlternos = true;
        }
      }
  }

  chooseDocsMaestro(){
    this.tableCrudService.emitResetExpandedRowsTable();
    this.agregarProgramaMainService.chooseDocsMaestro();    
  }

  reset() {
    this.tableCrudService.resetSelectedRows();
    this.uploaderFilesService.resetValidatorFiles();
    this.uploaderFilesService.setAction('reset')
    this.uploaderFilesService.setFiles(null);
  }
  
  changeDisposition(){
    this.agregarProgramaMainService.disposition = !this.agregarProgramaMainService.disposition;
  }

  submit(){
    this.uploaderFilesService.setContext('select','programa','agregar-programa', 'Resumen_programa')
    this.confirmAddPrograma = true;
  }

  confirmAndSubmit(){
    this.openAccordion();
    this.agregarProgramaMainService.setModeCrud('insert');
  }


  redirectTo(value: 'p' | 'v' | 'c'){
    switch (value) {
      case 'p': this.router.navigate([`/programa/`]); break;
      case 'v': this.router.navigate([`/programa/show/${this.form.codProgramaAdded}`]); break;
      case 'c': 
        this.form.resetForm();
        this.agregarProgramaMainService.dialogSuccessAddPrograma = false;
      break;
    }
  }

  openAccordion(){
    this.uploaderFilesService.setFiles(null);
    this.tableCrudService.emitResetExpandedRowsTable();
  }

  stepChange(value: number){
    this.form.activeIndexStepper = value;
    this.form.activeIndexStateForm = value;
  }

  test(){
    Object.keys(this.form.fbForm.controls).forEach(key => {
      const control = this.form.fbForm.get(key);
      if (control?.invalid) {
        console.log(`Errores en ${key}:`, control.errors);
      }
    });
    console.log("VALORES FORMULARIO:",this.form.fbForm.value);
    this.form.getValuesSelected();
    this.form.getValuesIndex();
  }

  test2(){
    this.confirmAddPrograma = true
  }

  getStateClass(state: boolean): string {
    return state ? 'state-badge state-valid' : 'state-badge state-invalid';
  }

  getStateText(state: boolean): string {
    return state ? 'válido' : 'inválido';
  }

}
