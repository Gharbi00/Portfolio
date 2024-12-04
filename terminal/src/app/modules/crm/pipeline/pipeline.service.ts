import { Injectable } from '@angular/core';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import {
  GetCrmBoardGQL,
  UpdateBoardListGQL,
  UpdateBoardCardGQL,
  DeleteBoardListGQL,
  DeleteBoardCardGQL,
  CreateBoardListGQL,
  CreateBoardCardGQL,
  GetArchivedBoardCardsPaginatedGQL,
  BoardWithListsAndCardsType,
  BoardCardForListType,
  BoardCardType,
  BoardListType,
  ListWithCardsType,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class PipelineService {
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private archived: BehaviorSubject<BoardCardType[]> = new BehaviorSubject(null);
  private card: BehaviorSubject<BoardCardForListType> = new BehaviorSubject(null);
  private board: BehaviorSubject<BoardWithListsAndCardsType> = new BehaviorSubject(null);
  private loadingCrm: BehaviorSubject<boolean> = new BehaviorSubject(null);

  searchString = '';
  pageIndex = 0;
  pageLimit = 10;

  constructor(
    private storageHelper: StorageHelper,
    private getCRMBoardGQL: GetCrmBoardGQL,
    private createBoardCardGQL: CreateBoardCardGQL,
    private updateBoardCardGQL: UpdateBoardCardGQL,
    private deleteBoardCardGQL: DeleteBoardCardGQL,
    private createBoardListGQL: CreateBoardListGQL,
    private updateBoardListGQL: UpdateBoardListGQL,
    private deleteBoardListGQL: DeleteBoardListGQL,
    private getArchivedBoardCardsPaginatedGQL: GetArchivedBoardCardsPaginatedGQL,
  ) {}

  get board$(): Observable<BoardWithListsAndCardsType> {
    return this.board.asObservable();
  }
  get loadingCrm$(): Observable<boolean> {
    return this.loadingCrm.asObservable();
  }
  get archived$(): Observable<BoardCardType[]> {
    return this.archived.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  getCRMBoard(): Observable<BoardWithListsAndCardsType> {
    this.loadingCrm.next(true);
    return this.getCRMBoardGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.loadingCrm.next(false);
          this.board.next(data.getCRMBoard);
          return data.getCRMBoard;
        }
      }),
    );
  }

  getArchivedBoardCardsPaginated(boardId: string): Observable<BoardCardType[]> {
    return this.getArchivedBoardCardsPaginatedGQL
      .fetch({ searchString: this.searchString, boardId, pagination: { page: this.pageIndex, limit: this.pageLimit } })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.pageLimit,
              length: data.getArchivedBoardCardsPaginated?.count,
            });
            this.archived.next(data.getArchivedBoardCardsPaginated.objects);
            return data.getArchivedBoardCardsPaginated.objects;
          }
        }),
      );
  }

  createList(name: string, board: string, rank?: number): Observable<BoardListType> {
    return this.createBoardListGQL.mutate({ name, board, rank }).pipe(
      map((response) => response.data.createBoardList as any),
      tap((newList) => {
        const iboard = this.board.value;
        iboard.boardLists = iboard.boardLists?.length ? [...iboard.boardLists, newList as any] : [newList as any];
        iboard.boardLists.sort((a, b) => a.rank - b.rank);
        this.board.next(iboard);
      }),
    );
  }

  updateList(id: string, name?: string, board?: string, rank?: number): Observable<BoardListType> {
    return this.updateBoardListGQL.mutate({ id, name, board, rank }).pipe(
      map((response) => response.data.updateBoardList as any),
      tap((updatedList) => {
        const iboard = this.board.value;
        const index = iboard.boardLists.findIndex((item) => item.id === id);
        iboard.boardLists[index] = { ...(updatedList as any), boardCards: iboard.boardLists[index].boardCards } as ListWithCardsType;
        iboard.boardLists.sort((a, b) => a.rank - b.rank);
        this.board.next(iboard);
      }),
    );
  }

  deleteList(id: string): Observable<boolean> {
    return this.deleteBoardListGQL.mutate({ id }).pipe(
      map((response) => response.data.deleteBoardList.success),
      tap((isDeleted) => {
        const board = this.board.value;
        const index = board.boardLists.findIndex((item) => item.id === id);
        board.boardLists.splice(index, 1);
        board.boardLists.sort((a, b) => a.rank - b.rank);
        this.board.next(board);
      }),
    );
  }

  getCard(id: string): Observable<BoardCardForListType> {
    return this.board.pipe(
      take(1),
      map((board) => {
        const card = board.boardLists.find((list) => list.boardCards.some((item) => item.id === id)).boardCards.find((item) => item.id === id);
        this.card.next(card);
        return card;
      }),
      switchMap((card) => {
        if (!card) {
          return throwError(() => new Error('Could not found the card with id of ' + id + '!'));
        }
        return of(card);
      }),
    );
  }

  createBoardCard(input: any): Observable<BoardCardForListType> {
    return this.createBoardCardGQL
      .mutate({
        procedure: input?.procedure,
        budget: input?.budget,
        customer: input?.customer,
        title: input?.title,
        boardList: input?.boardList,
        description: input?.description,
        dueDate: input?.dueDate,
        assignedTo: input.assignedTo,
      })
      .pipe(
        map((response) => response.data.createBoardCard),
        tap((newCard: any) => {
          const board = this.board.value;
          board.boardLists.forEach((listItem, index, list) => {
            if (listItem.id === newCard.boardList.id) {
              list[index].boardCards.push(newCard);
            }
          });
          this.board.next(board);
          return newCard;
        }),
      );
  }

  updateArchivedCard(input: any, id: string): Observable<BoardCardType> {
    return this.updateBoardCardGQL
      .mutate({
        id,
        archived: input?.archived,
        procedure: input?.procedure,
        budget: input?.budget,
        customer: input?.customer,
        title: input?.title,
        boardList: input?.boardList,
        description: input?.description,
        dueDate: input?.dueDate,
        assignedTo: input.assignedTo,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            const archived = this.archived.value;
            const index = archived?.findIndex((a) => a.id === id);
            archived[index] = data.updateBoardCard;
            this.archived.next(archived);
            return data.updateBoardCard;
          }
        }),
      );
  }

  updateBoardCard(input: any, id: string): Observable<BoardCardForListType> {
    return this.board$.pipe(
      take(1),
      switchMap((board) =>
        this.updateBoardCardGQL
          .mutate({
            id,
            archived: input?.archived,
            procedure: input?.procedure,
            budget: input?.budget,
            customer: input?.customer,
            title: input?.title,
            boardList: input?.boardList,
            description: input?.description,
            dueDate: input?.dueDate,
            assignedTo: input.assignedTo,
          })
          .pipe(
            map((response) => {
              board.boardLists.forEach((listItem) => {
                listItem.boardCards.forEach((cardItem, index, array) => {
                  if (cardItem.id === id) {
                    array[index] = response.data.updateBoardCard as any;
                  }
                });
              });
              this.board.next(board);
              this.card.next(response.data.updateBoardCard as any);
              return response.data.updateBoardCard as any;
            }),
          ),
      ),
    );
  }

  archivedCard(input: any, id: string, isArchived: boolean) {
    return this.board$.pipe(
      take(1),
      switchMap((board) =>
        this.updateBoardCardGQL
          .mutate({
            id,
            archived: input?.archived,
            procedure: input?.procedure,
            budget: input?.budget,
            customer: input?.customer,
            title: input?.title,
            boardList: input?.boardList,
            description: input?.description,
            dueDate: input?.dueDate,
            assignedTo: input.assignedTo,
          })
          .pipe(
            map((response) => {
              if (isArchived === false) {
                board.boardLists.forEach((listItem) => {
                  listItem.boardCards.forEach((cardItem, index, array) => {
                    if (cardItem.id === id) {
                      array?.splice(index, 1);
                    }
                  });
                });
                this.board.next(board);
                this.card.next(response.data.updateBoardCard as any);
              } else {
                const archived = this.archived.value;
                const index = archived?.findIndex((a) => a.id === id);
                archived?.splice(index, 1);
                this.archived.next(archived);
              }
              return response.data.updateBoardCard as any;
            }),
          ),
      ),
    );
  }

  deleteCard(id: string): Observable<boolean> {
    return this.board$.pipe(
      take(1),
      switchMap((board) =>
        this.deleteBoardCardGQL.mutate({ id }).pipe(
          map((response) => {
            if (response.data.deleteBoardCard.success) {
              board.boardLists.forEach((listItem) => {
                listItem.boardCards.forEach((cardItem, index, array) => {
                  if (cardItem.id === id) {
                    array.splice(index, 1);
                  }
                });
              });
              this.board.next(board);
              this.card.next(null);
            }
            return response.data.deleteBoardCard.success;
          }),
        ),
      ),
    );
  }

  // switchBoardCardList(cardId: string, newList: string, newRank: number): Observable<boolean> {
  //   return this.board.pipe(
  //     take(1),
  //     map((board) =>
  //       board.boardLists.find((list) => list.boardCards.some((item) => item.id === cardId)).boardCards.find((item) => item.id === cardId),
  //     ),
  //     switchMap((card) => {
  //       if (!card) {
  //         return throwError(() => new Error('Could not found the card with id of ' + cardId + '!'));
  //       }
  //       return this.createCard(
  //         card.title,
  //         newList,
  //         newRank,
  //         card.description,
  //         card.dueDate,
  //         card.pictures as PictureInput[],
  //         card.tasks,
  //         card.labels?.length ? card.labels.map((l) => l.id) : [],
  //       ).pipe(switchMap((newCard) => this.deleteCard(cardId)));
  //     }),
  //   );
  // }
}
