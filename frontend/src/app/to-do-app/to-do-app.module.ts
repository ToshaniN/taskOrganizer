import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToDoComponent } from './to-do/to-do.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClickedOutsideDirective } from '../directives/clicked-outside.directive';
import { SideContainerComponent } from './side-container/side-container.component';
import { LoginPageComponent } from './login-page/login-page.component';

@NgModule({
  declarations: [ToDoComponent, SideContainerComponent, ClickedOutsideDirective, LoginPageComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class ToDoAppModule { }
