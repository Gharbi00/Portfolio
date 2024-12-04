import { ActivatedRoute, Router } from '@angular/router';
import { BASE_URL } from '../../../../environments/environment';
import { Component, OnInit, Input, OnChanges, Output, EventEmitter, ViewEncapsulation, ChangeDetectorRef } from '@angular/core';
import { ModalService } from '../../services/modal.service';
import { PlayerService } from '../../../modules/player/player.service';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'widget-pagination',
  templateUrl: './pagination.component.html',
  encapsulation: ViewEncapsulation.ShadowDom,
  styles: [
    `
      @import '${BASE_URL}/assets/css/quill/quill.snow.css';
      @import '${BASE_URL}/assets/css/styles.min.css';
      @import '${BASE_URL}/assets/css/vendor/simplebar.css';
      @import '${BASE_URL}/assets/css/vendor/bootstrap.min.css';

      :root {
        --dynamic-color: #7750f8;
        --dynamic-color2: #615dfa;
        --dynamic-color3: #45437f;
      }

      :host {
        display: contents;
      }

      .section-pager-item-text.dark {
        background-color: #21283b !important;
        // color: #fff !important;
        // box-shadow: 3px 5px 20px 0 rgba(0, 0, 0, 0.12) !important;
      }
      .section-pager-bar.dark {
        background-color: #1d2333 !important;
      }
      .slider-control.dark {
        background-color: #1d2333 !important;
      }

      .section-pager .section-pager-item:before.dark {
        content: '' !important;
        width: 1px !important;
        height: 20px !important;
        background-color: #2f3749 !important;
        position: absolute !important;
        top: 12px !important;
        left: 0 !important;
      }
      .border-dark {
        border-color: #6e6e6e !important;
      }
      .dark-mode {
        .border {
          border: 1px solid #7e8387 !important;
        }
        .section-pager-item-text {
          color: #fff;
        }
        .section-pager-bar {
          width: 494px;
          height: 60px;
          margin: 32px auto 0;
          border-radius: 12px;
          background-color: #1d2333;
          box-shadow: 0 0 40px 0 rgba(0, 0, 0, 0.06);
          position: relative;
          overflow: hidden;

          .section-pager {
            height: 100%;
            position: absolute;
            top: 0;
            left: 60px;
            z-index: 1;
          }

          .section-pager-controls {
            .slider-control {
              width: 60px;
              height: 60px;
              background-color: #1d2333;
              position: absolute;
              top: 0;
              z-index: 2;

              &.left {
                left: 0;
                border-top-left-radius: 12px;
                border-bottom-left-radius: 12px;
              }

              &.right {
                right: 0;
                border-top-right-radius: 12px;
                border-bottom-right-radius: 12px;
              }
            }
          }
        }

        .section-pager {
          display: flex;
          align-items: center;

          &.secondary {
            .section-pager-item {
              &.active,
              &:hover {
                .section-pager-item-text {
                  color: red;
                }
              }
            }
          }

          .section-pager-item {
            padding: 0 8px;
            cursor: pointer;
            position: relative;

            &::before {
              content: '';
              width: 1px;
              height: 20px;
              background-color: #2f3749;
              position: absolute;
              top: 12px;
              left: 0;
            }

            &:last-child {
              &::after {
                content: '';
                width: 1px;
                height: 20px;
                background-color: #2f3749;
                position: absolute;
                top: 12px;
                right: 0;
              }
            }

            &.active,
            &:hover {
              .section-pager-item-text {
                background-color: #21283b;
                color: var(--dynamic-color2);
                box-shadow: white;
              }
            }

            .section-pager-item-text {
              background-color: #21283b;
              padding: 16px;
              border-radius: 12px;
              font-size: 14px;
              font-weight: 500;
              transition: color 0.2s ease-in-out, box-shadow 0.2s ease-in-out, background-color 0.2s ease-in-out;
            }
          }
        }
      }
      @media only screen and (max-width: 600px) {
        .col-mobile {
          flex: 0 0 41.666667%;
          max-width: 41.666667%;
        }
      }
    `,
  ],
})
export class PaginationComponent implements OnInit, OnChanges {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Input() perPage: number;
  @Input() total: number;
  @Input() loaded: boolean;
  @Output() pageChanged: EventEmitter<number> = new EventEmitter<number>();

  limit = 1;
  lastPage = 1;
  current = '/';
  startIndex = 1;
  currentPage = 1;
  pagesToBeShown = [];
  baseUrl = BASE_URL;
  darkMode: boolean;
  rtl: boolean;

  constructor(
    public router: Router,
    public activeRoute: ActivatedRoute,
    private modalService: ModalService,
    private playerService: PlayerService,
    private cd: ChangeDetectorRef,
  ) {}

  ngOnChanges() {
    this.refresh();
  }

  ngOnInit(): void {
    this.modalService.darkMode$.subscribe((darkMode) => {
      this.darkMode = darkMode;
      this.cd.detectChanges();
    });
    this.modalService.rtl$.subscribe((rtl) => {
      this.rtl = rtl;
      this.cd.detectChanges();
    });
    this.playerService.currentPage$.pipe(takeUntil(this.unsubscribeAll)).subscribe((currentPage) => {
      this.currentPage = currentPage;
      this.cd.markForCheck();
    });
  }

  onChangePage(page: number) {
    this.playerService.currentPage$ = page;
    this.refresh();
    this.pageChanged.emit(this.currentPage);
  }

  refresh() {
    this.lastPage = Math.ceil(this.total / this.perPage);
    this.startIndex = !(this.currentPage % this.perPage) ? this.currentPage : this.perPage * Math.floor(this.currentPage / this.perPage);
    this.pagesToBeShown = [];
    const pageCount = Math.ceil(this.total / this.perPage);
    for (let i = -1; i < 2 && pageCount >= 3; i++) {
      if (1 < this.currentPage && this.currentPage < pageCount) {
        this.pagesToBeShown.push(this.currentPage + i);
      }
      if (1 === this.currentPage) {
        this.pagesToBeShown.push(this.currentPage + i + 1);
      }
      if (this.currentPage === pageCount) {
        this.pagesToBeShown.push(this.currentPage + i - 1);
      }
    }

    for (let i = 0; i < pageCount && pageCount < 3; i++) {
      this.pagesToBeShown.push(i + 1);
    }
  }
}
