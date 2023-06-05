import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators} from '@angular/forms';

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
          "description": "first task in the agenda",
          "status": "Open",
          "dueDate": "June 28",
          "priority": 2
        },
        { "title": "Task2",
          "description": "second task in the agenda",
          "status": "Open",
          "dueDate": "June 14",
          "priority": 1
        }
      ],
      "wantNewTask": false      
    },
    { "name": "Agenda2",
      "status": "On track",
      "Tasks" : [
        { "title": "Task3",
          "description": "third task in the agenda",
          "status": "Ready for QA",
          "dueDate": "June 29",
          "priority": 2
        },
        { "title": "Task4",
          "description": "fourth task in the agenda",
          "status": "Done",
          "dueDate": "July 1",
          "priority": 3
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
    // return;
    if (this.newTitle.valid) {
      let newTask = {
        "title": this.newTitle.value, 
        "description": "Not Set", 
        "status": "Open", 
        "dueDate": this.newDate.value, 
        "priority": this.newPriority.value
      }
      this.todoList.find(a => a.name == agenda).Tasks.push(newTask);
      this.resetTaskInputs();
      this.removeTaskInputs(agenda);
    } //else {
    //   // if (this.newDate.valid || this.newPriority.valid) {
    //   //   return;
    //   // }
    //   this.removeTaskInputs(agenda);
    // }
    this.resetTaskInputs();
    this.removeTaskInputs(agenda);
  }
  //......................................................................


  // AGENDA METHODS ......................................................
  displayAgendaInputs() {
    this.wantNewAgenda = true;
    let button = <HTMLElement>document.getElementById("addAgenda");
    button.hidden = true;
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
  }


}
