import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userSubject = new BehaviorSubject<string>('');

  constructor() {
    const userItem = localStorage.getItem('user');
    const user = userItem ? JSON.parse(userItem) : null;
    this.userSubject.next(user ? user.username : '');
  }

  get username$() {
    return this.userSubject.asObservable();
  }

  login(user: any) {
    localStorage.setItem('access_token', user.accessToken);
    localStorage.setItem('user', JSON.stringify(user));
    this.userSubject.next(user.username);
  }

  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    this.userSubject.next('');
  }
}