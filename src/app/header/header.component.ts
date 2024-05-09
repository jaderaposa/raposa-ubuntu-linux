import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  username: string = '';
  routerSubscription: Subscription;

  constructor(private router: Router) {
    this.routerSubscription = new Subscription();
  }
  
  ngOnInit(): void {
    this.routerSubscription = this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const user = JSON.parse(localStorage.getItem('user') ?? '');
      this.username = user ? user.username : '';
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('access_token');
    return !!token;
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user'); // Also remove the user from local storage
    this.username = ''; // Clear the username
    this.router.navigate(['/login']);
  }
}