import { map as _map } from 'lodash';
import { Injectable } from '@angular/core';
import { map, switchMap, take, tap } from 'rxjs/operators';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

import {
  LabelType,
  BoardListType,
  LabelTypeEnum,
  CreateBoardGQL,
  DeleteBoardGQL,
  UpdateBoardGQL,
  CreateLabelGQL,
  UpdateLabelGQL,
  DeleteLabelGQL,
  GetBoardCardGQL,
  CreateBoardCardGQL,
  CreateBoardListGQL,
  DeleteBoardCardGQL,
  DeleteBoardListGQL,
  UpdateBoardCardGQL,
  UpdateBoardListGQL,
  ReorderBoardCardsGQL,
  GetBoardListByBoardGQL,
  GetBoardWithListsAndCardsGQL,
  GetBoardsByTargetPaginatedGQL,
  GetArchivedBoardCardsPaginatedGQL,
  GetBoardCardsByBoardWithFilterPaginatedGQL,
  UpdateBoardCardListGQL,
  GetAccountsGQL,
  AccountType,
  BoardWithListsAndCardsType,
  BoardCardFilterInput,
  BoardCardForListType,
  ListWithCardsType,
  BoardPaginateType,
  BoardCardType, BoardCategoryEnum, BoardType 
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private boards: BehaviorSubject<BoardType[]>;
  private card: BehaviorSubject<BoardCardForListType>;
  private board: BehaviorSubject<BoardWithListsAndCardsType>;
  private team: BehaviorSubject<AccountType[]> = new BehaviorSubject(null);
  private loadingBoardCards: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingBoards: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);
  private boardList: BehaviorSubject<BoardListType[]> = new BehaviorSubject(null);
  private boardCards: BehaviorSubject<BoardCardType[]> = new BehaviorSubject(null);
  private archived: BehaviorSubject<BoardCardType[] | null> = new BehaviorSubject(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  archivedPageIndex = 0;
  archivedPageLimit = 10;

  get loadingBoards$(): Observable<boolean> {
    return this.loadingBoards.asObservable();
  }

  get loadingBoardCards$(): Observable<boolean> {
    return this.loadingBoardCards.asObservable();
  }

  get team$(): Observable<AccountType[]> {
    return this.team.asObservable();
  }

  get board$(): Observable<BoardWithListsAndCardsType> {
    return this.board.asObservable();
  }

  get boardCards$(): Observable<BoardCardType[]> {
    return this.boardCards.asObservable();
  }

  get boardList$(): Observable<BoardListType[]> {
    return this.boardList.asObservable();
  }

  get boards$(): Observable<BoardType[]> {
    return this.boards.asObservable();
  }

  get card$(): Observable<BoardCardForListType> {
    return this.card.asObservable();
  }

  get archived$(): Observable<BoardCardType[]> {
    return this.archived.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  constructor(
    private storageHelper: StorageHelper,
    private getAccountsGQL: GetAccountsGQL,
    private createBoardGQL: CreateBoardGQL,
    private updateBoardGQL: UpdateBoardGQL,
    private deleteBoardGQL: DeleteBoardGQL,
    private createLabelGQL: CreateLabelGQL,
    private updateLabelGQL: UpdateLabelGQL,
    private deleteLabelGQL: DeleteLabelGQL,
    private getBoardCardGQL: GetBoardCardGQL,
    private createBoardCardGQL: CreateBoardCardGQL,
    private updateBoardCardGQL: UpdateBoardCardGQL,
    private deleteBoardCardGQL: DeleteBoardCardGQL,
    private createBoardListGQL: CreateBoardListGQL,
    private updateBoardListGQL: UpdateBoardListGQL,
    private deleteBoardListGQL: DeleteBoardListGQL,
    private reorderBoardCardsGQL: ReorderBoardCardsGQL,
    private updateBoardCardListGQL: UpdateBoardCardListGQL,
    private getBoardListByBoardGQL: GetBoardListByBoardGQL,
    private getBoardWithListsAndCardsGQL: GetBoardWithListsAndCardsGQL,
    private getBoardsByTargetPaginatedGQL: GetBoardsByTargetPaginatedGQL,
    private getArchivedBoardCardsPaginatedGQL: GetArchivedBoardCardsPaginatedGQL,
    private getBoardCardsByBoardWithFilterPaginatedGQL: GetBoardCardsByBoardWithFilterPaginatedGQL,
  ) {
    this.board = new BehaviorSubject(null);
    this.boards = new BehaviorSubject(null);
    this.card = new BehaviorSubject(null);
  }

  deleteBoardCard(id: string): Observable<BoardCardType> {
    return this.deleteBoardCardGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          const boardCards = this.boardCards.value;
          const index = boardCards.findIndex((item) => item.id === id);
          boardCards.splice(index, 1);
          this.boardCards.next(boardCards);
          return data.deleteBoardCard;
        }
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
        project: input.project,
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
        project: input.project,
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

  reorderBorderCards(id: string, rank: number): Observable<BoardWithListsAndCardsType> {
    return this.reorderBoardCardsGQL.mutate({ id, rank }).pipe(
      map((response) => response.data.reorderBoardCards),
      switchMap((cards) =>
        this.board$.pipe(
          take(1),
          switchMap((board) => this.getBoard(board.id)),
        ),
      ),
    );
  }

  updateBoardCardList(id: string, boardList: string, rank: number): Observable<BoardWithListsAndCardsType> {
    return this.updateBoardCardListGQL.mutate({ id, boardList, rank }).pipe(
      map((response: any) => response.data.updateBoardCardList),
      switchMap((cards) =>
        this.board$.pipe(
          take(1),
          switchMap((board) => this.getBoard(board.id)),
        ),
      ),
    );
  }

  getTeam(): Observable<AccountType[]> {
    return this.getAccountsGQL.fetch().pipe(
      switchMap((res) =>
        this.getAccountsGQL.fetch({ pagination: { limit: res.data.getAccounts.count, page: 0 } }).pipe(
          tap((response: any) => {
            if (response.data) {
              this.team.next(response.data.getAccounts.objects);
              return response.data.getAccounts.objects;
            }
          }),
          map((response) => response.data.getAccounts.objects),
        ),
      ),
    );
  }

  getBoardsPaginated(): Observable<BoardPaginateType> {
    this.loadingBoards.next(true);
    return this.getBoardsByTargetPaginatedGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        category: BoardCategoryEnum.PROJECTS,
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        searchString: this.searchString,
      })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.loadingBoards.next(false);
            this.boards.next(data.getBoardsByTargetPaginated.objects);
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.getBoardsByTargetPaginated?.count,
            });
            return data.getBoardsByTargetPaginated;
          }
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

  getArchivedBoardCardsPaginated(boardId: string): Observable<BoardCardType[]> {
    return this.getArchivedBoardCardsPaginatedGQL
      .fetch({ searchString: this.searchString, boardId, pagination: { page: this.archivedPageIndex, limit: this.archivedPageLimit } })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.archivedPageIndex,
              size: this.archivedPageLimit,
              length: data.getArchivedBoardCardsPaginated?.count,
            });
            this.archived.next(data.getArchivedBoardCardsPaginated.objects);
            return data.getArchivedBoardCardsPaginated.objects;
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
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.getBoardCardsByBoardWithFilterPaginated?.count,
            });
            this.loadingBoardCards.next(false);
            this.boardCards.next(data.getBoardCardsByBoardWithFilterPaginated.objects);
            return data.getBoardCardsByBoardWithFilterPaginated.objects;
          }
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

  getBoard(id: string): Observable<BoardWithListsAndCardsType> {
    return this.getBoardWithListsAndCardsGQL.fetch({ id }).pipe(
      take(1),
      map((response) => {
        const board = (response.data.getBoardWithListsAndCards || null) as any;
        this.board.next(board);
        return board;
      }),
      switchMap((board) => {
        if (!board) {
          return throwError(() => new Error('Could not found board with id of ' + id + '!'));
        }

        return of(board);
      }),
    );
  }

  createBoard(input: any): Observable<BoardType> {
    return this.createBoardGQL
      .mutate({
        title: input.title,
        category: input.category,
        description: input.description,
        icon: input.icon,
        members: input.members,
        projects: input.projects,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map((response) => response.data.createBoard as any),
        tap((board) => this.boards.next([...this.boards.value, board])),
      );
  }

  updateBoard(input: any): Observable<BoardType> {
    return this.boards$.pipe(
      take(1),
      switchMap((boards) =>
        this.updateBoardGQL
          .mutate({
            id: input.id,
            title: input.title,
            description: input.description,
            icon: input.icon,
            members: input.members,
            projects: input.projects,
          })
          .pipe(
            map((response) => {
              if (this.boards.value) {
                const index = boards.findIndex((item) => item.id === input.id);
                boards[index] = response.data.updateBoard as any;
                this.boards.next(boards);
              }
              return response.data.updateBoard as any;
            }),
          ),
      ),
    );
  }

  deleteBoard(id: string): Observable<boolean> {
    return this.boards$.pipe(
      take(1),
      switchMap((boards) =>
        this.deleteBoardGQL.mutate({ id }).pipe(
          map((response) => {
            if (response.data.deleteBoard.success) {
              const index = boards.findIndex((item) => item.id === id);
              boards.splice(index, 1);
              this.boards.next(boards);
              this.board.next(null);
              this.card.next(null);
            }
            return response.data.deleteBoard.success;
          }),
        ),
      ),
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
          switchMap((board) => this.getBoard(board.id)),
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

  createCard(input: any): Observable<BoardCardForListType> {
    return this.createBoardCardGQL
      .mutate({
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
        map((response) => response.data.createBoardCard),
        tap((newCard: any) => {
          const board = this.board.value;
          board.boardLists.forEach((listItem, index, list) => {
            if (listItem.id === newCard.boardList.id) {
              if (list[index].boardCards?.length) {
                list[index].boardCards.push(newCard);
              } else {
                list[index].boardCards = [newCard];
              }
            }
          });
          this.board.next(board);
          return newCard;
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

  createLabel(name: string, icon: string, color: string, category: LabelTypeEnum): Observable<LabelType> {
    return this.card$.pipe(
      take(1),
      switchMap((card) =>
        this.createLabelGQL.mutate({ name, icon, color, category, target: { pos: this.storageHelper.getData('posId') } }).pipe(
          map((response: any) => {
            card.labels = card.labels?.length ? [...card.labels, response.data.createLabel] : [response.data.createLabel];
            this.card.next(card);
            return response.data.createLabel;
          }),
        ),
      ),
    );
  }

  updateLabel(id: string, name: string, icon: string, color: string, category: LabelTypeEnum): Observable<LabelType> {
    return this.card$.pipe(
      take(1),
      switchMap((card) =>
        this.updateLabelGQL
          .mutate({
            id,
            name,
            icon,
            color,
            category,
            target: { pos: this.storageHelper.getData('posId') },
          })
          .pipe(
            map((response: any) => {
              if (response) {
                const index = card.labels.findIndex((item) => item.id === id);
                card.labels[index] = response.data.updateLabel;
                this.card.next(card);
              }
              return response.data.updateLabel;
            }),
          ),
      ),
    );
  }

  deleteLabel(id: string): Observable<boolean> {
    return this.card$.pipe(
      take(1),
      switchMap((card) =>
        this.deleteLabelGQL.mutate({ id }).pipe(
          map((response) => {
            if (response.data.deleteLabel.success) {
              const index = card.labels.findIndex((item) => item.id === id);
              card.labels.splice(index, 1);
              this.card.next(card);
            }
            return response.data.deleteLabel.success;
          }),
        ),
      ),
    );
  }

  // search(query: string): Observable<Card[] | null> {
  //   // @TODO: Update the board cards based on the search results
  //   return this._httpClient.get<Card[] | null>('api/apps/scrumboard/board/search', { params: { query } });
  // }
}
