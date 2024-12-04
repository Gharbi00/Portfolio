import { Component, ElementRef, OnInit } from '@angular/core';
import { fadeAnimations } from '../../../shared/animations';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  animations: [fadeAnimations],
})
export class HeaderComponent implements OnInit {
  fadeAnimationState = 'void';

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        this.fadeAnimationState = entry.isIntersecting ? 'visible' : 'void';
      });
    });

    observer.observe(this.elementRef.nativeElement);
  }

  isCollapsed = false;

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }

  megaMenuCollapsed = false;

  toggleCollapseMegaMenu() {
    this.megaMenuCollapsed = !this.megaMenuCollapsed;
  }
}
