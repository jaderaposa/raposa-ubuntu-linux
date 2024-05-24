import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PostCreateComponent } from './post/post-create/post-create.component';
import { PostListComponent } from './post/post-list/post-list.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from './guards/auth.guard';
import { LoginGuard } from './guards/login.guard';
import { ForgotPassComponent } from './forgot-pass/forgot-pass.component';
import { ChangePassComponent } from './change-pass/change-pass.component';
import { ForgotPassGuard } from './guards/forgot-pass.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'register', component: RegisterComponent, canActivate: [LoginGuard] },
  { path: 'login', component: LoginComponent, canActivate: [LoginGuard] },
  { path: 'create', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'list', component: PostListComponent, canActivate: [AuthGuard] },
  { path: 'create/:postId', component: PostCreateComponent, canActivate: [AuthGuard] },
  { path: 'forgot-password', component: ForgotPassComponent },
  { path: 'change-password/:email', component: ChangePassComponent, canActivate: [ForgotPassGuard] }];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [AuthGuard, LoginGuard, ForgotPassGuard] // Add your guards here
})
export class AppRoutingModule { }