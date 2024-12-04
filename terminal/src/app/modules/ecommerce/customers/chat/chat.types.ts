import { BehaviorSubject, Observable } from 'rxjs';

import { MessageType, MessageGroupType, PictureType } from '@sifca-monorepo/terminal-generator';

export interface Profile {
  id?: string;
  name?: string;
  email?: string;
  avatar?: string;
  about?: string;
}
export interface Contact {
  id?: string;
  avatar?: string;
  name?: string;
  about?: string;
  details?: {
    emails?: {
      email?: string;
      label?: string;
    }[];
    phoneNumbers?: {
      country?: string;
      phoneNumber?: string;
      label?: string;
    }[];
    title?: string;
    company?: string;
    birthday?: string;
    address?: string;
  };
  attachments?: {
    media?: any[];
    docs?: any[];
    links?: any[];
  };
}
export interface Chat {
  id?: string;
  contactId?: string;
  contact?: Contact;
  unreadCount?: number;
  muted?: boolean;
  lastMessage?: string;
  lastMessageAt?: string;
  messages?: {
    id?: string;
    chatId?: string;
    contactId?: string;
    isMine?: boolean;
    value?: string;
    createdAt?: string;
  }[];
}
export interface IMessageType extends MessageType {
  isMine: boolean;
}
export interface IMessageGroupDataInterface {
  searchString: string;
  mediaPageIndex: number;
  mediaPageLimit: number;
  messagesPageIndex: number;
  messagesPageLimit: number;
  messageGroupsPageIndex: number;
  messageGroupsPageLimit: number;
  media$?: Observable<PictureType[]>;
  messages$?: Observable<MessageType[]>;
  media?: BehaviorSubject<PictureType[]>;
  isLastMediaPage$?: Observable<boolean>;
  messages?: BehaviorSubject<MessageType[]>;
  isLastMessagesPage$?: Observable<boolean>;
  isLastMediaPage?: BehaviorSubject<boolean>;
  isLastMessagesPage?: BehaviorSubject<boolean>;
  isLastMessageGroupsPage$?: Observable<boolean>;
  messageGroups$?: Observable<MessageGroupType[]>;
  isLastMessageGroupsPage?: BehaviorSubject<boolean>;
  messageGroups?: BehaviorSubject<MessageGroupType[]>;
  selectedMessageGroup$?: Observable<MessageGroupType>;
  selectedMessageGroup?: BehaviorSubject<MessageGroupType>;
}
