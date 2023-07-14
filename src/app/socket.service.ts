import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {  

  socket:any;
  io:Socket;
  evtResult: Subject<any> = new Subject<any>()
  evtResultObs = this.evtResult.asObservable();
  events = ['connect', 'disconnect', 'error', 'dataOut']  

  constructor(private env: EnvService) { 
    this.io =  io(this.env.socketUrl)
    this.checkEvents()
  }

  checkEvents() {
    for (let evt of this.events) {
      this.dataOut(evt)
    }
  }

  dataOut(eventName) {
    console.log('Listening for: ' + eventName)
    this.io.on(eventName, (data, callback) => {
      console.log("Event occurred: " + eventName)
      this.eventActions[eventName](data)
      this.evtResult.next(data)
      if (eventName != 'connect' && eventName != 'disconnect') {
        callback("Client has recieved the event: " + eventName)
      }
    })
  }

  dataIn(payload) {
    return new Promise((resolve) => {
      this.io.emit('dataIn', payload, (response) => {
        console.log("Response received from server in dataIn", response)
        resolve(response)
      })
    })
  }

  eventActions = {
    'connect': () => {
      console.log("Connected to server")
    },
    'disconnect': (data) => {
      console.log("Disconnected from server: ", data)
    },
    'error': (err) => {
      console.error('Error encountered:', err);
    },
    'dataOut': (data) => {
      console.log("Data from socket --> received in service:" + JSON.stringify(data))
    }
  }  
}
