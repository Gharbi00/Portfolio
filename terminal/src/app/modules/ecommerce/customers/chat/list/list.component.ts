import { Howl } from 'howler';
import isToday from 'date-fns/isToday';
import { Lightbox } from 'ngx-lightbox';
import parseISO from 'date-fns/parseISO';
import { Router } from '@angular/router';
import { findIndex, trim } from 'lodash';
import { DOCUMENT } from '@angular/common';
import { FormBuilder, FormControl } from '@angular/forms';
import { NgbNav, NgbOffcanvas } from '@ng-bootstrap/ng-bootstrap';
import { Observable, Subject, combineLatest, debounceTime, distinctUntilChanged, map, of, switchMap, take, takeUntil } from 'rxjs';
import {
  OnInit,
  Inject,
  Component,
  ViewChild,
  QueryList,
  ElementRef,
  TemplateRef,
  HostListener,
  ViewChildren,
  ChangeDetectorRef,
} from '@angular/core';

import { StorageHelper } from '@diktup/frontend/helpers';
import { ListenForNewMessageGQL, ListenForMessageGroupUpdatedGQL } from '@sifca-monorepo/terminal-generator';
import { AccountType, CorporateUserType, MessageGroupType, MessageGroupTypeEnum, MessageType, UserType } from '@sifca-monorepo/terminal-generator';

import { ChatService } from '../chat.service';
import { TeamService } from '../../../../system/team/team.service';
import { CustomersService } from '../../customers/customers.service';
import { UserService } from '../../../../../core/services/user.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { IndexService } from '../../../../index/index.service';

@Component({
  selector: 'sifca-monorepo-chat-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ChatListComponent implements OnInit {
  private isScrolledToBottom = false;
  private unsubscribeAll: Subject<any> = new Subject<any>();
  @ViewChild('nav') nav: NgbNav;
  @ViewChild('scrollRef') scrollRef: ElementRef;
  @ViewChildren('chatContainer') elementRef: QueryList<ElementRef>;

  emoji = '';
  isFlag = false;
  toReset = false;
  message: string;
  selectedNav = 1;
  readyFor: string;
  chatData!: any[];
  groupData!: any[];
  submitted = false;
  resetGroups = true;
  contactData!: any[];
  isStatus = 'online';
  usermessage!: string;
  set: any = 'twitter';
  currentUser: UserType;
  isreplyMessage = false;
  selectedUser: UserType;
  showEmojiPicker = false;
  messages: MessageType[];
  chatMessagesData!: any[];
  chat: MessageGroupType[];
  selectedMessageGroupIndex = 0;
  username: any = 'Lisa Parker';
  chatType: MessageGroupTypeEnum;
  previousScrollHeight: number = 0;
  messageGroups: MessageGroupType[];
  previousScrollHeightMinusTop: number;
  selectedMessageGroup: MessageGroupType;
  isLastMessagesPage$: Observable<boolean>;
  selectedMainMessageGroups: MessageGroupType;
  isLastMessageGroupsPage$: Observable<boolean>;
  isProfile = 'assets/images/users/avatar-2.jpg';
  textInputControl: FormControl = new FormControl();
  selectedMessageGroup$: Observable<MessageGroupType>;
  isLastTeam$: Observable<boolean> = this.teamService.isLast$;
  images: { src: string; thumb: string; caption: string }[] = [];
  loadingTeam$: Observable<boolean> = this.teamService.isLoading$;
  messages$: Observable<MessageType[]> = this.chatService.messages$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  isLastContacts$: Observable<boolean> = this.customersService.isLast$;
  isLastMessages$: Observable<boolean> = this.chatService.isLastMessages$;
  loadingMessages$: Observable<boolean> = this.chatService.loadingMessages$;
  infiniteTeam$: Observable<AccountType[]> = this.teamService.infiniteTeam$;
  messageGroups$: Observable<MessageGroupType[]> = this.chatService.messageGroups$;
  loadingMessageGroups$: Observable<boolean> = this.chatService.loadingMessageGroups$;
  contacts$: Observable<CorporateUserType[]> = this.customersService.infiniteContacts$;
  isLastMessageGroups$: Observable<boolean> = this.chatService.isLastMessageGroupsPage$;
  sets: any = ['native', 'google', 'twitter', 'facebook', 'emojione', 'apple', 'messenger'];

  searchForm = this.formbuilder.group({
    searchString: [''],
  });
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private lightbox: Lightbox,
    private formbuilder: FormBuilder,
    private teamService: TeamService,
    private chatService: ChatService,
    private userService: UserService,
    private indexService: IndexService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private offcanvasService: NgbOffcanvas,
    private customersService: CustomersService,
    public changeDetectorRef: ChangeDetectorRef,
    public listenForNewMessageGQL: ListenForNewMessageGQL,
    public listenForMessageGroupUpdatedGQL: ListenForMessageGroupUpdatedGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.previousScrollHeightMinusTop = 0;
    this.readyFor = 'up';
    this.restore();
    const fullPath = this.router.url;
    this.chatType = fullPath.includes('/collaboration') ? MessageGroupTypeEnum.INTERNAL : MessageGroupTypeEnum.SUPPORT;
    if (this.chatType === MessageGroupTypeEnum.SUPPORT) {
      this.handleMessageGroupSearch(() => this.chatService.searchSupportMessageGroup()).subscribe();
    } else {
      this.handleMessageGroupSearch(() => this.chatService.searchInternalMessageGroup()).subscribe();
    }
    this.userService.user$.pipe(takeUntil(this.unsubscribeAll)).subscribe((user) => {
      this.currentUser = user;
      this.changeDetectorRef.markForCheck();
    });
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          if (this.selectedNav === 2) {
            this.customersService.infiniteContacts$ = [];
            this.teamService.infiniteUsers$ = [];
            if (this.chatType === MessageGroupTypeEnum.SUPPORT) {
              this.customersService.searchString.next(searchValues.searchString);
              return this.customersService.searchCorporateUsersByTarget();
            } else {
              this.teamService.searchString = searchValues.searchString;
              return this.teamService.searchAccount();
            }
          } else if (this.selectedNav === 1) {
            this.chatService.messageGroups$ = [];
            this.chatService.searchString = searchValues.searchString;
            if (this.chatType === MessageGroupTypeEnum.SUPPORT) {
              return this.chatService.searchSupportMessageGroup();
            } else {
              return this.chatService.searchInternalMessageGroup();
            }
          }
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
  }

  ngOnInit(): void {
    this.chatService.messages$.pipe(takeUntil(this.unsubscribeAll)).subscribe((messages) => {
      this.messages = messages;
      this.onListScroll();
    });
    this.listenForMessageGroupUpdatedGQL.subscribe({ userId: this.storageHelper.getData('currentUserId') }).subscribe(({ data }: any) => {
      const messageGroupIndex = findIndex(this.messageGroups, (item) => item.id === data.listenForMessageGroupUpdated.id);
      if (messageGroupIndex < 0 && data.listenForMessageGroupUpdated?.target?.pos?.id === this.storageHelper.getData('posId')) {
        this.messageGroups = [data.listenForMessageGroupUpdated, ...this.messageGroups];
      } else if (
        messageGroupIndex > -1 &&
        this.selectedMessageGroup?.id === data.listenForMessageGroupUpdated.id &&
        this.selectedMessageGroup?.target?.pos?.id === data.listenForMessageGroupUpdated?.target?.pos?.id
      ) {
        this.messageGroups = this.messageGroups.filter((group) => group.id !== data.listenForMessageGroupUpdated.id);
        this.messageGroups.unshift(this.selectedMessageGroup);
        this.changeDetectorRef.markForCheck();
      } else if (messageGroupIndex > -1 && this.selectedMessageGroup?.id !== data.listenForMessageGroupUpdated.id) {
        this.messageGroups[messageGroupIndex].unreadCount += 1;
        this.selectedMessageGroupIndex = messageGroupIndex;
        this.changeDetectorRef.markForCheck();
      }
    });
    this.listenForNewMessageGQL.subscribe({ userId: this.storageHelper.getData('currentUserId') }).subscribe(({ data }: any) => {
      if (data.listenForNewMessage?.messageGroup?.id === this.selectedMessageGroup?.id) {
        this.messages = [...this.messages, data.listenForNewMessage];
      }
      this.playNotification();
      this.onListScroll();
      this.changeDetectorRef.markForCheck();
    });
    this.chatService.messageGroups$.pipe(takeUntil(this.unsubscribeAll)).subscribe((messageGroups) => {
      this.messageGroups = messageGroups;
      this.selectedMessageGroup = messageGroups?.[0];
      // if (this.selectedMessageGroup) {
      //   this.selectedMessageGroup.lastMessage.unread = false;
      //   this.selectedMessageGroup.unreadCount = 0;
      // }
      this.selectedUser = messageGroups?.[0]?.members?.users.find((user) => user?.id !== this.currentUser?.id);
    });
    this.textInputControl.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        map((query) => {
          this.message = query;
        }),
      )
      .subscribe();
  }

  ngAfterViewInit() {
    if (this.chatType === MessageGroupTypeEnum.SUPPORT) {
      this.customersService.searchCorporateUsersByTarget().subscribe();
    } else {
      this.teamService.searchAccount().subscribe();
    }
  }

  handleMessageGroupSearch(searchMethod: () => Observable<any>): Observable<any> {
    return searchMethod().pipe(
      switchMap((res) => {
        if (res?.length) {
          this.selectedMessageGroup = res[0];
          return this.chatService.getMessagesByMessageGroupPagination(this.selectedMessageGroup?.id);
        } else {
          return of(null);
        }
      }),
      switchMap(() => {
        if (this.selectedMessageGroup?.lastMessage?.unread) {
          this.selectedMessageGroup.unreadCount = 0;
          return this.chatService.markAllMessageGroupMessagesAsSeen(this.selectedMessageGroup?.id);
        } else {
          return of(null);
        }
      }),
      switchMap((res) => {
        if (res) {
          if (this.selectedMessageGroup) {
            this.selectedMessageGroup.lastMessage.unread = false;
            this.selectedMessageGroup.unreadCount = 0;
            this.changeDetectorRef.markForCheck();
          }
          return this.indexService.getMenuBadges();
        } else {
          return of(null);
        }
      }),
    );
  }

  playNotification() {
    const sound = new Howl({ src: ['assets/sounds/sound.mp3'] });
    sound.play();
    this.changeDetectorRef.markForCheck();
  }

  getMessageGroup(messageGroup: MessageGroupType) {
    this.selectedMessageGroup = messageGroup;
    if (this.chatType === MessageGroupTypeEnum.INTERNAL) {
      this.selectedUser = messageGroup?.members?.users.find((user) => user?.id !== this.currentUser?.id);
    }
    this.chatService.messages$ = [];
    this.messages = [];
    this.chatService.messagesPageIndex = 0;
    this.markUnseenAndgetMessages(messageGroup, false);
    const userChatShow = this.document.querySelector('.user-chat');
    if (userChatShow != null) {
      userChatShow.classList.add('user-chat-show');
    }
  }

  selectUser(member: any) {
    this.chatService.messages$ = [];
    this.messages = [];
    this.chatService.messagesPageIndex = 0;
    if (this.chatType === MessageGroupTypeEnum.SUPPORT) {
      this.chatService
        .getMessageGroupByMember(member)
        .pipe(
          switchMap((result) => {
            if (result) {
              this.selectedMessageGroup = result;
              this.selectedMessageGroup.unreadCount = 0;
              this.nav.select(1);
              this.chatService.messagesPageIndex = 0;
              this.chatService.messages$ = null;
              return this.chatService.getMessagesByMessageGroupPagination(this.selectedMessageGroup?.id, true);
            }
            return this.chatService.createMessageGroup(member);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.nav.select(1);
            this.onListScroll();
            this.changeDetectorRef.markForCheck();
          }
        });
    } else {
      this.selectedUser = member?.user;
      this.chatService.getMessageGroupByMember(member?.user?.id).subscribe((res) => {
        if (res) {
          this.selectedNav = 1;
          this.selectedMessageGroup = res;
          this.markUnseenAndgetMessages(res);
        }
      });
    }
  }

  onNavChange(event) {
    this.selectedNav = event.nextId;
    if (this.searchForm.get('searchString').value !== '') {
      this.searchForm.get('searchString').patchValue('');
    }
  }

  markUnseenAndgetMessages(messageGroup: MessageGroupType, fetchMessages = true) {
    combineLatest([
      this.chatService.getMessagesByMessageGroupPagination(messageGroup?.id),
      ...(messageGroup.lastMessage?.unread === true || this.selectedMessageGroup?.unreadCount > 0
        ? [
            this.chatService.markAllMessageGroupMessagesAsSeen(messageGroup.id).pipe(
              switchMap(() => {
                let field: string;
                field = this.chatType === MessageGroupTypeEnum.SUPPORT ? 'searchSupportMessageGroup' : 'searchInternalMessageGroup';
                this.resetGroups = false;
                this.selectedMessageGroup.unreadCount = 0;
                this.selectedMessageGroup.lastMessage.unread = false;
                if (fetchMessages) {
                  return this.chatService[field](true);
                } else return of(null);
              }),
              switchMap((res) => {
                if (res) {
                  return this.indexService.getMenuBadges();
                } else {
                  return of(null);
                }
              }),
            ),
          ]
        : []),
    ]).subscribe();
  }

  onListScroll() {
    if (this.scrollRef !== undefined) {
      setTimeout(() => {
        this.scrollRef.nativeElement.scrollTop = this.scrollRef.nativeElement.scrollHeight;
        this.changeDetectorRef.markForCheck();
      }, 500);
    }
  }

  @HostListener('window:scroll', ['$event'])
  onScroll(event: Event, field: string) {
    const element = event.target as HTMLElement;
    const atBottom = element.scrollHeight - element.clientHeight <= element.scrollTop + 100;
    if (atBottom && !this.isScrolledToBottom) {
      this.isScrolledToBottom = true;
      if (this.chatType === MessageGroupTypeEnum.SUPPORT && field === 'customers') {
        this.loadMoreContacts();
      } else if (this.chatType === MessageGroupTypeEnum.INTERNAL && field === 'customers') {
        this.loadMoreTeam();
      }
      if (field === 'chat') {
        this.loadMoreMessageGroups();
      }
    } else if (!atBottom) {
      this.isScrolledToBottom = false;
    }
  }

  scrollHandler(e) {
    if (e === 'top') {
      this.loadMoreMessages();
    }
  }

  loadMoreContacts() {
    this.customersService.isLast$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.customersService.pageIndex++;
        this.customersService.searchCorporateUsersByTarget().subscribe();
      }
    });
  }

  loadMoreMessageGroups() {
    let field: string;
    field = this.chatType === MessageGroupTypeEnum.SUPPORT ? 'searchSupportMessageGroup' : 'searchInternalMessageGroup';
    this.chatService.isLastMessageGroupsPage$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.chatService.messageGroupsPageIndex++;
        this.chatService[field](false).subscribe();
      }
    });
  }

  loadMoreTeam() {
    this.teamService.isLast$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.teamService.page++;
        this.teamService.searchAccount(true).subscribe();
      }
    });
  }

  loadMoreMessages() {
    this.prepareFor('up');
    this.chatService.isLastMessages$.pipe(take(1)).subscribe((isLast) => {
      if (!isLast) {
        this.chatService.messagesPageIndex++;
        this.chatService.getMessagesByMessageGroupPagination(this.selectedMessageGroup?.id, false).subscribe((res) => {
          if (res) {
            setTimeout(() => this.restore());
          }
        });
      }
    });
  }

  prepareFor(direction) {
    this.toReset = true;
    this.readyFor = direction || 'up';
    this.previousScrollHeightMinusTop = this.elementRef.first.nativeElement.scrollHeight - this.elementRef.first.nativeElement.scrollTop;
  }

  restore() {
    if (this.toReset) {
      if (this.readyFor === 'up') {
        this.elementRef.first.nativeElement.scrollTop = this.elementRef.first.nativeElement.scrollHeight - this.previousScrollHeightMinusTop;
      }
      this.toReset = false;
    }
  }

  reset() {
    this.readyFor = 'up';
    this.previousScrollHeightMinusTop = 0;
  }

  send(): void {
    let field: string;
    field = this.chatType === MessageGroupTypeEnum.INTERNAL ? 'createDirectMessage' : 'createMessage';
    if (!trim(this.message)) {
      return;
    }
    this.chatService[field](
      this.message,
      this.chatType === MessageGroupTypeEnum.SUPPORT ? this.selectedMessageGroup?.id : this.selectedUser?.id,
    ).subscribe((res) => {
      if (res) {
        setTimeout(() => {
          this.onListScroll();
        });
        if (this.selectedMessageGroup) {
          this.messageGroups = this.messageGroups.filter((group) => group.id !== this.selectedMessageGroup.id);
          this.messageGroups.unshift(this.selectedMessageGroup);
        }
        if (this.chatType === MessageGroupTypeEnum.INTERNAL && this.selectedNav === 2) {
          this.selectedNav = 1;
          this.chatService.messageGroups$ = [];
          this.messageGroups = [];
          this.chatService.messageGroupsPageIndex = 0;
          return this.chatService.searchInternalMessageGroup(true).subscribe();
        }
      }
    });
    this.textInputControl.reset();
  }

  isToday(date: string): boolean {
    return isToday(parseISO(date));
  }

  chatUsername(name: string, profile: any, status: string) {
    this.isFlag = true;
    this.username = name;
    this.usermessage = 'Hello';
    this.chatMessagesData = [];
    const currentDate = new Date();
    this.isStatus = status;
    this.isProfile = profile ? profile : 'assets/images/users/user-dummy-img.jpg';
    this.chatMessagesData.push({
      name: this.username,
      message: this.usermessage,
      profile: this.isProfile ? this.isProfile : 'assets/images/users/user-dummy-img.jpg',
      time: currentDate.getHours() + ':' + currentDate.getMinutes(),
    });
    const userChatShow = this.document.querySelector('.user-chat');
    if (userChatShow != null) {
      userChatShow.classList.add('user-chat-show');
    }
  }

  /**
   * SidebarHide modal
   * @param content modal content
   */
  SidebarHide() {
    const recentActivity = this.document.querySelector('.user-chat');
    if (recentActivity != null) {
      recentActivity.classList.remove('user-chat-show');
    }
  }

  open(index: number): void {
    // open lightbox
    this.lightbox.open(this.images, index, {});
  }

  // Contact Search
  ContactSearch() {
    let li: any, a: any | undefined, i: any, txtValue: any;
    const input: any = this.document.getElementById('searchContact') as HTMLAreaElement;
    const filter = input.value.toUpperCase();
    const ul = this.document.querySelectorAll('.chat-user-list');
    ul.forEach((item: any) => {
      li = item.getElementsByTagName('li');
      for (i = 0; i < li.length; i++) {
        a = li[i].getElementsByTagName('p')[0];
        txtValue = a?.innerText;
        if (txtValue?.toUpperCase().indexOf(filter) > -1) {
          li[i].style.display = '';
        } else {
          li[i].style.display = 'none';
        }
      }
    });
  }

  // Message Search
  MessageSearch() {
    let a: any | undefined, i: any, txtValue: any;
    const input: any = this.document.getElementById('searchMessage') as HTMLAreaElement;
    const filter = input.value.toUpperCase();
    const ul = this.document.getElementById('users-conversation');
    const li = ul.getElementsByTagName('li');
    for (i = 0; i < li.length; i++) {
      a = li[i].getElementsByTagName('p')[0];
      txtValue = a?.innerText;
      if (txtValue?.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = '';
      } else {
        li[i].style.display = 'none';
      }
    }
  }

  // Filter Offcanvas Set
  onChatInfoClicked(content: TemplateRef<any>) {
    this.offcanvasService.open(content, { position: 'end' });
  }
  // Copy Message
  copyMessage(event: any) {
    navigator.clipboard.writeText(event.target.closest('.chat-list').querySelector('.ctext-content').innerHTML);
    this.document.getElementById('copyClipBoard')?.classList.add('show');
    setTimeout(() => {
      this.document.getElementById('copyClipBoard')?.classList.remove('show');
    }, 1000);
  }

  // Delete Message
  deleteMessage(event: any) {
    event.target.closest('.chat-list').remove();
  }

  // Delete All Message
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  deleteAllMessage(event: any) {
    const allMsgDelete: any = this.document.getElementById('users-conversation')?.querySelectorAll('.chat-list');
    allMsgDelete.forEach((item: any) => {
      item.remove();
    });
  }

  // Emoji Picker
  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    const { emoji } = this;
    const text = `${emoji}${event.emoji.native}`;
    this.emoji = text;
    this.showEmojiPicker = false;
  }

  onFocus() {
    this.showEmojiPicker = false;
  }
  onBlur() {}

  closeReplay() {
    this.document.querySelector('.replyCard')?.classList.remove('show');
  }

  /**
   * Delete Chat Contact Data
   */
  delete(event: any) {
    event.target.closest('li')?.remove();
  }

  ngOnDestroy() {
    this.customersService.pageIndex = 0;
    this.teamService.page = 0;
    this.teamService.searchString = '';
    this.customersService.searchString$ = '';
    this.chatService.messageGroups$ = null;
    this.chatService.messages$ = null;
    this.chatService.messageGroupsPageIndex = 0;
    this.chatService.messagesPageIndex = 0;
    this.customersService.infiniteContacts$ = [];
    this.chatService.searchString = '';
  }
}
