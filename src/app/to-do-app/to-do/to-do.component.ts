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
      "status": "In Dev",
      "Tasks" : [
        { "title": "Task1",
          "description": "first task in the agenda",
          "status": "not started",
          "dueDate": "June 28",
          "priority": 2
        },
        { "title": "Task2",
          "description": "second task in the agenda",
          "status": "started",
          "dueDate": "June 14",
          "priority": 1
        }
      ],
      "wantNewTask": false      
    },
    { "name": "Agenda2",
      "status": "Not started",
      "Tasks" : [
        { "title": "Task3",
          "description": "third task in the agenda",
          "status": "not started",
          "dueDate": "June 29",
          "priority": 2
        },
        { "title": "Task4",
          "description": "fourth task in the agenda",
          "status": "not started",
          "dueDate": "July 1",
          "priority": 3
        }
      ],
      "wantNewTask": false      
    }
  ];

  constructor(private fb:FormBuilder) { }

  ngOnInit() {
    this.newTaskForm = this.fb.group({
      newTitle: ['', [Validators.required]],
      newDate: ['', [Validators.required]],
      newPriority: ['', [Validators.required]],
      newAgendaName: ['', [Validators.required]]
    })
    // interface agenda {
    //   name: string
    //   status:string
    //   Tasks:tasks
    // }

    // interface tasks {
    //   title:string
    //   description:string
    //   due_date:string
    //   priority:any
    // }
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
    let button = <HTMLElement>document.getElementById("addTask");
    button.hidden = true;
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
    // console.log("focus out")
    // return;
    if (this.newTitle.valid) {
      // let dateInput = document.getElementById("taskDate")
      // let priorInput = document.getElementById("taskPrior")
      // if (document.activeElement.id == 'taskDate') {
      //   console.log('There was focus')
      //   return;
      // }

      if(!this.newDate.valid) {
        this.newDate.setValue("not set");
      }
      if(!this.newPriority.valid) {
        this.newPriority.setValue("not set");
      }
      let newTask = {
        "title": this.newTitle.value, 
        "description": "Not Set", 
        "status": "not started", 
        "dueDate": this.newDate.value, 
        "priority": this.newPriority.value
      }
      this.todoList.find(a => a.name == agenda).Tasks.push(newTask);
      this.resetTaskInputs();
      this.removeTaskInputs(agenda);
    } else {
      if (this.newDate.valid || this.newPriority.valid) {
        return;
      }
      this.removeTaskInputs(agenda);
    }
    let button = <HTMLElement>document.getElementById("addTask");
    button.hidden = false;
  }
  //......................................................................

  // taskDiv = <HTMLElement>document.getElementById("taskInputs");
  // lostFocus(agenda) {
  //   this.taskDiv.addEventListener('focusout', function (e) {
  //     if (this.taskDiv.contains(e.relatedTarget as HTMLInputElement)) {
  //       return;
  //     } else {
  //       console.log("works")
  //     }
  //   });
  // }
  

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
    let button = <HTMLElement>document.getElementById("addAgenda");
    button.hidden = false;
    if (this.newAgendaName.valid) {
      let newAgenda = {
        "name": this.newAgendaName.value,
        "status": "Not started",
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

  
}
