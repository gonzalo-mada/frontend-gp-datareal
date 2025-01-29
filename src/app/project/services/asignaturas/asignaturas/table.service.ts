import { Injectable } from '@angular/core';

interface Column {
    field: string;
    header: string;
    width: string;
    useMinWidth: boolean;
    getValue?: (data: any) => any;
}

@Injectable({
    providedIn: 'root'
})

export class TableAsignaturasService {

}