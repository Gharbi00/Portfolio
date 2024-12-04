import { Component, AfterViewInit } from '@angular/core';
import { fadeAnimations } from '../../shared/animations';
import { Subscription } from 'rxjs';
declare const bootstrap: any;

@Component({
  selector: 'app-home-screen',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [fadeAnimations],
})
export class IndexComponent implements AfterViewInit {
  isCollapsed = false;

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  accordionState: any[] = [];

  toggleAccordion(index: number): void {
    this.accordionState[index] = !this.accordionState[index];
  }

  isAccordionOpen(index: number): boolean {
    return this.accordionState[index];
  }

  public routerSubscription?: Subscription;

  ngAfterViewInit(): void {
    // Initialize Bootstrap Scrollspy
    new bootstrap.ScrollSpy(document.body, {
      target: '#home',
    });
  }
}
