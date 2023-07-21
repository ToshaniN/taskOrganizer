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
  events = {
    'socketEvents': ['connect', 'disconnect', 'error'],
    'customEvents': ['dataOut'],
    'managerEvents': ['reconnect_failed', 'reconnect']
  }

  constructor(private env: EnvService) { 
    this.io =  io(this.env.socketUrl, {'reconnection':true, 'reconnectionDelay':1000, 'reconnectionDelayMax':5000, 'reconnectionAttempts':5})
    // These functions go through all the events in the dictionary to set up listeners for them
    this.checkEvents(this.events.socketEvents)
    this.checkEvents(this.events.customEvents)
    this.checkManagerEvents()
  }

  // Calls the function that sets listeners for socket and custom events
  checkEvents(events) {
    for (let evt of events) {
      this.dataOut(evt)
    }
  }

  // Calls the function that sets listeners for manager events
  checkManagerEvents() {
    for (let evt in this.events.managerEvents) {
      this.managerEvtsHandler(evt)
    }
  }

  // Sets up listeners for manager events
  managerEvtsHandler(eventName) {
    this.io.io.on(eventName, () => {
      this.eventActions[eventName]('nothing')
    })
  }

  // Sets listeners for socket and custom events and adds the event + its data to observable
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

  // Emits events with given payload to the socket server and returns the response
  dataIn(payload) {
    return new Promise((resolve) => {
      this.io.emit('dataIn', payload, (response) => {
        console.log("Response received from server in dataIn", response)
        resolve(response)
      })
    })
  }

  // All the events that are being monitored and the actions that need to be performed
  //     when they occur
  eventActions = {
    'connect': () => {
      console.log("Connected to server")
    },
    'disconnect': (data) => {
      console.log("Disconnected from server: ", data)
      alert("Reconnecting to server, do not make any new changes")
    },
    'error': (err) => {
      console.error('Error encountered:', err);
    },
    'dataOut': (data) => {
      console.log("Data from socket --> received in service:" + JSON.stringify(data))
    },
    'reconnect': () => {
      alert("Reconnect successful. Changes made during disconnect may not be saved. Reloading page now.")
      let reconnectEvt = {'type': 'reconnected'}
      this.evtResult.next(reconnectEvt)
    },
    'reconnect_failed': () => {
      console.log('Could not reconnect to socket');
      alert("An error occurred, recent changes may not have been saved. Please reload the page.")
    }
  }  
}
