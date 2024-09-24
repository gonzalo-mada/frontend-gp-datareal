import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoriaTp } from 'src/app/project/models/CategoriaTp';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';
import { StateValidatorForm } from 'src/app/project/models/shared/StateValidatorForm';
import { CategoriasTpService } from 'src/app/project/services/categorias-tp.service';
import { generateMessage } from 'src/app/project/tools/utils/form.utils';

@Component({
  selector: 'app-form-categorias-tp',
  templateUrl: './form-categorias-tp.component.html',
  styles: [
  ]
})
export class FormCategoriasTpComponent implements OnInit, OnDestroy {
  
  constructor(public categoriasTpService: CategoriasTpService, 
    private fb: FormBuilder
  ){}

  namesCrud!: NamesCrud;
  categoriaTp: CategoriaTp = {};
  mode: string = '';
  private subscription: Subscription = new Subscription();

  get modeForm() {
    return this.categoriasTpService.modeForm;
  }

  public fbForm : FormGroup = this.fb.group({
    Descripcion_categoria: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
  })

  async ngOnInit() {
    this.namesCrud = {
      singular: 'categoría de tipo de programa',
      plural: 'categorías de tipos de programas',
      articulo_singular: 'la categoría de tipo de programa',
      articulo_plural: 'las categorías de tipos de programas',
      genero: 'femenino'
    };
    this.subscription.add(this.fbForm.statusChanges.subscribe(status => { this.categoriasTpService.stateForm = status as StateValidatorForm }))
    
    this.subscription.add(
      this.categoriasTpService.formUpdate$.subscribe( form => {
        if (form && form.mode) {
          if (form.data) {
            this.categoriaTp = {};
            this.categoriaTp = form.data
          }
          switch (form.mode) {
            case 'show': this.showForm(form.resolve! , form.reject!); break;
            case 'create': this.createForm(form.resolve! , form.reject!); break;
            case 'edit': this.editForm(form.resolve! , form.reject!); break;
            case 'insert': this.insertForm(form.resolve! , form.resolve!); break;
            case 'update': this.updateForm(form.resolve! , form.resolve!); break;
          }
        }
      })
    );

  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  createForm(resolve: Function, reject: Function){
    try {
      this.resetForm();
      resolve(true)
    } catch (error) {
      reject(error)
    }
  }

  showForm(resolve: Function, reject: Function){
    try {
      this.fbForm.patchValue({...this.categoriaTp});
      this.fbForm.get('Descripcion_categoria')?.disable();
      resolve(true)
    } catch (error) {
      reject(error)
    }
  }

  editForm(resolve: Function, reject: Function){
    try {
      this.resetForm();
      this.fbForm.patchValue({...this.categoriaTp});
      resolve(true);
    } catch (error) {
      reject(error)
    }
  }

  async insertForm(resolve: Function, reject: Function){
    try {
      let params = {
        Descripcion_categoria: this.fbForm.get('Descripcion_categoria')!.value,
      }
      const inserted = await this.categoriasTpService.insertCategoriaTp(params)
      if ( inserted.dataWasInserted ) {
        const messageGp = generateMessage(this.namesCrud, inserted.dataInserted , 'creado', true, false)
        resolve({success:true , dataInserted: inserted.dataInserted, messageGp})
        this.resetForm()
      }
    } catch (e:any) {
      reject(e)
      this.resetForm()
    }
  }

  async updateForm(resolve: Function, reject: Function){
    try {
      let params = {
        Cod_CategoriaTP: this.categoriaTp.Cod_CategoriaTP,
        Descripcion_categoria: this.fbForm.get('Descripcion_categoria')!.value,
      }
      const updated = await this.categoriasTpService.updateCategoriaTp(params)
      if ( updated.dataWasUpdated ) {
        const messageGp = generateMessage(this.namesCrud, null , 'actualizado', true, false)
        resolve({success:true , dataUpdated: updated.dataUpdated, messageGp})
        this.resetForm()
      }
    } catch (e:any) {
      reject(e)
      this.resetForm()
    }
  }

  resetForm(){
    this.fbForm.reset({
      Descripcion_categoria: '',
    });
    this.fbForm.get('Descripcion_categoria')!.enable();
  }


}
