import { Injectable } from '@angular/core';
import { map, switchMap, take } from 'rxjs/operators';
import { BehaviorSubject, Observable, combineLatest, of } from 'rxjs';

import { CommentType } from '@sifca-monorepo/terminal-generator';
import {
  CommentGQL,
  CommentInput,
  CreateCommentGQL,
  CommentHolderInput,
  CommentPaginateType,
  GetCommentsRepliesGQL,
  GetCommentsByHolderPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { slice } from 'lodash';

@Injectable({ providedIn: 'root' })
export class CommentService {
  private repliesSubjectArray: { [key: string]: BehaviorSubject<CommentType[]> } = {};
  private isLastRepliesSubjectArray: { [key: string]: BehaviorSubject<boolean> } = {};
  private isLoadingRepliesSubjectArray: { [key: string]: BehaviorSubject<boolean> } = {};
  private loadingComments: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private isLastCommentsPage: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(null);
  private comments: BehaviorSubject<CommentType[]> = new BehaviorSubject<CommentType[]>(null);

  posId: string;
  commentsLimit = 10;
  commentsPageIndex = 0;
  isLastRepliesArray: { [key: string]: Observable<boolean> } = {};
  repliesArray: { [key: string]: Observable<CommentType[]> } = {};
  isLoadingRepliesArray: { [key: string]: Observable<boolean> } = {};
  pages: { [key: string]: { pageIndex: number; pageLimit: number } } = {};

  get isLastCommentsPage$(): Observable<boolean> {
    return this.isLastCommentsPage.asObservable();
  }
  get comments$(): Observable<CommentType[]> {
    return this.comments.asObservable();
  }
  get loadingComments$(): Observable<boolean> {
    return this.loadingComments.asObservable();
  }

  constructor(
    private commentGQL: CommentGQL,
    private createCommentGQL: CreateCommentGQL,
    private getCommentsRepliesGQL: GetCommentsRepliesGQL,
    private getCommentsByHolderPaginatedGQL: GetCommentsByHolderPaginatedGQL,
  ) {}

  initRepliesData(id: string) {
    const observableName = `${id}$`;
    if (!this.repliesSubjectArray[id]) {
      this.repliesSubjectArray[id] = new BehaviorSubject<CommentType[]>([]);
      Object.defineProperty(this.repliesArray, observableName, {
        enumerable: true,
        get: () => this.repliesSubjectArray[id].asObservable(),
      });
    }
    if (!this.isLastRepliesSubjectArray[id]) {
      this.isLastRepliesSubjectArray[id] = new BehaviorSubject<boolean>(null);
      Object.defineProperty(this.isLastRepliesArray, observableName, {
        enumerable: true,
        get: () => this.isLastRepliesSubjectArray[id].asObservable(),
      });
    }
    if (!this.isLoadingRepliesSubjectArray[id]) {
      this.isLoadingRepliesSubjectArray[id] = new BehaviorSubject<boolean>(null);
      Object.defineProperty(this.isLoadingRepliesArray, observableName, {
        enumerable: true,
        get: () => this.isLoadingRepliesSubjectArray[id].asObservable(),
      });
    }
  }

  findCommentById(id: string): Observable<CommentType> {
    return this.commentGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        return data.comment;
      }),
    );
  }

  getCommentsByHolderPaginated(holder: CommentHolderInput, reset = false): Observable<CommentPaginateType> {
    if (reset) {
      this.commentsPageIndex = 0;
      this.comments.next([]);
    }
    this.loadingComments.next(true);
    return this.getCommentsByHolderPaginatedGQL.fetch({ holder, pagination: { page: this.commentsPageIndex, limit: this.commentsLimit } }).pipe(
      map(({ data }: any) => {
        this.isLastCommentsPage.next(data.getCommentsByHolderPaginated.isLast);
        this.comments.next(data.getCommentsByHolderPaginated.objects);
        this.loadingComments.next(false);
        return data.getCommentsByHolderPaginated;
      }),
    );
  }

  createComment(input: CommentInput): Observable<CommentType> {
    this.initRepliesData(input.replyTo);
    return combineLatest([
      this.comments,
      this.createCommentGQL.mutate({ input }),
      input.replyTo ? this.repliesArray[`${input.replyTo}$`] : of(null),
      input.replyTo ? this.isLastRepliesArray[`${input.replyTo}$`] : of(null),
    ]).pipe(
      take(1),
      map(([comments, { data }, replies, isLastReply]: any) => {
        if (!input.replyTo) {
          this.comments.next([data.createComment, ...comments]);
        } else if (isLastReply) {
          this.repliesSubjectArray[input.replyTo].next([...(replies.length ? replies : []), data.createComment]);
        }
        return data.createComment;
      }),
    );
  }

  getCommentsReplies(id: string, reset = false): Observable<CommentType[]> {
    this.initRepliesData(id);
    if (!this.pages[id]) {
      this.pages[id] = { pageIndex: 0, pageLimit: 5 };
    }
    if (reset) {
      this.repliesSubjectArray[id].next([]);
      this.isLastRepliesSubjectArray[id].next(true);
      this.pages[id] = { pageIndex: 0, pageLimit: 5 };
    }
    return combineLatest([this.repliesArray[`${id}$`], this.isLastRepliesArray[`${id}$`]]).pipe(
      take(1),
      switchMap(([replies, isLast]) => {
        if (isLast) {
          return of(replies);
        }
        return this.getCommentsRepliesGQL.fetch({ id, pagination: { page: this.pages[id].pageIndex, limit: this.pages[id].pageLimit } }).pipe(
          map(({ data }: any) => {
            this.isLastRepliesSubjectArray[id].next(data.getCommentsReplies.isLast);
            this.repliesSubjectArray[id].next([
              ...(replies?.length ? replies : []),
              ...(this.pages[id].pageIndex === 0 ? slice(data.getCommentsReplies.objects, 1) : data.getCommentsReplies.objects),
            ]);
            this.isLoadingRepliesSubjectArray[id].next(false);
            return data.getCommentsReplies.objects;
          }),
        );
      }),
    );
  }
}
