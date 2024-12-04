import { Subscription, Subject, Observable, takeUntil, combineLatest, map } from 'rxjs';
import {
  Input,
  Output,
  OnInit,
  Component,
  OnDestroy,
  ElementRef,
  EventEmitter,
  AfterViewInit,
  ChangeDetectorRef,
  ViewEncapsulation,
  HostListener,
} from '@angular/core';

import {
  UserType,
  LoyaltySettingsType,
  WidgetIntegrationType,
  WalletWithReputationDtoType,
  ReputationWithoutTargetType,
  PositionEnum,
} from '@sifca-monorepo/widget-generator';

import { PlayerService } from '../player/player.service';
import { ModalService } from '../../shared/services/modal.service';
import { BASE_URL, defaultPicture } from '../../../environments/environment';
import { ProfileService } from '../player/components/profile/profile.service';
import { AnimationsHelper, childButtonState, fadeAnimations } from '../../shared/animations/animations';
import { CircularMenuService } from './circular-menu.service';

@Component({
  selector: 'fw-circular-menu',
  animations: [childButtonState, fadeAnimations],
  encapsulation: ViewEncapsulation.ShadowDom,
  templateUrl: './circular-menu.component.html',
  styles: [
    `
      @import '${BASE_URL}/assets/css/styles.min.css';
      .profile-image {
        width: 92px;
        left: 14px;
        bottom: -15px;
        height: 92px;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
        animation: clipRotateAnim 2s linear infinite;
        position: relative;
        overflow: hidden;
        z-index: 500;
      }

      .profile-image:before {
        content: '';
        position: absolute;
        top: 0%;
        bottom: 0%;
        left: 0%;
        right: 0%;
        background: var(--i) center / cover;
        animation: inherit;
        animation-direction: reverse;
      }

      .progress {
        width: 120px;
        height: 120px;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }

      .progress .track,
      .progress .fill {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 140px;
        transform: translate(75px, 685px) rotate(-90deg);
      }

      .progress .track {
        stroke: rgb(56, 71, 83);
      }

      .progress .fill {
        stroke: white;
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }

      .progress.blue .fill {
        stroke: rgb(104, 214, 198);
      }

      .progress-bar {
        position: absolute;
        top: 0;
      }

      .progress-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        background-color: white;
        transition: width 0.6s ease;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }

      .special-badge-text {
        color: #fff;
        font-size: 12px;
        font-weight: 700;
        pointer-events: none;
        position: relative;
        z-index: 6;
        font-size: 16px;
      }

      .progress .track,
      .progress .fillLeaderboard {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 140px;
        transform: translate(75px, 685px) rotate(-90deg);
      }

      .progress .track {
        stroke: rgb(56, 71, 83);
      }

      .progress .fillLeaderboard {
        stroke: rgb(255, 255, 255);
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }

      @media (600px<width<800px) {
        :host {
          scale: 0.8;
        }
      }
      @media (width<600px) {
        :host {
          scale: 0.8;
        }
      }
      @media (min-width: 800px) {
        :host {
          scale: 0.9;
          // margin-left: 1%;
        }
      }

      :host {
        z-index: 1000;
        position: fixed;
        touch-action: none;
        width: 100px !important;
        height: 100px !important;
        // left: calc(100% - 150px);
        // top: calc(50% - (75px / 2));
        img {
          z-index: 2;
          position: relative;
          border-radius: 100%;
          &.child-img {
            height: 40px;
            width: 40px;
          }
        }
        .main-button {
          cursor: grab;
          /* box-shadow: 0 0 20px rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); */
          &:active {
            cursor: grabbing !important;
          }
        }
        .desktop-size {
          width: 75px;
          height: 75px;
        }
        .mobile-size {
          width: 60px;
          height: 60px;
        }
        i {
          z-index: 2;
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .progress .track,
      .progress .fill {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 140px;
        transform: translate(75px, 685px) rotate(-90deg);
      }

      .progress .track {
        stroke: rgb(56, 71, 83);
      }

      .progress.blue .fill {
        stroke: rgb(104, 214, 198);
      }
      .level-left {
        right: 29px;
        position: absolute;
        top: 0px;
      }

      .progress-bar {
        position: absolute;
        top: 0;
      }

      .progress-bar {
        display: flex;
        flex-direction: column;
        justify-content: center;
        overflow: hidden;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        background-color: white;
        transition: width 0.6s ease;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }
      .profile-avatar-badge {
        left: 26%;
        top: 80px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 28px;
        width: 37px;
        height: 36px;
        position: absolute;
        z-index: 500000000;
        background-color: #45437f;
        clip-path: polygon(
          47.5% 5.66987%,
          48.2899% 5.30154%,
          49.13176% 5.07596%,
          50% 5%,
          50.86824% 5.07596%,
          51.7101% 5.30154%,
          52.5% 5.66987%,
          87.14102% 25.66987%,
          87.85495% 26.16978%,
          88.47124% 26.78606%,
          88.97114% 27.5%,
          89.33948% 28.2899%,
          89.56505% 29.13176%,
          89.64102% 30%,
          89.64102% 70%,
          89.56505% 70.86824%,
          89.33948% 71.7101%,
          88.97114% 72.5%,
          88.47124% 73.21394%,
          87.85495% 73.83022%,
          87.14102% 74.33013%,
          52.5% 94.33013%,
          51.7101% 94.69846%,
          50.86824% 94.92404%,
          50% 95%,
          49.13176% 94.92404%,
          48.2899% 94.69846%,
          47.5% 94.33013%,
          12.85898% 74.33013%,
          12.14505% 73.83022%,
          11.52876% 73.21394%,
          11.02886% 72.5%,
          10.66052% 71.7101%,
          10.43495% 70.86824%,
          10.35898% 70%,
          10.35898% 30%,
          10.43495% 29.13176%,
          10.66052% 28.2899%,
          11.02886% 27.5%,
          11.52876% 26.78606%,
          12.14505% 26.16978%,
          12.85898% 25.66987%
        );
      }
      .progress .track,
      .progress .test {
        fill: rgba(0, 0, 0, 0);
        stroke-width: 140px;
        transform: translate(75px, 685px) rotate(-90deg);
      }

      .progress .track {
        stroke: rgb(56, 71, 83);
      }

      .progress .test {
        stroke: rgb(255, 255, 255);
        stroke-linecap: round;
        stroke-dasharray: 2160;
        stroke-dashoffset: 2160;
        transition: stroke-dashoffset 1s;
      }

      @media (min-width: 801px) {
        .profile-cnt {
          // left: -59%;
          top: -25%;
          position: relative;
        }
      }
      @media (max-width: 800px) {
        .profile-cnt {
          // left: -48%;
          top: -25%;
          position: relative;
        }
      }

      .widget-badge {
        display: inline-block;
        padding: 0.35em 0.65em;
        font-size: 0.75em;
        font-weight: 700;
        line-height: 1;
        color: #fff;
        text-align: center;
        white-space: nowrap;
        vertical-align: baseline;
        border-radius: 4px;
      }
      .widget-rounded-pill {
        border-radius: 800px !important;
      }

      .icon-button__badge {
        width: 14px;
        height: 14px;
        background-color: red;
        border-radius: 50%;
        border: 3px solid white;
        left: 6px;
        top: 25px;
        position: relative;
        z-index: 99;
      }
      .badge_position_left {
        left: 99px !important;
      }
    `,
  ],
})
export class CircularMenuComponent implements OnDestroy, OnInit, AfterViewInit {
  private subscriptions: Subscription = new Subscription();
  private unsubscribeAll: Subject<any> = new Subject<any>();

  @Input() direction = 'right';
  @Input() alignment: PositionEnum;
  @Input() public highlightedActivity: any;
  @Output() isOpenWidget = new EventEmitter<boolean>();
  @Output() isDragedWidget = new EventEmitter<boolean>();
  @Output() directionAnimation = new EventEmitter<string>();
  @Output() mouseEnterTarget = new EventEmitter<PointerEvent>();
  @Output() mouseLeaveTarget = new EventEmitter<PointerEvent>();

  baseUrl = BASE_URL;
  windowWidth: number;
  currentUser: UserType;
  authenticated: boolean;
  public notifications: any;
  public closeIntervall: any;
  public isOpen: boolean = false;
  currentLevelPercentage: number;
  defaultPicture = defaultPicture;
  wallet: WalletWithReputationDtoType;
  loyaltySettings: LoyaltySettingsType;
  widgetSettings: WidgetIntegrationType;
  currentLevel: ReputationWithoutTargetType;
  currentUser$: Observable<UserType> = this.profileService.currentUser$;
  widgetSettings$: Observable<WidgetIntegrationType> = this.playerService.widgetSettings$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.playerService.loyaltySettings$;
  walletPushedNotification$: Observable<boolean> = this.circularMenuService.walletPushedNotification$;

  constructor(
    private element: ElementRef,
    private modalService: ModalService,
    private playerService: PlayerService,
    private profileService: ProfileService,
    private changeDetectorRef: ChangeDetectorRef,
    private circularMenuService: CircularMenuService,
  ) {}

  ngOnInit(): void {
    this.windowWidth = window.innerWidth;
    combineLatest([
      this.playerService.loyaltySettings$,
      this.playerService.authenticated$,
      this.profileService.currentUser$,
      this.playerService.widgetSettings$,
      this.playerService.currentLevelPercentage$,
      this.playerService.nextLevel$,
      this.playerService.isFinalLevel$,
      this.playerService.currentLevel$,
    ])
      .pipe(
        takeUntil(this.unsubscribeAll),
        map(([loyaltySettings, authenticated, currentUser, widgetSettings, currentLevelPercentage, nextLevel, isFinalLevel, currentLevel]) => {
          this.loyaltySettings = loyaltySettings;
          this.widgetSettings = widgetSettings;
          this.currentUser = currentUser;
          this.authenticated = authenticated;
          this.currentLevel = currentLevel;
          if (!widgetSettings?.theme) {
            this.playerService.levelColor$ = '#4F75FF';
          }
          let max = 2160;
          setTimeout(() => {
            const trackElement = this.element.nativeElement.shadowRoot.querySelector('.track') as HTMLElement;
            const fillElement = this.element.nativeElement.shadowRoot.querySelector('.fill') as HTMLElement;
            if (fillElement && trackElement) {
              if ((!this.loyaltySettings?.qualitative?.active && !authenticated) || currentLevelPercentage === null || currentLevelPercentage === 100 && authenticated) {
                const strokeStyle = widgetSettings?.theme || '#653EDA';
                fillElement.style.strokeDashoffset = '100px';
                trackElement.style.stroke = fillElement.style.stroke = strokeStyle;
                trackElement.style.opacity = '0.4';
                this.changeDetectorRef.markForCheck();
              } else {
                const strokeStyle = authenticated
                  ? !nextLevel && !isFinalLevel
                    ? loyaltySettings?.prelevel?.color
                    : isFinalLevel
                    ? currentLevel?.color
                    : nextLevel?.color
                  : '#000000';
                fillElement.style.strokeDashoffset = `${((100 - (!isFinalLevel ? currentLevelPercentage : 100)) / 100) * max}px`;
                trackElement.style.stroke = fillElement.style.stroke = strokeStyle;
                trackElement.style.opacity = '0.4';
                this.changeDetectorRef.markForCheck();
              }
            }
          }, 2000);
        }),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    window.dispatchEvent(new Event('resize'));
  }

  getBackgroundImage(): string {
    if (this.currentUser?.picture?.baseUrl) {
      return `url(${this.currentUser.picture.baseUrl}/${this.currentUser.picture.path})`;
    } else if (this.widgetSettings?.picture?.baseUrl) {
      return `url(${this.widgetSettings.picture.baseUrl}/${this.widgetSettings.picture.path})`;
    } else {
      return `url(${this.defaultPicture})`;
    }
  }

  @HostListener('touchstart', ['$event'])
  @HostListener('dragstart', ['$event'])
  onDragstart(event: PointerEvent): void {
    this.isOpen = false;
    this.isDragedWidget.emit(true);
    this.isOpenWidget.emit(false);
  }

  @HostListener('touchend', ['$event'])
  @HostListener('dragend', ['$event'])
  onDragEnd(e) {
    let clientX = e.clientX;
    if (e instanceof TouchEvent) {
      clientX = e.touches[0]?.clientX || e.changedTouches[0]?.clientX;
    }
    this.goToDirection(clientX > window.innerWidth / 2 ? 'right' : 'left');
    this.isDragedWidget.emit(false);
  }

  goToDirection(direction: 'left' | 'right') {
    this.direction = direction;
    AnimationsHelper.direction = direction;
    this.directionAnimation.emit(direction);
  }

  closeMenu() {
    this.closeIntervall = setTimeout(() => {
      this.isOpen = false;
      this.isOpenWidget.emit(false);
      this.changeDetectorRef.markForCheck();
    }, 4500);
  }

  openPopup(field: string): void {
    this.modalService.toggleModal(field);
    this.modalService.isHidden$ = false;
  }

  ngOnDestroy() {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
    this.subscriptions.unsubscribe();
  }
}
