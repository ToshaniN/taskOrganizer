import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToDoComponent } from './to-do/to-do.component';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [ToDoComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule
  ]
})
export class ToDoAppModule { }
