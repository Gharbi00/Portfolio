import { findIndex } from 'lodash';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

import { IPagination } from '@diktup/frontend/models';
import {
  App,
  CauseType,
  QuestTypeType,
  PointOfSaleType,
  UserPosRoleEnum,
  ActivityTypeType,
  PartnershipTypeEnum,
  AddTargetsToAccountGQL,
  PartnershipNetworkType,
  ActivityTypeWithActiveStatusType,
  SearchQuestTypesByTargetWithFilterPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import {
  CauseInput,
  QuestTypeGQL,
  QuestTypeInput,
  CreateCauseGQL,
  UpdateCauseGQL,
  DeleteCauseGQL,
  ActivityTypeInput,
  CreateQuestTypeGQL,
  UpdateQuestTypeGQL,
  DeleteQuestTypeGQL,
  CreateActivityTypeGQL,
  UpdateActivityTypeGQL,
  DeleteActivityTypeGQL,
  GetCausesByTargetPaginatedGQL,
  GetQuestTypesByTargetPaginatedGQL,
  GetDonationActivityTypesByTargetPaginatedGQL,
  GetPredefinedActivityTypesByTargetPaginatedGQL,
  GetQuestTypesByTargetAndAdvertiserPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';

import { StorageHelper } from '@diktup/frontend/helpers';
import { GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL } from '@sifca-monorepo/terminal-generator';
import {
  PartnershipNetworkInput,
  InvitePartnerToNetworkGQL,
  NewPartnershipNetworkInput,
  CreatePartnershipNetworkGQL,
  DeletePartnershipNetworkGQL,
  GetPartnershipNetworksByTargetAndPartnershipPaginationGQL,
  GetPartnershipNetworksByPartnerAndPartnershipPaginationGQL,
} from '@sifca-monorepo/terminal-generator';
import { PosService } from '../../../../../../app/core/services/pos.service';

@Injectable({ providedIn: 'root' })
export class QuestTypeService {
  private quest: BehaviorSubject<QuestTypeType> = new BehaviorSubject(null);
  private causes: BehaviorSubject<CauseType[]> = new BehaviorSubject(null);
  private infiniteCauses: BehaviorSubject<CauseType[]> = new BehaviorSubject(null);
  private isLastCauses: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingCauses: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingDonations: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingPartnership: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastAdvertiser: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingActivityTypes: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private loadingCompaigns: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private donations: BehaviorSubject<ActivityTypeType[]> = new BehaviorSubject(null);
  private targetsByPartner: BehaviorSubject<PartnershipNetworkType[]> = new BehaviorSubject(null);
  private isLastDonation: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastPartners: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private advertisers: BehaviorSubject<PartnershipNetworkType[]> = new BehaviorSubject(null);
  private isLastQuests: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private partnershipMarketplace: BehaviorSubject<PartnershipNetworkType[]> = new BehaviorSubject(null);
  private partnershipDonation: BehaviorSubject<PartnershipNetworkType[]> = new BehaviorSubject(null);
  private infiniteDonations: BehaviorSubject<ActivityTypeType[]> = new BehaviorSubject(null);
  private quests: BehaviorSubject<QuestTypeType[]> = new BehaviorSubject(null);
  private infiniteQuestType: BehaviorSubject<QuestTypeType[]> = new BehaviorSubject(null);
  private isLastQuestType: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private isLastPredefinedActivity: BehaviorSubject<boolean> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private causePagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private advertiserPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private partnershipDonationPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private partnershipMarketplacePagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private donationPagination: BehaviorSubject<IPagination> = new BehaviorSubject<IPagination>(null);
  private activityTypes: BehaviorSubject<ActivityTypeWithActiveStatusType[]> = new BehaviorSubject(null);

  pageIndex = 0;
  pageLimit = 10;
  causesPageIndex = 0;
  parnterPageIndex = 0;
  donationPageIndex = 0;
  infinitePageLimit = 10;
  questTypePageIndex = 0;
  advertiserPageIndex = 0;
  infinteCausesPageIndex = 0;
  partnershipDonationPageIndex = 0;
  partnershipMarketplacePageIndex = 0;

  get advertisers$(): Observable<PartnershipNetworkType[]> {
    return this.advertisers.asObservable();
  }

  get isLastQuests$(): Observable<boolean> {
    return this.isLastQuests.asObservable();
  }

  get partnershipDonation$(): Observable<PartnershipNetworkType[]> {
    return this.partnershipDonation.asObservable();
  }

  get partnershipMarketplace$(): Observable<PartnershipNetworkType[]> {
    return this.partnershipMarketplace.asObservable();
  }

  get isLastDonation$(): Observable<boolean> {
    return this.isLastDonation.asObservable();
  }

  get isLastPartners$(): Observable<boolean> {
    return this.isLastPartners.asObservable();
  }

  get isLastCauses$(): Observable<boolean> {
    return this.isLastCauses.asObservable();
  }

  get isLastPredefinedActivity$(): Observable<boolean> {
    return this.isLastPredefinedActivity.asObservable();
  }

  get loadingDonations$(): Observable<boolean> {
    return this.loadingDonations.asObservable();
  }

  get loadingCauses$(): Observable<boolean> {
    return this.loadingCauses.asObservable();
  }

  get loadingPartnership$(): Observable<boolean> {
    return this.loadingPartnership.asObservable();
  }

  get isLastAdvertiser$(): Observable<boolean> {
    return this.isLastAdvertiser.asObservable();
  }

  get loadingActivityTypes$(): Observable<boolean> {
    return this.loadingActivityTypes.asObservable();
  }

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }

  get advertiserPagination$(): Observable<IPagination> {
    return this.advertiserPagination.asObservable();
  }

  get partnershipDonationPagination$(): Observable<IPagination> {
    return this.partnershipDonationPagination.asObservable();
  }

  get partnershipMarketplacePagination$(): Observable<IPagination> {
    return this.partnershipMarketplacePagination.asObservable();
  }

  get causePagination$(): Observable<IPagination> {
    return this.causePagination.asObservable();
  }

  get donationPagination$(): Observable<IPagination> {
    return this.donationPagination.asObservable();
  }

  get causes$(): Observable<CauseType[]> {
    return this.causes.asObservable();
  }
  set causes$(value: any) {
    this.causes.next(value);
  }

  get infiniteCauses$(): Observable<CauseType[]> {
    return this.infiniteCauses.asObservable();
  }
  set infiniteCauses$(value: any) {
    this.infiniteCauses.next(value);
  }

  get quests$(): Observable<QuestTypeType[]> {
    return this.quests.asObservable();
  }

  get isLastQuestType$(): Observable<boolean> {
    return this.isLastQuestType.asObservable();
  }

  get infiniteQuestType$(): Observable<QuestTypeType[]> {
    return this.infiniteQuestType.asObservable();
  }
  set infiniteQuestType$(value: any) {
    this.infiniteQuestType.next(value);
  }

  get quest$(): Observable<QuestTypeType> {
    return this.quest.asObservable();
  }
  set quest$(value: any) {
    this.quest.next(value);
  }

  get loadingCompaigns$(): Observable<boolean> {
    return this.loadingCompaigns.asObservable();
  }

  get infiniteDonations$(): Observable<ActivityTypeType[]> {
    return this.infiniteDonations.asObservable();
  }
  set infiniteDonations$(value: any) {
    this.infiniteDonations.next(value);
  }

  get donations$(): Observable<ActivityTypeType[]> {
    return this.donations.asObservable();
  }

  get targetsByPartner$(): Observable<PartnershipNetworkType[]> {
    return this.targetsByPartner.asObservable();
  }
  set targetsByPartner$(value: any) {
    this.targetsByPartner.next(value);
  }

  get activityTypes$(): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.activityTypes.asObservable();
  }
  set activityTypes$(value: any) {
    this.activityTypes.next(value);
  }

  constructor(
    private questTypeGQL: QuestTypeGQL,
    private storageHelper: StorageHelper,
    private createCauseGQL: CreateCauseGQL,
    private deleteCauseGQL: DeleteCauseGQL,
    private updateCauseGQL: UpdateCauseGQL,
    private posService: PosService,
    private deleteQuestTypeGQL: DeleteQuestTypeGQL,
    private createQuestTypeGQL: CreateQuestTypeGQL,
    private updateQuestTypeGQL: UpdateQuestTypeGQL,
    private deleteActivityTypeGQL: DeleteActivityTypeGQL,
    private updateActivityTypeGQL: UpdateActivityTypeGQL,
    private createActivityTypeGQL: CreateActivityTypeGQL,
    private addTargetsToAccountGQL: AddTargetsToAccountGQL,
    private invitePartnerToNetworkGQL: InvitePartnerToNetworkGQL,
    private createPartnershipNetworkGQL: CreatePartnershipNetworkGQL,
    private deletePartnershipNetworkGQL: DeletePartnershipNetworkGQL,
    private getCausesByTargetPaginatedGQL: GetCausesByTargetPaginatedGQL,
    private getQuestTypesByTargetPaginatedGQL: GetQuestTypesByTargetPaginatedGQL,
    private getDonationActivityTypesByTargetPaginatedGQL: GetDonationActivityTypesByTargetPaginatedGQL,
    private getQuestTypesByTargetAndAdvertiserPaginatedGQL: GetQuestTypesByTargetAndAdvertiserPaginatedGQL,
    private getPredefinedActivityTypesByTargetPaginatedGQL: GetPredefinedActivityTypesByTargetPaginatedGQL,
    private searchQuestTypesByTargetWithFilterPaginatedGQL: SearchQuestTypesByTargetWithFilterPaginatedGQL,
    private getPartnershipNetworksByTargetAndPartnershipPaginationGQL: GetPartnershipNetworksByTargetAndPartnershipPaginationGQL,
    private getPartnershipNetworksByPartnerAndPartnershipPaginationGQL: GetPartnershipNetworksByPartnerAndPartnershipPaginationGQL,
    private getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL: GetPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL,
  ) {}

  getPartnershipNetworksByPartnerAndPartnershipPagination(): Observable<PartnershipNetworkType[]> {
    return this.getPartnershipNetworksByPartnerAndPartnershipPaginationGQL
      .fetch({
        partnership: [PartnershipTypeEnum.ADVERTISER],
        partner: { pos: this.storageHelper.getData('posId') },
        pagination: { page: this.parnterPageIndex, limit: this.pageLimit },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.isLastPartners.next(data.getPartnershipNetworksByPartnerAndPartnershipPagination.isLast);
            this.targetsByPartner.next([
              ...(this.targetsByPartner.value || []),
              ...data.getPartnershipNetworksByPartnerAndPartnershipPagination.objects,
            ]);
            return data.getPartnershipNetworksByPartnerAndPartnershipPagination.objects;
          }
        }),
      );
  }

  getPartnershipNetworksByTargetAndPartnershipPagination(partnership: PartnershipTypeEnum): Observable<PartnershipNetworkType[]> {
    this.loadingPartnership.next(true);
    return this.getPartnershipNetworksByTargetAndPartnershipPaginationGQL
      .fetch({
        target: { pos: this.storageHelper.getData('posId') },
        pagination: {
          ...(partnership === PartnershipTypeEnum?.ADVERTISER ? { page: this.advertiserPageIndex } : { page: this.partnershipDonationPageIndex }),
          limit: this.pageLimit,
        },
        partnership,
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.isLastAdvertiser.next(data.getPartnershipNetworksByTargetAndPartnershipPagination.isLast);
            this.loadingPartnership.next(false);
            if (partnership === PartnershipTypeEnum.ADVERTISER) {
              this.advertiserPagination.next({
                page: this.advertiserPageIndex,
                size: this.pageLimit,
                length: data.getPartnershipNetworksByTargetAndPartnershipPagination?.count,
              });
              this.advertisers.next(data.getPartnershipNetworksByTargetAndPartnershipPagination.objects);
            } else if (partnership === PartnershipTypeEnum.DONATION) {
              this.partnershipDonationPagination.next({
                page: this.partnershipDonationPageIndex,
                size: this.pageLimit,
                length: data.getPartnershipNetworksByTargetAndPartnershipPagination?.count,
              });
              this.partnershipDonation.next(data.getPartnershipNetworksByTargetAndPartnershipPagination.objects);
            } else {
              this.partnershipMarketplacePagination.next({
                page: this.partnershipMarketplacePageIndex,
                size: this.pageLimit,
                length: data.getPartnershipNetworksByTargetAndPartnershipPagination?.count,
              });
              this.partnershipMarketplace.next(data.getPartnershipNetworksByTargetAndPartnershipPagination.objects);
            }
            return data.getPartnershipNetworksByTargetAndPartnershipPagination.objects;
          }
        }),
      );
  }

  createPartnershipNetwork(input: NewPartnershipNetworkInput): Observable<PartnershipNetworkType> {
    return this.posService.pos$.pipe(
      take(1),
      switchMap((pos: PointOfSaleType) =>
        this.createPartnershipNetworkGQL.mutate({
          input: {
            ...input,
            target: { pos: this.storageHelper.getData('posId') },
            subject: `${pos?.title} has extended an invitation for you to be his partner.`,
            app: App.SIFCA,
            variables: {
              brand: {
                name: 'Sifca',
                logo: 'https://sifca-storage.s3.eu-central-1.amazonaws.com/sifca-brand/12412421432.png',
                website: 'https://sifca.app',
              },
            },
          },
        }),
      ),
      map(({ data }: any) => {
        if (data) {
          const partnership = input.partnership[0];
          if (partnership === PartnershipTypeEnum.ADVERTISER) {
            this.advertisers.next([data.createPartnershipNetwork, ...(this.advertisers.value || [])]);
          } else {
            this.partnershipDonation.next([data.createPartnershipNetwork, ...(this.partnershipDonation.value || [])]);
          }
          return data.createPartnershipNetwork;
        }
      }),
    );
  }

  invitePartnerToNetwork(input: PartnershipNetworkInput): Observable<PartnershipNetworkType> {
    return this.invitePartnerToNetworkGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          if (input.partnership[0] === PartnershipTypeEnum.ADVERTISER) {
            this.advertisers.next([data.invitePartnerToNetwork, ...(this.advertisers.value || [])]);
          } else if (input.partnership[0] === PartnershipTypeEnum.DONATION) {
            this.partnershipDonation.next([data.invitePartnerToNetwork, ...(this.partnershipDonation.value || [])]);
          } else {
            this.partnershipMarketplace.next([data.invitePartnerToNetwork, ...(this.partnershipMarketplace.value || [])]);
          }
          return data.invitePartnerToNetwork;
        }
      }),
    );
  }

  deletePartnershipNetwork(id: string, partnership: PartnershipTypeEnum): Observable<boolean> {
    return this.deletePartnershipNetworkGQL.mutate({ id }).pipe(
      map(({ data }) => {
        if (data.deletePartnershipNetwork) {
          if (partnership === PartnershipTypeEnum.ADVERTISER) {
            const advertisers = this.advertisers.value.filter((item) => item.id !== id);
            this.advertisers.next(advertisers);
          } else {
            const partnershipDonation = this.partnershipDonation.value.filter((item) => item.id !== id);
            this.partnershipDonation.next(partnershipDonation);
          }
          return true;
        }
        return false;
      }),
    );
  }

  getDonationActivityTypesByTargetPaginated(): Observable<ActivityTypeType[]> {
    this.loadingDonations.next(true);
    return this.getDonationActivityTypesByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.donationPageIndex, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingDonations.next(false);
            this.donationPagination.next({
              page: this.donationPageIndex,
              size: this.pageLimit,
              length: data.getDonationActivityTypesByTargetPaginated?.count,
            });
            this.infiniteDonations.next([...(this.infiniteDonations.value || []), ...data.getDonationActivityTypesByTargetPaginated.objects]);
            this.donations.next(data.getDonationActivityTypesByTargetPaginated.objects);
            this.isLastDonation.next(data.getDonationActivityTypesByTargetPaginated.isLast);
            return data.getDonationActivityTypesByTargetPaginated.objects;
          }
        }),
      );
  }

  createActivityType(input: ActivityTypeInput): Observable<ActivityTypeType> {
    return this.createActivityTypeGQL
      .mutate({
        input: { ...input, donation: { cause: input?.donation?.cause, enable: true }, target: { pos: this.storageHelper.getData('posId') } },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.donations.next([data.createActivityType, ...(this.donations.value || [])]);
            return data.createActivityType;
          }
        }),
      );
  }

  updateActivityType(id: string, input: ActivityTypeInput): Observable<ActivityTypeType> {
    return this.updateActivityTypeGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.donations.value, (item) => item?.id === id);
          this.donations.value[index] = data.updateActivityType;
          this.donations.next(this.donations.value);
          return data.updateActivityType;
        }
      }),
    );
  }

  getCausesByTargetPaginated(): Observable<CauseType[]> {
    this.loadingCauses.next(true);
    return this.getCausesByTargetPaginatedGQL
      .fetch({ pagination: { page: this.causesPageIndex, limit: this.pageLimit }, target: { pos: this.storageHelper.getData('posId') } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingCauses.next(false);
            this.causePagination.next({
              page: this.causesPageIndex,
              size: this.pageLimit,
              length: data.getCausesByTargetPaginated?.count,
            });
            this.causes.next(data.getCausesByTargetPaginated.objects);
            return data.getCausesByTargetPaginated.objects;
          }
        }),
      );
  }

  getInfiniteCauses(): Observable<CauseType[]> {
    this.loadingCauses.next(true);
    return this.getCausesByTargetPaginatedGQL
      .fetch({
        pagination: { page: this.infinteCausesPageIndex, limit: this.infinitePageLimit },
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.loadingCauses.next(false);
            this.isLastCauses.next(data.getCausesByTargetPaginated.isLast);
            this.infiniteCauses.next([...(this.infiniteCauses.value || []), ...data.getCausesByTargetPaginated.objects]);
            return data.getCausesByTargetPaginated.objects;
          }
        }),
      );
  }

  createCause(input: CauseInput): Observable<CauseType[]> {
    return this.createCauseGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.causes.next([data.createCause, ...(this.causes.value || [])]);
          return data.createCause;
        }
      }),
    );
  }

  updateCause(id: string, input: ActivityTypeInput): Observable<CauseType[]> {
    return this.updateCauseGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const index = findIndex(this.causes.value, (item) => item?.id === id);
          this.causes.value[index] = data.updateCause;
          this.causes.next(this.causes.value);
          return data.updateCause;
        }
      }),
    );
  }

  deleteActivityType(id: string): Observable<boolean> {
    return this.deleteActivityTypeGQL.mutate({ id }).pipe(
      map(({ data }) => {
        if (data.deleteActivityType) {
          const donations = this.donations.value.filter((item) => item.id !== id);
          this.donations.next(donations);
          return true;
        }
        return false;
      }),
    );
  }

  deleteCause(id: string): Observable<boolean> {
    return this.deleteCauseGQL.mutate({ id }).pipe(
      map(({ data }: any) => {
        if (data.deleteCause) {
          const causes = this.causes.value.filter((item) => item.id !== id);
          this.causes.next(causes);
          return true;
        }
        return false;
      }),
    );
  }

  getPredefinedActivityTypesByTargetPaginated(): Observable<ActivityTypeType[]> {
    return this.getPredefinedActivityTypesByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.pageIndex, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.activityTypes.next([...(this.activityTypes.value || []), ...data.getPredefinedActivityTypesByTargetPaginated.objects]);
            return data.getPredefinedActivityTypesByTargetPaginated.objects;
          }
        }),
      );
  }

  getPredefinedActivityTypesByTargetWithActiveStatusPaginated(): Observable<ActivityTypeWithActiveStatusType[]> {
    return this.getPredefinedActivityTypesByTargetWithActiveStatusPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { page: this.pageIndex, limit: this.pageLimit } })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.isLastPredefinedActivity.next(data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.isLast);
            this.activityTypes.next([
              ...(this.activityTypes.value || []),
              ...data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.objects,
            ]);
            return data.getPredefinedActivityTypesByTargetWithActiveStatusPaginated.objects;
          }
        }),
      );
  }

  getQuestTypesByTargetPaginated(): Observable<QuestTypeType[]> {
    this.loadingCompaigns.next(true);
    return this.getQuestTypesByTargetPaginatedGQL
      .fetch({ target: { pos: this.storageHelper.getData('posId') }, pagination: { limit: this.pageLimit, page: this.questTypePageIndex } })
      .pipe(
        tap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.questTypePageIndex,
              size: this.pageLimit,
              length: data.getQuestTypesByTargetPaginated?.count,
            });
            this.infiniteQuestType.next([...(this.infiniteQuestType.value || []), ...data.getQuestTypesByTargetPaginated.objects]);
            this.quests.next(data.getQuestTypesByTargetPaginated.objects);
            this.isLastQuests.next(data.getQuestTypesByTargetPaginated.isLast);
            this.loadingCompaigns.next(false);
            return data.getQuestTypesByTargetPaginated.objects;
          }
        }),
      );
  }

  searchQuestTypesByTargetWithFilterPaginated(posId?: string, isAdvertiserNull = false): Observable<QuestTypeType[]> {
    this.loadingCompaigns.next(true);
    return this.searchQuestTypesByTargetWithFilterPaginatedGQL
      .fetch({
        ...(isAdvertiserNull ? { advertiser: null } : {}),
        target: { pos: posId ? posId : this.storageHelper.getData('posId') },
        filter: { enable: true },
        ...(posId ? { advertiser: { pos: this.storageHelper.getData('posId') } } : {}),
        pagination: { limit: this.pageLimit, page: this.questTypePageIndex },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.infiniteQuestType.next([...(this.infiniteQuestType.value || []), ...data.searchQuestTypesByTargetWithFilterPaginated.objects]);
            this.quests.next(data.searchQuestTypesByTargetWithFilterPaginated.objects);
            this.isLastQuests.next(data.searchQuestTypesByTargetWithFilterPaginated.isLast);
            this.loadingCompaigns.next(false);
            return data.searchQuestTypesByTargetWithFilterPaginated.objects;
          }
        }),
      );
  }

  getQuestTypesByTargetAndAdvertiserPaginated(posId?: string): Observable<QuestTypeType[]> {
    this.loadingCompaigns.next(true);
    return this.getQuestTypesByTargetAndAdvertiserPaginatedGQL
      .fetch({
        target: { pos: posId ? posId : this.storageHelper.getData('posId') },
        advertiser: posId ? { pos: this.storageHelper.getData('posId') } : null,
        pagination: { limit: this.pageLimit, page: this.questTypePageIndex },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            this.infiniteQuestType.next([...(this.infiniteQuestType.value || []), ...data.getQuestTypesByTargetAndAdvertiserPaginated.objects]);
            this.quests.next(data.getQuestTypesByTargetAndAdvertiserPaginated.objects);
            this.isLastQuests.next(data.getQuestTypesByTargetAndAdvertiserPaginated.isLast);
            this.loadingCompaigns.next(false);
            return data.getQuestTypesByTargetAndAdvertiserPaginated.objects;
          }
        }),
      );
  }

  addTargetsToAccount(userId: string, posId: string): Observable<QuestTypeType[]> {
    return this.addTargetsToAccountGQL
      .mutate({
        userId,
        roles: [UserPosRoleEnum.POS_MANAGER],
        targets: { pos: [posId] },
      })
      .pipe(
        map(({ data }: any) => {
          if (data) {
            return data.getQuestTypesByTargetAndAdvertiserPaginated.objects;
          }
        }),
      );
  }

  getQuestTypeById(id: string): Observable<QuestTypeType> {
    return this.questTypeGQL.fetch({ id }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.quest.next(data.questType);
          return data.questType;
        }
      }),
    );
  }

  deleteQuestType(id: string): Observable<boolean> {
    return this.deleteQuestTypeGQL.mutate({ id }).pipe(
      map((response: any) => {
        if (response.data.deleteQuestType) {
          const quests = this.quests.value.filter((item) => item.id !== id);
          this.quests.next(quests);
          return true;
        }
        return false;
      }),
    );
  }

  createQuestType(input: QuestTypeInput): Observable<QuestTypeType> {
    return this.createQuestTypeGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      map(({ data }: any) => {
        if (data) {
          this.quests.next([data.createQuestType, ...(this.quests.value || [])]);
          return data.createQuestType;
        }
      }),
    );
  }

  updateQuestType(id: string, input: QuestTypeInput): Observable<QuestTypeType> {
    return this.updateQuestTypeGQL.mutate({ id, input }).pipe(
      map(({ data }: any) => {
        if (data) {
          const quests = this.quests.value;
          const index = this.quests.value?.findIndex((a) => a.id === id);
          quests[index] = data.updateQuestType;
          this.quests.next(quests);
          return data.updateQuestType;
        }
      }),
    );
  }
}
