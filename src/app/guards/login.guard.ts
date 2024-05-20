import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginGuard implements CanActivate {

  constructor(private router: Router) { }

  canActivate(): boolean {
    const token = localStorage.getItem('access_token');
    if (token && !this.isTokenExpired()) {
      this.router.navigate(['/list']);
      return false;
    }
    localStorage.removeItem('access_token'); // Remove the expired token
    localStorage.removeItem('user'); // Also remove the user from local storage
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