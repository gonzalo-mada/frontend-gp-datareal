import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';

@Injectable({
  providedIn: 'root'
})
export class CategoriasTpService {

  constructor(private invoker: InvokerService) { }

  async bruto_getCategoriasTp(){
    return await this.invoker.httpInvoke('categorias-tp/bruto_getCategoriasTp');
  }

  async bruto_insertCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/bruto_insertCategoriaTp', params);
  }

  async bruto_updateCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/bruto_updateCategoriaTp', params);
  }

  async bruto_deleteCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/bruto_deleteCategoriaTp', {categoriasTpToDelete:params});
  }

  //logica
  async getCategoriasTp(){
    return await this.invoker.httpInvoke('categorias-tp/getCategoriasTp');
  }

  async insertCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/insertCategoriaTp', params);
  }

  async updateCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/updateCategoriaTp', params);
  }

  async deleteCategoriaTp(params: any){
    return await this.invoker.httpInvoke('categorias-tp/deleteCategoriaTp', {categoriasTpToDelete:params});
  }

}
