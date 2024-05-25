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

  resetTokenExpiration() {
    this.tokenExpiredSubject.next(false);
  }

  login(user: any) {
    localStorage.setItem('access_token', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user.username);

    // Clear any existing timeout
    if (this.tokenExpirationTimeoutId) {
      clearTimeout(this.tokenExpirationTimeoutId);
    }

    // Start a new timeout to automatically log out the user after 1 minute
    this.tokenExpirationTimeoutId = setTimeout(() => {
      this.logout();
      this.setTokenExpired(true);
    }, 60000); // 60000 milliseconds = 1 minute
  }

  logout(manualLogout: boolean = false) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.userSubject.next('');

    if (this.tokenExpirationTimeoutId) {
      clearTimeout(this.tokenExpirationTimeoutId);
      this.tokenExpirationTimeoutId = null;
    }

    // If it's a manual logout, set tokenExpired to false
    if (manualLogout) {
      this.setTokenExpired(false);
    }
  }

  isManualLogout() { // Add this method
    return this.manualLogout;
  }
}