import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadinggpService {

  constructor() { }

  private loadingSubject = new Subject<object>();
  loading$ = this.loadingSubject.asObservable();

  loading(active: boolean, options?: any): void {
    var object = options != null ? options : {};
    object['active'] = active;
    this.loadingSubject.next(object);
  }
}
