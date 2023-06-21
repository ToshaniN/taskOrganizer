import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { SideContainerComponent } from '../side-container/side-container.component';
import { FlaskApiService } from '../../flask-api.service';
// import { debounce } from 'lodash'
import { Observable, Subscription, fromEvent, interval} from 'rxjs'
import { debounceTime, distinctUntilChanged } from 'rxjs/operators'

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.css']
})

export class ToDoComponent implements OnInit, OnDestroy {

  newTaskForm: FormGroup;
  wantNewAgenda = false;
  agendaFieldCopy = {"name":"",
                     "agenda_status":""};
  taskFieldCopy = {"title":"",
                   "due_date":null,
                   "priority":null,
                   "task_status":"",
                   "description":"" }
                   commentFieldCopy = {"comment_text":""}
  agendaCopied = false;
  taskCopied = false

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
                      "statusEditing": false
                  }
                ],
                "wantNewTask": false,
                "nameEditing": false,
                "aStatusEditing": false
              }];  
  comments = [];

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
  typing:Subscription

  constructor(private fb:FormBuilder, private flask:FlaskApiService) { 
  // this.updateAgendaOnKeyup = debounce(this.updateAgendaOnKeyup, 1500)
  }

  ngOnInit() {
    this.newTaskForm = this.fb.group({
      newTitle: ['', [Validators.required]],
      newDate: ['', [Validators.required]],
      newPriority: ['', [Validators.required]],
      newAgendaName: ['', [Validators.required]]
    })

    //Retrieves original view from database and saves it to the var that is displayed
    this.flask.getHeirarchy()
      .subscribe({
        next: (data) => {
          this.todoList = data
        },
        error: (err) => {
          console.error(err)
          alert("An error occurred")
        }
      });      
  }

  ngOnDestroy() {
    if (this.typing) {
      this.typing.unsubscribe();
    }
  }
  
  //GET methods
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
      let jsonNewTask = {
        "task2agenda": this.todoList[agendaIndex].id,
        "title": this.newTitle.value,
        ...(this.newDate.valid && {due_date: this.newDate.value}),
        ...(this.newPriority.valid && {priority: this.newPriority.value})  
      }
      this.flask.createTask(jsonNewTask)
      .subscribe({
        next: (data) => {
          if (data['errCode'] == 0) {
            console.log("Success: " + JSON.stringify(data))
            this.todoList[agendaIndex].tasks.push(data['datarec'])
            console.log("pushed datarec")
          } else {
            console.log("Failure: " + JSON.stringify(data))
          }
        },
        error: (err) => {
          console.error(err)
          alert("An error occurred")
        }
      });
    }
    this.resetTaskInputs();
    this.todoList[agendaIndex].wantNewTask = false;
  }

  copyTask(taskIndex, agendaIndex) {
    if (this.taskCopied) {
      return
    }
    console.log("copying task")
    for (let key in this.taskFieldCopy) {
      this.taskFieldCopy[key] = this.todoList[agendaIndex].tasks[taskIndex][key]
    }
    console.log(JSON.stringify(this.taskFieldCopy))
    this.taskCopied = true
  }
  
  updateTask(taskIndex, agendaIndex) {
    console.log("Updating task")
    let payload = {"id":this.todoList[agendaIndex].tasks[taskIndex].id}
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
    console.log(JSON.stringify(payload))
    let errorOccurred = false
    this.flask.updateTask(payload)
    .subscribe({
      next: (data) => {
        if (data['errCode'] == 0) {
          console.log("Success: " + JSON.stringify(data))
        } else {
          console.log("Failure: " + JSON.stringify(data))
          errorOccurred = true
        }
      },
      error: (err) => {
        console.error(err)
        errorOccurred = true
        alert("An error occurred")
      }
    });
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
      let jsonPayload = {"id": id}
      console.log(JSON.stringify(jsonPayload))
      this.flask.deleteTask(jsonPayload)
        .subscribe({
          next: (data) => {
            if (data['errCode'] == 0) {
              //hide inputs
              this.todoList[agendaIndex].tasks.splice(taskIndex,1)
              console.log("Success: " + JSON.stringify(data))
            } else {
              console.log("Failure: " + JSON.stringify(data))
            }
          },
          error: (err) => {
            console.error(err)
            alert("An error occurred")
          }
        });
    }    
  }

  openDetails(taskIndex:number, agendaIndex:number) {
    this.agenda_index = agendaIndex;
    this.task_index = taskIndex;
    this.container_name = this.todoList[this.agenda_index].tasks[this.task_index].title
    let payload = {"comment2task": this.todoList[agendaIndex].tasks[taskIndex].id}
    this.flask.getComments(payload)
      .subscribe({
        next: (data) => {
          if (data['errCode'] == 0) {
            console.log("Success: " + JSON.stringify(data))
            this.comments = data['datarec']
          } else {
            console.log("Failure: " + JSON.stringify(data))
          }
        },
        error: (err) => {
          console.error(err)
          alert("An error occurred")
        }
      });
    this.details.openContainer();
    this.copyTask(taskIndex, agendaIndex)    //if task is already copied: fields except for description will get updated in next line
    this.updateTask(taskIndex, agendaIndex)  //    if task had not been previously copied --> nothing to update --> update api will not be called
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

  updateTaskOnInactivity(taskIndex, agendaIndex) {
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
      this.flask.addComment(commentToAdd)
      .subscribe({
        next: (data) => {
          if (data['errCode'] == 0) {
            console.log("Success: " + JSON.stringify(data))
            this.comments.push(data["datarec"])
          } else {
            console.log("Failure: " + JSON.stringify(data))
          }
        },
        error: (err) => {
          console.error(err)
          alert("An error occurred")
        }
      });
      

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
    this.flask.updateComment(payload)
    .subscribe({
      next: (data) => {
        if (data['errCode'] == 0) {
          console.log("Success: " + JSON.stringify(data))
        } else {
          errorOccurred = true
          console.log("Failure: " + JSON.stringify(data))
        }
      },
      error: (err) => {
        console.error(err)
        errorOccurred = true
        alert("An error occurred")
      }
    });
    if (errorOccurred) { //return edits to previous value
        this.comments[commentIndex].comment_text = this.commentFieldCopy.comment_text   
    }
  }

  deleteComment(commentIndex) {
    var answer = confirm("Do you want to delete this comment?");
    if (answer) {
      let jsonPayload = {"id": this.comments[commentIndex].id}
      this.flask.removeComment(jsonPayload)
        .subscribe({
          next: (data) => {
            if (data['errCode'] == 0) {
              this.comments.splice(commentIndex, 1)
              console.log("Success: " + JSON.stringify(data))
            } else {
              console.log("Failure: " + JSON.stringify(data))
            }
          },
          error: (err) => {
            console.error(err)
            alert("An error occurred")
          }
        });
    }
  }
  //......................................................................


  // AGENDA METHODS ......................................................
  displayAgendaInputs() {
    this.wantNewAgenda = true;
  }


  createAgenda() {
    if (this.newAgendaName.valid) {
      let jsonPayload = {
        "name": this.newAgendaName.value
      }
      this.flask.createAgenda(jsonPayload)
      .subscribe({
        next: (data) => {
          if (data['errCode'] == 0) {
            console.log("Success: " + JSON.stringify(data))
            this.todoList.push(data['datarec'])
          } else {
            console.log("Failure: " + JSON.stringify(data))
          }
        },
        error: (err) => {
          console.error(err)
          alert("An error occurred")
        }
      });
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
    let errorOccurred = false
    console.log(JSON.stringify(payload))
    this.flask.updateAgenda(payload)
    .subscribe({
      next: (data) => {
        if (data['errCode'] == 0) {
          console.log("Success: " + JSON.stringify(data))
        } else {
          errorOccurred = true
          console.log("Failure: " + JSON.stringify(data))
        }
      },
      error: (err) => {
        console.error(err)
        errorOccurred = true
        alert("An error occurred")
      }
    });
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
      let jsonPayload = {"id": this.todoList[agendaIndex].id}
      this.flask.deleteAgenda(jsonPayload)
        .subscribe({
          next: (data) => {
            if (data['errCode'] == 0) {
              this.todoList.splice(agendaIndex,1)
              console.log("Success: " + JSON.stringify(data))
            } else {
              console.log("Failure: " + JSON.stringify(data))
            }
          },
          error: (err) => {
            console.error(err)
            alert("An error occurred")
          }
        });
    }
  }

  agendaExists(agendaIndex) {
    return this.todoList[agendaIndex] && this.todoList[agendaIndex].tasks
  }

  focusAFields(agendaIndex, field, id) {
    // console.log("before changing: " + this.todoList[agendaIndex][field])
    this.todoList[agendaIndex][field] = true
    // console.log("after changing: " + this.todoList[agendaIndex][field])
    console.log("Show and focus on field: " + field + " id: " + id)
    setTimeout(() => {
        document.getElementById(id).focus()
      }
    )
  }

  updateAgendaOnInactivity(agendaIndex) {
    clearTimeout(this.agendaInactivityTime)
    this.agendaInactivityTime = setTimeout(() => {
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
    }, 1500)
  }

  // updateAgendaOnKeyup(agendaIndex) {
  //   this.updateAgenda(agendaIndex)
  //   this.copyAgenda(agendaIndex)
  // }  

  
  updateAgendaWhileTyping(agendaIndex, id) {
    console.log("while typing called")
    let keyUp$: Observable<any> = fromEvent(document.getElementById(id), 'keyup').pipe(
      debounceTime(1500),
      distinctUntilChanged()
    )
    keyUp$.subscribe(()=> {
      console.log("in keyup sub")
      this.updateAgenda(agendaIndex)
      this.copyAgenda(agendaIndex)
    })

    // if (this.typing) {
    //   this.typing.unsubscribe()
    // }
    // this.typing = interval(2000)
    // .subscribe(()=> {
    //   console.log("in keyup sub")
    //   this.updateAgenda(agendaIndex)
    //   this.copyAgenda(agendaIndex)
    // })
  }

  //.....................................................................
}
