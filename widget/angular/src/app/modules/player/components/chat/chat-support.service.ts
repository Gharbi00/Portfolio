import { sortBy } from 'lodash';
import { Injectable } from '@angular/core';
import { map, BehaviorSubject, Observable, switchMap, takeUntil, Subject} from 'rxjs';

import {
  MessageType,
  MessageGroupTypeEnum,
  SendMessageToTargetGQL,
  GetMessagesByMemberPaginatedGQL,
} from '@sifca-monorepo/widget-generator';
import { ProfileService } from '../profile/profile.service';

@Injectable({
  providedIn: 'root',
})
export class ChatSupportService {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  private messages: BehaviorSubject<MessageType[]> = new BehaviorSubject(null);
  private loadingMessages: BehaviorSubject<boolean> = new BehaviorSubject(null);

  messagesPageLimit = 10;
  messagesPageIndex = 0;
  isLastPage: BehaviorSubject<boolean> = new BehaviorSubject(null);

  get isLastPage$(): Observable<boolean> {
    return this.isLastPage.asObservable();
  }

  get messages$(): Observable<MessageType[]> {
    return this.messages.asObservable();
  }
  set messages$(value: any) {
    this.messages.next(value);
  }

  get loadingMessages$(): Observable<boolean> {
    return this.loadingMessages.asObservable();
  }
  set loadingMessages$(value: any) {
    this.loadingMessages.next(value);
  }

  constructor(
    private profileService: ProfileService,
    private sendMessageToTargetGQL: SendMessageToTargetGQL,
    private getMessagesByMemberPaginatedGQL: GetMessagesByMemberPaginatedGQL,
  ) {}

  getMessagesByMemberPaginated(scorlled = false): Observable<MessageType[]> {
    if (!scorlled) {
      this.loadingMessages.next(true);
    }
    return this.profileService.currentUser$.pipe(takeUntil(this.unsubscribeAll), switchMap((currentUser) => {
      return this.getMessagesByMemberPaginatedGQL.fetch({
        target: { pos: (window as any).widgetInit.appId },
        memberId: currentUser?.id,
        type: MessageGroupTypeEnum.SUPPORT,
        pagination: {
          page: this.messagesPageIndex,
          limit: this.messagesPageLimit,
        },
      }).pipe(
        map(({ data }: any) => {
          this.loadingMessages.next(false);
          if (data) {
            this.isLastPage.next(data.getMessagesByMemberPaginated.isLast);
            this.messages.next([...(this.messages.value || []), ...sortBy(data.getMessagesByMemberPaginated.objects, 'createdAt')]);
            return data.getMessagesByMemberPaginated.objects;
          }
        }),
      )
    }))
    ;
  }

  sendMessageToTarget(text: string) {
    return this.sendMessageToTargetGQL.mutate({ input: { target: { pos: (window as any).widgetInit.appId }, text } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.messages.next([...(this.messages.value || []), data.sendMessageToTarget]);
          return data.sendMessageToTarget;
        }
      }),
    );
  }

  ngOnDestroy(): void {
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
