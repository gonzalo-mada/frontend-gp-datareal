import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';

@Injectable({
  providedIn: 'root'
})
export class TiposprogramasService {

  constructor(private invoker: InvokerService) { }

  async bruto_getTiposProgramas(){
    return await this.invoker.httpInvoke('tiposprogramas/bruto_getTiposProgramas');
  }

  async bruto_insertTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/bruto_insertTipoPrograma', params);
  }

  async bruto_updateTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/bruto_updateTipoPrograma', params);
  }

  async bruto_deleteTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/bruto_deleteTipoPrograma', {tiposProgramasToDelete:params});
  }

  //LOGICA
  async getTiposProgramas(){
    return await this.invoker.httpInvoke('tiposprogramas/getTiposProgramas');
  }

  async insertTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/insertTipoPrograma', params);
  }

  async updateTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/updateTipoPrograma', params);
  }

  async deleteTipoPrograma(params: any){
    return await this.invoker.httpInvoke('tiposprogramas/deleteTipoPrograma', {tiposProgramasToDelete:params});
  }


}
