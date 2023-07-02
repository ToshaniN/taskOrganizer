import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import * as  io  from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {  

  socket:any;

  constructor(private env: EnvService) { 
    this.socket = io(this.env.socketUrl)

    //on connect:
    this.socket.on('connect',  () => {
      console.log('Connected to server');
    });

    //on disconnect:
    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    //on error:
    this.socket.on('error', (err) => {
      console.error('Error encountered:', err);
    });
  }


  public taskCreate(datarec): Observable<any> {
    let newTask: Subject<any> = new Subject<any>()
    this.socket.emit('newTask', datarec)
    this.socket.on('taskAdded', (data) => {
      console.log("Data from socket --> received in service:" + JSON.stringify(data))
      newTask.next(data)
    });
    return newTask.asObservable();
  }

  public agendaCreate(datarec): Observable<any> {
    let newAgenda: Subject<any> = new Subject<any>()
    this.socket.emit('newAgenda', datarec)
    this.socket.on('agendaAdded', (data) => {
      console.log("Data from socket --> received in service:" + JSON.stringify(data))
      newAgenda.next(data)
    });
    return newAgenda.asObservable();
  }

  
}
