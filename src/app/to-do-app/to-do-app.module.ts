import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToDoComponent } from './to-do/to-do.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClickedOutsideDirective } from '../directives/clicked-outside.directive';

@NgModule({
  declarations: [ToDoComponent, ClickedOutsideDirective],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ToDoAppModule { }
