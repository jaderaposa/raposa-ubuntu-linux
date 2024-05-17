import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage = '';
  isTokenExpired = false;


  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      usernameOrEmail: '',
      password: ''
    });
  }

  submit(): void {
    this.http.post('http://localhost:3000/api/login', this.form.getRawValue(), {
      withCredentials: true
    }).subscribe((response: any) => {
      localStorage.setItem('access_token', response.accessToken);
      localStorage.setItem('user', JSON.stringify(response.user)); // Store user information
      this.router.navigate(['/list']);

      // Set a timeout to show the modal after 5 seconds
      setTimeout(() => {
        this.userService.setTokenExpired(true);
      }, 300000); // Adjust this value to change the logout time
    }, (error) => {
      this.errorMessage = error.error.error;
    });
  }
}