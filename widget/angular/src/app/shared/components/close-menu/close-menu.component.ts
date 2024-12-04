import { DOCUMENT } from '@angular/common';
import { AfterViewInit, Component, ElementRef, EventEmitter, HostListener, Inject, Output, ViewChild, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'fw-close-menu',
  templateUrl: './close-menu.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      div {
        width: 100px;
        height: 150px;
        .icon-close {
          -webkit-animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
          animation: slide-fwd-top 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
        }
        img {
          border-radius: 100%;
          background: rgba(0, 0, 0, 0.4);
          box-shadow: 0px 0px 10px 2px rgba(0, 0, 0, 0.4);
        }
      }
      @-webkit-keyframes slide-fwd-top {
        0% {
          -webkit-transform: translateZ(160px) translateY(100px);
          transform: translateZ(160px) translateY(100px);
        }
        100% {
          -webkit-transform: translateZ(0) translateY(0);
          transform: translateZ(0) translateY(0);
        }
      }
      @keyframes slide-fwd-top {
        0% {
          -webkit-transform: translateZ(160px) translateY(100px);
          transform: translateZ(160px) translateY(100px);
        }
        100% {
          -webkit-transform: translateZ(0) translateY(0);
          transform: translateZ(0) translateY(0);
        }
      }
    `,
  ],
})
export class CloseMenuComponent implements AfterViewInit {
  @ViewChild('imgClose', { static: true }) element: ElementRef;
  @Output() hoverClose = new EventEmitter<boolean>();

  public position: any;
  public ishovering = false;

  constructor(@Inject(DOCUMENT) protected document: Document) {}

  ngAfterViewInit() {
    this.position = this.element.nativeElement.getBoundingClientRect();
    this.document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
  }

  onTouchMove(e) {
    const x = e.touches[0].clientX;
    const y = e.touches[0].clientY;
    if (x > this.position.left - 30 && x < this.position.left + this.position.width + 30 && y > this.position.top - 230) {
      this.ishovering = true;
      this.hoverClose.emit(true);
    } else {
      this.ishovering = false;
      this.hoverClose.emit(false);
    }
  }

  @HostListener('dragover', ['$event'])
  onDragOver(e) {
    this.hoverClose.emit(true);
    this.ishovering = true;
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave(e) {
    this.hoverClose.emit(false);
    this.ishovering = false;
  }
}
