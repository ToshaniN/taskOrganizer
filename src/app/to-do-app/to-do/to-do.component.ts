import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { SideContainerComponent } from '../side-container/side-container.component';
import { FlaskApiService } from '../../flask-api.service';
import { SocketService } from '../../socket.service';
import { EnvService } from '../../env.service';

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.css']
})

export class ToDoComponent implements OnInit {

  newTaskForm: FormGroup;
  wantNewAgenda = false;
  agendaFieldCopy = {"name":"",
                     "agenda_status":""};
  taskFieldCopy = {"id":"",
                   "title":"",
                   "due_date":null,
                   "priority":null,
                   "task_status":"",
                   "description":"" }
  commentFieldCopy = {"comment_text":""}
  agendaCopied = false;
  taskCopied = false
  comments = [];
  todoList = [{"id": null,
               "name": "",
               "agenda_status": "",
               "tasks": [
                  {
                      "id": null,
                      "task2agenda": null,
                      "title": "",
                      "due_date": null,
                      "priority": null,
                      "task_status": "",
                      "description": "",
                      "wantNewComment": false,
                      "titleEditing": false,
                      "dateEditing": false,
                      "priorityEditing": false,
                      "statusEditing": false,
                  }
                ],
                "wantNewTask": false,
                "nameEditing": false,
                "aStatusEditing": false,
              }];  
  

  agendaStatusOptions = [
    {
      "value" : "notStarted",
      "name" : "Not started"
    },
    {
      "value" : "onTrack",
      "name" : "On track"
    },    
    {
      "value" : "offTrack",
      "name" : "Off track"
    },
    {
      "value" : "onHold",
      "name" : "On hold"
    },
    {
      "value" : "complete",
      "name" : "Complete"
    }
  ]

  taskStatusOptions = [
    {
      "value": "open",
      "name": "Open"
    },
    {
      "value": "inDev",
      "name": "In development"
    },
    {
      "value": "readyQA",
      "name": "Ready for QA"
    },
    {
      "value": "inQA",
      "name": "In QA"
    },
    {
      "value": "done",
      "name": "Done"
    },
  ]

  priorityOptions = [
    {
      "value": "p1",
      "name": 1
    },
    {
      "value": "p2",
      "name": 2
    },
    {
      "value": "p3",
      "name": 3
    },
    {
      "value": "p4",
      "name": 4
    },
    {
      "value": "p5",
      "name": 5
    }
  ]

  //@Viewchild for side-container
  @ViewChild('details', {static:false}) details: SideContainerComponent;
  container_name = "";
  agenda_index = 0;
  task_index = 0;
  newComment="";

  agendaInactivityTime:any
  taskInactivityTime:any

  constructor(private fb:FormBuilder, private flask:FlaskApiService, private socket:SocketService, private env: EnvService) { }

  ngOnInit() {
    this.newTaskForm = this.fb.group({
      newTitle: ['', [Validators.required]],
      newDate: ['', [Validators.required]],
      newPriority: ['', [Validators.required]],
      newAgendaName: ['', [Validators.required]]
    })

    //Retrieves original view from database and saves it to the var that is displayed
      let jsonPayload = {
        "endpoint": 'get_agenda_task_hierarchy',
        "httpMethod": "post",
        "type": 'getHierarchy',
        "payload": {}
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Info received: ", fromSocket)
        this.todoList = fromSocket
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })

      
      // Subscription to socket to allow for multiuser updates
      this.subscribeToObs()
  }

// SOCKET METHODS ........................................................
  subscribeToObs() {
    this.socket.evtResultObs.subscribe({
      next: (fromSocket) => {
        if (fromSocket == null) {
          return
        }
        let eventName = fromSocket.type
        console.log("eventName = ", eventName)
        this.updateViewForEvt[eventName](fromSocket)
      },
      error: (err) => {
        console.error(err)
        alert("An error occurred")
      }
    });
  }

  updateViewForEvt = {
    'taskAdded': (fromSocket) => {this.updateViewNewTask(fromSocket)},
    'taskUpdated': (fromSocket) => {this.updateViewUpdateTask(fromSocket)},
    'taskDeleted': (fromSocket) => {this.updateViewDeleteTask(fromSocket)},
    'agendaAdded': (fromSocket) => {this.updateViewNewAgenda(fromSocket)},
    'agendaUpdated': (fromSocket) => {this.updateViewUpdateAgenda(fromSocket)},
    'agendaDeleted': (fromSocket) => {this.updateViewDeleteAgenda(fromSocket)},
    'commentAdded': (fromSocket) => {this.updateViewNewComment(fromSocket)},
    'commentUpdated': (fromSocket) => {this.updateViewUpdateComment(fromSocket)},
    'commentDeleted': (fromSocket) => {this.updateViewDeleteComment(fromSocket)},
  }


  updateViewNewTask(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      console.log("Success: " + JSON.stringify(fromSocket))
      this.todoList.find(i => i.id == fromSocket.datarec.task2agenda).tasks.push(fromSocket['datarec'])
      console.log("pushed datarec")
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewUpdateTask(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      console.log("Success: " + JSON.stringify(fromSocket))
      let taskToUpdate = this.todoList.find(i => i.id == fromSocket.datarec.task2agenda).tasks.find(j => j.id == fromSocket.datarec.id)
      Object.assign(taskToUpdate, fromSocket.datarec)
      console.log("pushed datarec")
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewDeleteTask(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      //hide inputs
      let agendaIndex = this.todoList.findIndex(i => i.id == fromSocket.datarec.task2agenda)
      let taskIndex = this.todoList[agendaIndex].tasks.findIndex(j => j.id == fromSocket.datarec.id) 
      this.todoList[agendaIndex].tasks.splice(taskIndex,1)
      console.log("Success: " + JSON.stringify(fromSocket))
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewNewAgenda(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      console.log("Success: " + JSON.stringify(fromSocket))
      this.todoList.push(fromSocket['datarec'])
      console.log("pushed datarec")
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewUpdateAgenda(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      console.log("Success: " + JSON.stringify(fromSocket))
      let agendaToUpdate = this.todoList.find(i => i.id == fromSocket.datarec.id)
      Object.assign(agendaToUpdate, fromSocket.datarec)
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewDeleteAgenda(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaIndex = this.todoList.findIndex(i => i.id == fromSocket.datarec.id)
      this.todoList.splice(agendaIndex,1)
      console.log("Success: " + JSON.stringify(fromSocket))
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewNewComment(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      console.log("Success: " + JSON.stringify(fromSocket))
      this.comments.push(fromSocket["datarec"])
      console.log("pushed datarec")
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewUpdateComment(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let comment_to_update = this.comments.find(c => c.id == fromSocket.datarec.id)
      Object.assign(comment_to_update, fromSocket.datarec)
      console.log("Success: " + JSON.stringify(fromSocket))
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

  updateViewDeleteComment(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let commentIndex = this.comments.findIndex(c => c.id == fromSocket.datarec.id)
      this.comments.splice(commentIndex, 1)
      console.log("Success: " + JSON.stringify(fromSocket))
    } else {
      console.log("Failure: " + JSON.stringify(fromSocket))
    }
  }

// .......................................................................
  
  //GET methods ..........................................................
  get newTitle() {
    return this.newTaskForm.get('newTitle');
  }

  get newDate() {
    return this.newTaskForm.get('newDate');
  }

  get newPriority() {
    return this.newTaskForm.get('newPriority');
  }

  get newAgendaName() {
    return this.newTaskForm.get('newAgendaName');
  }

  //......................................................................

  // TASK METHODS ........................................................
  displayTaskInputs(agendaIndex) {
    this.todoList[agendaIndex].wantNewTask = true;
  }

  resetTaskInputs() {
    this.newTitle.setValue("");
    this.newDate.setValue("");
    this.newPriority.setValue("");
  }

  createTask(agendaIndex) {
    console.log("focus out")
    if (this.newTitle.valid) {
      let payload = {
        "task2agenda": this.todoList[agendaIndex].id,
        "title": this.newTitle.value,
        ...(this.newDate.valid && {due_date: this.newDate.value}),
        ...(this.newPriority.valid && {priority: this.newPriority.value})  
      }
      let jsonNewTask = {
        "endpoint": 'task/create',
        "httpMethod": "post",
        "type": 'newTask',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonNewTask).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          console.log("Success: " + JSON.stringify(fromSocket))
          this.todoList[agendaIndex].tasks.push(fromSocket['datarec'])
          console.log("pushed datarec")
        } else {
          console.log("Failure: " + JSON.stringify(fromSocket))
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
    this.resetTaskInputs();
    this.todoList[agendaIndex].wantNewTask = false;
  }

  copyTask(taskIndex, agendaIndex) {
    if (this.taskCopied) {
      return
    }
    console.log("copying task id: ", this.todoList[agendaIndex].tasks[taskIndex].id)
    for (let key in this.taskFieldCopy) {
      this.taskFieldCopy[key] = this.todoList[agendaIndex].tasks[taskIndex][key]
    }
    console.log(JSON.stringify(this.taskFieldCopy))
    this.taskCopied = true
  }
  
  updateTask(taskIndex, agendaIndex) {
    console.log("Updating task id: ", this.todoList[agendaIndex].tasks[taskIndex].id)
    let payload = {"id":this.todoList[agendaIndex].tasks[taskIndex].id}
    if (payload.id != this.taskFieldCopy.id) {
      return
    }
    for (let key in this.taskFieldCopy) {
      if (key == 'title' && this.todoList[agendaIndex].tasks[taskIndex][key] == '') {
          alert("Please enter a title for the task")
          this.todoList[agendaIndex].tasks[taskIndex][key] = this.taskFieldCopy[key]
          return
      }
      if (this.taskFieldCopy[key] != this.todoList[agendaIndex].tasks[taskIndex][key]) {
        payload[key] = this.todoList[agendaIndex].tasks[taskIndex][key]
      }
    }
    if (Object.keys(payload).length === 1) { //only id present, no fields were edited
      this.taskCopied = false
      return
    }
    let jsonPayload = {
      "endpoint": 'task/update',
      "httpMethod": "post",
      "type": 'updateTask',
      "payload": payload
    }
    console.log(JSON.stringify(jsonPayload))
    let errorOccurred = false
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("event emitted and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success: " + JSON.stringify(fromSocket))
      } else {
        console.log("Failure: " + JSON.stringify(fromSocket))
        errorOccurred = true
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
      for (let key in this.taskFieldCopy) {
        this.todoList[agendaIndex].tasks[taskIndex][key] = this.taskFieldCopy[key]
      }
    }
    this.taskCopied = false
  }

  deleteTask(taskIndex, agendaIndex) {
    var answer = confirm("Do you want to delete this task?");
    if (answer) {
      let id = this.todoList[agendaIndex].tasks[taskIndex].id
      console.log("deleting task")
      let payload = {"id": id}
      let jsonPayload = {
        "endpoint":'task/delete',
        "httpMethod": "post",
        "type": 'deleteTask',
        "payload": payload
      }
      console.log(JSON.stringify(jsonPayload))
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          //hide inputs
          this.todoList[agendaIndex].tasks.splice(taskIndex,1)
          console.log("Success: " + JSON.stringify(fromSocket))
        } else {
          console.log("Failure: " + JSON.stringify(fromSocket))
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }    
  }

  openDetails(taskIndex:number, agendaIndex:number) {
    this.agenda_index = agendaIndex;
    this.task_index = taskIndex;
    this.container_name = this.todoList[this.agenda_index].tasks[this.task_index].title
    let payload = {"comment2task": this.todoList[agendaIndex].tasks[taskIndex].id}
    let jsonPayload = {
      "endpoint":'comment/get_all',
      "httpMethod": "post",
      "type": 'getComments',
      "payload": payload
    }
    console.log(JSON.stringify(jsonPayload))
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("event emitted and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success: " + JSON.stringify(fromSocket))
        this.comments = fromSocket['datarec']
      } else {
        console.log("Failure: " + JSON.stringify(fromSocket))
      }
    })
    .catch((err) => {
      console.error(err)
      alert("An error occurred")
    })
    if (this.taskCopied == true && this.taskFieldCopy.id != payload.comment2task){
      this.taskCopied = false
    }
    this.copyTask(taskIndex, agendaIndex)    //if task is already copied: fields except for description will get updated in next line
    this.updateTask(taskIndex, agendaIndex)  //    if task had not been previously copied --> nothing to update --> update api will not be called
    this.details.openContainer();
    this.copyTask(taskIndex, agendaIndex)    //copying task again since clicking anywhere on sidecontainer will make task row lose focus --> clickedOutside triggered --> update api again
  }

  showAndFocus(agendaIndex, taskIndex, field, id) {
    this.todoList[agendaIndex].tasks[taskIndex][field] = true
    console.log("Show and focus applied on -> field: " + field + " id: " + id)
    setTimeout(() => {
      document.getElementById(id).focus()});
  }

  tabToNext(tabPress, taskIndex, agendaIndex, nextField, nextFieldId) {
    console.log("tab pressed")
    tabPress.preventDefault()
    if (taskIndex != -1) {
      this.updateTask(taskIndex, agendaIndex)
      this.copyTask(taskIndex, agendaIndex)
      this.showAndFocus(agendaIndex, taskIndex, nextField, nextFieldId)
    } else {
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
      this.focusAFields(agendaIndex, nextField, nextFieldId)
    }
  }

  onTaskEnter(taskIndex, agendaIndex) {
    this.updateTask(taskIndex, agendaIndex)
    this.copyTask(taskIndex, agendaIndex)
  }

  onTaskKeyup(taskIndex, agendaIndex) {
    this.updateTaskWhileTyping(taskIndex, agendaIndex)
    this.updateTaskOnInactivity(taskIndex, agendaIndex)
  }

  updateTaskWhileTyping(taskIndex, agendaIndex) {
    console.log("while typing called")
    setTimeout(() => {
      console.log("CALLED FUNCS WHILE TYPING")
      this.updateTask(taskIndex, agendaIndex)
      this.copyTask(taskIndex, agendaIndex)
      }, 3000)
  } 

  updateTaskOnInactivity(taskIndex, agendaIndex) {
    console.log("On inactivity called")
    clearTimeout(this.taskInactivityTime)
    this.taskInactivityTime = setTimeout(() => {
      this.updateTask(taskIndex, agendaIndex)
      this.copyTask(taskIndex, agendaIndex)
    }, 2000)
  }
  //......................................................................

  // COMMENT METHODS .....................................................
  displayCommentInput() {
    this.todoList[this.agenda_index].tasks[this.task_index].wantNewComment = true;
  }

  addComment(taskIndex, agendaIndex) {
    if (this.newComment != "") {
      let commentToAdd = {"comment2task": this.todoList[agendaIndex].tasks[taskIndex].id,
                          "comment_text": this.newComment }
      ///
      let jsonPayload = {
        "endpoint":'comment/add',
        "httpMethod": "post",
        "type": 'newComment',
        "payload": commentToAdd
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          console.log("Success: " + JSON.stringify(fromSocket))
          this.comments.push(fromSocket["datarec"])
          console.log("pushed datarec")
        } else {
          console.log("Failure: " + JSON.stringify(fromSocket))
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
    this.newComment = "";
    this.todoList[this.agenda_index].tasks[this.task_index].wantNewComment = false;
  }

  copyComment(commentIndex) {
    console.log("copying comment")
    for (let key in this.commentFieldCopy) {
      this.commentFieldCopy[key] = this.comments[commentIndex][key]
    }
    console.log(JSON.stringify(this.commentFieldCopy))
  }

  updateComment(commentIndex) {
    let payload = {"id":this.comments[commentIndex].id}
    if (this.commentFieldCopy.comment_text != this.comments[commentIndex].comment_text) {
      payload["comment_text"] = this.comments[commentIndex].comment_text
    } else {
      return //nothing was changed
    }
    console.log("payload: " + JSON.stringify(payload))
    let errorOccurred = false
    ///
    let jsonPayload = {
      "endpoint":'comment/update',
      "httpMethod": "post",
      "type": 'updateComment',
      "payload": payload
    }
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("event emitted and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success: " + JSON.stringify(fromSocket))
      } else {
        errorOccurred = true
        console.log("Failure: " + JSON.stringify(fromSocket))
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
        this.comments[commentIndex].comment_text = this.commentFieldCopy.comment_text   
    }
  }

  deleteComment(commentIndex) {
    var answer = confirm("Do you want to delete this comment?");
    if (answer) {
      let payload = {"id": this.comments[commentIndex].id}
      let jsonPayload = {
        "endpoint":'comment/remove',
        "httpMethod": "post",
        "type": 'deleteComment',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          this.comments.splice(commentIndex, 1)
          console.log("Success: " + JSON.stringify(fromSocket))
        } else {
          console.log("Failure: " + JSON.stringify(fromSocket))
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
  }
  //......................................................................


  // AGENDA METHODS ......................................................
  displayAgendaInputs() {
    this.wantNewAgenda = true;
  }


  createAgenda() {
    if (this.newAgendaName.valid) {
      let payload = {"name": this.newAgendaName.value}
      let jsonPayload = {
        "endpoint": 'agenda/create',
        "httpMethod": "post",
        "type": 'newAgenda',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Agenda info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          console.log("Success: " + JSON.stringify(fromSocket))
          this.todoList.push(fromSocket['datarec'])
          console.log("pushed datarec")
        } else {
          console.log("Failure: " + JSON.stringify(fromSocket))
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
      this.newAgendaName.setValue("");
    } 
    this.wantNewAgenda = false;
  }


  copyAgenda(agendaIndex) {
    if (this.agendaCopied) {
      return
    }
    console.log("Copying the fields")
    this.agendaFieldCopy.name = this.todoList[agendaIndex].name
    this.agendaFieldCopy.agenda_status = this.todoList[agendaIndex].agenda_status
    console.log(JSON.stringify(this.agendaFieldCopy))
    this.agendaCopied = true
  }


  updateAgenda(agendaIndex) {
    console.log("Updating agenda")
    let payload = {"id":this.todoList[agendaIndex].id}
    for (let key in this.agendaFieldCopy) {
      if (key == 'name' && this.todoList[agendaIndex][key] == '') {
          alert("Please enter a name for the agenda")
          this.todoList[agendaIndex][key] = this.agendaFieldCopy[key]
          return
      }
      if (this.agendaFieldCopy[key] != this.todoList[agendaIndex][key]) {
        payload[key] = this.todoList[agendaIndex][key]
      }
    }
    if (Object.keys(payload).length === 1) { //only id present, no fields were edited
      this.agendaCopied = false
      return
    }
    let jsonPayload = {
      "endpoint": 'agenda/update',
      "httpMethod": "post",
      "type": 'updateAgenda',
      "payload": payload
    }
    let errorOccurred = false
    console.log(JSON.stringify(payload))
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("event emitted and back in component. Agenda info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success: " + JSON.stringify(fromSocket))
      } else {
        errorOccurred = true
        console.log("Failure: " + JSON.stringify(fromSocket))
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
      console.log("inside error if")
      for (let key in this.agendaFieldCopy) {
        this.todoList[agendaIndex][key] = this.agendaFieldCopy[key]
      }
    }
    this.agendaCopied = false
  }


  deleteAgenda(agendaIndex) {
    var answer = confirm("Do you want to delete this agenda?");
    if (answer) {
      let payload = {"id": this.todoList[agendaIndex].id}
      let jsonPayload = {
        "endpoint": 'agenda/delete',
        "httpMethod": "post",
        "type": 'deleteAgenda',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("event emitted and back in component. Agenda info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          this.todoList.splice(agendaIndex,1)
          console.log("Success: " + JSON.stringify(fromSocket))
        } else {
          console.log("Failure: " + JSON.stringify(fromSocket))
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
  }

  agendaExists(agendaIndex) {
    return this.todoList[agendaIndex] && this.todoList[agendaIndex].tasks
  }

  focusAFields(agendaIndex, field, id) {
    this.todoList[agendaIndex][field] = true
    console.log("Show and focus on field: " + field + " id: " + id)
    setTimeout(() => {
        document.getElementById(id).focus()
      }
    )
  }

  onEnter(agendaIndex) {
    this.updateAgenda(agendaIndex)
    this.copyAgenda(agendaIndex)
  }

  onKeyup(agendaIndex) {
    this.updateAgendaWhileTyping(agendaIndex)
    this.updateAgendaOnInactivity(agendaIndex)
  }

  updateAgendaOnInactivity(agendaIndex) {
    clearTimeout(this.agendaInactivityTime)
    this.agendaInactivityTime = setTimeout(() => {
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
    }, 1500)
  }
  
  updateAgendaWhileTyping(agendaIndex) {
    console.log("while typing called")
    setTimeout(() => {
      console.log("CALLED FUNCS WHILE TYPING")
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
    }, 3000)
  }

  //.....................................................................
}
