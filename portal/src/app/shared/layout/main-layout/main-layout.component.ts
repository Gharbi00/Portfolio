import { Component, HostListener, Inject, OnInit, PLATFORM_ID } from '@angular/core';

import { fadeAnimations } from '../../animations';
import { isPlatformBrowser } from '@angular/common';
@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.css'],
  animations: [fadeAnimations],
})
export class MainLayoutComponent implements OnInit {
  /*   constructor(private route: ActivatedRoute) { } */

  ngOnInit(): void {}
  /*   shouldShowHeaderAndFooter(): boolean {
    // Check the current route's path and decide whether to show the navbar and footer.
    const currentRoute = this.route.firstChild;
    return !currentRoute || currentRoute.snapshot.url[0].path !== 'error404';
  } */
  showButton: boolean = false;

  // Threshold for scroll position to display the button
  scrollThreshold: number = 500;

  constructor(@Inject(PLATFORM_ID) protected platformId: Object) {}

  @HostListener('window:scroll', [])
  onWindowScroll() {
    if (isPlatformBrowser(this.platformId)) {
      // Get the current scroll position
      const scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

      // Update the variable based on the scroll position
      this.showButton = scrollPosition >= this.scrollThreshold;
    }
  }

  // Function to handle button click event
  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
