import { Component, OnInit, ViewChild, ChangeDetectorRef, AfterContentChecked } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { SideContainerComponent } from '../side-container/side-container.component';
import { SocketService } from '../../socket.service';
import { Router } from '@angular/router';
import { fromIterable } from 'rxjs/internal-compatibility';

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.css']
})

export class ToDoComponent implements OnInit, AfterContentChecked  {
  newTaskForm: FormGroup;
  newAgendaForm: FormGroup;
  @ViewChild('sideContainer', {static:false}) sideContainer: SideContainerComponent;
  container_name = "";
  agendaTaskHierarchy = []   
  commentConfig = {
    'commentFieldCopy': {"comment_text":""},
    'comments': [],
    'newComment': ""
  }

  taskConfig = {
    'taskFieldCopy': {"id":"",
                      "title":"",
                      "due_date":null,
                      "priority":null,
                      "task_status":"",
                      "description":"" },
    'taskCopied': false,
    'taskInactivityTime': null,
    'task_index': -1,
    'taskStatusOptions': [
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
      }],
    'priorityOptions': [
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
  }

  agendaConfig = {
    'agendaFieldCopy': {"id": "",
                        "name":"",
                        "agenda_status":""},
    'agendaCopied': false,
    'wantNewAgenda': false,
    'agendaInactivityTime': null,
    'agenda_index': -1,
    'agendaStatusOptions': [
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
  }

  constructor(private fb:FormBuilder, private socket:SocketService, 
              private changeDetector: ChangeDetectorRef, private router: Router) { }

  ngOnInit() {
    this.taskFormInit()
    this.agendaFormInit()

    // Get and display the initial view of the user's task organizer
    this.getAgendaTaskHierarchy()

    // Subscribe to the observable that allows view updates in multi-user task organizers
    this.socketServerEvtSub()
  }

  // Use this to check for changes and avoid the ExpressionChangedAfterItHasBeenChecked error
  //   --> The error occurs when typing the name of a new task and pressing enter
  //       Specifically when typing fast and pressing enter right after
  ngAfterContentChecked(): void {
    this.changeDetector.detectChanges();
  }

  taskFormInit() {
    // ngModel bound variables for when a new task/agenda is created
    this.newTaskForm = this.fb.group({
      newTitle: ['', [Validators.required]],
      newDate: [''],
      newPriority: ['']
    })
  }

  agendaFormInit() {
    this.newAgendaForm = this.fb.group({
      newAgendaName: ['', [Validators.required]]
    })
  }

  disconnect() {
    this.socket.disconnectSocket()
  }

  logOut() {
    this.router.navigate(['/'])
  }

  // GET HIERARCHY ........................................................
  // Retrieves values from database and saves it to todoList, which is then displayed by html file
  getAgendaTaskHierarchy() {
    let jsonPayload = {
      "endpoint": 'get_agenda_task_hierarchy',
      "httpMethod": "post",
      "type": 'getHierarchy',
      "payload": {}
    }
    this.socket.dataIn(jsonPayload).then((acknowledgement) => {
      console.log("Event emitted (getHierarchy) and back in component. Info received: ", acknowledgement)
      if (acknowledgement["errCode"] == 0) {
        this.agendaTaskHierarchy = acknowledgement["datarec"]
        console.log("Success in getHierarchy: ", acknowledgement)
      } else {
        console.log("Failure in getHierarchy: ", acknowledgement)
      }
    })
    .catch((err) => {
      console.error(err)
      alert("An error occurred")
    })
  }

  // SOCKET METHODS ........................................................
  // Subscription to socket observable to process received broadcasts and allow for multiuser updates
  socketServerEvtSub() {
    this.socket.evtResultObs.subscribe(
      (fromSocket) => {
        if (fromSocket == null || !(fromSocket.hasOwnProperty("type")) ) {
          return
        }
        let eventName = fromSocket.type
        console.log("fromSocket received in subscription:", fromSocket)
        console.log("eventName received in subscription: ", eventName)
        this.updateViewForEvt[eventName](fromSocket)
      },
      (err) => {
        console.error(err)
        alert("An error occurred")
      }
    );
  }

  // Events that are received in broadcast and view update functions that need to be run accordingly
  updateViewForEvt = {
    'taskAdded': (fromSocket) => {this.onNewTaskEvent(fromSocket)},
    'taskUpdated': (fromSocket) => {this.onUpdateTaskEvent(fromSocket)},
    'taskDeleted': (fromSocket) => {this.onDeleteTaskEvent(fromSocket)},
    'agendaAdded': (fromSocket) => {this.onNewAgendaEvent(fromSocket)},
    'agendaUpdated': (fromSocket) => {this.onUpdateAgendaEvent(fromSocket)},
    'agendaDeleted': (fromSocket) => {this.onDeleteAgendaEvent(fromSocket)},
    'commentAdded': (fromSocket) => {this.onNewCommentEvent(fromSocket)},
    'commentUpdated': (fromSocket) => {this.onUpdateCommentEvent(fromSocket)},
    'commentDeleted': (fromSocket) => {this.onDeleteCommentEvent(fromSocket)},
    'reconnected': (fromSocket) => {this.getAgendaTaskHierarchy()},
    'userDisconnect': (fromSocket) => {this.logOut()}
  }

  // New task added in another open tab, update self's view
  onNewTaskEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      this.agendaTaskHierarchy.find(i => i.id == fromSocket.datarec.task2agenda).tasks.push(fromSocket['datarec'])
      console.log("Success in updateViewNewTask: ", fromSocket)
    } else {
      console.log("Failure in updateViewNewTask: ", fromSocket)
    }
  }

  // Task updated in another open tab, update self's view
  onUpdateTaskEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let taskToUpdate = this.agendaTaskHierarchy.find(i => i.id == fromSocket.datarec.task2agenda).tasks.find(j => j.id == fromSocket.datarec.id)
      if (taskToUpdate) {
        Object.assign(taskToUpdate, fromSocket.datarec)
        console.log("Success in updateViewUpdateTask: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewUpdateTask: ", fromSocket)
    }
  }

  // Task deleted in another open tab, update self's view
  onDeleteTaskEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaIndex = this.agendaTaskHierarchy.findIndex(i => i.id == fromSocket.datarec.task2agenda)
      let taskIndex = this.agendaTaskHierarchy[agendaIndex].tasks.findIndex(j => j.id == fromSocket.datarec.id) 
      this.agendaTaskHierarchy[agendaIndex].tasks.splice(taskIndex,1)
      console.log("Success in updateViewDeleteTask: ", fromSocket)
    } else {
      console.log("Failure in updateViewDeleteTask: ", fromSocket)
    }
  }

  // New agenda added in another open tab, update self's view  
  onNewAgendaEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      this.agendaTaskHierarchy.unshift(fromSocket['datarec'])
      console.log("Success in updateViewNewAgenda: ", fromSocket)
    } else {
      console.log("Failure in updateViewNewAgenda: ", fromSocket)
    }
  }

  // Agenda updated in another open tab, update self's view
  onUpdateAgendaEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaToUpdate = this.agendaTaskHierarchy.find(i => i.id == fromSocket.datarec.id)
      if (agendaToUpdate) {
        Object.assign(agendaToUpdate, fromSocket.datarec)
        console.log("Success in updateViewUpdateAgenda: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewUpdateAgenda: ", fromSocket)
    }
  }

  // Agenda deleted in another open tab, update self's view
  onDeleteAgendaEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let agendaIndex = this.agendaTaskHierarchy.findIndex(i => i.id == fromSocket.datarec.id)
      this.agendaTaskHierarchy.splice(agendaIndex,1)
      console.log("Success in updateViewDeleteAgenda: ", fromSocket)
    } else {
      console.log("Failure in updateViewDeleteAgenda: ", fromSocket)
    }
  }

  // New comment added in another open tab, update self's view
  onNewCommentEvent(fromSocket) {
    if (fromSocket['errCode'] == 0 && this.agendaConfig.agenda_index != -1) { // i.e. some side container is/has been opened
      if (fromSocket["datarec"].comment2task == this.agendaTaskHierarchy[this.agendaConfig.agenda_index].tasks[this.taskConfig.task_index].id) {
        this.commentConfig.comments.push(fromSocket["datarec"])
        console.log("Success in updateViewNewComment: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewNewComment: ", fromSocket)
    }
  }

  // Comment updated in another open tab, update self's view
  onUpdateCommentEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let commentToUpdate = this.commentConfig.comments.find(c => c.id == fromSocket.datarec.id)
      if (commentToUpdate) {
        Object.assign(commentToUpdate, fromSocket.datarec)
        console.log("Success in updateViewUpdateComment: ", fromSocket)
      }
    } else {
      console.log("Failure in updateViewUpdateComment: ", fromSocket)
    }
  }

  // Comment deleted in another open tab, update self's view
  onDeleteCommentEvent(fromSocket) {
    if (fromSocket['errCode'] == 0) {
      let commentIndex = this.commentConfig.comments.findIndex(c => c.id == fromSocket.datarec.id)
      this.commentConfig.comments.splice(commentIndex, 1)
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
    return this.newAgendaForm.get('newAgendaName');
  }

  //......................................................................

  // TASK METHODS ........................................................
  // Used to display the input fields when new task button is clicked
  displayTaskInputs(agendaIndex) {
    this.agendaTaskHierarchy[agendaIndex].toggleNewTask = true;
  }

  // Sets the task input fields' values back to empty
  resetTaskInputs() {
    this.newTitle.setValue("");
    this.newDate.setValue("");
    this.newPriority.setValue("");
  }

  validateTaskForm() {
    return this.newTaskForm.valid
  }

  validateExistingTask(taskIndex, agendaIndex) {
    let task = this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex]
    if (task.title != '') {
      return true
    } else {
      this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].title = this.taskConfig.taskFieldCopy.title
      return false
    }
  }

  revertTaskToPreviousState(taskIndex, agendaIndex) {
    for (let key in this.taskConfig.taskFieldCopy) {
      this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex][key] = this.taskConfig.taskFieldCopy[key]
    }
  }

  makeUpdateTaskPayload(taskIndex, agendaIndex) {
    let payload = {"id": this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id}
    for (let key in this.taskConfig.taskFieldCopy) {
      if (this.taskConfig.taskFieldCopy[key] != this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex][key]) {
        payload[key] = this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex][key]
      }
    }
    return payload
  }

  // Used to create a new task, add it to the database and the frontend agendaTaskHierarchy 
  createTask(agendaIndex) {
    console.log("Focus out triggered --> Creating new task now")
    if (this.validateTaskForm()) {    // the title cannot be empty
      let payload = {
        "task2agenda": this.agendaTaskHierarchy[agendaIndex].id,
        "title": this.newTitle.value,
        ...((this.newDate.value != '') && {due_date: this.newDate.value}),
        ...((this.newPriority.value != '') && {priority: this.newPriority.value})  
      }
      let jsonNewTask = {
        "endpoint": 'task/create',
        "httpMethod": "post",
        "type": 'newTask',
        "payload": payload
      }
      this.socket.dataIn(jsonNewTask).then((acknowledgement) => {
        console.log("Event emitted (createTask) and back in component. Info received: ", acknowledgement)
        if (acknowledgement['errCode'] == 0) {
          this.agendaTaskHierarchy[agendaIndex].tasks.push(acknowledgement['datarec'])
          console.log("Success in createTask: ", acknowledgement)
        } else {
          console.log("Failure in createTask: ", acknowledgement)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
    // set fields to empty again and hide
    this.resetTaskInputs();
    this.agendaTaskHierarchy[agendaIndex].toggleNewTask = false;
  }


  // Used to update the given task, both in the database and frontend view  
  updateTask(taskIndex, agendaIndex) {
    console.log("Updating task id: ", this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id)
    // If the target task to edit and copied tasks do not have the same ids, return
    if (this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id != this.taskConfig.taskFieldCopy.id) { 
      console.log("Id of task copy != Id of update target")
      return
    }
    if (!this.validateExistingTask(taskIndex, agendaIndex)) {
      alert("Please enter a title for the task")
      return
    }
    // Add all the fields that were changed to the payload
    let payload = this.makeUpdateTaskPayload(taskIndex, agendaIndex)
    if (Object.keys(payload).length === 1) { // only id present, no fields were edited
      this.taskConfig.taskCopied = false
      return
    }
    let jsonPayload = {
      "endpoint": 'task/update',
      "httpMethod": "post",
      "type": 'updateTask',
      "payload": payload
    } 
    let errorOccurred = false
    this.socket.dataIn(jsonPayload).then((acknowledgement) => {
      console.log("Event emitted (updateTask) and back in component. Info received: ", acknowledgement)
      if (acknowledgement['errCode'] == 0) {
        console.log("Success in updateTask: ", acknowledgement)
      } else {
        console.log("Failure in updateTask: ", acknowledgement)
        errorOccurred = true
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
      this.revertTaskToPreviousState(taskIndex, agendaIndex)
    }
    this.taskConfig.taskCopied = false
  }


  // Used to delete the given task, remove from frontend and set as inactive in database
  deleteTask(taskIndex, agendaIndex) {
    var answer = confirm("Do you want to delete this task?");
    if (answer) {
      let id = this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id
      let payload = {"id": id}
      console.log("Deleting task id: ", id)
      let jsonPayload = {
        "endpoint":'task/delete',
        "httpMethod": "post",
        "type": 'deleteTask',
        "payload": payload
      }
      this.socket.dataIn(jsonPayload).then((acknowledgement) => {
        console.log("Event emitted (deleteTask) and back in component. Info received: ", acknowledgement)
        if (acknowledgement['errCode'] == 0) {
          // remove task from view
          this.agendaTaskHierarchy[agendaIndex].tasks.splice(taskIndex,1)
          console.log("Success in deleteTask: ", acknowledgement)
        } else {
          console.log("Failure in deleteTask: ", acknowledgement)
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
    console.log("Copying task id: ", this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id)
    if (this.taskConfig.taskCopied) { // Recopying task might set unsaved values as 'previous values' --> lose actual previous vals
      console.log("Task id was already copied: ", this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id)
      return
    }
    for (let key in this.taskConfig.taskFieldCopy) {
      this.taskConfig.taskFieldCopy[key] = this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex][key]
    }
    console.log("Final copy of task: ", this.taskConfig.taskFieldCopy)
    this.taskConfig.taskCopied = true
  }


  // Fetches comments and opens the side container for selected task
  //    Saves any previous unsaved changes made to the task before details button was clicked
  openDetails(taskIndex:number, agendaIndex:number) {
    // this.copyTask(taskIndex, agendaIndex)
    this.agendaConfig.agenda_index = agendaIndex;
    this.taskConfig.task_index = taskIndex;
    this.container_name = this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].title
    this.getAllComments(taskIndex, agendaIndex)
    if (this.taskConfig.taskCopied == true && this.taskConfig.taskFieldCopy.id != this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id){
      this.taskConfig.taskCopied = false
    }
    this.copyTask(taskIndex, agendaIndex)    //if task is already copied: fields except for description will get updated in next line
    this.updateTask(taskIndex, agendaIndex)  //    if task had not been previously copied: nothing to update --> update api will not be called
    setTimeout(() => {this.sideContainer.openContainer()})
    this.copyTask(taskIndex, agendaIndex)    //copying task again since clicking anywhere on sidecontainer will make task row lose focus
  }                                          //    --> clickedOutside triggered --> update api again unnecessarily


  // When a task field is clicked, it's going to change to edit mode. This fn turns the display into inputs and applies focus
  showAndFocus(agendaIndex, taskIndex, field, id) {
    this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex][field] = true
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
      this.focusAgendaFields(agendaIndex, nextField, nextFieldId)
    }
  }

  taskEventListeners = {
    "typing": (taskIndex, agendaIndex) => {this.onTaskKeyup(taskIndex, agendaIndex)},
    "enter": (taskIndex, agendaIndex) => {this.onTaskEnter(taskIndex, agendaIndex)},
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
    clearTimeout(this.taskConfig.taskInactivityTime)
    this.taskConfig.taskInactivityTime = setTimeout(() => {
      this.updateTask(taskIndex, agendaIndex)
      this.copyTask(taskIndex, agendaIndex)
    }, 2000)
  }
  //......................................................................

  // COMMENT METHODS .....................................................
  // Display input field for comments when new comment button is clicked
  displayCommentInput() {
    this.agendaTaskHierarchy[this.agendaConfig.agenda_index].tasks[this.taskConfig.task_index].wantNewComment = true;
  }

  validateExistingComment(commentIndex) {
    if (this.commentConfig.comments[commentIndex].comment_text != '') {
      return true
    } else {
      this.commentConfig.comments[commentIndex].comment_text = this.commentConfig.commentFieldCopy.comment_text
      return false
    }
  }

  getAllComments(taskIndex, agendaIndex) {
    let payload = {"comment2task": this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id}
    let jsonPayload = {
      "endpoint":'comment/get_all',
      "httpMethod": "post",
      "type": 'getComments',
      "payload": payload
    }
    this.socket.dataIn(jsonPayload).then((acknowledgement) => {
      console.log("Event emitted (comments_getAll) and back in component. Info received: ", acknowledgement)
      if (acknowledgement['errCode'] == 0) {
        this.commentConfig.comments = acknowledgement['datarec']
        console.log("Success in openDetails: ", acknowledgement)
      } else {
        console.log("Failure in openDetails: ", acknowledgement)
      }
    })
    .catch((err) => {
      console.error(err)
      alert("An error occurred")
    })
  }

  // Used to add a new comment to database and frontend
  addComment(taskIndex, agendaIndex) {
    if (this.commentConfig.newComment != "") {
      let commentToAdd = {"comment2task": this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex].id,
                          "comment_text": this.commentConfig.newComment }
      console.log("Adding a new comment for task id: ", commentToAdd.comment2task)
      let jsonPayload = {
        "endpoint":'comment/add',
        "httpMethod": "post",
        "type": 'newComment',
        "payload": commentToAdd
      }
      this.socket.dataIn(jsonPayload).then((acknowledgement) => {
        console.log("Event emitted (addComment) and back in component. Info received: ", acknowledgement)
        if (acknowledgement['errCode'] == 0) {
          this.commentConfig.comments.push(acknowledgement["datarec"])
          console.log("Success in addComment: ", acknowledgement)
        } else {
          console.log("Failure in addComment: ", acknowledgement)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
    }
    // Reset input to empty and hide
    this.commentConfig.newComment = "";
    this.agendaTaskHierarchy[this.agendaConfig.agenda_index].tasks[this.taskConfig.task_index].wantNewComment = false;
  }


  // Used to update a comment in database and frontend  
  updateComment(commentIndex) {
    if (!this.validateExistingComment(commentIndex)) {
      alert("Please enter text for comment")
      return
    }
    let payload = {"id":this.commentConfig.comments[commentIndex].id}
    console.log("Updating comment id: ", payload.id)
    if (this.commentConfig.commentFieldCopy.comment_text != this.commentConfig.comments[commentIndex].comment_text) {
      payload["comment_text"] = this.commentConfig.comments[commentIndex].comment_text
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
    this.socket.dataIn(jsonPayload).then((acknowledgement) => {
      console.log("Event emitted (updateComment) and back in component. Info received: ", acknowledgement)
      if (acknowledgement['errCode'] == 0) {
        console.log("Success in updateComment: ", acknowledgement)
      } else {
        errorOccurred = true
        console.log("Failure in updateComment: ", acknowledgement)
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
        this.commentConfig.comments[commentIndex].comment_text = this.commentConfig.commentFieldCopy.comment_text   
    }
  }


  // Used to delete the selected comment --> remove from frontend view and set inactive in database
  deleteComment(commentIndex) {
    var answer = confirm("Do you want to delete this comment?");
    if (answer) {
      let payload = {"id": this.commentConfig.comments[commentIndex].id}
      console.log("Deleting comment id: ", payload.id)
      let jsonPayload = {
        "endpoint":'comment/remove',
        "httpMethod": "post",
        "type": 'deleteComment',
        "payload": payload
      }
      this.socket.dataIn(jsonPayload).then((acknowledgement) => {
        console.log("Event emitted (deleteComment) and back in component. Info received: ", acknowledgement)
        if (acknowledgement['errCode'] == 0) {
          this.commentConfig.comments.splice(commentIndex, 1)
          console.log("Success in deleteComment: ", acknowledgement)
        } else {
          console.log("Failure in deleteComment: ", acknowledgement)
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
    console.log("Copying comment id: ", this.commentConfig.comments[commentIndex].id)
    for (let key in this.commentConfig.commentFieldCopy) {
      this.commentConfig.commentFieldCopy[key] = this.commentConfig.comments[commentIndex][key]
    }
    console.log("Final comment copy: ", this.commentConfig.commentFieldCopy)
  }
  //......................................................................


  // AGENDA METHODS ......................................................
  // Display agenda name input field when new agenda button clicked
  displayAgendaInputs() {
    this.agendaConfig.wantNewAgenda = true;
  }

  validateExistingAgenda(agendaIndex) {
    if (this.agendaTaskHierarchy[agendaIndex].name != '') {
      return true
    } else {
      this.agendaTaskHierarchy[agendaIndex].name = this.agendaConfig.agendaFieldCopy.name
      return false
    }
  }

  revertAgendaToPreviousState(agendaIndex) {
    for (let key in this.agendaConfig.agendaFieldCopy) {
      this.agendaTaskHierarchy[agendaIndex][key] = this.agendaConfig.agendaFieldCopy[key]
    }
  }

  makeUpdateAgendaPayload(agendaIndex) {
    let payload = {"id":this.agendaTaskHierarchy[agendaIndex].id}
    for (let key in this.agendaConfig.agendaFieldCopy) {
      if (this.agendaConfig.agendaFieldCopy[key] != this.agendaTaskHierarchy[agendaIndex][key]) {
        payload[key] = this.agendaTaskHierarchy[agendaIndex][key]
      }
    }
    return payload
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
      this.socket.dataIn(jsonPayload).then((acknowledgement) => {
        console.log("Event emitted (createAgenda) and back in component. Info received: ", acknowledgement)
        if (acknowledgement['errCode'] == 0) {          
          this.agendaTaskHierarchy.unshift(acknowledgement["datarec"])
          console.log("Success in createAgenda: ", acknowledgement)
        } else {
          console.log("Failure in createAgenda: ", acknowledgement)
        }
      })
      .catch((err) => {
        console.error(err)
        alert("An error occurred")
      })
      this.newAgendaName.setValue("");
    } 
    this.agendaConfig.wantNewAgenda = false;
  }


  // Used to update agenda fields in database and frontend
  updateAgenda(agendaIndex) {
    console.log("Updating agenda id: ", this.agendaTaskHierarchy[agendaIndex].id)
    if (this.agendaTaskHierarchy[agendaIndex].id != this.agendaConfig.agendaFieldCopy.id) {
      console.log("Id of agenda copy != Id of update target")
      return
    }
    if (!this.validateExistingAgenda(agendaIndex)) {
      alert("Please enter a name for the agenda")
      return
    }
    let payload = this.makeUpdateAgendaPayload(agendaIndex)
    if (Object.keys(payload).length === 1) { //only id present, no fields were edited
      this.agendaConfig.agendaCopied = false
      return
    }
    let jsonPayload = {
      "endpoint": 'agenda/update',
      "httpMethod": "post",
      "type": 'updateAgenda',
      "payload": payload
    }
    let errorOccurred = false
    this.socket.dataIn(jsonPayload).then((acknowledgement) => {
      console.log("Event emitted (updateAgenda) and back in component. Info received: ", acknowledgement)
      if (acknowledgement['errCode'] == 0) {
        console.log("Success in updateAgenda: ", acknowledgement)
      } else {
        errorOccurred = true
        console.log("Failure in updateAgenda: ", acknowledgement)
      }
    })
    .catch((err) => {
      console.error(err)
      errorOccurred = true
      alert("An error occurred")
    })
    if (errorOccurred) { //return edits to previous value
      this.revertAgendaToPreviousState(agendaIndex)
    }
    this.agendaConfig.agendaCopied = false
  }


  // Used to delete specified agenda --> remove from frontend and set inactive in database
  deleteAgenda(agendaIndex) {
    var answer = confirm("Do you want to delete this agenda?");
    if (answer) {
      let payload = {"id": this.agendaTaskHierarchy[agendaIndex].id}
      console.log("Deleting agenda id: ", payload.id)
      let jsonPayload = {
        "endpoint": 'agenda/delete',
        "httpMethod": "post",
        "type": 'deleteAgenda',
        "payload": payload
      }
      this.socket.dataIn(jsonPayload).then((acknowledgement) => {
        console.log("Event emitted (deleteAgenda) and back in component. Info received: ", acknowledgement)
        if (acknowledgement['errCode'] == 0) {
          this.agendaTaskHierarchy.splice(agendaIndex,1)
          console.log("Success in deleteAgenda: ", acknowledgement)
        } else {
          console.log("Failure in deleteAgenda: ", acknowledgement)
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
    console.log("Copying agenda id: ", this.agendaTaskHierarchy[agendaIndex].id)
    if (this.agendaConfig.agendaCopied) {
      return
    }
    for (let key in this.agendaConfig.agendaFieldCopy) {
      this.agendaConfig.agendaFieldCopy[key] = this.agendaTaskHierarchy[agendaIndex][key]
    }
    console.log("Final agenda copy: ", this.agendaConfig.agendaFieldCopy)
    this.agendaConfig.agendaCopied = true
  }


  // A check to make sure that side-container only exists if that agenda and task exist
  agendaExists(agendaIndex, taskIndex) {
    if (this.agendaTaskHierarchy[agendaIndex] && (this.agendaTaskHierarchy[agendaIndex].tasks.length > 0)) {
      if (this.agendaTaskHierarchy[agendaIndex].tasks[taskIndex]) {
        return true
      }
    }
    return false
  }

  // Apply focus on agenda field when it is clicked (go from display --> edit mode)
  focusAgendaFields(agendaIndex, field, id) {
    this.agendaTaskHierarchy[agendaIndex][field] = true
    setTimeout(() => {
        document.getElementById(id).focus()
      }
    )
  }

  agendaEventListeners = {
    "typing": (agendaIndex) => {this.onKeyup(agendaIndex)},
    "enter": (agendaIndex) => {this.onEnter(agendaIndex)},
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
    clearTimeout(this.agendaConfig.agendaInactivityTime)
    this.agendaConfig.agendaInactivityTime = setTimeout(() => {
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
