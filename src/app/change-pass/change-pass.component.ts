import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-change-pass',
  templateUrl: './change-pass.component.html',
  styleUrls: ['./change-pass.component.css']
})
export class ChangePassComponent implements OnInit {
  form: FormGroup = this.formBuilder.group({
    newPassword: ['', Validators.required],
    confirmPassword: ['', Validators.required]
  });
  errorMessage = '';
  email: string = ''; // Initialize email with an empty string
  hideNewPassword = true;
  hideConfirmPassword = true;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute,
    private router: Router // Inject Router
  ) { }

  ngOnInit() {
    const emailParam = this.route.snapshot.paramMap.get('email');
    this.email = emailParam ? emailParam : ''; // Assign emailParam if it's not null, otherwise assign an empty string
  }

  submit() {
    if (this.form.valid) {
      const newPasswordControl = this.form.get('newPassword');
      const confirmPasswordControl = this.form.get('confirmPassword');

      if (newPasswordControl && confirmPasswordControl) {
        const newPassword = newPasswordControl.value;
        const confirmPassword = confirmPasswordControl.value;

        if (newPassword !== confirmPassword) {
          this.errorMessage = 'Passwords do not match';
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
            panelClass: ['red-snackbar']
          });
          return;
        }

        this.http.post('http://localhost:3000/api/reset-password', { email: this.email, newPassword }).subscribe({
          next: () => {
            this.snackBar.open('Password changed successfully!', 'Close', {
              duration: 5000,
            });
            this.errorMessage = '';
            localStorage.removeItem('resetToken'); // Remove the reset token from localStorage

            this.router.navigate(['/login']); // Redirect to login page
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