import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { UserService } from '../user.service'; // Adjust the path to match your project structure
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string = '';
  routerSubscription: Subscription;
  usernameSubscription: Subscription;

  constructor(private router: Router, private userService: UserService, private snackBar: MatSnackBar) {
    this.routerSubscription = new Subscription();
    this.usernameSubscription = new Subscription(); // Initialize usernameSubscription
  }

  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const userItem = localStorage.getItem('user');
      if (userItem) {
        const user = JSON.parse(userItem);
        this.username = user ? user.username : '';
      } else {
        this.username = '';
      }
    });

    this.usernameSubscription = this.userService.username$.subscribe(username => {
      this.username = username;
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.usernameSubscription) {
      this.usernameSubscription.unsubscribe();
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
    this.snackBar.open('Account Logged Out :(', 'Close', {
      duration: 5000,
    });
  }
}