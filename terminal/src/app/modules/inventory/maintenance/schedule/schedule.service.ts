import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';
import {
  GetBoardCardGQL,
  CreateBoardCardGQL,
  CreateBoardListGQL,
  DeleteBoardCardGQL,
  DeleteBoardListGQL,
  UpdateBoardCardGQL,
  UpdateBoardListGQL,
  UpdateBoardGQL,
  GetMaintenanceBoardGQL,
  GetBoardCardsByBoardWithFilterPaginatedGQL,
  GetBoardListByBoardGQL,
  UpdateBoardCardListGQL,
  BoardWithListsAndCardsType,
  BoardCardFilterInput,
} from '@sifca-monorepo/terminal-generator';
import { BoardCardForListType, BoardCardType, BoardListType, BoardType, ListWithCardsType } from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({ providedIn: 'root' })
export class ScheduleService {
  private boards: BehaviorSubject<BoardType[]>;
  private loadingBoardCards: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private card: BehaviorSubject<BoardCardForListType> = new BehaviorSubject(null);
  private boardCards: BehaviorSubject<BoardCardType[]> = new BehaviorSubject(null);
  private boardList: BehaviorSubject<BoardListType[]> = new BehaviorSubject(null);
  private board: BehaviorSubject<BoardWithListsAndCardsType> = new BehaviorSubject(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';

  constructor(
    private storageHelper: StorageHelper,
    private updateBoardGQL: UpdateBoardGQL,
    private getBoardCardGQL: GetBoardCardGQL,
    private createBoardCardGQL: CreateBoardCardGQL,
    private updateBoardCardGQL: UpdateBoardCardGQL,
    private deleteBoardCardGQL: DeleteBoardCardGQL,
    private createBoardListGQL: CreateBoardListGQL,
    private updateBoardListGQL: UpdateBoardListGQL,
    private deleteBoardListGQL: DeleteBoardListGQL,
    private getBoardListByBoardGQL: GetBoardListByBoardGQL,
    private updateBoardCardListGQL: UpdateBoardCardListGQL,
    private getMaintenanceBoardGQL: GetMaintenanceBoardGQL,
    private getBoardCardsByBoardWithFilterPaginatedGQL: GetBoardCardsByBoardWithFilterPaginatedGQL,
  ) {}

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get boardList$(): Observable<BoardListType[]> {
    return this.boardList.asObservable();
  }

  get board$(): Observable<BoardWithListsAndCardsType> {
    return this.board.asObservable();
  }

  get boards$(): Observable<BoardType[]> {
    return this.boards.asObservable();
  }

  get boardCards$(): Observable<BoardCardType[]> {
    return this.boardCards.asObservable();
  }

  get loadingBoardCards$(): Observable<boolean> {
    return this.loadingBoardCards.asObservable();
  }

  get card$(): Observable<BoardCardForListType> {
    return this.card.asObservable();
  }

  getMaintenanceBoard(): Observable<BoardWithListsAndCardsType> {
    return this.getMaintenanceBoardGQL.fetch({ target: { pos: this.storageHelper.getData('posId') } }).pipe(
      tap((response: any) => {
        if (response.data) {
          this.board.next(response.data.getMaintenanceBoard);
          return response.data.getMaintenanceBoard;
        }
      }),
    );
  }

  getBoardCardsByBoardWithFilterPaginated(board: string, filter?: BoardCardFilterInput): Observable<BoardCardType[]> {
    this.loadingBoardCards.next(true);
    return this.getBoardCardsByBoardWithFilterPaginatedGQL
      .fetch({
        searchString: this.searchString,
        filter: {
          ...filter,
          archived: false,
        },
        board,
        pagination: { page: this.pageIndex, limit: this.filterLimit },
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.loadingBoardCards.next(false);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.getBoardCardsByBoardWithFilterPaginated?.count,
            });
            this.boardCards.next(data.getBoardCardsByBoardWithFilterPaginated.objects);
            return data.getBoardCardsByBoardWithFilterPaginated.objects;
          }
        }),
      );
  }

  updateBoardCardList(id: string, boardList: string, rank: number): Observable<BoardWithListsAndCardsType> {
    return this.updateBoardCardListGQL.mutate({ id, boardList, rank }).pipe(
      map((response: any) => response.data.updateBoardCardList),
      switchMap((cards) =>
        this.board$.pipe(
          take(1),
          switchMap(() => this.getMaintenanceBoard()),
        ),
      ),
    );
  }

  updateBoard(input: any): Observable<BoardType> {
    return this.updateBoardGQL
      .mutate({
        id: input.id,
        icon: input.icon,
        title: input.title,
        members: input.members,
        projects: input.projects,
        description: input.description,
      })
      .pipe(
        map((response) => {
          return response.data.updateBoard as any;
        }),
      );
  }

  getBoardListByBoard(boardId: string): Observable<BoardListType[]> {
    return this.getBoardListByBoardGQL
      .fetch({
        boardId,
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.boardList.next(data.getBoardListByBoard);
            return data.getBoardListByBoard.objects;
          }
        }),
      );
  }

  archivedCard(input: any, id: string) {
    return this.updateBoardCardGQL
      .mutate({
        id,
        archived: input?.archived,
      })
      .pipe(
        map((response) => {
          const index = this.boardCards.value.findIndex((item) => item.id === id);
          this.boardCards.value.splice(index, 1);
          this.boardCards.next(this.boardCards.value);
          return response.data.updateBoardCard as any;
        }),
      );
  }

  archivedCardList(input: any, id: string) {
    return this.updateBoardCardGQL
      .mutate({
        id,
        archived: input?.archived,
      })
      .pipe(
        map((response) => {
          const board = this.board.value;
          board.boardLists.forEach((listItem) => {
            listItem.boardCards.forEach((cardItem, index, array) => {
              if (cardItem.id === id) {
                array[index] = response.data.updateBoardCard as any;
                listItem.boardCards.splice(index, 1);
              }
            });
          });
          this.board.next(board);
          this.card.next(response.data.updateBoardCard as any);
          return response.data.updateBoardCard as any;
        }),
      );
  }

  getBoardCard(id: string): Observable<BoardCardType> {
    return this.getBoardCardGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.card.next(data.getBoardCard);
          return data.getBoardCard;
        }
      }),
    );
  }

  createList(input: any): Observable<BoardWithListsAndCardsType> {
    return this.createBoardListGQL.mutate({ name: input.name, board: input.board, rank: input.rank }).pipe(
      map((response) => response.data.createBoardList as any),
      tap((newList) => {
        const iboard = this.board.value;
        iboard.boardLists = iboard.boardLists?.length ? [...iboard.boardLists, newList as any] : [newList as any];
        iboard.boardLists.sort((a, b) => a.rank - b.rank);
        this.board.next(iboard);
      }),
      switchMap((cards) =>
        this.board$.pipe(
          take(1),
          switchMap(() => this.getMaintenanceBoard()),
        ),
      ),
    );
  }

  updateList(input: any): Observable<BoardListType> {
    return this.updateBoardListGQL.mutate({ id: input.id, name: input.name, board: input.board, rank: input.rank }).pipe(
      map((response) => response.data.updateBoardList as any),
      tap((updatedList) => {
        const iboard = this.board.value;
        const index = iboard.boardLists.findIndex((item) => item.id === input.id);
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

  createBoardCard(input: any): Observable<BoardCardType> {
    return this.createBoardCardGQL
      .mutate({
        boardList: input.boardList,
        title: input.title,
        customer: input.customer,
        description: input.description,
        dueDate: input.dueDate,
        archived: input.archived,
        priority: input.priority,
        tags: input.tags,
        assignedTo: input.assignedTo,
        attachments: input.attachments,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.boardCards.next([data.createBoardCard, ...this.boardCards.value]);
            return data.createBoardCard;
          }
        }),
      );
  }

  createCard(input: any): Observable<BoardCardForListType> {
    return this.createBoardCardGQL
      .mutate({
        title: input.title,
        tags: input.tags,
        boardList: input.boardList,
        description: input.description,
        dueDate: input.dueDate,
        pictures: input.pictures,
        tasks: input.tasks,
        labels: input.labels,
        rank: input.rank,
        assignedTo: input.assignedTo,
        project: input.project,
        priority: input.priority,
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

  updateBoardCard(input: any): Observable<BoardCardType> {
    return this.updateBoardCardGQL
      .mutate({
        id: input.id,
        tasks: input.tasks,
        title: input.title,
        customer: input.customer,
        description: input.description,
        dueDate: input.dueDate,
        archived: input.archived,
        priority: input.priority,
        tags: input.tags,
        assignedTo: input.assignedTo,
        attachments: input.attachments,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            if (this.boardCards.value) {
              const boardCards = this.boardCards.value;
              const index = boardCards?.findIndex((a) => a.id === input.id);
              boardCards[index] = data.updateBoardCard;
              this.boardCards.next(boardCards);
            }
            this.card.next(data.updateBoardCard);
            return data.updateBoardCard;
          }
        }),
      );
  }

  updateCard(input: any): Observable<BoardCardForListType> {
    return this.board$.pipe(
      take(1),
      switchMap((board) =>
        this.updateBoardCardGQL
          .mutate({
            id: input.id,
            tags: input.tags,
            title: input.title,
            boardList: input.boardList,
            description: input.description,
            dueDate: input.dueDate,
            pictures: input.pictures,
            tasks: input.tasks,
            labels: input.labels,
            rank: input.rank,
            assignedTo: input.assignedTo,
            project: input.project,
            priority: input.priority,
          })
          .pipe(
            map((response) => {
              board.boardLists.forEach((listItem) => {
                listItem.boardCards.forEach((cardItem, index, array) => {
                  if (cardItem.id === input.id) {
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
}
