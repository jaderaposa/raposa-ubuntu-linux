import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from './user.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title: string = 'Jaded';
  isTokenExpired: boolean = false;
  private tokenExpiredSubscription!: Subscription;

  constructor(private userService: UserService, private router: Router) { }

  ngOnInit() {
    this.subscribeToTokenExpired();
  }

  subscribeToTokenExpired() {
    this.tokenExpiredSubscription = this.userService.tokenExpired$.subscribe(expired => {
      console.log('Token expired value received:', expired);
      if (!this.userService.isManualLogout()) { // Check if it's not a manual logout
        this.isTokenExpired = expired;
      }
    });
  }

  ngOnDestroy() {
    if (this.tokenExpiredSubscription) {
      this.tokenExpiredSubscription.unsubscribe();
    }
  }

  onOkClick() {
    this.isTokenExpired = false; // hide the modal
    this.userService.logout(true); // Indicate that it's a manual logout

    // Unsubscribe from tokenExpired$ to prevent isTokenExpired from being set to true
    if (this.tokenExpiredSubscription) {
      this.tokenExpiredSubscription.unsubscribe();
    }

    // Navigate to the login page
    this.router.navigate(['/login']);
  }
}