import { trigger, transition, state, style, animate, keyframes, useAnimation, AnimationMetadata } from '@angular/animations';

import { lightSpeedIn, lightSpeedOut, rotateOutUpLeft, rotateOutUpRight, rotateInDownLeft, rotateInDownRight } from 'ng-animate';
import { BehaviorSubject } from 'rxjs';

export type AnimationDirection = 'left' | 'right';

export class AnimationsHelper {
  public static direction: AnimationDirection = 'left';
  private fadeAnimationStateSubject = new BehaviorSubject<string>('void');
  fadeAnimationState$ = this.fadeAnimationStateSubject.asObservable();

  updateFadeAnimationState(isIntersecting: boolean) {
    this.fadeAnimationStateSubject.next(isIntersecting ? 'visible' : 'void');
  }
}

export const enterFromRight: AnimationMetadata[] = [useAnimation(rotateInDownRight, { params: { timing: 0.3 } })];
export const enterFromLeft: AnimationMetadata[] = [useAnimation(rotateInDownLeft, { params: { timing: 0.3 } })];
export const exitToRight: AnimationMetadata[] = [useAnimation(rotateOutUpRight, { params: { timing: 0.2 } })];
export const exitToLeft: AnimationMetadata[] = [useAnimation(rotateOutUpLeft, { params: { timing: 0.2 } })];
export function canEnterLeft(from, to) {
  return AnimationsHelper.direction === 'left' && !to;
}
export function canEnterRight(from, to) {
  return AnimationsHelper.direction === 'right' && !to;
}
export function canExitLeft(from, to) {
  return AnimationsHelper.direction === 'left' && !!to;
}
export function canExitRight(from, to) {
  return AnimationsHelper.direction === 'right' && !!to;
}
export const childButtonState = trigger('childButtonState', [
  transition(canExitLeft, exitToLeft),
  transition(canExitRight, exitToRight),
  transition(canEnterLeft, enterFromLeft),
  transition(canEnterRight, enterFromRight),
]);
export const hightlightActivity = trigger('lightSpeed', [
  transition(':enter', useAnimation(lightSpeedIn, { params: { timing: 0.3 } })),
  transition(':leave', useAnimation(lightSpeedOut), { params: { timing: 0.3 } }),
]);
export const fadeAnimations = [
  trigger('tabAnimation', [
    transition(':enter', [
      style({ opacity: 0, transform: 'scale(0.8)' }),
      animate('300ms ease-in', style({ opacity: 1, transform: 'scale(1)' })),
    ]),

    transition(':leave', [
      animate(
        '300ms ease-out',
        keyframes([
          style({ opacity: 1, transform: 'scale(1) translateY(0)', offset: 0 }),
          style({ opacity: 0, transform: 'scale(0.8) translateY(20px)', offset: 1 }),
        ]),
      ),
    ]),
  ]),
    trigger('fadeAnimation', [
      state('void', style({ opacity: 0 })),
      state('*', style({ opacity: 1, transform: 'translateZ(0)' })),
      transition('void => *', [
        style({ opacity: 0 }),
        animate('1.5s ease')
      ]),
      transition('* => void', [
        animate('1.5s ease', style({ opacity: 0 }))
      ])
    ]),
    trigger('fadeUpAnimation', [
      state('void', style({ opacity: 0, transform: 'translate3d(0, 100px, 0)' })),
      transition('void => *', [
        animate('{{ delay }}s ease', style({ opacity: 1, transform: 'translate3d(0, 0, 0)' }))
      ], { params: { delay: '1.5' } }) 
    ]),
    
    trigger('fadeDownAnimation', [
      state('void', style({ opacity: 0,transform: 'translate3d(0, 0px, 0)' })),
      transition('void => *', [
        style({ transform: 'translate3d(0, -100px, 0)' }),
        animate('1s ease')
      ])
    ]),
    trigger('fadeRightAnimation', [
      state('void', style({opacity: 0, transform: 'translate3d(-100px, 0, 0)' })),
      transition('void => *', [
        style({ opacity: 1, transform: 'translate3d(-100px, 0, 0)' }),
        animate('1.5s ease')
      ])
    ]),
    trigger('fadeLeftAnimation', [
      state('void', style({ opacity: 0,transform: 'translate3d(100px, 0, 0)' })),
      transition('void => *', [
        style({  opacity: 1,transform: 'translate3d(100px, 0, 0)' }),
        animate('1.5s ease')
      ])
    ]),
    trigger('fadeUpRightAnimation', [
      state('void', style({ opacity: 0,transform: 'translate3d(-100px, 100px, 0)' })),
      transition('void => *', [
        style({ opacity: 1, transform: 'translate3d(-100px, 100px, 0)' }),
        animate('1.5s ease')
      ])
    ]),
    trigger('fadeUpLeftAnimation', [
      state('void', style({opacity: 0, transform: 'translate3d(100px, 100px, 0)' })),
      transition('void => *', [
        style({  opacity: 1,transform: 'translate3d(100px, 100px, 0)' }),
        animate('1.5s ease')
      ])
    ]),
    trigger('fadeDownRightAnimation', [
      state('void', style({ opacity: 0,transform: 'translate3d(-100px, -100px, 0)' })),
      transition('void => *', [
        style({  opacity: 1,transform: 'translate3d(-100px, -100px, 0)' }),
        animate('1.5s ease')
      ])
    ]),
    trigger('fadeDownLeftAnimation', [
      state('void', style({ opacity: 0, transform: 'translate3d(100px, -100px, 0)' })),
      transition('void => *', [
        style({ opacity: 1, transform: 'translate3d(100px, -100px, 0)' }),
        animate('1.5s ease')
      ])
    ])
  ];