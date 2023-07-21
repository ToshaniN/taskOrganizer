import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
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

export class ToDoComponent implements OnInit, AfterContentChecked  {

  newTaskForm: FormGroup;
  wantNewAgenda = false;
  agendaFieldCopy = {"id": "",
                     "name":"",
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
  
  agendaInactivityTime:any
  taskInactivityTime:any

  //@Viewchild for side-container
  @ViewChild('details', {static:false}) details: SideContainerComponent;
  container_name = "";
  agenda_index = 0;
  task_index = 0;
  newComment="";

  // Options being displayed on view
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

  constructor(private fb:FormBuilder, private flask:FlaskApiService, private socket:SocketService, 
              private env: EnvService, private changeDetector: ChangeDetectorRef) { }

  ngOnInit() {
    // ngModel bound variables for when a new task/agenda is created
    this.newTaskForm = this.fb.group({
      newTitle: ['', [Validators.required]],
      newDate: ['', [Validators.required]],
      newPriority: ['', [Validators.required]],
      newAgendaName: ['', [Validators.required]]
    })

    // Get and display the initial view of the user's task organizer
    this.getHierarchy()

    // Subscribe to the observable that allows view updates in multi-user task organizers
    this.subscribeToObs()
  }

  // Use this to check for changes and avoid the ExpressionChangedAfterItHasBeenChecked error
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  // GET HIERARCHY ........................................................
  // Retrieves values from database and saves it to todoList, which is then displayed by html file
  getHierarchy() {
    let jsonPayload = {
      "endpoint": 'get_agenda_task_hierarchy',
      "httpMethod": "post",
      "type": 'getHierarchy',
      "payload": {}
    }
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("Event emitted (getHierarchy) and back in component. Info received: ", fromSocket)
      if (fromSocket["errCode"] == 0) {
        this.todoList = fromSocket["datarec"]
        console.log("Success in getHierarchy: ", fromSocket)
      } else {
        console.log("Failure in getHierarchy: ", fromSocket)
      }
      
    })
    .catch((err) => {
      console.error(err)
      alert("An error occurred")
    })
  }

  // SOCKET METHODS ........................................................
  // Subscription to socket observable to process received broadcasts and allow for multiuser updates
  subscribeToObs() {
    this.socket.evtResultObs.subscribe({
      next: (fromSocket) => {
        if (fromSocket == null || !(fromSocket.hasOwnProperty("errCode")) ) {
          return
        }
        let eventName = fromSocket.type
        console.log("fromSocket received in subscription:", fromSocket)
        console.log("eventName received in subscription: ", eventName)
        this.updateViewForEvt[eventName](fromSocket)
      },
      error: (err) => {
        console.error(err)
        alert("An error occurred")
      }
    });
  }

  // Events that are received in broadcast and view update functions that need to be run accordingly
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
    'reconnected': (fromSocket) => {this.getHierarchy()}
  }

  // New task added in another open tab, update self's view
  updateViewNewTask(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      this.todoList.find(i => i.id == fromSocket.datarec.task2agenda).tasks.push(fromSocket['datarec'])
      console.log("Success in updateViewNewTask: ", fromSocket)
    } else {
      console.log("Failure in updateViewNewTask: ", fromSocket)
    }
  }

  // Task updated in another open tab, update self's view
  updateViewUpdateTask(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let taskToUpdate = this.todoList.find(i => i.id == fromSocket.datarec.task2agenda).tasks.find(j => j.id == fromSocket.datarec.id)
      if (taskToUpdate) {
        Object.assign(taskToUpdate, fromSocket.datarec)
        console.log("Success in updateViewUpdateTask: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewUpdateTask: ", fromSocket)
    }
  }

  // Task deleted in another open tab, update self's view
  updateViewDeleteTask(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaIndex = this.todoList.findIndex(i => i.id == fromSocket.datarec.task2agenda)
      let taskIndex = this.todoList[agendaIndex].tasks.findIndex(j => j.id == fromSocket.datarec.id) 
      this.todoList[agendaIndex].tasks.splice(taskIndex,1)
      console.log("Success in updateViewDeleteTask: ", fromSocket)
    } else {
      console.log("Failure in updateViewDeleteTask: ", fromSocket)
    }
  }

  // New agenda added in another open tab, update self's view  
  updateViewNewAgenda(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      this.todoList.unshift(fromSocket['datarec'])
      console.log("Success in updateViewNewAgenda: ", fromSocket)
    } else {
      console.log("Failure in updateViewNewAgenda: ", fromSocket)
    }
  }

  // Agenda updated in another open tab, update self's view
  updateViewUpdateAgenda(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaToUpdate = this.todoList.find(i => i.id == fromSocket.datarec.id)
      if (agendaToUpdate) {
        Object.assign(agendaToUpdate, fromSocket.datarec)
        console.log("Success in updateViewUpdateAgenda: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewUpdateAgenda: ", fromSocket)
    }
  }

  // Agenda deleted in another open tab, update self's view
  updateViewDeleteAgenda(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaIndex = this.todoList.findIndex(i => i.id == fromSocket.datarec.id)
      this.todoList.splice(agendaIndex,1)
      console.log("Success in updateViewDeleteAgenda: ", fromSocket)
    } else {
      console.log("Failure in updateViewDeleteAgenda: ", fromSocket)
    }
  }

  // New comment added in another open tab, update self's view
  updateViewNewComment(fromSocket) {
    if (fromSocket['errCode'] == 0 && fromSocket["datarec"].comment2task == this.todoList[this.agenda_index].tasks[this.task_index].id) {
      this.comments.push(fromSocket["datarec"])
      console.log("Success in updateViewNewComment: ", fromSocket)
    } else {
      console.log("Failure in updateViewNewComment: ", fromSocket)
    }
  }

  // Comment updated in another open tab, update self's view
  updateViewUpdateComment(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let commentToUpdate = this.comments.find(c => c.id == fromSocket.datarec.id)
      if (commentToUpdate) {
        Object.assign(commentToUpdate, fromSocket.datarec)
        console.log("Success in updateViewUpdateComment: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewUpdateComment: ", fromSocket)
    }
  }

  // Comment deleted in another open tab, update self's view
  updateViewDeleteComment(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let commentIndex = this.comments.findIndex(c => c.id == fromSocket.datarec.id)
      this.comments.splice(commentIndex, 1)
      console.log("Success in updateViewDeleteComment: ", fromSocket)
    } else {
      console.log("Failure in updateViewDeleteComment: ", fromSocket)
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
  // Used to display the input fields when new task button is clicked
  displayTaskInputs(agendaIndex) {
    this.todoList[agendaIndex].wantNewTask = true;
  }

  // Sets the task input fields' values back to empty
  resetTaskInputs() {
    this.newTitle.setValue("");
    this.newDate.setValue("");
    this.newPriority.setValue("");
  }

  // Used to create a new task, add it to the database and the frontend todoList 
  createTask(agendaIndex) {
    console.log("Focus out triggered --> Creating new task now")
    if (this.newTitle.valid) {    // the title cannot be empty
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
        console.log("Event emitted (createTask) and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          this.todoList[agendaIndex].tasks.push(fromSocket['datarec'])
          console.log("Success in createTask: ", fromSocket)
        } else {
          console.log("Failure in createTask: ", fromSocket)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
    // set fields to empty again and hide
    this.resetTaskInputs();
    this.todoList[agendaIndex].wantNewTask = false;
  }


  // Used to update the given task, both in the database and frontend view  
  updateTask(taskIndex, agendaIndex) {
    console.log("Updating task id: ", this.todoList[agendaIndex].tasks[taskIndex].id)
    let payload = {"id":this.todoList[agendaIndex].tasks[taskIndex].id}
    // If the target task to edit and copied tasks do not have the same ids, return
    if (payload.id != this.taskFieldCopy.id) { 
      console.log("Id of task copy != Id of update target")
      return
    }
    // Add all the fields that were changed to the payload
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
    if (Object.keys(payload).length === 1) { // only id present, no fields were edited
      this.taskCopied = false
      return
    }
    let jsonPayload = {
      "endpoint": 'task/update',
      "httpMethod": "post",
      "type": 'updateTask',
      "payload": payload
    }
    let errorOccurred = false
    let fromSocket:any
    console.log("going to emit event")
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("Event emitted (updateTask) and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success in updateTask: ", fromSocket)
      } else {
        console.log("Failure in updateTask: ", fromSocket)
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


  // Used to delete the given task, remove from frontend and set as inactive in database
  deleteTask(taskIndex, agendaIndex) {
    var answer = confirm("Do you want to delete this task?");
    if (answer) {
      let id = this.todoList[agendaIndex].tasks[taskIndex].id
      let payload = {"id": id}
      console.log("Deleting task id: ", id)
      let jsonPayload = {
        "endpoint":'task/delete',
        "httpMethod": "post",
        "type": 'deleteTask',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("Event emitted (deleteTask) and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          // remove task from view
          this.todoList[agendaIndex].tasks.splice(taskIndex,1)
          console.log("Success in deleteTask: ", fromSocket)
        } else {
          console.log("Failure in deleteTask: ", fromSocket)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }    
  }


  // Copies the given task when it has focus. Copied values are compared to new values in
  //    updateTask to check which fields need to be sent in the payload
  copyTask(taskIndex, agendaIndex) {
    console.log("Copying task id: ", this.todoList[agendaIndex].tasks[taskIndex].id)
    if (this.taskCopied) { // Recopying task might set unsaved values as 'previous values' --> lose actual previous vals
      console.log("Task id was already copied: ", this.todoList[agendaIndex].tasks[taskIndex].id)
      return
    }
    for (let key in this.taskFieldCopy) {
      this.taskFieldCopy[key] = this.todoList[agendaIndex].tasks[taskIndex][key]
    }
    console.log("Final copy of task: ", this.taskFieldCopy)
    this.taskCopied = true
  }


  // Fetches comments and opens the side container for selected task
  //    Saves any previous unsaved changes made to the task before details button was clicked
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
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("Event emitted (comments_getAll) and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        this.comments = fromSocket['datarec']
        console.log("Success in openDetails: ", fromSocket)
      } else {
        console.log("Failure in openDetails: ", fromSocket)
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
    this.updateTask(taskIndex, agendaIndex)  //    if task had not been previously copied: nothing to update --> update api will not be called
    setTimeout(() => {this.details.openContainer()})
    this.copyTask(taskIndex, agendaIndex)    //copying task again since clicking anywhere on sidecontainer will make task row lose focus
  }                                          //    --> clickedOutside triggered --> update api again unnecessarily


  // When a task field is clicked, it's going to change to edit mode. This fn turns the display into inputs and applies focus
  showAndFocus(agendaIndex, taskIndex, field, id) {
    this.todoList[agendaIndex].tasks[taskIndex][field] = true
    setTimeout(() => {
      document.getElementById(id).focus()});
  }


  // Move from field to field for task/agenda
  tabToNext(tabPress, taskIndex, agendaIndex, nextField, nextFieldId) {
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

  // Update the task for any edited fields on enter
  onTaskEnter(taskIndex, agendaIndex) {
    this.updateTask(taskIndex, agendaIndex)
    this.copyTask(taskIndex, agendaIndex)
  }

  // Update task title on keyup events
  onTaskKeyup(taskIndex, agendaIndex) {
    this.updateTaskWhileTyping(taskIndex, agendaIndex)
    this.updateTaskOnInactivity(taskIndex, agendaIndex)
  }

  // Use a timeout to make regular updateTask calls while the user is typing
  updateTaskWhileTyping(taskIndex, agendaIndex) {
    console.log("updateTaskWhileTyping called")
    setTimeout(() => {
      console.log("Updating and copying task while typing")
      this.updateTask(taskIndex, agendaIndex)
      this.copyTask(taskIndex, agendaIndex)
      }, 3000)
  } 

  // Update the task on inactivity
  updateTaskOnInactivity(taskIndex, agendaIndex) {
    console.log("updateTaskOnInactivity called")
    clearTimeout(this.taskInactivityTime)
    this.taskInactivityTime = setTimeout(() => {
      this.updateTask(taskIndex, agendaIndex)
      this.copyTask(taskIndex, agendaIndex)
    }, 2000)
  }
  //......................................................................

  // COMMENT METHODS .....................................................
  // Display input field for comments when new comment button is clicked
  displayCommentInput() {
    this.todoList[this.agenda_index].tasks[this.task_index].wantNewComment = true;
  }

  // Used to add a new comment to database and frontend
  addComment(taskIndex, agendaIndex) {
    if (this.newComment != "") {
      let commentToAdd = {"comment2task": this.todoList[agendaIndex].tasks[taskIndex].id,
                          "comment_text": this.newComment }
      console.log("Adding a new comment for task id: ", commentToAdd.comment2task)
      let jsonPayload = {
        "endpoint":'comment/add',
        "httpMethod": "post",
        "type": 'newComment',
        "payload": commentToAdd
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("Event emitted (addComment) and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          this.comments.push(fromSocket["datarec"])
          console.log("Success in addComment: ", fromSocket)
        } else {
          console.log("Failure in addComment: ", fromSocket)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
    // Reset input to empty and hide
    this.newComment = "";
    this.todoList[this.agenda_index].tasks[this.task_index].wantNewComment = false;
  }


  // Used to update a comment in database and frontend  
  updateComment(commentIndex) {
    let payload = {"id":this.comments[commentIndex].id}
    console.log("Updating comment id: ", payload.id)
    if (this.commentFieldCopy.comment_text != this.comments[commentIndex].comment_text) {
      payload["comment_text"] = this.comments[commentIndex].comment_text
    } else {
      return //nothing was changed
    }
    let errorOccurred = false
    let jsonPayload = {
      "endpoint":'comment/update',
      "httpMethod": "post",
      "type": 'updateComment',
      "payload": payload
    }
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("Event emitted (updateComment) and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success in updateComment: ", fromSocket)
      } else {
        errorOccurred = true
        console.log("Failure in updateComment: ", fromSocket)
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


  // Used to delete the selected comment --> remove from frontend view and set inactive in database
  deleteComment(commentIndex) {
    var answer = confirm("Do you want to delete this comment?");
    if (answer) {
      let payload = {"id": this.comments[commentIndex].id}
      console.log("Deleting comment id: ", payload.id)
      let jsonPayload = {
        "endpoint":'comment/remove',
        "httpMethod": "post",
        "type": 'deleteComment',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("Event emitted (deleteComment) and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          this.comments.splice(commentIndex, 1)
          console.log("Success in deleteComment: ", fromSocket)
        } else {
          console.log("Failure in deleteComment: ", fromSocket)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
  }


  // Copy specified comment --> used to compare with new values in updateComment
  copyComment(commentIndex) {
    console.log("Copying comment id: ", this.comments[commentIndex].id)
    for (let key in this.commentFieldCopy) {
      this.commentFieldCopy[key] = this.comments[commentIndex][key]
    }
    console.log("Final comment copy: ", this.commentFieldCopy)
  }
  //......................................................................


  // AGENDA METHODS ......................................................
  // Display agenda name input field when new agenda button clicked
  displayAgendaInputs() {
    this.wantNewAgenda = true;
  }
  
  // Used to add an agenda in the database and frontend
  createAgenda() {
    if (this.newAgendaName.valid) {
      console.log("Creating new agenda")
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
        console.log("Event emitted (createAgenda) and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {          
          this.todoList.unshift(fromSocket["datarec"])
          console.log("Success in createAgenda: ", fromSocket)
        } else {
          console.log("Failure in createAgenda: ", fromSocket)
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


  // Used to update agenda fields in database and frontend
  updateAgenda(agendaIndex) {
    let payload = {"id":this.todoList[agendaIndex].id}
    console.log("Updating agenda id: ", payload.id)
    if (payload.id != this.agendaFieldCopy.id) {
      console.log("Id of agenda copy != Id of update target")
      return
    }
    console.log(this.agendaFieldCopy)
    for (let key in this.agendaFieldCopy) {
      if (key == 'name' && this.todoList[agendaIndex][key] == '') {
          alert("Please enter a name for the agenda")
          this.todoList[agendaIndex][key] = this.agendaFieldCopy[key]
          return
      }
      // Add all edited fields to payload
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
    let fromSocket:any
    this.socket.dataIn(jsonPayload).then((reply) => {
      fromSocket = reply
      console.log("Event emitted (updateAgenda) and back in component. Info received: ", fromSocket)
      if (fromSocket['errCode'] == 0) {
        console.log("Success in updateAgenda: ", fromSocket)
      } else {
        errorOccurred = true
        console.log("Failure in updateAgenda: ", fromSocket)
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
      for (let key in this.agendaFieldCopy) {
        this.todoList[agendaIndex][key] = this.agendaFieldCopy[key]
      }
    }
    this.agendaCopied = false
  }


  // Used to delete specified agenda --> remove from frontend and set inactive in database
  deleteAgenda(agendaIndex) {
    var answer = confirm("Do you want to delete this agenda?");
    if (answer) {
      let payload = {"id": this.todoList[agendaIndex].id}
      console.log("Deleting agenda id: ", payload.id)
      let jsonPayload = {
        "endpoint": 'agenda/delete',
        "httpMethod": "post",
        "type": 'deleteAgenda',
        "payload": payload
      }
      let fromSocket:any
      this.socket.dataIn(jsonPayload).then((reply) => {
        fromSocket = reply
        console.log("Event emitted (deleteAgenda) and back in component. Info received: ", fromSocket)
        if (fromSocket['errCode'] == 0) {
          this.todoList.splice(agendaIndex,1)
          console.log("Success in deleteAgenda: ", fromSocket)
        } else {
          console.log("Failure in deleteAgenda: ", fromSocket)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
  }


  // Copy the given agenda. Use as 'previous values' in updateAgenda to check which fields 
  //     were updated.
  copyAgenda(agendaIndex) {
    console.log("Copying agenda id: ", this.todoList[agendaIndex].id)
    if (this.agendaCopied) {
      return
    }
    for (let key in this.agendaFieldCopy) {
      this.agendaFieldCopy[key] = this.todoList[agendaIndex][key]
    }
    console.log("Final agenda copy: ", this.agendaFieldCopy)
    this.agendaCopied = true
  }


  // A check to make sure that side-container only exists if that agenda and task exist
  agendaExists(agendaIndex, taskIndex) {
    if (this.todoList[agendaIndex] && (this.todoList[agendaIndex].tasks.length > 0)) {
      if (this.todoList[agendaIndex].tasks[taskIndex]) {
        return true
      }
    }
    return false
  }

  // Apply focus on agenda field when it is clicked (go from display --> edit mode)
  focusAFields(agendaIndex, field, id) {
    this.todoList[agendaIndex][field] = true
    setTimeout(() => {
        document.getElementById(id).focus()
      }
    )
  }

  // Update changed agenda fields on enter
  onEnter(agendaIndex) {
    this.updateAgenda(agendaIndex)
    this.copyAgenda(agendaIndex)
  }

  // Update agenda name on keyups
  onKeyup(agendaIndex) {
    this.updateAgendaWhileTyping(agendaIndex)
    this.updateAgendaOnInactivity(agendaIndex)
  }

  // Update agenda on inactivity
  updateAgendaOnInactivity(agendaIndex) {
    console.log("updateAgendaOnInactivity called")
    clearTimeout(this.agendaInactivityTime)
    this.agendaInactivityTime = setTimeout(() => {
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
    }, 1500)
  }
  
  // Update agenda name regularly while user is typing
  updateAgendaWhileTyping(agendaIndex) {
    console.log("updateAgendaWhileTyping called")
    setTimeout(() => {
      console.log("Updating and copying while typing")
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
    }, 3000)
  }
  //.....................................................................
}
