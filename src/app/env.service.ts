import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class EnvService {
  socketUrl = "http://localhost:5000/"
  apiUrl = "http://localhost:5000/"
  constructor() { }
}
