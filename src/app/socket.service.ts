import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import {io, Socket} from 'socket.io-client';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {  

  socket:any;
  io:Socket;
  evtResult: Subject<any> = new Subject<any>()
  evtResultObs = this.evtResult.asObservable();
  events = ['connect', 'disconnect', 'error', 'dataOut'] // 'taskAdded', 'taskUpdated', 'taskDeleted', 'agendaAdded'] 

  constructor(private env: EnvService) { 
    // this.socket.io.connect(this.env.socketUrl)
    this.io =  io(this.env.socketUrl)
    this.checkEvents()
  }

  checkEvents() {
    for (let evt of this.events) {
      console.log('Checking event: ' + evt)
      this.dataOut(evt)
    }
  }

  dataOut(eventName) {
    console.log('Listening for: ' + eventName)
    this.io.on(eventName, (data) => {
      console.log("event occurred: " + eventName)
      this.eventActions[eventName](data)
      this.evtResult.next(data)
    })
  }

  dataIn(payload) {
    // console.log("going to emit event")
    this.io.emit('dataIn', payload)
    console.log("event emitted to server")
  }

  eventActions = {
    'connect': () => {
      console.log("Connected to server")
    },
    'disconnect': () => {
      console.log("Disconnected from server")
    },
    'error': (err) => {
      console.error('Error encountered:', err);
    },
    'dataOut': (data) => {
      console.log("Data from socket --> received in service:" + JSON.stringify(data))
    }
    // 'taskAdded': (data) => {
    //   console.log("Data from socket --> received in service:" + JSON.stringify(data))
    // },
    // 'taskUpdated': (data) => {
    //   console.log("Data from socket --> received in service:" + JSON.stringify(data))
    // },
    // 'taskDeleted': (data) => {
    //   console.log("Data from socket --> received in service:" + JSON.stringify(data))
    // },
    // 'agendaAdded': (data) => {
    //   console.log("Data from socket --> received in service:" + JSON.stringify(data))
    // }
  }


  // public taskCreate(datarec): Observable<any> {
  //   let newTask: Subject<any> = new Subject<any>()
  //   this.socket.emit('newTask', datarec)
  //   this.socket.on('taskAdded', (data) => {
  //     console.log("Data from socket --> received in service:" + JSON.stringify(data))
  //     newTask.next(data)
  //   });
  //   return newTask.asObservable();
  // }

  // public agendaCreate(datarec): Observable<any> {
  //   let newAgenda: Subject<any> = new Subject<any>()
  //   this.socket.emit('newAgenda', datarec)
  //   this.socket.on('agendaAdded', (data) => {
  //     console.log("Data from socket --> received in service:" + JSON.stringify(data))
  //     newAgenda.next(data)
  //   });
  //   return newAgenda.asObservable();
  // }

  
}
