import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './guards/auth.guard'; // Import your AuthGuard here
import { LoginGuard } from './guards/login.guard';
import { inject } from '@angular/core';

const routes: Routes = [
  { path: 'register', component: RegisterComponent, canActivate: [() => inject(LoginGuard).canActivate()] },
  { path: 'login', component: LoginComponent, canActivate: [() => inject(LoginGuard).canActivate()] },
  { path: 'create', component: PostCreateComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: 'list', component: PostListComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'create/:postId', component: PostCreateComponent, canActivate: [() => inject(AuthGuard).canActivate()] },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }