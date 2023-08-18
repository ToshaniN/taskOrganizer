import { Injectable } from '@angular/core';
import { EnvService } from './env.service';
import { io, Socket } from 'socket.io-client';
import { Subject } from 'rxjs';

export interface Payload {
  endpoint:string;
  httpMethod:string;
  type:string;
  payload:any;
}

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  io:Socket;
  evtResult: Subject<any> = new Subject<any>()
  evtResultObs = this.evtResult.asObservable();
  logoutDisconnect:Boolean
  events = {
    'socketEvents': ['connect', 'disconnect', 'error'],
    'customEvents': ['dataOut'],
    'managerEvents': ['reconnect_failed', 'reconnect', 'reconnect_error']
  }
  ioOptionsConfig = {'reconnection':true, 
                     'reconnectionDelay':1000, 
                     'reconnectionDelayMax':5000, 
                     'reconnectionAttempts':5, 
                     autoConnect: false}

  constructor(private env: EnvService) { 
    this.logoutDisconnect = false
  }

  // Initializes the socket, connects to it, and calls functions to set up the event listeners
  connectSocket() {
    this.io = io(this.env.socketUrl, this.ioOptionsConfig)
    console.log("io configured with url: ", this.env.socketUrl)
    this.io.connect()
    this.checkSocketEvents()
    this.checkCustomEvents()
    this.checkManagerEvents()
  }
  
  // Called on log out. Disconnects socket
  disconnectSocket() {
    this.logoutDisconnect = true
    this.io.disconnect()
    this.logoutDisconnect = false
  } 

  // Calls the functions that set listeners for socket, custom, and manager events
  checkSocketEvents() {
    for (let evt of this.events.socketEvents) {
      this.socketEvtHandler(evt)
    }
  }

  checkCustomEvents() {
    for (let evt of this.events.customEvents) {
      this.customEvtHandler(evt)
    }
  }

  checkManagerEvents() {
    for (let evt of this.events.managerEvents) {
      this.managerEvtsHandler(evt)
    }
  }

  // Sets up listeners for manager events
  managerEvtsHandler(eventName) {
    console.log('Listening for: ' + eventName)
    this.io.io.on(eventName, () => {
      this.managerEvtActions[eventName]()
    })
  }

  // Sets listeners for socket and custom events and adds the event + its data to observable
  customEvtHandler(eventName) {
    console.log('Listening for: ' + eventName)
    this.io.on(eventName, (data, callback) => {
      console.log("Event occurred: " + eventName)
      this.customEvtActions[eventName](data)
      this.evtResult.next(data)
      callback("Client has recieved the event: " + eventName)
    })
  }

  socketEvtHandler(eventName) {
    console.log('Listening for: ' + eventName)
    this.io.on(eventName, (data, callback) => {
      console.log("Event occurred: " + eventName)
      this.socketEvtActions[eventName](data)
      this.evtResult.next(data)
    })
  }

  // Emits events with given payload to the socket server and returns the response
  dataIn(payload:Payload) {
    return new Promise((resolve) => {
      console.log("Emmiting event")
      this.io.emit('dataIn', payload, (response) => {
        console.log("Response received from server in dataIn", response)
        resolve(response)
      })
    })
  }

  // All the events that are being monitored and the actions that need to be performed
  //     when they occur
  socketEvtActions = {
    'connect': () => {
      console.log("Connected to server")
    },
    'disconnect': (data) => {
      console.log("Disconnected from server: ", data)
      if (!this.logoutDisconnect) {
        alert("Reconnecting to server, do not make any new changes")
      } else {
        let disconnectEvt = {'type': 'userDisconnect', 'data': data}
        this.evtResult.next(disconnectEvt)
      }
    },
    'error': (err) => {
      console.error('Error encountered:', err);
    }
  }  

  customEvtActions = {
    'dataOut': (data) => {
      console.log("Data from socket --> received in service:" + JSON.stringify(data))
    }
  }

  managerEvtActions = {
    'reconnect': () => {
      alert("Reconnect successful. Changes made during disconnect may not be saved. Reloading page now.")
      let reconnectEvt = {'type': 'reconnected'}
      this.evtResult.next(reconnectEvt)
    },
    'reconnect_failed': () => {
      console.log('Could not reconnect to socket');
      alert("Could not reconnect, recent changes may not have been saved. Please reload the page.")
    },
    'reconnect_error': () => {
      console.log("Reconnect error occurred")
      // alert("An error occurred, recent changes may not have been saved. Please reload the page.")
    }
  }
}
