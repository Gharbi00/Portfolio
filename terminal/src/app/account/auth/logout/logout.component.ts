import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { ELEVOK_LOGO } from '../../../../environments/environment';

@Component({
  selector: 'sifca-monorepo-logout',
  templateUrl: './logout.component.html',
  styleUrls: ['./logout.component.scss'],
})
export class LogoutComponent implements OnInit {
  year: number = new Date().getFullYear();
  elevokLogo = ELEVOK_LOGO;

  constructor(private authService: AuthService, private router: Router) {
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
  }

  ngOnInit(): void {
    this.authService.signOut().subscribe(() => {
      setTimeout(() => {
        this.router.navigate(['/auth/login']);
      }, 5000);
    });
  }
}
