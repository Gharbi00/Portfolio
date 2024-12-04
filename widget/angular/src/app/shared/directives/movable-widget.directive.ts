import { DomSanitizer, SafeStyle } from '@angular/platform-browser';
import { Directive, Renderer2, ElementRef, HostBinding, HostListener, AfterViewInit, Inject, PLATFORM_ID, Input } from '@angular/core';

import { DeviceDetectorService } from 'ngx-device-detector';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { PositionEnum } from '@sifca-monorepo/widget-generator';

interface Position {
  top: number;
  left: number;
}

@Directive({
  selector: '[fmdMovableWidget]',
})
export class MovableWidgetDirective implements AfterViewInit {
  @Input() widgetPosition: number;
  @Input() alignment: PositionEnum;

  @HostBinding('draggable') draggable = true;
  @HostBinding('class.dragging') dragging = false;
  @HostBinding('class.draggable') draggableClass = true;
  @HostBinding('class.movable-widget') movableWidget = true;
  @HostBinding('style') get style(): SafeStyle {
    return this.sanitizer.bypassSecurityTrustStyle(`top: ${this.position.top}px; left: ${this.position.left}px;`);
  }

  private isRight = true;
  private sizeWidget: string;
  private offset: Position = { left: 0, top: 0 };
  private position: Position = { left: 0, top: 0 };

  constructor(
    public element: ElementRef,
    private renderer: Renderer2,
    private sanitizer: DomSanitizer,
    private deviceService: DeviceDetectorService,
    @Inject(DOCUMENT) protected document: Document,
    @Inject(PLATFORM_ID) protected platformId: Object,
  ) {
    this.sizeWidget = this.deviceService.isMobile() ? '75' : '75';
    this.document.addEventListener('touchmove', this.onDragMove.bind(this), { passive: false });
    this.document.addEventListener('touchend', this.onDrop.bind(this), { passive: false });
    this.document.addEventListener('touchcancel', this.onDrop.bind(this), { passive: false });
    this.element.nativeElement.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
  }

  ngAfterViewInit(): void {
    this.setPosition();
  }

  setPosition() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.alignment === PositionEnum.LEFT) {
        this.renderer.setStyle(this.element.nativeElement, 'left', `calc(100% - ${this.sizeWidget}px)`);
      } else if (this.alignment === PositionEnum.RIGHT) {
        this.renderer.setStyle(this.element.nativeElement, 'left', `auto`);
      }
      if (this.widgetPosition) {
        this.renderer.setStyle(this.element.nativeElement, 'top', `${this.widgetPosition.toString()}px`);
      } else {
        this.renderer.setStyle(this.element.nativeElement, 'top', `calc(50% - (${this.sizeWidget}px / 2))`);
      }
      const clientRect = this.element.nativeElement.getBoundingClientRect();
      this.position = { top: clientRect.top, left: clientRect.left };
    }
  }

  animateToFinalPosition(viewPortWidth: number) {
    this.renderer.setStyle(this.element.nativeElement, 'transition', `120ms all ease-in-out`);
    const isMobile = this.deviceService.isMobile();
    if (isMobile) {
      this.renderer.setStyle(this.element.nativeElement, 'left', this.position.left + this.offset.left > viewPortWidth / 2 ? `auto` : '-14px');
    } else {
      this.renderer.setStyle(
        this.element.nativeElement,
        'left',
        this.position.left + this.offset.left > viewPortWidth / 2 ? `auto` : '0',
      );
    }
    this.isRight = this.position.left + this.offset.left > viewPortWidth / 2;
    setTimeout(() => this.renderer.setStyle(this.element.nativeElement, 'transition', `none`), 121);
  }

  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    event.dataTransfer.effectAllowed = 'move';
    this.offset = { top: event.offsetY, left: event.offsetX };
    this.dragging = true;
  }

  onTouchStart(event: TouchEvent): void {
    const clientRect = this.element.nativeElement.getBoundingClientRect();
    this.offset = { top: event.touches[0].pageY - clientRect.top, left: event.touches[0].pageX - clientRect.left };
    this.dragging = true;
  }

  onDragMove(event: TouchEvent): void {
    if (!this.dragging) {
      return;
    }
    const top = event.touches[0].pageY - this.offset.top;
    const left = event.touches[0].pageX - this.offset.left;
    this.position = { top, left };
  }

  @HostListener('document:dragover', ['$event'])
  onDragEnd(event: DragEvent) {
    event.preventDefault();
  }

  @HostListener('document:drop', ['$event'])
  onDrop(event: DragEvent | TouchEvent): void {
    if (isPlatformBrowser(this.platformId)) {
      const viewPortWidth = Math.max(this.document.documentElement.clientWidth, window.innerWidth || 0);
      if (this.deviceService.isDesktop()) {
        event = event as DragEvent;
        this.position = { top: event.clientY - this.offset.top, left: event.clientX - this.offset.left };
        if (event.clientY > window.innerHeight - 75 * 2) {
          this.position.top = window.innerHeight - 75 * 2;
        } else if (event.clientY < 75) {
          this.position.top = 75;
        }
        setTimeout(() => this.animateToFinalPosition(viewPortWidth), 0);
      } else {
        if (!this.dragging) {
          return;
        }
        if (this.position.top > window.innerHeight - 180) {
          this.position.top = window.innerHeight - 180;
        } else if (this.position.top < 60) {
          this.position.top = 60;
        }
        this.animateToFinalPosition(viewPortWidth);
      }
      this.offset = { top: 0, left: 0 };
      this.dragging = false;
    }
  }

  @HostListener('window:orientationchange', ['$event'])
  onOrientationChange() {
    if (isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => {
        const isMobile = this.deviceService.isMobile();
        if (isMobile) {
          this.renderer.setStyle(this.element.nativeElement, 'left', this.isRight ? `auto` : '-14px');
        } else {
          this.renderer.setStyle(this.element.nativeElement, 'left', this.isRight ? `auto` : '0');
        }
        if (this.position.top > window.innerHeight * 180) {
          this.renderer.setStyle(this.element.nativeElement, 'top', `calc(50% - (${this.sizeWidget}px / 2))`);
        }
        const clientRect = this.element.nativeElement.getBoundingClientRect();
        this.position = { top: clientRect.top, left: clientRect.left };
        this.renderer.setStyle(this.element.nativeElement, 'transition', `120ms all ease-in-out`);
        setTimeout(() => this.renderer.setStyle(this.element.nativeElement, 'transition', `none`), 121);
      }, 200);
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    if (isPlatformBrowser(this.platformId)) {
      window.setTimeout(() => {
        if (this.position.top > window.innerHeight - 75 * 2) {
          this.position.top = window.innerHeight - 75 * 2;
        } else if (this.position.top < 75) {
          this.position.top = 75;
        }
        const isMobile = this.deviceService.isMobile();
        if (isMobile) {
          this.renderer.setStyle(this.element.nativeElement, 'left', this.isRight ? `auto` : '-14px');
        } else {

          if (this.isRight && this.alignment === PositionEnum.RIGHT) {
            this.renderer.setStyle(this.element.nativeElement, 'left', `auto`);
          } else {
            this.renderer.setStyle(this.element.nativeElement, 'left', '0');
          }

          // this.renderer.setStyle(this.element.nativeElement, 'left', this.isRight && this.alignment !== PositionEnum.RIGHT ? `auto` : '0');
        }
      }, 200);
    }
  }
}
