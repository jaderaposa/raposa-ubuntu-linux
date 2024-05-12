import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;
  errorMessage = ''; // Add this line

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
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

      // Set a timeout to automatically log out the user after 5 seconds
      setTimeout(() => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        this.router.navigate(['/login']);
      }, 300000); // Adjust this value to change the logout time
    }, (error) => {
      this.errorMessage = error.error.message;
    });
  }
}