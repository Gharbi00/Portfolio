import { AfterViewInit, Component } from '@angular/core';
declare const bootstrap: any;

@Component({
  selector: 'app-check-api',
  templateUrl: './check-api.component.html',
  styleUrls: ['./check-api.component.scss'],
})
export class CheckApiComponent implements AfterViewInit {
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
      target: '#check-api',
    });
  }
}
