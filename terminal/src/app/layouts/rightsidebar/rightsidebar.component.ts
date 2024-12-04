import { Component, OnInit, Output, EventEmitter, TemplateRef, Inject } from '@angular/core';
import { EventService } from '../../core/services/event.service';
import {
  LAYOUT_VERTICAL,
  LAYOUT_MODE,
  LAYOUT_WIDTH,
  LAYOUT_POSITION,
  TOPBAR,
  SIDEBAR_SIZE,
  SIDEBAR_VIEW,
  SIDEBAR_COLOR,
  SIDEBAR_IMAGE,
  DATA_PRELOADER,
} from '../layout.model';
import { NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'sifca-monorepo-rightsidebar',
  templateUrl: './rightsidebar.component.html',
  styleUrls: ['./rightsidebar.component.scss'],
})

/**
 * Right Sidebar component
 */
export class RightsidebarComponent implements OnInit {
  layout: string | undefined;
  mode: string | undefined;
  width: string | undefined;
  position: string | undefined;
  topbar: string | undefined;
  size: string | undefined;
  sidebarView: string | undefined;
  sidebar: string | undefined;
  attribute: any;
  sidebarImage: any;
  preLoader: any;
  grd: any;

  @Output() settingsButtonClicked = new EventEmitter();

  constructor(private eventService: EventService, private offcanvasService: NgbOffcanvas, @Inject(DOCUMENT) private document: Document) {}

  ngOnInit(): void {
    this.layout = LAYOUT_VERTICAL;
    this.mode = LAYOUT_MODE;
    this.width = LAYOUT_WIDTH;
    this.position = LAYOUT_POSITION;
    this.topbar = TOPBAR;
    this.size = SIDEBAR_SIZE;
    this.sidebarView = SIDEBAR_VIEW;
    this.sidebar = SIDEBAR_COLOR;
    this.sidebarImage = SIDEBAR_IMAGE;
    this.preLoader = DATA_PRELOADER;
    this.attribute = '';
  }

  ngAfterViewInit() {}

  /**
   * Change the layout onclick
   * @param layout Change the layout
   */
  changeLayout(layout: string) {
    this.document.body.setAttribute('layout', layout);
    this.eventService.broadcast('changeLayout', layout);
  }

  // Add Active Class
  addActive(grdSidebar: any) {
    this.grd = grdSidebar;
    this.document.documentElement.setAttribute('data-sidebar', grdSidebar);
    this.document.getElementById('collapseBgGradient')?.classList.toggle('show');
    this.document.getElementById('collapseBgGradient1')?.classList.add('active');
  }

  // Remove Active Class
  removeActive() {
    this.grd = '';
    this.document.getElementById('collapseBgGradient1')?.classList.remove('active');
    this.document.getElementById('collapseBgGradient')?.classList.remove('show');
  }

  // When the user clicks on the button, scroll to the top of the document
  topFunction() {
    this.document.body.scrollTop = 0;
    this.document.documentElement.scrollTop = 0;
  }

  //  Filter Offcanvas Set
  openEnd(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });

    setTimeout(() => {
      var layouttype = this.document.documentElement.getAttribute('data-layout');
      if (layouttype == 'vertical') {
        var vertical = this.document.getElementById('customizer-layout01') as HTMLInputElement;
        if (vertical != null) {
          vertical.setAttribute('checked', 'true');
        }
      }
      if (layouttype == 'horizontal') {
        const horizontal = this.document.getElementById('customizer-layout02');
        if (horizontal != null) {
          horizontal.setAttribute('checked', 'true');
        }
      }
      if (layouttype == 'twocolumn') {
        const Twocolumn = this.document.getElementById('customizer-layout03');
        if (Twocolumn != null) {
          Twocolumn.setAttribute('checked', 'true');
        }
      }
    }, 0);
  }

  // Mode Change
  changeMode(mode: string) {
    this.mode = mode;
    this.document.documentElement.setAttribute('data-layout-mode', mode);
  }

  // Width Change
  changeWidth(width: string, size: string) {
    this.width = width;
    this.document.documentElement.setAttribute('data-layout-width', width);
    this.document.documentElement.setAttribute('data-sidebar-size', size);
  }

  // Position Change
  changePosition(position: string) {
    this.position = position;
    this.document.documentElement.setAttribute('data-layout-position', position);
  }

  // Topbar Change
  changeTopColor(color: string) {
    this.topbar = color;
    this.document.documentElement.setAttribute('data-topbar', color);
  }

  // Sidebar Size Change
  changeSidebarSize(size: string) {
    this.size = size;
    this.document.documentElement.setAttribute('data-sidebar-size', size);
  }

  // Sidebar Size Change
  changeSidebar(sidebar: string) {
    this.sidebarView = sidebar;
    this.document.documentElement.setAttribute('data-layout-style', sidebar);
  }

  // Sidebar Color Change
  changeSidebarColor(color: string) {
    this.sidebar = color;
    this.document.documentElement.setAttribute('data-sidebar', color);
  }

  // Sidebar Image Change
  changeSidebarImage(img: string) {
    this.sidebarImage = img;
    this.document.documentElement.setAttribute('data-sidebar-image', img);
  }

  // PreLoader Image Change
  changeLoader(loader: string) {
    this.preLoader = loader;
    this.document.documentElement.setAttribute('data-preloader', loader);
    var preloader = this.document.getElementById('preloader');
    if (preloader) {
      setTimeout(function () {
        (this.document.getElementById('preloader') as HTMLElement).style.opacity = '0';
        (this.document.getElementById('preloader') as HTMLElement).style.visibility = 'hidden';
      }, 1000);
    }
  }
}
