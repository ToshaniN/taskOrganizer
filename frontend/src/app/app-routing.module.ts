import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ToDoComponent } from './to-do-app/to-do/to-do.component';
import { LoginPageComponent } from './to-do-app/login-page/login-page.component'

const routes: Routes = [
  {path: 'organizer', component: ToDoComponent},
  {path: '', component: LoginPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
