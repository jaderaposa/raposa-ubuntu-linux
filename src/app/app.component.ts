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
    this.tokenExpiredSubscription = this.userService.tokenExpired$.subscribe(expired => {
      this.isTokenExpired = expired;
    });
  }

  ngOnDestroy() {
    if (this.tokenExpiredSubscription) {
      this.tokenExpiredSubscription.unsubscribe();
    }
  }

  onOkClick() {
    this.userService.logout();
    this.isTokenExpired = false; // hide the modal
    this.router.navigate(['/login']);
  }
}