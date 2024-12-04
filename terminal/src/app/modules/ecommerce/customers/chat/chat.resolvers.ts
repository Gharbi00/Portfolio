import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { ChatService } from './chat.service';
import { MessageGroupType } from '@sifca-monorepo/terminal-generator';

@Injectable({
  providedIn: 'root',
})
export class MessageGroupsResolver implements Resolve<any> {
  constructor(private chatService: ChatService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<MessageGroupType[]> | any {
    this.chatService.messageGroups$ = [];
    this.chatService.messages$ = [];
    this.chatService.searchString = '';
    this.chatService.messagesPageIndex = 0;
    this.chatService.messageGroupsPageIndex = 0;
    return route.data.action === 'internal' ? this.chatService.searchInternalMessageGroup() : this.chatService.searchSupportMessageGroup();
  }
}
