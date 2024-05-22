import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<string>('');
  private tokenExpiredSubject = new BehaviorSubject<boolean>(false);


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
    this.tokenExpiredSubject.next(value);
  }

  login(user: any) {
    localStorage.setItem('access_token', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user.username);

    // Set token expired after 5 minutes
    setTimeout(() => {
      this.setTokenExpired(true);
    }, 1 * 60 * 1000);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.userSubject.next('');
    this.setTokenExpired(true);
  }
}