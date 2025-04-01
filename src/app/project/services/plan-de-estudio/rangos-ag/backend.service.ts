import { Injectable } from '@angular/core';
import { InvokerService } from 'src/app/base/services/invoker.service';
import { ServiceUtils } from 'src/app/project/tools/utils/service.utils';
import { ErrorTemplateHandler } from 'src/app/base/tools/error/error.handler';
import { NamesCrud } from 'src/app/project/models/shared/NamesCrud';

@Injectable({
  providedIn: 'root'
})
export class BackendRangosAGService {

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

	async getPlanesDeEstudiosColumnaPorPrograma(params: any, loading = true) {
		try {
			return await this.invoker.httpInvoke(
				this.serviceUtils.generateServiceMongo('planesDeEstudio/getPlanesDeEstudiosColumnaPorPrograma', loading),
				params
			);
		} catch (error: any) {
			this.errorTemplateHandler.processError(error, {
				notifyMethod: 'alert',
				message: 'Hubo un error al obtener planes de estudios por programa seleccionado. Intente nuevamente.',
			});
		}
	}

	async getRangosAprobacionPorPlanDeEstudio(params: any, loading = true) {
		try {
			return await this.invoker.httpInvoke(
				this.serviceUtils.generateServiceMongo('rangoAprobacion/getRangosAprobacionPorPlanDeEstudio', loading),
				params
			);
		} catch (error: any) {
			this.errorTemplateHandler.processError(
				error, 
				{
					notifyMethod: 'alert',
					message: `Hubo un error al obtener rangos de aprobación por plan de estudio seleccionado. Intente nuevamente.`,
				}
			);
		}
	}

	async insertRangoAprobacion(params: any, namesCrud: NamesCrud) {
		try {
			const response = await this.serviceUtils.checkResponse(
				await this.invoker.httpInvoke('rangoAprobacion/insertRangoAprobacion', params),
				namesCrud
			);
			return response;
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

	async updateRangoAprobacion(params: any, namesCrud: NamesCrud) {
		try {
			const response = await this.serviceUtils.checkResponse(
				await this.invoker.httpInvoke('rangoAprobacion/updateRangoAprobacion', params),
				namesCrud
			);
			return response;
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

	async deleteRangoAprobacion(params: any, namesCrud: NamesCrud) {
		try {
			return await this.invoker.httpInvoke('rangoAprobacion/deleteRangoAprobacion', { rangoToDelete: params });
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