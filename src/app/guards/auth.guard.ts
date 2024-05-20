import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token || this.isTokenExpired()) {
      localStorage.removeItem('access_token'); // Remove the expired token
      localStorage.removeItem('user'); // Also remove the user from local storage
      this.router.navigate(['/login']);
      return false;
    }
    return true;
  }

  isTokenExpired(): boolean {
    const token = localStorage.getItem('access_token');
    if (!token) {
      return true;
    }

    const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
    return (Math.floor((new Date).getTime() / 1000)) >= expiry;
  }
}