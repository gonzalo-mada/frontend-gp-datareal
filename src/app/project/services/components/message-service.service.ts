import { Injectable } from '@angular/core';
import { Message, MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class MessageServiceGP{

    constructor(private messageService: MessageService){}

    add(message: Message){
        this.messageService.add(message);
    }

    clear(){
        this.messageService.clear();
    }

}