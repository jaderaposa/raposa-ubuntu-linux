import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
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
      username: '',
      email: '',
      password: ''
    });
  }

  submit(): void {
    this.http.post('http://localhost:3000/api/register', this.form.getRawValue())
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (err) => {
          // Handle the error here
          this.errorMessage = err.error.error; // Update this line
        }
      });
  }
}