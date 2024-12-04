import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class RouteChangeService {
  previousUrl: string;

  constructor(private router: Router) {
    this.previousUrl = "";

    router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
      this.previousUrl = (e as NavigationEnd).url;
    });
  }

  setRoute() {
    this.router.events.pipe(filter(event => event instanceof NavigationEnd)).subscribe(e => {
      this.previousUrl = (e as NavigationEnd).url;
    });
  }

  getPreviousRoute() {
    return this.previousUrl;
  }
}
