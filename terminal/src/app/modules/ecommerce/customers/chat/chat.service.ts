import { sortBy, uniqBy } from 'lodash';
import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import { map as rxMap, switchMap, take, shareReplay } from 'rxjs/operators';
import { BehaviorSubject, Observable, combineLatest, Observer, of } from 'rxjs';

import { StorageHelper } from '@diktup/frontend/helpers';
import { MessageGroupStatusEnum, MessageGroupTypeEnum } from '@sifca-monorepo/terminal-generator';
import {
  MessageType,
  CreateMessageGQL,
  MessageGroupType,
  MessagePaginateType,
  CreateMessageGroupGQL,
  CreateDirectMessageGQL,
  MarkAllMessageAsSeenGQL,
  GetMessageGroupByMemberGQL,
  SearchSupportMessageGroupGQL,
  SearchInternalMessageGroupGQL,
  GetMessagesByMessageGroupPaginationGQL,
} from '@sifca-monorepo/terminal-generator';
import { UserService } from '../../../../core/services/user.service';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private messages: BehaviorSubject<MessageType[]> = new BehaviorSubject(null);
  private isLastMessages: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingMessageGroups: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastMessageGroupsPage: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private messageGroups: BehaviorSubject<MessageGroupType[]> = new BehaviorSubject(null);
  private loadingMessages: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  progress: any;
  posId: string;
  searchGroups = '';
  scrollDown: boolean;
  progressObserver: any;
  isCurrentUserMessage: boolean;
  searchString = '';
  messagesPageIndex = 0;
  messagesPageLimit = 10;
  messageGroupsPageIndex = 0;
  messageGroupsPageLimit = 10;

  get messages$(): Observable<MessageType[]> {
    return this.messages.asObservable();
  }
  set messages$(value: any) {
    this.messages.next(value);
  }

  get isLastMessages$(): Observable<boolean> {
    return this.isLastMessages.asObservable();
  }

  get loadingMessageGroups$(): Observable<boolean> {
    return this.loadingMessageGroups.asObservable();
  }

  get loadingMessages$(): Observable<boolean> {
    return this.loadingMessages.asObservable();
  }

  get messageGroups$(): Observable<MessageGroupType[]> {
    return this.messageGroups.asObservable();
  }
  set messageGroups$(value: any) {
    this.messageGroups.next(value);
  }

  get isLastMessageGroupsPage$(): Observable<boolean> {
    return this.isLastMessageGroupsPage.asObservable();
  }

  constructor(
    public router: Router,
    private userService: UserService,
    private storageHelper: StorageHelper,
    private createMessageGQL: CreateMessageGQL,
    private createMessageGroupGQL: CreateMessageGroupGQL,
    private createDirectMessageGQL: CreateDirectMessageGQL,
    private markAllMessageAsSeenGQL: MarkAllMessageAsSeenGQL,
    private getMessageGroupByMemberGQL: GetMessageGroupByMemberGQL,
    private searchSupportMessageGroupGQL: SearchSupportMessageGroupGQL,
    private searchInternalMessageGroupGQL: SearchInternalMessageGroupGQL,
    private getMessagesByMessageGroupPaginationGQL: GetMessagesByMessageGroupPaginationGQL,
  ) {
    this.scrollDown = true;
    this.posId = this.storageHelper.getData('posId');
    this.progress = new Observable((observer: Observer<any>): any => (this.progressObserver = observer)).pipe(shareReplay());
  }

  searchSupportMessageGroup(loading = true): Observable<MessageGroupType[]> {
    this.messagesPageIndex = 0;
    this.messages$ = null;
    if (loading) {
      this.loadingMessageGroups.next(true);
    }
    return this.searchSupportMessageGroupGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        status: MessageGroupStatusEnum.ACTIVE,
        searchString: this.searchString,
        pagination: {
          page: this.messageGroupsPageIndex,
          limit: this.messageGroupsPageLimit,
        },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingMessageGroups.next(false);
          this.messageGroups.next([...(this.messageGroups.value || []), ...data.searchSupportMessageGroup.objects]);
          this.isLastMessageGroupsPage.next(data.searchSupportMessageGroup.isLast);
          return [...(this.messageGroups.value || []), ...data.searchSupportMessageGroup.objects];
        }),
      );
  }

  searchInternalMessageGroup(loading = true): Observable<MessageGroupType[]> {
    this.messagesPageIndex = 0;
    this.messages$ = null;
    if (loading) {
      this.loadingMessageGroups.next(true);
    }
    return this.searchInternalMessageGroupGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        status: MessageGroupStatusEnum.ACTIVE,
        searchString: this.searchString,
        pagination: {
          page: this.messageGroupsPageIndex,
          limit: this.messageGroupsPageLimit,
        },
      })
      .pipe(
        rxMap(({ data }: any) => {
          this.loadingMessageGroups.next(false);
          this.messageGroups.next([...(this.messageGroups.value || []), ...data.searchInternalMessageGroup.objects]);
          this.isLastMessageGroupsPage.next(data.searchInternalMessageGroup.isLast);
          return data.searchInternalMessageGroup.objects;
        }),
      );
  }

  getMessageGroupByMember(memberId: string): Observable<MessageGroupType> {
    return this.getMessageGroupByMemberGQL.fetch({ memberId, target: { pos: this.storageHelper.getData('posId') } }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.getMessageGroupByMember;
        }
      }),
    );
  }

  createMessageGroup(memberId: string): Observable<MessageGroupType> {
    return this.createMessageGroupGQL
      .mutate({
        input: {
          creator: this.storageHelper.getData('currentUserId'),
          members: [memberId],
          type: MessageGroupTypeEnum.SUPPORT,
          target: { pos: this.storageHelper.getData('posId') },
        },
      })
      .pipe(
        rxMap(({ data }: any) => {
          const newMessageGroups: any = [data.createMessageGroup, ...(this.messageGroups.value || [])];
          this.messageGroups.next(newMessageGroups);
          return data.createMessageGroup;
        }),
      );
  }

  getMessageGroupByMemberElseCreateIt(memberId: string): Observable<MessageGroupType> {
    return combineLatest([this.userService.user$, this.getMessageGroupByMemberGQL.fetch({ memberId })]).pipe(
      take(1),
      switchMap(([user, { data }]: any) => {
        if (data?.getMessageGroupByMember) {
          return of(data.getMessageGroupByMember);
        }
        return this.createMessageGroupGQL.mutate({
          input: {
            creator: user.id,
            members: [memberId],
            type: MessageGroupTypeEnum.SUPPORT,
            target: { pos: this.storageHelper.getData('posId') },
          },
        });
      }),
      rxMap(({ data }: any) => {
        if (data) {
          const newMessageGroups: any = [data.createMessageGroup, ...(this.messageGroups.value || [])];
          this.messageGroups.next(newMessageGroups);
          return data.createMessageGroup;
        }
      }),
    );
  }

  getMessagesByMessageGroupPagination(messageGroup: string, loading = true): Observable<MessagePaginateType> {
    if (loading === true) {
      this.loadingMessages.next(true);
    }
    return this.userService.user$.pipe(
      take(1),
      switchMap((user) => {
        if (user) {
          return this.getMessagesByMessageGroupPaginationGQL
            .fetch({
              messageGroup,
              pagination: {
                page: this.messagesPageIndex,
                limit: this.messagesPageLimit,
              },
            })
            .pipe(
              rxMap(({ data }: any) => {
                this.loadingMessages.next(false);
                this.isLastMessages.next(data.getMessagesByMessageGroupPagination.isLast);
                this.messages.next(
                  sortBy(
                    uniqBy([...(this.messages.value?.length ? this.messages.value : []), ...data.getMessagesByMessageGroupPagination.objects], 'id'),
                    'createdAt',
                  ),
                );
                return data.getMessagesByMessageGroupPagination;
              }),
            );
        }
      }),
    );
  }

  markAllMessageGroupMessagesAsSeen(messageGroup: string): Observable<boolean> {
    return this.markAllMessageAsSeenGQL.mutate({ messageGroup }).pipe(rxMap(({ data }) => {
      if (data) {
        return data.markAllMessageAsSeen.success;
      }
    }));
  }

  getMessagesByMessageGroupId(id: string, page: number, limit: number): Observable<MessagePaginateType> {
    return this.getMessagesByMessageGroupPaginationGQL.fetch({ messageGroup: id, pagination: { page, limit } }).pipe(
      rxMap(({ data }: any) => {
        return {
          ...data.getMessagesByMessageGroupPagination,
          objects: sortBy(data.getMessagesByMessageGroupPagination.objects as MessageType[], 'createdAt'),
        };
      }),
    );
  }

  createMessage(text: string, messageGroup: string) {
    return this.createMessageGQL.mutate({ input: { text, messageGroup } }).pipe(
      rxMap(({ data }: any) => {
        this.messages.next([...(this.messages.value || []), data.createMessage]);
        return data.createMessage;
      }),
    );
  }

  createDirectMessage(text: string, receiver: string) {
    return this.createDirectMessageGQL
      .mutate({ input: { text, receiver, type: MessageGroupTypeEnum.INTERNAL, target: { pos: this.storageHelper.getData('posId') } } })
      .pipe(
        rxMap(({ data }: any) => {
          this.messages.next([...(this.messages.value || []), data.createDirectMessage]);
          return data.createDirectMessage;
        }),
      );
  }
}
