import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  socketUrl =  "http://localhost:5001/"  //"http://socket_server:5001/"
  apiUrl = "http://api_server:5000/" // "http://localhost:5000/"
  constructor() { }
}
