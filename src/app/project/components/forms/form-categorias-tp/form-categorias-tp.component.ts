import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CategoriaTp } from 'src/app/project/models/CategoriaTp';
import { ActionsCrudService } from 'src/app/project/services/actions-crud.service';
import { CategoriasTpService } from 'src/app/project/services/categorias-tp.service';

@Component({
  selector: 'app-form-categorias-tp',
  templateUrl: './form-categorias-tp.component.html',
  styles: [
  ]
})
export class FormCategoriasTpComponent implements OnInit, OnDestroy {

  categoriaTp: CategoriaTp = {};
  mode: string = '';
  private subscription: Subscription = new Subscription();

  public fbForm : FormGroup = this.fb.group({
    Descripcion_categoria: ['', [Validators.required , Validators.pattern(/^(?!\s*$).+/)]],
  })

  constructor(private actionsCrudService: ActionsCrudService, private categoriasTpService: CategoriasTpService, private fb: FormBuilder){}
  
  async ngOnInit() {
    this.subscription.add(
      this.actionsCrudService.actionForm$.subscribe( action => {
        if (action) {          
          this.mode = action.mode
          this.categoriaTp = action.data
          switch (action.mode) {
            case 'show':
              this.showForm(action)
            break;
            case 'create':
              this.createForm(action)
            break;
            case 'edit':
              this.editForm(action)
            break;
            case 'insert':        
              this.insertForm(action)
            break;
            case 'update':
              this.updateForm(action)
            break;
            case 'reset':
              this.resetForm()
            break;
          }
        }
      })
    )
    this.subscription.add(this.fbForm.statusChanges.subscribe( status => {
      this.actionsCrudService.triggerStatusForm(status);
    }))
  }


  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.actionsCrudService.triggerFormAction(null);
  }

  showForm(event: any){
    const { resolve , reject } = event;
    this.fbForm.patchValue({
      Descripcion_categoria: this.categoriaTp.Descripcion_categoria,
    })
    this.fbForm.get('Descripcion_categoria')?.disable();
    resolve({success:true})
  }

  editForm(event: any){
    this.resetForm()
    const { resolve , reject } = event;
    this.fbForm.patchValue({
      Descripcion_categoria: this.categoriaTp.Descripcion_categoria,
    })
    resolve({success:true})
  }

  async insertForm(event: any){
    const { resolve , reject } = event;
    try {
      let params = {
        Descripcion_categoria: this.fbForm.get('Descripcion_categoria')!.value,
      }
      const inserted = await this.categoriasTpService.insertCategoriaTp(params)
      if ( inserted.dataWasInserted ) {
        resolve({success:true , dataInserted: inserted.dataInserted})
        this.resetForm()
      }
    } catch (e:any) {
      reject(e)
      this.resetForm()
    }
  }

  async updateForm(event: any){
    const { resolve , reject } = event;
    try {
      let params = {
        Cod_CategoriaTP: this.categoriaTp.Cod_CategoriaTP,
        Descripcion_categoria: this.fbForm.get('Descripcion_categoria')!.value,
      }
      const updated = await this.categoriasTpService.updateCategoriaTp(params)
      if ( updated.dataWasUpdated ) {
        resolve({success:true , dataUpdated: updated.dataUpdated})
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
    // this.actionsCrudService.triggerFormAction(null);
  }

  createForm(event: any){
    const { resolve } = event;
    this.resetForm();
    resolve({success:true});
  }
}
