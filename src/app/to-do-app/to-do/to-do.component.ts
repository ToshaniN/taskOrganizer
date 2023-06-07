import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';
import { SideContainerComponent } from '../side-container/side-container.component';

@Component({
  selector: 'app-to-do',
  templateUrl: './to-do.component.html',
  styleUrls: ['./to-do.component.css']
})

export class ToDoComponent implements OnInit {

  newTaskForm: FormGroup;
  wantNewAgenda = false;
  todoList = [
    { "name": "Agenda1",
      "status": "Not Started",
      "Tasks" : [
        { "title": "Task1",
          "dueDate": "2023-06-14",
          "priority": 2,
          "status": "Open",
          "description": "first task in the agenda",
          "comments": [
            {
              "comment_text": "this needs to be done soon"
            },
            {
              "comment_text": "start working on this next week"
            }
          ],
          "wantNewComment": false
        },
        { "title": "Task2",
          "dueDate": "2023-06-28",
          "priority": 1,
          "status": "Open",
          "description": "second task in the agenda",
          "comments": [
            {
              "comment_text": "finish Task1 prior to this"
            }
          ],
          "wantNewComment": false
        }
      ],
      "wantNewTask": false      
    },
    { "name": "Agenda2",
      "status": "On track",
      "Tasks" : [
        { "title": "Task3",
          "dueDate": "2023-06-29",
          "priority": 2,
          "status": "Ready for QA",
          "description": "third task in the agenda",
          "comments": [
            {
              "comment_text": "QA team has started working on this, please change status"
            }
          ],
          "wantNewComment": false
        },
        { "title": "Task4",
          "dueDate": "2023-07-05",
          "priority": 3,
          "status": "Done",
          "description": "fourth task in the agenda",
          "comments": [
            {
              "comment_text": "Please assign a technical writer to update the documentation"
            }
          ],
          "wantNewComment": false
        }
      ],
      "wantNewTask": false      
    }
  ];

  agendaStatusOptions = [
    {
      "value" : "notStarted",
      "name" : "Not Started"
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

  // titleFocus = false;
  // dateFocus = false;
  // priorFocus = false;
  // statusFocus = false;

  constructor(private fb:FormBuilder) { }

  ngOnInit() {
    this.newTaskForm = this.fb.group({
      newTitle: ['', [Validators.required]],
      newDate: ['', [Validators.required]],
      newPriority: ['', [Validators.required]],
      newAgendaName: ['', [Validators.required]]
    })
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
  displayTaskInputs(agenda) {
    this.todoList.find(a => a.name == agenda).wantNewTask = true;
  }

  removeTaskInputs(agenda) {
    this.todoList.find(a => a.name == agenda).wantNewTask = false;
  }

  resetTaskInputs() {
    this.newTitle.setValue("");
    this.newDate.setValue("");
    this.newPriority.setValue("");
  }

  createTask(agenda) {
    console.log("focus out")
    if (this.newTitle.valid) {
      let newTask = {
        "title": this.newTitle.value,  
        "dueDate": this.newDate.value, 
        "priority": this.newPriority.value,
        "status": "Open",
        "description": "",
        "comments":[],
        "wantNewComment": false
      }
      this.todoList.find(a => a.name == agenda).Tasks.push(newTask);
    }
    this.resetTaskInputs();
    this.removeTaskInputs(agenda);
  }

  openDetails(taskIndex:number, agendaIndex) {
    this.agenda_index = agendaIndex;
    this.task_index = taskIndex;
    this.container_name = this.todoList[this.agenda_index].Tasks[this.task_index].title
    this.details.openContainer();
  }
  //......................................................................

  // COMMENT METHODS .....................................................
  displayCommentInput() {
    this.todoList[this.agenda_index].Tasks[this.task_index].wantNewComment = true;
  }

  addComment() {
    if (this.newComment != "") {
      let commentToAdd = {
        "comment_text": this.newComment
      }
      this.todoList[this.agenda_index].Tasks[this.task_index].comments.push(commentToAdd)
    }
    this.newComment = "";
    this.todoList[this.agenda_index].Tasks[this.task_index].wantNewComment = false;
  }
  //......................................................................


  // AGENDA METHODS ......................................................
  displayAgendaInputs() {
    this.wantNewAgenda = true;
  }

  removeAgendaInputs() {
    this.wantNewAgenda = false;
  }

  resetAgendaInputs() {
    this.newAgendaName.setValue("");
  }

  createAgenda() {
    if (this.newAgendaName.valid) {
      let newAgenda = {
        "name": this.newAgendaName.value,
        "status": "Not Started",
        "Tasks": [],
        "wantNewTask": false
      }
      //console.log(JSON.stringify(newAgenda))
      this.todoList.push(newAgenda);
      this.resetAgendaInputs();
      this.removeAgendaInputs();
    } else {
      this.removeAgendaInputs();
    }
  }
  //......................................................................

  tableRowClick() {
    console.log("clicked outside")
    //console.log(this.titleFocus)
  }

  // inFocus(name) {
  //   console.log("in focus")
  //   if (name == 'title') {
  //     this.titleFocus = true;
  //   }
  //   console.log(this.titleFocus)
  // }


}
