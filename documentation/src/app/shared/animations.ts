import { trigger, state, style, animate, transition, keyframes } from '@angular/animations';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AnimationService {
  private fadeAnimationStateSubject = new BehaviorSubject<string>('void');
  fadeAnimationState$ = this.fadeAnimationStateSubject.asObservable();

  updateFadeAnimationState(isIntersecting: boolean) {
    this.fadeAnimationStateSubject.next(isIntersecting ? 'visible' : 'void');
  }
}

export const fadeAnimations = [
  trigger('scaleAnimation', [
    state('open', style({ opacity: 1, transform: 'scale(1, 1)' })),
    state('*', style({ opacity: 0.2, transform: 'scale(0.9, 0.8)' })),
    transition('* => open', [
      animate('1s ease',    keyframes([
        style({ opacity: 1, transform: 'scale(1, 1) translateY(0)', offset: 0 }),
        style({ opacity: 0, transform: 'scale(0.9, 0.8) translateY(20px)', offset: 1 }),
      ]),)

    ]),
  ]),
  trigger('tabAnimation', [
    transition(':enter', [style({ opacity: 0, transform: 'scale(0.9, 0.8)' }), animate('1000ms ease', style({ opacity: 1, transform: 'scale(1, 1)' }))]),


  ]),
  trigger('fadeAnimation', [
    state('void', style({ opacity: 0 })),
    state('*', style({ opacity: 1, transform: 'translateZ(0)' })),
    transition('void => *', [style({ opacity: 0 }), animate('1.5s ease')]),
    transition('* => void', [animate('1.5s ease', style({ opacity: 0 }))]),
  ]),
  trigger('fadeUpAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(0, 100px, 0)' })),
    transition('void => *', [animate('{{ delay }}s ease', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }))], { params: { delay: '1.5' } }),
  ]),

  trigger('fadeDownAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(0, -100px, 0)' })),
    transition('void => *', [style({ transform: 'translate3d(0, -100px, 0)' }), animate('1.5s ease')]),
  ]),
  trigger('fadeRightAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(-100px, 0, 0)' })),
    transition('void => *', [style({ opacity: 1, transform: 'translate3d(-100px, 0, 0)' }), animate('1.5s ease')]),
  ]),
  trigger('fadeLeftAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(100px, 0, 0)' })),
    transition('void => *', [style({ opacity: 1, transform: 'translate3d(100px, 0, 0)' }), animate('1.5s ease')]),
  ]),
  trigger('fadeUpRightAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(-100px, 100px, 0)' })),
    transition('void => *', [style({ opacity: 1, transform: 'translate3d(-100px, 100px, 0)' }), animate('1.5s ease')]),
  ]),
  trigger('fadeUpLeftAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(100px, 100px, 0)' })),
    transition('void => *', [style({ opacity: 1, transform: 'translate3d(100px, 100px, 0)' }), animate('1.5s ease')]),
  ]),
  trigger('fadeDownRightAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(-100px, -100px, 0)' })),
    transition('void => *', [style({ opacity: 1, transform: 'translate3d(-100px, -100px, 0)' }), animate('1.5s ease')]),
  ]),
  trigger('fadeDownLeftAnimation', [
    state('void', style({ opacity: 0, transform: 'translate3d(100px, -100px, 0)' })),
    transition('void => *', [style({ opacity: 1, transform: 'translate3d(100px, -100px, 0)' }), animate('1.5s ease')]),
  ]),
];
