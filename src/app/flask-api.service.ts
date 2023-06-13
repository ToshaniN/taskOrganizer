import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FlaskApiService {
  baseUrl:string = "http://localhost:5000/";

  constructor(private httpClient : HttpClient) { }

  // TASK CRUD ...........................................................
  public createTask(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'task/create', details)
  }

  public updateTask(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'task/update', details)
  }

  public deleteTask(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'task/delete', details)
  }

  
  // AGENDA CRUD .........................................................
  public createAgenda(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'agenda/create', details)
  }

  public updateAgenda(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'agenda/update', details)
  }

  public deleteAgenda(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'agenda/delete', details)
  }

  
  // COMMENT CRUD .........................................................
  public addComment(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'comment/add', details)
  }

  public updateComment(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'comment/update', details)
  }

  public removeComment(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'comment/remove', details)
  }

  public getComments(details:any): Observable<any> {
    return this.httpClient.post(this.baseUrl+'comment/get_all', details)
  }
  
  // GET HIERARCHY .........................................................
  public getHeirarchy(): Observable<any> {
    return this.httpClient.post(this.baseUrl+'get_agenda_task_hierarchy', null)
  }

}
