import { Component } from '@angular/core';
declare const bootstrap: any;

@Component({
  selector: 'app-gradle',
  templateUrl: './gradle.component.html',
  styleUrls: ['./gradle.component.scss'],
})
export class GradleComponent {
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
      target: '#navbar-example3'
    });
  }
}
