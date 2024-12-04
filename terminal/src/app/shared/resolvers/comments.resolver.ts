import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';

import { CommentType } from '@sifca-monorepo/terminal-generator';

import { CommentService } from '../services/comment.service';

@Injectable({
  providedIn: 'root',
})
export class CommentsResolver implements Resolve<any> {
  holder: string;

  constructor(private commentService: CommentService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CommentType | {}> {
    return this.commentService.getCommentsByHolderPaginated({ [this.holder]: route.paramMap.get('id') }, true);
  }
}
