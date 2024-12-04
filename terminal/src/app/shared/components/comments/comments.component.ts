import { forEach, omit } from 'lodash';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { Observable, combineLatest, map, switchMap, take } from 'rxjs';

import { CommentType } from '@sifca-monorepo/terminal-generator';
import { FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { CommentService } from '../../services/comment.service';
import { InvoicingService } from '../../../modules/shared/services/invoicing.service';

@Component({
  selector: 'app-comments',
  styleUrls: ['./comments.component.scss'],
  templateUrl: './comments.component.html',
})
export class CommentsComponent implements OnInit {
  currentUserId: string;
  commentForm: FormGroup;
  defaultCommentForm: any;
  replyFormsArray: { [key: string]: FormGroup } = {};
  replyInputVisibleArray: { [key: string]: boolean } = {};
  repliesArray: { [key: string]: Observable<CommentType[]> } = {};
  isLastRepliesArray: { [key: string]: Observable<boolean> } = {};
  isLoadingRepliesArray: { [key: string]: Observable<boolean> } = {};
  comments$: Observable<CommentType[]> = this.commentService.comments$;
  commentHolder$: Observable<string> = this.invoicingService.commentHolder$;
  loadingComments$: Observable<boolean> = this.commentService.loadingComments$;
  isLastCommentsPage$: Observable<boolean> = this.commentService.isLastCommentsPage$;

  constructor(
    private formBuilder: FormBuilder,
    private storageHelper: StorageHelper,
    private commentService: CommentService,
    private invoicingService: InvoicingService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    this.currentUserId = this.storageHelper.getData('currentUserId');
    combineLatest([this.invoicingService.commentService$, this.invoicingService.commentServiceAttribute$])
      .pipe(
        take(1),
        switchMap(([commentService, commentServiceAttribute]: string[]) =>
          combineLatest([
            this[commentService][`${commentServiceAttribute}$`] as Observable<any>,
            this.commentService.comments$,
            this.invoicingService.commentHolder$,
          ]),
        ),
        map(([commentHolderData, comments, commentHolder]) => {
          this.defaultCommentForm = {
            replyTo: [''],
            attachments: [[]],
            comment: ['', Validators.required],
            user: [this.currentUserId, Validators.required],
            holder: this.formBuilder.group({
              [commentHolder]: [commentHolderData?.id, Validators.required],
            }),
          };
          this.commentForm = this.formBuilder.group(this.defaultCommentForm);
          this.commentForm.valueChanges.subscribe((d) => {});
          forEach(comments, (comment) => {
            const observableName = `${comment.id}$`;
            this.replyFormsArray[comment.id] = this.formBuilder.group({
              ...this.defaultCommentForm,
              replyTo: [comment.id],
            });
            this.commentService.initRepliesData(comment.id);
            this.repliesArray[observableName] = this.commentService.repliesArray[observableName];
            this.isLastRepliesArray[observableName] = this.commentService.isLastRepliesArray[observableName];
            this.isLoadingRepliesArray[observableName] = this.commentService.isLoadingRepliesArray[observableName];
          });
        }),
      )
      .subscribe();
  }

  createComment(form: FormGroup) {
    const input: any = {
      ...FormHelper.getNonEmptyValues(omit(form.value, ['replyTo', 'attachments'])),
      ...(form.get('replyTo')?.value ? { replyTo: form.value.replyTo } : {}),
      ...(form.get('attachments')?.value.length ? { attachments: form.value.attachments } : {}),
    };
    this.commentService.createComment(input).subscribe((res) => {
      form.get('comment').reset();
      if (form.get('attachments')?.value.length) {
        form.get('attachments').reset();
      }
      this.changeDetectorRef.markForCheck();
    });
  }

  showReplyInput(id: string) {
    this.replyInputVisibleArray[id] = true;
  }

  hideReplyInput(id: string) {
    this.replyInputVisibleArray[id] = false;
  }

  replyToComment(id: string) {
    this.createComment(this.replyFormsArray[id]);
    this.replyInputVisibleArray[id] = false;
  }

  loadMoreReplies(id: string) {
    this.commentService.pages[id] = {
      pageLimit: this.commentService.pages[id]?.pageLimit || 5,
      pageIndex: this.commentService.pages[id]?.pageIndex >= 0 ? this.commentService.pages[id]?.pageIndex + 1 : 0,
    };
    this.commentService.getCommentsReplies(id).subscribe(() => {
      this.changeDetectorRef.markForCheck();
    });
  }
}
