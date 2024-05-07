import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, Event as RouterEvent } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit, OnDestroy {
  private subscription: Subscription | undefined;
  isLoginOrRegister: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    this.subscription = this.router.events.pipe(
      filter((event: RouterEvent): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.isLoginOrRegister = event.urlAfterRedirects === '/login' || event.urlAfterRedirects === '/register';
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}