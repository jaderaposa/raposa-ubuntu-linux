import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router'; // Import Router

@Component({
  selector: 'app-forgot-pass',
  templateUrl: './forgot-pass.component.html',
  styleUrls: ['./forgot-pass.component.css']
})
export class ForgotPassComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    code: ['', Validators.required]
  });
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private router: Router // Inject Router
  ) { }

  ngOnInit() {
  }

  sendCode() {
    const emailControl = this.form.get('email');
    if (emailControl) {
      const email = emailControl.value;
      this.http.post<{ resetToken: string }>('http://localhost:3000/api/send-reset-code', { email }).subscribe({
        next: (response) => {
          localStorage.setItem('resetToken', response.resetToken);
          this.snackBar.open('Code sent!', 'Close', {
            duration: 5000,
          });
          this.errorMessage = ''; // Clear error message on successful send
        },
        error: (error) => {
          this.errorMessage = error.error.error;
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['red-snackbar']
          });
        }
      });
    }
  }

  submit() {
    if (this.form.valid) {
      const emailControl = this.form.get('email');
      const codeControl = this.form.get('code');

      if (emailControl && codeControl) {
        const email = emailControl.value;
        const code = codeControl.value;

        this.http.post('http://localhost:3000/api/validate-reset-code', { email, code }).subscribe({
          next: () => {
            this.snackBar.open('Code verified!', 'Close', {
              duration: 5000,
            });
            this.errorMessage = ''; // Clear error message on successful verification

            // Navigate to password reset form with email as a parameter
            this.router.navigate(['/change-password', email]);
          },
          error: (error) => {
            this.errorMessage = error.error.error;
            this.snackBar.open(this.errorMessage, 'Close', {
              duration: 5000,
              panelClass: ['red-snackbar']
            });
          }
        });
      }
    }
  }
}