import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';


@Injectable({
  providedIn: 'root'
})
export class EstadoMaestroService {

  constructor(private invoker: InvokerService) { }

  async getEstadosMaestros(){
    return await this.invoker.httpInvoke('estado_maestro/getEstadosMaestros');
  }
    
}
