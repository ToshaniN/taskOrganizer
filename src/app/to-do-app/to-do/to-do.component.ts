import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { SideContainerComponent } from '../side-container/side-container.component';
import { FlaskApiService } from '../../flask-api.service';

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.css']
})

export class ToDoComponent implements OnInit {

  newTaskForm: FormGroup;
  wantNewAgenda = false;
  todoList = [
    // { "id":1,
    //   "name": "Agenda1",
    //   "status": "Not started",
    //   "tasks" : [
    //     { "id":1,
    //       "title": "Task1",
    //       "dueDate": "2023-06-14",
    //       "priority": 2,
    //       "status": "Open",
    //       "description": "first task in the agenda",
    //       "comments": [
    //         {
    //           "comment_text": "this needs to be done soon"
    //         },
    //         {
    //           "comment_text": "start working on this next week"
    //         }
    //       ],
    //       "wantNewComment": false
    //     },
    //     { "id":2,
    //       "title": "Task2",
    //       "dueDate": "2023-06-28",
    //       "priority": 1,
    //       "status": "Open",
    //       "description": "second task in the agenda",
    //       "comments": [
    //         {
    //           "comment_text": "finish Task1 prior to this"
    //         }
    //       ],
    //       "wantNewComment": false
    //     }
    //   ],
    //   "wantNewTask": false      
    // },
    // { "id":2,
    //   "name": "Agenda2",
    //   "status": "On track",
    //   "tasks" : [
    //     { "id":3,
    //       "title": "Task3",
    //       "dueDate": "2023-06-29",
    //       "priority": 2,
    //       "status": "Ready for QA",
    //       "description": "third task in the agenda",
    //       "comments": [
    //         {
    //           "comment_text": "QA team has started working on this, please change status"
    //         }
    //       ],
    //       "wantNewComment": false
    //     },
    //     { "id":4,
    //       "title": "Task4",
    //       "dueDate": "2023-07-05",
    //       "priority": 3,
    //       "status": "Done",
    //       "description": "fourth task in the agenda",
    //       "comments": [
    //         {
    //           "comment_text": "Please assign a technical writer to update the documentation"
    //         }
    //       ],
    //       "wantNewComment": false
    //     }
    //   ],
    //   "wantNewTask": false      
    // }
  ];

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

  constructor(private fb:FormBuilder, private flask:FlaskApiService) { }

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
            this.todoList[agendaIndex].tasks.push(data["datarec"])
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

  updateTask(changed, taskIndex, agendaIndex) {
    console.log("focused out on " + changed.target.id)
    let key = changed.target.id
    let value = changed.target.value
    if (key == 'title' && value == '') {
      alert("Please enter a title for the task")
      return
    }
    if (key == 'detailsButton' || key == 'deleteTaskButton') {
      return
    }
    console.log("new value: " + changed.target.value)
    let jsonPayload = { "id": this.todoList[agendaIndex].tasks[taskIndex].id,
                        [key]: value }
    console.log(JSON.stringify(jsonPayload))
    this.flask.updateTask(jsonPayload)
    .subscribe({
      next: (data) => {
        if (data['errCode'] == 0) {
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
    this.details.openContainer();
  }
  //......................................................................

  // COMMENT METHODS .....................................................
  displayCommentInput() {
    this.todoList[this.agenda_index].tasks[this.task_index].wantNewComment = true;
  }

  addComment() {
    if (this.newComment != "") {
      let commentToAdd = {
        "comment_text": this.newComment
      }
      this.todoList[this.agenda_index].tasks[this.task_index].comments.push(commentToAdd)
    }
    this.newComment = "";
    this.todoList[this.agenda_index].tasks[this.task_index].wantNewComment = false;
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


  updateAgenda(changed, agendaIndex) {
    let key = changed.target.id;
    let value = changed.target.value
    if (key == 'name' && value == '') {
      alert("Please enter a name for the agenda")
      return
    }
    if (key == 'deleteAgendaButton') {
      return
    }
    let jsonPayload = {"id": this.todoList[agendaIndex].id, 
                       [key]: value }                      
    this.flask.updateAgenda(jsonPayload)
    .subscribe({
      next: (data) => {
        if (data['errCode'] == 0) {
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

  //......................................................................

  tableRowClick() {
    console.log("clicked outside")
    //console.log(this.titleFocus)
  }


}
