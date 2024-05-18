import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { PostCreateComponent } from "./post/post-create/post-create.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { MatInputModule } from "@angular/material/input";
import { MatCardModule } from "@angular/material/card";
import { MatFormFieldModule } from "@angular/material/form-field";
import { HeaderComponent } from "./header/header.component";
import { MatToolbarModule } from "@angular/material/toolbar";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { MatProgressSpinnerModule } from "@angular/material/progress-spinner";
import { PostListComponent } from "./post/post-list/post-list.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { HttpClientModule } from '@angular/common/http';
import { MatMenuModule } from '@angular/material/menu';
import { PostsService } from './post/post.service';
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { MatPaginatorModule } from '@angular/material/paginator';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { JwtModule, JwtHelperService } from '@auth0/angular-jwt';
import { AuthGuard } from "./guards/auth.guard";
import { MatDialogModule } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

@NgModule({
	declarations: [AppComponent, PostCreateComponent, HeaderComponent, PostListComponent, LoginComponent, RegisterComponent],
	imports: [
		BrowserModule,
		AppRoutingModule,
		FormsModule,
		BrowserAnimationsModule,
		MatInputModule,
		MatCardModule,
		MatFormFieldModule,
		MatToolbarModule,
		MatButtonModule,
		MatIconModule,
		MatProgressSpinnerModule,
    MatExpansionModule,
    HttpClientModule,
    MatMenuModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => {
          return localStorage.getItem('access_token');
        },
        allowedDomains: ['localhost:3000'],
        disallowedRoutes: ['http://localhost:3000/api/auth/login']
      }
    }),
    MatDialogModule,
	],
  providers: [PostsService, AuthGuard, DatePipe],
	bootstrap: [AppComponent],
})
export class AppModule {}
