import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
  providedIn: 'root'
})
export class BackendParalelaSecuencialService {

	constructor(
		private errorTemplateHandler: ErrorTemplateHandler,
		private invoker: InvokerService,
		private serviceUtils: ServiceUtils
	) { }

	countTableRegisters(value: number, namesCrud: NamesCrud){
		this.serviceUtils.countTableValues(value,namesCrud);
	}

	async getProgramasPorFacultad(params: any, loading = true) {
		try {
			return await this.invoker.httpInvoke(
				this.serviceUtils.generateServiceMongo('programas/getProgramasPorFacultad', loading),
				params
			);
		} catch (error: any) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al obtener programas por facultad seleccionada. Intente nuevamente.'
			});
		}
	}

	async getPlanesDeEstudiosPorPrograma(params: any, loading = true) {
		try {
			return await this.invoker.httpInvoke(
				this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanesDeEstudiosPorPrograma', loading),
				params
			);
		} catch (error: any) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al obtener planes de estudios por programa seleccionado. Intente nuevamente.',
			});
		}
	}

	async getAsignaturasParalelaSecuencial(params: any, loading = true) {
        try {
            return await this.invoker.httpInvoke(
                this.serviceUtils.generateServiceMongo('paralela_secuencial/getAsignaturasParalelaSecuencial', loading),
                params
            );
        } catch (error: any) {
            this.errorTemplateHandler.processError(error, {
                notifyMethod: 'alert',
                message: 'Hubo un error al obtener asignaturas por paralelidad o secuencialidad seleccionada. Intente nuevamente.',
            });
        }
    }

	async getAsignaturasSecuencialesParalelasGrouped(params: any, loading = true) {
		try {
			return await this.invoker.httpInvoke(
				this.serviceUtils.generateServiceMongo('paralela_secuencial/getAsignaturasSecuencialesParalelasGrouped', loading),
				params
			);
		} catch (error: any) {
			this.errorTemplateHandler.processError(
				error, 
				{
					notifyMethod: 'alert',
					message: `Hubo un error al obtener asignaturas secuenciales y paralelas por plan de estudio seleccionado. Intente nuevamente.`,
				}
			);
		}
	}

	async insertParalelaSecuencial(params: any, namesCrud: NamesCrud) {
		try {
			return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('paralela_secuencial/insertParalelaSecuencial'),
                    params
                ),
                namesCrud
            );
		} catch (error: any) {
			this.errorTemplateHandler.processError(
				error, 
				{
				notifyMethod: 'alert',
				summary: `Error al agregar ${namesCrud.articulo_singular}.`,
				message: error?.message || error.detail.error.message.message
				}
			);
		}
	}

	async updateParalelaSecuencial(params: any, namesCrud: NamesCrud) {
		try {
			return this.serviceUtils.checkResponse(
                await this.invoker.httpInvoke(
                    this.serviceUtils.generateServiceMongo('paralela_secuencial/updateParalelaSecuencial'),
                    params
                ),
                namesCrud
            );
		} catch (error: any) {
			this.errorTemplateHandler.processError(
				error, 
				{
				notifyMethod: 'alert',
				summary: `Error al actualizar ${namesCrud.articulo_singular}.`,
				message: error?.message || error.detail.error.message.message
				}
			);
		}
	}

	async deleteParalelaSecuencial(params: any, namesCrud: NamesCrud) {
		try {
			return await this.invoker.httpInvoke('paralela_secuencial/deleteParalelaSecuencial', { paralelaSecuencialToDelete: params });
		} catch (error: any) {
			this.errorTemplateHandler.processError(
				error, 
				{
				notifyMethod: 'alert',
				summary: `Error al eliminar ${namesCrud.articulo_singular}.`,
				message: error?.message || error.detail.error.message.message
				}
			);
		}
	}

}