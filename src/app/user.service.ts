import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<string>('');
  private tokenExpiredSubject = new BehaviorSubject<boolean>(false);
  private tokenExpirationTimeoutId: any;
  private manualLogout = false; // Add this line

  constructor() {
    const userItem = localStorage.getItem('user');
    const user = userItem ? JSON.parse(userItem) : null;
    this.userSubject.next(user ? user.username : '');
  }

  get username$() {
    return this.userSubject.asObservable();
  }

  get tokenExpired$() {
    return this.tokenExpiredSubject.asObservable();
  }

  setTokenExpired(value: boolean) {
    console.log('Token expired value set to:', value);
    this.tokenExpiredSubject.next(value);
  }

  login(user: any) {
    localStorage.setItem('access_token', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user.username);

    // Clear any existing timeout
    if (this.tokenExpirationTimeoutId) {
      clearTimeout(this.tokenExpirationTimeoutId);
    }

    // Set token expired after 1 minute/s
    this.tokenExpirationTimeoutId = setTimeout(() => {
      this.setTokenExpired(true);
    }, 1 * 60 * 1000);
  }

  logout(manualLogout: boolean = false) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.userSubject.next('');

    this.manualLogout = manualLogout; // Add this line

    if (!manualLogout) {
      this.setTokenExpired(true);
    }

    if (this.tokenExpirationTimeoutId) {
      clearTimeout(this.tokenExpirationTimeoutId);
      this.tokenExpirationTimeoutId = null;
    }
  }

  isManualLogout() { // Add this method
    return this.manualLogout;
  }
}