import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})

export class MenuButtonsTableService {

    private actionClickButton = new Subject<'agregar' | 'eliminar' | 'historial'>();
    actionClickButton$ = this.actionClickButton.asObservable();

    constructor(){}

    emitClickButtonAgregar(){
        this.actionClickButton.next('agregar');
    }

    emitClickButtonLog(){
        this.actionClickButton.next('historial');
    }

    emitClickDeleteSelected(){
        this.actionClickButton.next('eliminar');
    }
}