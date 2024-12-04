import { AfterViewInit, Component } from '@angular/core';
declare const bootstrap: any;

@Component({
  selector: 'app-mobile',
  templateUrl: './mobile.component.html',
  styleUrls: ['./mobile.component.scss'],
})
export class MobileComponent implements AfterViewInit {
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

  ngAfterViewInit(): void {
    // Initialize Bootstrap Scrollspy
    new bootstrap.ScrollSpy(document.body, {
      target: '#mobile',
    });
  }
}
