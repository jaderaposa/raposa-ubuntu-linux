import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { timer, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit, OnDestroy {
  form!: FormGroup;
  errorMessage = '';
  hidePassword = true;
  countdown: number | null = null;
  private countdownTimer$ = timer(0, 1000);
  private destroy$ = new Subject<void>();
  isTokenExpired = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private userService: UserService,
    private snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      usernameOrEmail: '',
      password: ''
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit(): void {
    if (this.countdown !== null) {
      return;
    }

    this.http.post('http://localhost:3000/api/login', this.form.getRawValue(), {
      withCredentials: true
    }).subscribe({
      next: (response: any) => {
        localStorage.setItem('access_token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(response.user)); // Store user information
        this.router.navigate(['/list']);
        this.snackBar.open('Account Logged In!', 'Close', {
          duration: 5000,
        });
        // Set a timeout to show the modal after 5 seconds
        setTimeout(() => {
          this.userService.setTokenExpired(true);
        }, 300000); // Adjust this value to change the logout time
        this.errorMessage = ''; // Clear error message on successful login
      },
      error: (error) => {
        if (error.status === 429) {
          this.startCountdown(30);
        } else {
          this.errorMessage = error.error.error;
          this.snackBar.open(this.errorMessage, 'Close', {
            duration: 5000,
          });
        }
      }
    });
  }

  startCountdown(seconds: number): void {
    this.countdown = seconds;
    const intervalId = setInterval(() => {
      if (this.countdown !== null && this.countdown > 0) {
        this.countdown--;
        this.errorMessage = `Too many failed attempts. Try again in ${this.countdown} seconds.`;
        this.snackBar.open(this.errorMessage, 'Close', {
          duration: 1000,
        });
      } else {
        clearInterval(intervalId);
        this.countdown = null;
        this.errorMessage = '';
      }
    }, 1000);
  }
}