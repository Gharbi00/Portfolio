import Swal from 'sweetalert2';
import { combineLatest } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { clone, filter, find, findIndex, identity, isEqual, keys, map, omit, pickBy, sortBy, values } from 'lodash';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { Observable, Subject, catchError, debounceTime, distinctUntilChanged, of, switchMap, take, takeUntil, throwError } from 'rxjs';

import {
  DayEnum,
  CoinType,
  PluginType,
  WalletType,
  CountryType,
  CurrencyType,
  LanguageType,
  CodeFormatEnum,
  ReputationType,
  CoinHandleEnum,
  PointOfSaleType,
  PeriodCycleEnum,
  LoginSourceEnum,
  CoinCategoryEnum,
  OutboundEditorEnum,
  LoyaltySettingsType,
  TransactionTypeEnum,
  DeleteFileFromAwsGQL,
  WidgetIntegrationType,
  CodeRepresentationEnum,
  GenerateS3SignedUrlGQL,
  BarcodeRepresentationTyeEnum,
  LoyaltySettingsRedeemTranslationType,
} from '@sifca-monorepo/terminal-generator';
import { AmazonS3Helper, FormHelper, StorageHelper } from '@diktup/frontend/helpers';

import { LoyaltyService } from './loyalty.service';
import { IntegrationAppsService } from '../../apps.service';
import { QuestTypeService } from '../campaigns/campaigns.service';
import { PosService } from '../../../../../core/services/pos.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { SharedService } from '../../../../../shared/services/shared.service';
import { WidgetService } from '../widget/widget.service';

@Component({
  selector: 'loyalty',
  templateUrl: './loyalty.component.html',
  styleUrls: ['./loyalty.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoyaltyComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  selectedIndex = 0;
  coins: CoinType[];
  initialValues: any;
  isLoading: boolean;
  coinForm: FormGroup;
  coinInitValues: any;
  safeRedeem: SafeHtml;
  subscribersForm: any;
  remunerationIndex = 0;
  isEqualValue: boolean;
  repInitialValues: any;
  days = values(DayEnum);
  loyaltyForm: FormGroup;
  selectedCoin: CoinType;
  selectedPrelevel = true;
  isCoinSelected: boolean;
  selectedRepLevel: string;
  loadingPrelevel: boolean;
  selectedRepIndex: number;
  isPreviewEnabled = false;
  loadingCardlevel: boolean;
  selectedCardIndex: number;
  reputationsForm: FormGroup;
  levelButtonDisabled = true;
  selectedField = 'prelevel';
  selectedConverterIndex = 1;
  currencies: CurrencyType[];
  loadingCoinPrelevel = false;
  isCardButtonDisabled = true;
  loadingUserPicture: boolean;
  isCoinButtonDisabled = true;
  loadingCardPrelevel: boolean;
  isLoginButtonDisabled = true;
  reputations: ReputationType[];
  isRedeemButtonDisabled = true;
  countries: CountryType[] = [];
  isAggregatorSelected: boolean;
  loadingQualitativePic: boolean;
  isProfileButtonDisabled = true;
  loadingQuantitativePic: boolean;
  isPreLevelButtonDisabled = true;
  isWalletButtonDisabled: boolean;
  aggregatorCoin: CoinType[] = [];
  isReferrerButtonDisabled = true;
  isReferredButtonDisabled = true;
  isReferralButtonDisabled = true;
  isConverterButtonDisabled = true;
  formats = values(CodeFormatEnum);
  periods = values(PeriodCycleEnum);
  isInactivityButtonDisabled = true;
  isPrelevelWebButtonDisabled = true;
  selectedReputation: ReputationType;
  selectedReputationColor = '#d8d0d0';
  isConverterWebButtonDisabled = true;
  selectedReputationLevel = 'prelevel';
  loyaltySettings: LoyaltySettingsType;
  isWebAccelerateButtonDisabled = true;
  originalCountries: CountryType[] = [];
  isPrelevelMobileButtonDisabled = true;
  isConverterMobileButtonDisabled = true;
  loginSources = values(LoginSourceEnum);
  isPrelevelPhysicalButtonDisabled = true;
  originalCurrencies: CurrencyType[] = [];
  isMobileAccelerateButtonDisabled = true;
  visuals = values(CodeRepresentationEnum);
  isConverterPhysicalButtonDisabled = true;
  isPhysicalAccelerateButtonDisabled = true;
  styles = values(BarcodeRepresentationTyeEnum);
  transactionTypes = values(TransactionTypeEnum);
  countrySearchInput$: Subject<string> = new Subject<string>();
  currencySearchInput$: Subject<string> = new Subject<string>();
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  targets$: Observable<PointOfSaleType[]> = this.loyaltyService.targets$;
  isLastWallets$: Observable<boolean> = this.loyaltyService.isLastWallet$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;

  defaultLanguage: any = {
    name: 'Default',
    id: '1',
  };
  allLanguages: any[];
  widget: WidgetIntegrationType;
  selectedTranslation: LoyaltySettingsRedeemTranslationType;
  selectedReputationIndex = 0;

  get mobileAccelerate(): FormArray {
    return this.loyaltyForm.get(['accelerate', 'mobile', 'slots']) as FormArray;
  }

  get physicalAccelerate(): FormArray {
    return this.loyaltyForm.get(['accelerate', 'physical', 'slots']) as FormArray;
  }

  get webAccelerate(): FormArray {
    return this.loyaltyForm.get(['accelerate', 'web', 'slots']) as FormArray;
  }

  get remunerationsPhysicalArray(): FormArray {
    return (this.loyaltyForm.get(['onsiteConverter', 'physical']) as FormGroup).get('remunerations') as FormArray;
  }

  get remunerationsMobileArray(): FormArray {
    return (this.loyaltyForm.get(['onsiteConverter', 'mobile']) as FormGroup).get('remunerations') as FormArray;
  }

  get remunerationsWebArray(): FormArray {
    return (this.loyaltyForm.get(['onsiteConverter', 'web']) as FormGroup).get('remunerations') as FormArray;
  }

  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  get translation() {
    return this.loyaltyForm.get(['redeem', 'translation']);
  }

  constructor(
    private posService: PosService,
    private modalService: NgbModal,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private widgetService: WidgetService,
    private storageHelper: StorageHelper,
    private loyaltyService: LoyaltyService,
    private amazonS3Helper: AmazonS3Helper,
    private questTypeService: QuestTypeService,
    private changeDetectorRef: ChangeDetectorRef,
    private deleteFileFromAwsGQL: DeleteFileFromAwsGQL,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
    private integrationAppsService: IntegrationAppsService,
  ) {
    this.widgetService.getWidgetIntegrationByTarget().subscribe();
    this.loyaltyService.wallet$.pipe(takeUntil(this.unsubscribeAll)).subscribe((wallets) => {
      this.coins = map(wallets, 'coin');
    });
    this.loyaltyService.reputations$.subscribe((reputations: ReputationType[]) => {
      this.reputations = sortBy(reputations, 'rank');
      this.reputationsForm = this.formBuilder.group({
        id: [this.reputations[this.selectedReputationIndex]?.id || ''],
        period: [this.reputations[this.selectedReputationIndex]?.period || ''],
        turnoverGoalEnabled: [this.reputations[this.selectedReputationIndex]?.turnoverGoalEnabled || false],
        frequencyGoalEnabled: [this.reputations[this.selectedReputationIndex]?.frequencyGoalEnabled || false],
        lossPoints: [this.reputations[this.selectedReputationIndex]?.lossPoints || ''],
        turnoverPoints: [this.reputations[this.selectedReputationIndex]?.turnoverPoints],
        reputationLevel: [this.reputations[this.selectedReputationIndex]?.reputationLevel || ''],
        lossAmount: [this.reputations[this.selectedReputationIndex]?.lossAmount],
        color: [this.reputations[this.selectedReputationIndex]?.color || ''],
        inactivityCycle: [this.reputations[this.selectedReputationIndex]?.inactivityCycle],
        picture: this.formBuilder.group({
          baseUrl: [this.reputations[this.selectedReputationIndex]?.picture.baseUrl || ''],
          path: [this.reputations[this.selectedReputationIndex]?.picture.path || ''],
        }),
        perks: this.formBuilder.group({
          discount: [this.reputations[this.selectedReputationIndex]?.perks.discount || ''],
          description: [this.reputations[this.selectedReputationIndex]?.perks.description || ''],
        }),
        levelInterval: [
          this.reputations[this.selectedReputationIndex]?.levelInterval.max - this.reputations[this.selectedReputationIndex]?.levelInterval.min || '',
        ],
        points: [''],
      });
      this.changeDetectorRef.markForCheck();
      this.repInitialValues = this.reputationsForm.value;
      this.reputationsForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.levelButtonDisabled = isEqual(ivalues, this.repInitialValues);
        this.isEqualValue = this.repInitialValues.levelInterval === Number(ivalues.levelInterval);
      });
    });
    this.widgetService.widget$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widget) => {
      this.widget = widget;
      this.allLanguages = [this.defaultLanguage, ...map(widget?.multilanguage?.languages || [], 'language')];
    });
  }

  ngOnInit(): void {
    this.countrySearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterCountries(searchString);
          return of(this.countries);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });

    this.currencySearchInput$
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchString) => {
          this.filterCurrencies(searchString);
          return of(this.countries);
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.loyaltyService.loyaltySettings$.pipe(takeUntil(this.unsubscribeAll)).subscribe((loyaltySettings: LoyaltySettingsType) => {
      this.loyaltySettings = loyaltySettings;
      this.isAggregatorSelected = loyaltySettings?.aggregator?.coin?.id ? true : false;
      this.isCoinSelected = loyaltySettings?.quantitative?.coin?.id ? true : false;
      let currentIndex;
      if (this.reputations?.length) {
        if (this.selectedConverterIndex === 1) {
          currentIndex = findIndex(
            this.loyaltySettings?.onsiteConverter?.physical?.remunerations,
            (item) => item?.reputationLevel.id === this.reputations[this.remunerationIndex]?.id,
          );
        } else if (this.selectedConverterIndex === 2) {
          currentIndex = findIndex(
            this.loyaltySettings?.onsiteConverter?.mobile?.remunerations,
            (item) => item?.reputationLevel.id === this.reputations[this.remunerationIndex]?.id,
          );
        } else if (this.selectedConverterIndex === 3) {
          currentIndex = findIndex(
            this.loyaltySettings?.onsiteConverter?.web?.remunerations,
            (item) => item?.reputationLevel.id === this.reputations[this.remunerationIndex]?.id,
          );
        }
        this.selectedIndex = currentIndex;
      }
      this.loyaltyForm = this.formBuilder.group({
        login: this.formBuilder.group({
          method: [this.loyaltySettings?.login?.method || undefined],
        }),
        accelerate: this.formBuilder.group({
          physical: this.formBuilder.group({
            enabled: [loyaltySettings?.accelerate?.physical?.enabled || false],
            slots: this.formBuilder.array(
              loyaltySettings?.accelerate?.physical?.slots?.length
                ? map(loyaltySettings?.accelerate?.physical?.slots, (item) => {
                    return this.formBuilder.group({
                      period: this.formBuilder.group({
                        day: [item?.period?.day || undefined],
                        from: [item?.period?.from || ''],
                        to: [item?.period?.to || ''],
                      }),
                      ratio: [item?.ratio || ''],
                    });
                  })
                : [
                    this.formBuilder.group({
                      period: this.formBuilder.group({
                        day: [undefined],
                        from: [''],
                        to: [''],
                      }),
                      ratio: [''],
                    }),
                  ],
            ),
          }),
          mobile: this.formBuilder.group({
            enabled: [loyaltySettings?.accelerate?.physical?.enabled || false],
            slots: this.formBuilder.array(
              loyaltySettings?.accelerate?.mobile?.slots?.length
                ? map(loyaltySettings?.accelerate?.mobile?.slots, (item) => {
                    return this.formBuilder.group({
                      period: this.formBuilder.group({
                        day: [item?.period?.day || undefined],
                        from: [item?.period?.from || ''],
                        to: [item?.period?.to || ''],
                      }),
                      ratio: [item?.ratio || ''],
                    });
                  })
                : [
                    this.formBuilder.group({
                      period: this.formBuilder.group({
                        day: [undefined],
                        from: [''],
                        to: [''],
                      }),
                      ratio: [''],
                    }),
                  ],
            ),
          }),
          web: this.formBuilder.group({
            enabled: [loyaltySettings?.accelerate?.physical?.enabled || false],
            slots: this.formBuilder.array(
              loyaltySettings?.accelerate?.web?.slots?.length
                ? map(loyaltySettings?.accelerate?.web?.slots, (item) => {
                    return this.formBuilder.group({
                      period: this.formBuilder.group({
                        day: [item?.period?.day || undefined],
                        from: [item?.period?.from || ''],
                        to: [item?.period?.to || ''],
                      }),
                      ratio: [item?.ratio || ''],
                    });
                  })
                : [
                    this.formBuilder.group({
                      period: this.formBuilder.group({
                        day: [undefined],
                        from: [''],
                        to: [''],
                      }),
                      ratio: [''],
                    }),
                  ],
            ),
          }),
        }),
        referral: this.formBuilder.group({
          enable: [loyaltySettings?.referral?.enable || false],
          url: [loyaltySettings?.referral?.url || ''],
          content: [loyaltySettings?.referral?.content || ''],
          limit: this.formBuilder.group({
            rate: [loyaltySettings?.referral?.limit?.rate || ''],
            period: [loyaltySettings?.referral?.limit?.period || undefined],
          }),
          remuneration: this.formBuilder.group({
            referrer: this.formBuilder.group({
              qualitative: this.formBuilder.group({
                amount: [loyaltySettings?.referral?.remuneration?.referrer?.qualitative?.amount || ''],
              }),
              quantitative: this.formBuilder.group({
                amount: [loyaltySettings?.referral?.remuneration?.referrer?.quantitative?.amount || ''],
                wallet: [loyaltySettings?.referral?.remuneration?.referrer?.quantitative?.wallet?.id || undefined],
              }),
            }),
            referred: this.formBuilder.group({
              qualitative: this.formBuilder.group({
                amount: [loyaltySettings?.referral?.remuneration?.referred?.qualitative?.amount || ''],
              }),
              quantitative: this.formBuilder.group({
                amount: [loyaltySettings?.referral?.remuneration?.referred?.quantitative?.amount || ''],
                wallet: [loyaltySettings?.referral?.remuneration?.referred?.quantitative?.wallet?.id || undefined],
              }),
            }),
          }),
        }),
        aggregator: this.formBuilder.group({
          target: this.formBuilder.group({
            pos: [this.loyaltySettings?.aggregator?.target?.pos?.id || undefined],
          }),
          coin: [this.loyaltySettings?.aggregator?.coin?.id || undefined],
          redirectUrl: [this.loyaltySettings?.aggregator?.redirectUrl || ''],
        }),
        loyaltyCard: this.formBuilder.group({
          digital: [this.loyaltySettings?.loyaltyCard?.digital || false],
          physical: [this.loyaltySettings?.loyaltyCard?.physical || false],
          validity: [this.loyaltySettings?.loyaltyCard?.validity || ''],
          number: this.formBuilder.group({
            format: [this.loyaltySettings?.loyaltyCard?.number?.format || undefined],
            length: [this.loyaltySettings?.loyaltyCard?.number?.length || undefined],
          }),
          representation: this.formBuilder.group({
            visual: [this.loyaltySettings?.loyaltyCard?.representation?.visual || undefined],
            style: [this.loyaltySettings?.loyaltyCard?.representation?.style || undefined],
          }),
          levels: this.formBuilder.array(
            this.reputations?.length
              ? map(this.reputations, (rep, i: number) => {
                  return this.formBuilder.group({
                    picture: this.formBuilder.group({
                      baseUrl: [this.loyaltySettings?.loyaltyCard?.levels?.[i]?.picture?.baseUrl || ''],
                      path: [this.loyaltySettings?.loyaltyCard?.levels?.[i]?.picture?.path || ''],
                    }),
                    reputationLevel: [rep?.id],
                  });
                })
              : [],
          ),
        }),
        qualitative: this.formBuilder.group({
          active: [this.loyaltySettings?.qualitative?.active || false],
          picture: this.formBuilder.group({
            baseUrl: [this.loyaltySettings.qualitative.picture?.baseUrl || ''],
            path: [this.loyaltySettings.qualitative.picture?.path || ''],
          }),
        }),
        quantitative: this.formBuilder.group({
          active: [this.loyaltySettings?.quantitative?.active || false],
          coin: [this.loyaltySettings?.quantitative?.coin || undefined],
        }),
        leaderboard: this.formBuilder.group({
          active: [this.loyaltySettings?.leaderboard?.active === true || false],
          overall: [this.loyaltySettings?.leaderboard?.overall === true || false],
          monthly: [this.loyaltySettings?.leaderboard?.monthly === true || false],
          weekly: [this.loyaltySettings?.leaderboard?.weekly === true || false],
          daily: [this.loyaltySettings?.leaderboard?.daily === true || false],
          blur: [this.loyaltySettings?.leaderboard?.blur === true || false],
        }),
        inactivity: this.formBuilder.group({
          actions: [this.loyaltySettings?.inactivity?.actions || []],
        }),
        onsiteConverter: this.formBuilder.group({
          physical: this.formBuilder.group({
            active: [this.loyaltySettings?.onsiteConverter?.physical?.active || ''],
            remunerations: this.formBuilder.array([
              this.formBuilder.group({
                qualitative: this.formBuilder.group({
                  amount: [
                    this.selectedIndex > -1
                      ? +(+this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.qualitative?.amount).toFixed(0)
                      : '',
                  ],
                }),
                quantitative: this.formBuilder.group({
                  amount: [
                    this.selectedIndex > -1
                      ? +(+this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.quantitative?.amount).toFixed(0)
                      : '',
                  ],
                  wallet: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.quantitative?.wallet
                      : undefined,
                  ],
                }),
                reputationLevel: this.formBuilder.group({
                  id: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.id
                      : '',
                  ],
                  reputationLevel: [
                    this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel || '',
                  ],
                  levelInterval: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                        this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                      : '',
                  ],
                  color: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.color
                      : '',
                  ],
                }),
              }),
            ]),
          }),
          mobile: this.formBuilder.group({
            active: [this.loyaltySettings?.onsiteConverter?.mobile?.active || ''],
            remunerations: this.formBuilder.array([
              this.formBuilder.group({
                qualitative: this.formBuilder.group({
                  amount: [
                    this.selectedIndex > -1
                      ? +(+this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.qualitative?.amount).toFixed(0)
                      : '',
                  ],
                }),
                quantitative: this.formBuilder.group({
                  amount: [
                    this.selectedIndex > -1
                      ? +(+this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.quantitative?.amount).toFixed(0)
                      : '',
                  ],
                  wallet: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.quantitative?.wallet
                      : undefined,
                  ],
                }),
                reputationLevel: this.formBuilder.group({
                  id: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.id
                      : '',
                  ],
                  reputationLevel: [
                    this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel || '',
                  ],
                  levelInterval: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                        this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                      : '',
                  ],
                  color: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.color
                      : '',
                  ],
                }),
              }),
            ]),
          }),
          web: this.formBuilder.group({
            active: [this.loyaltySettings?.onsiteConverter?.web?.active || ''],
            remunerations: this.formBuilder.array([
              this.formBuilder.group({
                qualitative: this.formBuilder.group({
                  amount: [
                    this.selectedIndex > -1
                      ? +(+this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.qualitative?.amount).toFixed(0)
                      : '',
                  ],
                }),
                quantitative: this.formBuilder.group({
                  amount: [
                    this.selectedIndex > -1
                      ? +(+this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.quantitative?.amount).toFixed(0)
                      : '',
                  ],
                  wallet: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.quantitative?.wallet
                      : undefined,
                  ],
                }),
                reputationLevel: this.formBuilder.group({
                  id: [
                    this.selectedIndex > -1 ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.id : '',
                  ],
                  reputationLevel: [
                    this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel || '',
                  ],
                  levelInterval: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                        this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                      : '',
                  ],
                  color: [
                    this.selectedIndex > -1
                      ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.color
                      : '',
                  ],
                }),
              }),
            ]),
          }),
        }),
        subscribers: this.formBuilder.group({
          verification: [loyaltySettings?.subscribers.verification === true ? true : false],
        }),
        prelevel: this.formBuilder.group({
          turnoverGoalEnabled: [this.loyaltySettings?.prelevel?.turnoverGoalEnabled || false],
          frequencyGoalEnabled: [this.loyaltySettings?.prelevel?.frequencyGoalEnabled || false],
          period: [this.loyaltySettings?.prelevel?.period || ''],
          lossPoints: [this.loyaltySettings?.prelevel?.lossPoints || ''],
          turnoverPoints: [this.loyaltySettings?.prelevel?.turnoverPoints || ''],
          name: [this.loyaltySettings?.prelevel?.name || ''],
          color: [this.loyaltySettings?.prelevel?.color || ''],
          picture: this.formBuilder.group({
            baseUrl: [this.loyaltySettings?.prelevel?.picture?.baseUrl || ''],
            path: [this.loyaltySettings?.prelevel?.picture?.path || ''],
          }),
          cardPicture: this.formBuilder.group({
            baseUrl: [this.loyaltySettings?.prelevel?.cardPicture?.baseUrl || ''],
            path: [this.loyaltySettings?.prelevel?.cardPicture?.path || ''],
          }),
          perks: this.formBuilder.group({
            discount: [this.loyaltySettings?.prelevel?.perks?.discount || ''],
            description: [this.loyaltySettings?.prelevel?.perks?.description || ''],
          }),
          lossAmount: [this.loyaltySettings?.prelevel?.lossAmount],
          inactivityCycle: [this.loyaltySettings?.prelevel?.inactivityCycle],
          onsiteConverter: this.formBuilder.group({
            physical: this.formBuilder.group({
              active: [this.loyaltySettings?.onsiteConverter?.physical?.active || false],
              qualitative: this.formBuilder.group({
                amount: [+(+this.loyaltySettings?.prelevel?.onsiteConverter?.physical.qualitative?.amount).toFixed(0)],
              }),
              quantitative: this.formBuilder.group({
                amount: [+(+this.loyaltySettings?.prelevel?.onsiteConverter?.physical?.quantitative?.amount).toFixed(0)],
                wallet: [this.loyaltySettings?.prelevel?.onsiteConverter?.physical?.quantitative?.wallet || undefined],
              }),
            }),
            web: this.formBuilder.group({
              active: [this.loyaltySettings?.onsiteConverter?.web?.active || false],
              qualitative: this.formBuilder.group({
                amount: [+(+this.loyaltySettings?.prelevel?.onsiteConverter?.web?.qualitative?.amount).toFixed(0)],
              }),
              quantitative: this.formBuilder.group({
                amount: [+(+this.loyaltySettings?.prelevel?.onsiteConverter?.web?.quantitative?.amount).toFixed(0)],
                wallet: [this.loyaltySettings?.prelevel?.onsiteConverter?.web?.quantitative?.wallet || undefined],
              }),
            }),
            mobile: this.formBuilder.group({
              active: [this.loyaltySettings?.onsiteConverter?.mobile?.active || false],
              qualitative: this.formBuilder.group({
                amount: [+(+this.loyaltySettings?.prelevel?.onsiteConverter?.mobile?.qualitative?.amount).toFixed(0)],
              }),
              quantitative: this.formBuilder.group({
                amount: [+(+this.loyaltySettings?.prelevel?.onsiteConverter?.mobile?.quantitative?.amount).toFixed(0)],
                wallet: [this.loyaltySettings?.prelevel?.onsiteConverter?.mobile?.quantitative?.wallet || undefined],
              }),
            }),
          }),
        }),
        redeem: this.formBuilder.group({
          content: [this.loyaltySettings?.redeem?.content || ''],
          editor: [this.loyaltySettings?.redeem?.editor || OutboundEditorEnum.TEXT],
          translation: this.formBuilder.group({
            language: [this.defaultLanguage],
            content: [''],
          }),
        }),
      });
      if (loyaltySettings?.aggregator?.target?.pos?.id) {
        this.loyaltyService.getLoyaltySettings(loyaltySettings?.aggregator?.target?.pos?.id).subscribe((res) => {
          if (res) {
            this.aggregatorCoin = [res?.quantitative?.coin];
            this.loyaltyForm.get(['aggregator', 'coin']).patchValue(res?.quantitative?.coin?.id);
          }
        });
      }
      this.initialValues = this.loyaltyForm.value;
      this.loyaltyForm
        .get('login')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isLoginButtonDisabled = isEqual(this.initialValues.login, ivalues);
        });

      this.loyaltyForm
        .get('referral')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isReferralButtonDisabled = isEqual(this.initialValues.referral, ivalues);
        });

      this.loyaltyForm
        .get(['accelerate', 'physical'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isPhysicalAccelerateButtonDisabled = isEqual(this.initialValues.accelerate.physical, ivalues);
        });

      this.loyaltyForm
        .get(['accelerate', 'mobile'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isMobileAccelerateButtonDisabled = isEqual(this.initialValues.accelerate.mobile, ivalues);
        });

      this.loyaltyForm
        .get(['accelerate', 'web'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isWebAccelerateButtonDisabled = isEqual(this.initialValues.accelerate.web, ivalues);
        });

      this.loyaltyForm
        .get(['referral', 'remuneration', 'referrer'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isReferrerButtonDisabled = isEqual(this.initialValues.referral.remuneration.referrer, ivalues);
        });
      this.loyaltyForm
        .get(['referral', 'remuneration', 'referred'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isReferredButtonDisabled = isEqual(this.initialValues.referral.remuneration.referred, ivalues);
        });
      this.loyaltyForm
        .get('aggregator')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isWalletButtonDisabled = isEqual(this.initialValues.aggregator, ivalues);
        });

      this.loyaltyForm
        .get('inactivity')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isInactivityButtonDisabled = isEqual(this.initialValues.inactivity?.actions, ivalues?.actions);
        });

      this.loyaltyForm
        .get('loyaltyCard')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isCardButtonDisabled = isEqual(omit(this.initialValues.loyaltyCard, 'digital', 'physical'), omit(ivalues, 'digital', 'physical'));
        });
      this.loyaltyForm
        .get('prelevel')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isPreLevelButtonDisabled = isEqual(ivalues, this.initialValues.prelevel);
        });
      this.loyaltyForm
        .get('redeem')
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          // this.isRedeemButtonDisabled = isEqual(ivalues, this.initialValues.redeem);
          this.isRedeemButtonDisabled = false;
        });
      this.loyaltyForm
        .get(['onsiteConverter', 'physical', 'remunerations'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isConverterPhysicalButtonDisabled = isEqual(this.initialValues.onsiteConverter.physical.remunerations, ivalues);
        });

      this.loyaltyForm
        .get(['prelevel', 'onsiteConverter', 'physical'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isPrelevelPhysicalButtonDisabled = isEqual(this.initialValues.prelevel.onsiteConverter.physical, ivalues);
        });

      this.loyaltyForm
        .get(['onsiteConverter', 'web', 'remunerations'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isConverterWebButtonDisabled = isEqual(this.initialValues.onsiteConverter.web.remunerations, ivalues);
        });

      this.loyaltyForm
        .get(['prelevel', 'onsiteConverter', 'web'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isPrelevelWebButtonDisabled = isEqual(this.initialValues.prelevel.onsiteConverter.web, ivalues);
        });

      this.loyaltyForm
        .get(['onsiteConverter', 'mobile', 'remunerations'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isConverterMobileButtonDisabled = isEqual(this.initialValues.onsiteConverter.mobile.remunerations, ivalues);
        });

      this.loyaltyForm
        .get(['prelevel', 'onsiteConverter', 'mobile'])
        .valueChanges.pipe(takeUntil(this.unsubscribeAll))
        .subscribe((ivalues) => {
          this.isPrelevelMobileButtonDisabled = isEqual(this.initialValues.prelevel.onsiteConverter.mobile, ivalues);
        });
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    combineLatest([
      this.posService.findCountriesPagination(),
      this.posService.findCurrenciesPagination(),
      this.loyaltyService.getPointOfSalesAggregatorPagination(),
      this.loyaltyService.quantitativeWalletsByOwnerPagination(),
      this.questTypeService.getPartnershipNetworksByPartnerAndPartnershipPagination(),
    ]).subscribe(([res, result]) => {
      if (res) {
        this.countries = sortBy(res, ['name']);
        this.originalCountries = sortBy(res, ['name']);
        this.currencies = sortBy(result, ['name']);
        this.originalCurrencies = sortBy(result, ['name']);
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  onRepChange(index: number) {
    this.selectedReputationIndex = index;
    this.selectedPrelevel = false;
    this.selectedRepLevel = this.reputations[index]?.reputationLevel;
    this.reputationsForm.patchValue({
      id: this.reputations[index].id,
      reputationLevel: this.reputations[index]?.reputationLevel,
      lossAmount: this.reputations[index]?.lossAmount,
      inactivityCycle: this.reputations[index]?.inactivityCycle,
      lossPoints: this.reputations[index]?.lossPoints,
      turnoverGoalEnabled: this.reputations[index]?.turnoverGoalEnabled,
      frequencyGoalEnabled: this.reputations[index]?.frequencyGoalEnabled,
      turnoverPoints: this.reputations[index]?.turnoverPoints,
      period: this.reputations[index]?.period,
      color: this.reputations[index]?.color,
      picture: this.formBuilder.group({
        baseUrl: this.reputations[index]?.picture?.baseUrl,
        path: this.reputations[index]?.picture?.path,
      }),
      perks: this.formBuilder.group({
        discount: this.reputations[index]?.perks?.discount,
        description: this.reputations[index]?.perks?.description,
      }),
      levelInterval: this.reputations[index].levelInterval.max - this.reputations[index].levelInterval.min,
      points: undefined,
    });
    this.repInitialValues = this.reputationsForm.value;
    this.reputationsForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
      this.isEqualValue = this.repInitialValues.levelInterval === Number(ivalues.levelInterval);
      this.levelButtonDisabled = isEqual(ivalues, this.repInitialValues);
    });
  }

  onChangeRedeem(content: any) {
    if (this.loyaltyForm.get(['redeem', 'editor']).value === OutboundEditorEnum.HTML) {
      if (this.translation?.get('language').value?.name !== 'Default') {
        this.safeRedeem = this.sanitizer?.bypassSecurityTrustHtml(this.translation.get('content').value);
      } else {
        this.safeRedeem = this.sanitizer?.bypassSecurityTrustHtml(this.loyaltyForm.get(['redeem', 'content']).value);
      }
    }
    this.modalService.open(content, { size: 'lg', backdrop: 'static' });
    this.isPreviewEnabled = !this.isPreviewEnabled;
  }

  onChangeEmailLanguage(translate: LanguageType) {
    this.selectedTranslation = find(this.loyaltySettings?.redeem?.translation, (trans) => trans?.language.id === translate?.id);
    this.loyaltyForm.get(['redeem', 'translation', 'content']).patchValue(this.selectedTranslation?.content);
    this.initialValues = this.loyaltyForm.value;
    this.isRedeemButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  saveRedeem() {
    let translations;
    this.isRedeemButtonDisabled = true;
    const translation = this.loyaltySettings?.redeem?.translation?.filter(
      (translate) => translate?.language?.id !== this.selectedTranslation?.language?.id,
    );
    if (this.translation?.value?.language && this.loyaltySettings?.redeem && this.translation?.get('language').value?.name !== 'Default') {
      translations = [
        ...map(translation, (trs) => {
          return {
            language: trs?.language?.id,
            content: trs?.content,
          };
        }),
        {
          language: this.translation?.value?.language?.id,
          content: this.translation?.value?.content,
        },
      ];
    }
    const redeem = FormHelper.getDifference(
      omit(this.initialValues.redeem, 'translation'),
      omit(this.loyaltyForm.get('redeem').value, 'translation'),
    );
    const input: any = {
      id: this.loyaltySettings.id,
      redeem: {
        ...(keys(redeem)?.length
          ? {
              ...redeem,
              editor: this.loyaltyForm.get(['redeem', 'editor']).value,
            }
          : {}),
        ...(translations?.length ? { translation: translations } : {}),
      },
    };
    this.loyaltyService
      .updateLoyaltySettings(input, false)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.loyaltySettings = res;
          this.position();
          this.modalService.dismissAll();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onChangeGoal(checked: boolean, label: string, field?: string) {
    let input: any;
    input = {
      ...(field === 'prelevel'
        ? {
            id: this.loyaltySettings.id,
            prelevel: {
              ...(label === 'turnover' ? { turnoverGoalEnabled: checked } : { frequencyGoalEnabled: checked }),
            },
          }
        : {
            id: this.reputationsForm.get('id').value,
            ...(label === 'turnover' ? { turnoverGoalEnabled: checked } : { frequencyGoalEnabled: checked }),
          }),
    };
    if (field === 'prelevel') {
      this.updateLoyaltySettings(input);
    } else {
      this.loyaltyService
        .updateReputationLevelGoalStatus(input)
        .pipe(
          catchError(() => {
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res) => {
          if (res) {
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  saveLevel() {
    let reputation;
    let formValues;
    let perks;
    this.levelButtonDisabled = true;
    if (this.selectedRepLevel === 'plus') {
      perks = FormHelper.getNonEmptyValues(this.reputationsForm.get('perks').value);
      formValues = {
        ...FormHelper.getNonEmptyValues(omit(this.reputationsForm.value, 'picture', 'levelInterval', 'perks', 'id')),
        ...(keys(perks)?.length ? { perks } : {}),
        ...(this.reputationsForm.get('picture').value.path ? { picture: this.reputationsForm.get('picture').value } : {}),
      };
      this.addReputationLevel(formValues);
    } else {
      reputation = this.reputations.find((s) => s.id === this.reputationsForm.value.id);
      perks = reputation?.perks ? FormHelper.getDifference(reputation.perks, this.reputationsForm.get('perks').value) : {};
      formValues = {
        ...FormHelper.getDifference(
          omit(reputation, 'picture', 'levelInterval', 'perks', 'points'),
          omit(this.reputationsForm.value, 'picture', 'levelInterval', 'perks', 'points'),
        ),
        ...(keys(perks)?.length ? { perks } : {}),
        ...(reputation?.picture?.path && reputation?.picture?.path !== this.reputationsForm.get('picture').value.path
          ? { picture: this.reputationsForm.get('picture').value }
          : {}),
        id: this.reputationsForm.get('id').value,
      };
      if (this.isEqualValue) {
        this.loyaltyService
          .updateTargetReputation(formValues, this.reputationsForm.get('id').value)
          .pipe(
            catchError(() => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return of(null);
            }),
            switchMap((res) => {
              if (res) {
                return this.loyaltyService.getLoyaltySettingsByTarget();
              }
              return of(null);
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.position();
              // this.selectedPrelevel = true;
              // this.selectedRepLevel = null;
              this.changeDetectorRef.markForCheck();
            }
          });
      } else {
        this.loyaltyService
          .updateReputationLevelPoints(this.reputationsForm.get('levelInterval').value, this.reputationsForm.get('id').value)
          .pipe(
            catchError((error) => {
              this.modalError();
              this.changeDetectorRef.markForCheck();
              return throwError(() => new Error(error));
            }),
          )
          .subscribe((res) => {
            if (res) {
              this.loyaltyService
                .updateTargetReputation(formValues, this.reputationsForm.get('id').value)
                .pipe(
                  catchError(() => {
                    this.modalError();
                    this.changeDetectorRef.markForCheck();
                    return of(null);
                  }),
                  switchMap((res) => {
                    if (res) {
                      return this.loyaltyService.getLoyaltySettingsByTarget();
                    }
                    return of(null);
                  }),
                )
                .subscribe(() => {
                  this.position();
                  this.selectedPrelevel = true;
                  this.selectedRepLevel = null;
                  this.changeDetectorRef.markForCheck();
                });
            }
          });
      }
    }
  }

  addReputationLevel(formValues: any) {
    this.loyaltyService
      .addReputationLevel(formValues)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  openDeleteModal(content: any, reputation: ReputationType) {
    this.selectedReputation = reputation;
    this.modalService.open(content, { centered: true });
  }

  removeReputationLevel() {
    this.loyaltyService
      .removeReputationLevel(this.selectedReputation.id)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.onRepChange(0);
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  save() {
    this.isCardButtonDisabled = true;
    let input: any = {};
    const representation: any = {
      ...FormHelper.getDifference(this.initialValues.loyaltyCard.representation, this.loyaltyForm.get(['loyaltyCard', 'representation']).value),
    };
    const number: any = {
      ...FormHelper.getDifference(this.initialValues.loyaltyCard.number, this.loyaltyForm.get(['loyaltyCard', 'number']).value),
    };
    const loyaltyCard = {
      ...FormHelper.getDifference(
        omit(this.initialValues.loyaltyCard, 'representation', 'number', 'levels'),
        omit(this.loyaltyForm.get('loyaltyCard').value, 'representation', 'number', 'levels'),
      ),
      ...(keys(number)?.length ? { number } : {}),
      ...(keys(representation)?.length ? { representation } : {}),
    };
    input = {
      id: this.loyaltySettings.id,
      ...(keys(loyaltyCard)?.length ? { loyaltyCard } : {}),
    };
    this.updateLoyaltySettings(input);
  }

  addLevel() {
    this.selectedRepLevel = 'plus';
    this.selectedPrelevel = false;
    this.reputationsForm.patchValue({
      turnoverGoalEnabled: false,
      frequencyGoalEnabled: false,
      reputationLevel: '',
      lossAmount: '',
      inactivityCycle: '',
      lossPoints: '',
      turnoverPoints: '',
      period: '',
      color: '',
      picture: {
        path: null,
        baseUrl: null,
      },
      perks: {
        discount: '',
        description: '',
      },
      levelInterval: '',
    });
    this.changeDetectorRef.markForCheck();
  }

  closeRedeemModal() {
    this.isPreviewEnabled = false;
    this.modalService.dismissAll();
  }

  getCardLevel(index: number, field: string) {
    if (field === 'prelevel') {
      this.selectedRepLevel = null;
    }
    this.selectedField = field;
    this.selectedCardIndex = index;
    this.isCardButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  uploadLevelPicture() {
    let input;
    let levels;
    let allLevels = clone(this.loyaltyForm?.value.loyaltyCard?.levels);
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      if (this.selectedField === 'prelevel') {
        this.loadingCardPrelevel = true;
      } else {
        this.loadingCardlevel = true;
      }
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          if (this.selectedField === 'prelevel') {
            this.loyaltyForm.get(['prelevel', 'cardPicture']).patchValue({
              path: picture.path,
              baseUrl: picture.baseUrl,
            });
          } else {
            allLevels[this.selectedCardIndex].picture = { path: picture.path, baseUrl: picture.baseUrl };
            levels = map(allLevels, (level) => {
              return {
                ...level,
                reputationLevel: level?.reputationLevel,
              };
            });
          }
          input = {
            id: this.loyaltySettings?.id,
            ...(this.selectedField === 'prelevel'
              ? {
                  prelevel: {
                    cardPicture: {
                      path: picture.path,
                      baseUrl: picture.baseUrl,
                    },
                  },
                }
              : {
                  loyaltyCard: {
                    levels,
                  },
                }),
          };
          this.updateLoyaltySettings(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
    this.changeDetectorRef.markForCheck();
  }

  removePicture(field: string) {
    let levels;
    let allLevels = clone(this.loyaltyForm?.value.loyaltyCard?.levels);
    let input;
    if (field === 'quantitative') {
      const fileName = this.loyaltyForm.get('quantitative').get(['picture', 'path']).value;
      this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
        if (data.deleteFileFromAws) {
          this.loyaltyForm.get(['quantitative', 'picture']).patchValue({
            baseUrl: '',
            path: '',
          });
          input = {
            id: this.loyaltySettings.id,
            quantitative: {
              picture: { baseUrl: '', path: '' },
            },
          };
          this.updateLoyaltySettings(input);
          this.changeDetectorRef.markForCheck();
        }
      });
    } else if (field === 'prelevel') {
      const fileName = this.loyaltyForm.get(['prelevel', 'cardPicture', 'path']).value;
      this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(({ data }) => {
        if (data.deleteFileFromAws) {
          this.loyaltyForm.get(['prelevel', 'cardPicture']).patchValue({
            baseUrl: '',
            path: '',
          });
          input = {
            id: this.loyaltySettings.id,
            prelevel: {
              cardPicture: { baseUrl: '', path: '' },
            },
          };
          this.updateLoyaltySettings(input);
          this.changeDetectorRef.markForCheck();
        }
      });
    } else if (field === 'level') {
      const fileName = this.loyaltyForm.get(['loyaltyCard', 'levels'])?.value[0]?.picture.path;
      allLevels[this.selectedCardIndex].picture = { path: '', baseUrl: '' };
      levels = [
        ...map(allLevels, (level) => {
          return {
            ...level,
            reputationLevel: level?.reputationLevel?.id,
          };
        }),
      ];
      this.deleteFileFromAwsGQL.fetch({ fileName }).subscribe(async ({ data }) => {
        if (data.deleteFileFromAws) {
          input = {
            id: this.loyaltySettings.id,
            loyaltyCard: {
              levels,
            },
          };
          this.changeDetectorRef.markForCheck();
        }
        this.updateLoyaltySettings(input);
      });
    } else {
    }
  }

  saveLogin() {
    const input = {
      id: this.loyaltySettings?.id,
      login: {
        method: this.loyaltyForm.get(['login', 'method']).value,
      },
    };
    this.isLoginButtonDisabled = true;
    this.updateLoyaltySettings(input);
  }

  saveAccelerate(field: string, accelerate: FormArray) {
    this.isMobileAccelerateButtonDisabled = true;
    this.isWebAccelerateButtonDisabled = true;
    this.isPhysicalAccelerateButtonDisabled = true;
    const slots = accelerate.value.map((item) => {
      const filteredObject = {
        ...(item?.ratio ? { ratio: item.ratio } : {}),
        period: pickBy(item?.period, identity),
      };
      return {
        ...(item?.ratio ? { ratio: item.ratio } : {}),
        ...(keys(filteredObject.period).length ? { period: pickBy(item?.period, identity) } : {}),
      };
    });
    const input = {
      id: this.loyaltySettings?.id,
      ...(slots.length && field === 'mobile' ? { accelerate: { mobile: { slots } } } : {}),
      ...(slots.length && field === 'web' ? { accelerate: { web: { slots } } } : {}),
      ...(slots.length && field === 'physical' ? { accelerate: { physical: { slots } } } : {}),
    };
    this.updateLoyaltySettings(input);
  }

  onChangeAccelerate(checked: boolean, field: string) {
    const input: any = {
      id: this.loyaltySettings?.id,
      accelerate: {
        ...(field === 'physical' ? { physical: { enabled: checked } } : {}),
        ...(field === 'web' ? { web: { enabled: checked } } : {}),
        ...(field === 'mobile' ? { mobile: { enabled: checked } } : {}),
      },
    };
    this.updateLoyaltySettings(input);
  }

  saveReferral(field: string) {
    let input;
    const limit = {
      ...FormHelper.getDifference(this.initialValues.referral.limit, this.loyaltyForm.get(['referral', 'limit']).value),
    };
    const referrer = {
      ...FormHelper.getDifference(
        this.initialValues.referral.remuneration.referrer,
        this.loyaltyForm.get(['referral', 'remuneration', 'referrer']).value,
      ),
    };
    const referred = {
      ...FormHelper.getDifference(
        this.initialValues.referral.remuneration.referred,
        this.loyaltyForm.get(['referral', 'remuneration', 'referred']).value,
      ),
    };
    this.isReferralButtonDisabled = true;
    if (field === 'referrer') {
      this.isReferrerButtonDisabled = true;
    } else if (field === 'referred') {
      this.isReferredButtonDisabled = true;
    }
    input = {
      id: this.loyaltySettings?.id,
      ...(field === 'referrer' && keys(referrer).length
        ? {
            referral: {
              ...(keys(limit)?.length ? { limit } : {}),
              remuneration: { referrer },
              ...(this.initialValues.referral.url === this.loyaltyForm.get(['referral', 'url']).value
                ? {}
                : { url: this.loyaltyForm.get(['referral', 'url']).value }),
              ...(this.initialValues.referral.content === this.loyaltyForm.get(['referral', 'content']).value
                ? {}
                : { content: this.loyaltyForm.get(['referral', 'content']).value }),
            },
          }
        : {}),
      ...(field === 'referred' && keys(referred).length
        ? {
            referral: {
              ...(keys(limit)?.length ? { limit } : {}),
              remuneration: { referred },
              ...(this.initialValues.referral.url === this.loyaltyForm.get(['referral', 'url']).value
                ? {}
                : { url: this.loyaltyForm.get(['referral', 'url']).value }),
              ...(this.initialValues.referral.content === this.loyaltyForm.get(['referral', 'content']).value
                ? {}
                : { content: this.loyaltyForm.get(['referral', 'content']).value }),
            },
          }
        : {}),
    };
    this.updateLoyaltySettings(input);
  }

  resetDate(field: FormArray, index: number, param1: string, param2: string) {
    field.at(index).get([param1, param2]).reset();
  }

  addSlotField(field: FormArray) {
    field.push(
      this.formBuilder.group({
        period: this.formBuilder.group({
          day: [undefined],
          from: [''],
          to: [''],
        }),
        ratio: [''],
      }),
    );
  }

  removeSlotField(field: FormArray, index: number) {
    field.removeAt(index);
  }

  onChangeTarget(target: PointOfSaleType) {
    this.loyaltyService.getLoyaltySettings(target?.id).subscribe((res) => {
      this.aggregatorCoin = [res?.quantitative?.coin];
      this.loyaltyForm.get(['aggregator', 'coin']).patchValue(res?.quantitative?.coin?.id);
    });
  }

  saveWallet() {
    const aggregator = {
      ...FormHelper.getDifference(this.initialValues.aggregator, this.loyaltyForm.get('aggregator').value),
    };
    this.isWalletButtonDisabled = true;
    const input = {
      id: this.loyaltySettings?.id,
      ...(keys(aggregator).length ? { aggregator } : {}),
      quantitative: {
        coin: null,
      },
    };
    this.updateLoyaltySettings(input);
  }

  saveCoin() {
    this.isCoinButtonDisabled = true;
    let field: string;
    field = this.selectedCoin ? 'updateCoin' : 'createCoin';
    const unitValue = {
      ...(this.coinInitValues.unitValue?.currency?.id === this.coinForm.get('unitValue').value.currency?.id
        ? {}
        : {
            currency: this.coinForm.get('unitValue').value.currency?.id,
          }),
      ...(this.coinInitValues.unitValue?.amount === this.coinForm.get('unitValue').value.amount
        ? {}
        : {
            amount: this.coinForm.get('unitValue').value.amount,
          }),
    };
    const input: any = {
      ...FormHelper.getDifference(
        omit(this.coinInitValues, 'picture', 'unitValue', 'category', 'handle'),
        omit(this.coinForm.value, 'picture', 'unitValue', 'category', 'handle'),
      ),
      ...(keys(unitValue)?.length ? { unitValue } : {}),
      ...(this.coinInitValues.picture?.path === this.coinForm.get(['picture', 'path']).value ? {} : { picture: this.coinForm.get('picture').value }),
    };
    const args = this.selectedCoin ? [this.selectedCoin.id, input] : [input];
    this.loyaltyService[field](...args)
      .pipe(
        catchError(() => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          if (!this.selectedCoin) {
            const input = {
              id: this.loyaltySettings.id,
              aggregator: {
                target: { pos: null },
                redirectUrl: null,
                coin: null,
              },
              quantitative: {
                ...omit(this.loyaltySettings?.quantitative, 'coin'),
                coin: res?.id,
              },
            };
            this.updateLoyaltySettings(input);
          } else {
            this.position();
            this.modalService.dismissAll();
            this.changeDetectorRef.markForCheck();
          }
        }
      });
  }

  loadMoreTargets() {
    this.loyaltyService.isLastTarget$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.targetPageIndex++;
        this.loyaltyService.getPointOfSalesAggregatorPagination().subscribe();
      }
    });
  }

  onChangeConversion(checked: boolean, field: string, isPrelevel = false) {
    const input: any = {
      id: this.loyaltySettings?.id,
      ...(isPrelevel
        ? {
            prelevel: {
              onsiteConverter: {
                ...(field === 'physical' ? { physical: { active: checked } } : {}),
                ...(field === 'web' ? { web: { active: checked } } : {}),
                ...(field === 'mobile' ? { mobile: { active: checked } } : {}),
              },
            },
          }
        : {
            onsiteConverter: {
              ...(field === 'physical' ? { physical: { active: checked } } : {}),
              ...(field === 'web' ? { web: { active: checked } } : {}),
              ...(field === 'mobile' ? { mobile: { active: checked } } : {}),
            },
          }),
    };
    this.updateLoyaltySettings(input);
  }

  saveInactivity() {
    this.isInactivityButtonDisabled = true;
    const input = {
      id: this.loyaltySettings.id,
      inactivity: {
        actions: this.loyaltyForm.get(['inactivity', 'actions']).value,
      },
    };
    this.updateLoyaltySettings(input);
  }

  openCoinModal(modal, coin: CoinType) {
    this.selectedCoin = coin;
    this.modalService.open(modal);
    this.coinForm = this.formBuilder.group({
      name: [coin?.name || ''],
      code: [coin?.code || ''],
      category: [coin?.category || CoinCategoryEnum.CLASSIC],
      picture: this.formBuilder.group({
        baseUrl: [coin?.picture?.baseUrl || ''],
        path: [coin?.picture?.path || ''],
      }),
      unitValue: this.formBuilder.group({
        amount: [coin?.unitValue?.amount || ''],
        currency: [coin?.unitValue?.currency || undefined],
      }),
      handle: [CoinHandleEnum.INTERNAL],
      country: [coin?.country?.id || undefined],
    });
    this.coinInitValues = this.coinForm.value;
    this.coinForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isCoinButtonDisabled = isEqual(values, this.coinInitValues);
    });
  }

  filterCountries(searchTerm: string) {
    this.countries = filter(this.originalCountries, (country) =>
      country.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''),
    );
  }

  filterCurrencies(searchTerm: string) {
    this.currencies = filter(this.originalCurrencies, (currency) =>
      currency.name?.toLowerCase().includes(searchTerm !== null ? searchTerm?.toLowerCase() : ''),
    );
  }

  loadMoreWallets() {
    this.loyaltyService.isLastWallet$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.walletPageIndex++;
        this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
      }
    });
  }

  uploadCoin() {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    fileInput.onchange = async () => {
      this.loadingCoinPrelevel = true;
      const file = fileInput.files[0];
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          this.coinForm.get('picture').patchValue({
            path: picture.path,
            baseUrl: picture.baseUrl,
          });
          this.loadingCoinPrelevel = false;
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  saveConverter(field: string) {
    this.isConverterWebButtonDisabled = true;
    this.isConverterPhysicalButtonDisabled = true;
    this.isConverterMobileButtonDisabled = true;
    this.isPrelevelMobileButtonDisabled = true;
    this.isPrelevelPhysicalButtonDisabled = true;
    this.isPrelevelWebButtonDisabled = true;
    let remunerations;
    let allRemunerations =
      field === 'physical'
        ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations
        : field === 'web'
        ? this.loyaltySettings?.onsiteConverter?.web?.remunerations
        : this.loyaltySettings?.onsiteConverter?.mobile?.remunerations;
    if (this.selectedPrelevel === false) {
      if (this.selectedIndex > -1) {
        allRemunerations = allRemunerations.filter((item, index) => index !== this.selectedIndex);
      }
      remunerations = [
        ...map(allRemunerations, (rm) => {
          return {
            ...rm,
            quantitative: {
              amount: rm?.quantitative?.amount,
              wallet: rm?.quantitative?.wallet?.id,
            },
            reputationLevel: rm?.reputationLevel?.id,
          };
        }),
        {
          reputationLevel: this.loyaltyForm.get(['onsiteConverter', field]).value.remunerations[0].reputationLevel?.id,
          ...(+this.loyaltyForm.get(['onsiteConverter', field]).value.remunerations[0].qualitative?.amount >= 0
            ? {
                qualitative: {
                  amount: this.loyaltyForm.get(['onsiteConverter', field]).value.remunerations[0].qualitative?.amount?.toString() || '',
                },
              }
            : {}),
          ...(+this.loyaltyForm.get(['onsiteConverter', field]).value.remunerations[0].quantitative?.amount >= 0
            ? {
                quantitative: {
                  amount: this.loyaltyForm.get(['onsiteConverter', field]).value.remunerations[0].quantitative?.amount?.toString() || '',
                  wallet: this.loyaltyForm.get(['onsiteConverter', field]).value.remunerations[0].quantitative?.wallet?.id,
                },
              }
            : {}),
        },
      ];
    }
    const input: any = {
      id: this.loyaltySettings.id,
      ...(this.selectedPrelevel === false
        ? {
            onsiteConverter: {
              ...(field === 'physical'
                ? {
                    physical: {
                      remunerations,
                    },
                  }
                : {}),
              ...(field === 'web'
                ? {
                    web: {
                      remunerations,
                    },
                  }
                : {}),
              ...(field === 'mobile'
                ? {
                    mobile: {
                      remunerations,
                    },
                  }
                : {}),
            },
          }
        : {
            prelevel: {
              onsiteConverter: {
                ...(field === 'physical'
                  ? {
                      physical: {
                        qualitative: {
                          amount: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'qualitative', 'amount']).value?.toString() || '0',
                        },
                        quantitative: {
                          amount: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'quantitative', 'amount']).value?.toString() || '0',
                          wallet: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'quantitative', 'wallet']).value?.id,
                        },
                      },
                    }
                  : {}),
                ...(field === 'web'
                  ? {
                      web: {
                        qualitative: {
                          amount: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'qualitative', 'amount']).value?.toString() || '0',
                        },
                        quantitative: {
                          amount: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'quantitative', 'amount']).value?.toString() || '0',
                          wallet: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'quantitative', 'wallet']).value?.id,
                        },
                      },
                    }
                  : {}),
                ...(field === 'mobile'
                  ? {
                      mobile: {
                        qualitative: {
                          amount: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'qualitative', 'amount']).value?.toString() || '0',
                        },
                        quantitative: {
                          amount: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'quantitative', 'amount']).value?.toString() || '0',
                          wallet: this.loyaltyForm.get(['prelevel', 'onsiteConverter', field, 'quantitative', 'wallet']).value?.id,
                        },
                      },
                    }
                  : {}),
              },
            },
          }),
    };

    this.loyaltyService
      .updateLoyaltySettings(input)
      .pipe(
        catchError(() => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return of(null);
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  onConverterChange(event: any) {
    this.selectedConverterIndex = event.nextId;
    if (this.selectedConverterIndex === 1) {
      this.selectedIndex = findIndex(
        this.loyaltySettings?.onsiteConverter?.physical?.remunerations,
        (item) => item?.reputationLevel.id === this.reputations[this.selectedRepIndex]?.id,
      );
    } else if (this.selectedConverterIndex === 2) {
      this.selectedIndex = findIndex(
        this.loyaltySettings?.onsiteConverter?.mobile?.remunerations,
        (item) => item?.reputationLevel.id === this.reputations[this.selectedRepIndex]?.id,
      );
    } else if (this.selectedConverterIndex === 3) {
      this.selectedIndex = findIndex(
        this.loyaltySettings?.onsiteConverter?.web?.remunerations,
        (item) => item?.reputationLevel.id === this.reputations[this.selectedRepIndex]?.id,
      );
    }
    this.loyaltyForm.get('onsiteConverter').patchValue({
      mobile: {
        active: this.loyaltySettings?.onsiteConverter?.mobile?.active || '',
        remunerations: [
          {
            qualitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.qualitative?.amount)?.toFixed(0)
                  : '',
            },
            quantitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.quantitative?.amount)?.toFixed(0)
                  : '',
              wallet:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.quantitative?.wallet
                  : undefined,
            },
            reputationLevel: {
              id: this.reputations[this.selectedRepIndex]?.id || '',
              reputationLevel:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel
                  : '',

              levelInterval:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                    this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                  : '',
              color:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.color
                  : '',
            },
          },
        ],
      },
      web: {
        active: this.loyaltySettings?.onsiteConverter?.web?.active || '',
        remunerations: [
          {
            qualitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.qualitative?.amount)?.toFixed(0)
                  : '',
            },
            quantitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.quantitative?.amount)?.toFixed(0)
                  : '',
              wallet:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.quantitative?.wallet
                  : undefined,
            },
            reputationLevel: {
              id: this.reputations[this.selectedRepIndex]?.id || '',
              reputationLevel:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel
                  : '',

              levelInterval:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                    this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                  : '',
              color:
                this.selectedIndex > -1 ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.color : '',
            },
          },
        ],
      },
      physical: {
        active: this.loyaltySettings?.onsiteConverter?.physical?.active || '',
        remunerations: [
          {
            qualitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.qualitative?.amount)?.toFixed(0)
                  : '',
            },
            quantitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.quantitative?.amount)?.toFixed(0)
                  : '',
              wallet:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.quantitative?.wallet
                  : undefined,
            },
            reputationLevel: {
              id: this.reputations[this.selectedRepIndex]?.id || '',
              reputationLevel:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel
                  : '',

              levelInterval:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                    this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                  : '',
              color:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.color
                  : '',
            },
          },
        ],
      },
    });
    this.initialValues = this.loyaltyForm.value;
    this.isConverterMobileButtonDisabled = true;
    this.isConverterWebButtonDisabled = true;
    this.isConverterPhysicalButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  getLevel(color: string, reputationLevel, index: number) {
    this.selectedRepIndex = index;
    this.isConverterButtonDisabled = true;
    this.selectedPrelevel = false;
    if (this.selectedConverterIndex === 1) {
      this.selectedIndex = findIndex(
        this.loyaltySettings?.onsiteConverter?.physical?.remunerations,
        (item) => item?.reputationLevel.id === this.reputations[index]?.id,
      );
    } else if (this.selectedConverterIndex === 2) {
      this.selectedIndex = findIndex(
        this.loyaltySettings?.onsiteConverter?.mobile?.remunerations,
        (item) => item?.reputationLevel.id === this.reputations[index]?.id,
      );
    } else if (this.selectedConverterIndex === 3) {
      this.selectedIndex = findIndex(
        this.loyaltySettings?.onsiteConverter?.web?.remunerations,
        (item) => item?.reputationLevel.id === this.reputations[index]?.id,
      );
    }
    this.remunerationIndex = index;
    this.selectedReputationColor = color;
    this.selectedReputationLevel = reputationLevel;
    this.loyaltyForm.get('onsiteConverter').patchValue({
      mobile: {
        active: this.loyaltySettings?.onsiteConverter?.mobile?.active || '',
        remunerations: [
          {
            qualitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.qualitative?.amount)?.toFixed(0)
                  : '',
            },
            quantitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.quantitative?.amount)?.toFixed(0)
                  : '',
              wallet:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.quantitative?.wallet
                  : undefined,
            },
            reputationLevel: {
              id: this.reputations[index]?.id || '',
              reputationLevel:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel
                  : '',

              levelInterval:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                    this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                  : '',
              color:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.mobile?.remunerations[this.selectedIndex]?.reputationLevel?.color
                  : '',
            },
          },
        ],
      },
      web: {
        active: this.loyaltySettings?.onsiteConverter?.web?.active || '',
        remunerations: [
          {
            qualitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.qualitative?.amount)?.toFixed(0)
                  : '',
            },
            quantitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.quantitative?.amount)?.toFixed(0)
                  : '',
              wallet:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.quantitative?.wallet
                  : undefined,
            },
            reputationLevel: {
              id: this.reputations[index]?.id || '',
              reputationLevel:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel
                  : '',

              levelInterval:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                    this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                  : '',
              color:
                this.selectedIndex > -1 ? this.loyaltySettings?.onsiteConverter?.web?.remunerations[this.selectedIndex]?.reputationLevel?.color : '',
            },
          },
        ],
      },
      physical: {
        active: this.loyaltySettings?.onsiteConverter?.physical?.active || '',
        remunerations: [
          {
            qualitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.qualitative?.amount)?.toFixed(0)
                  : '',
            },
            quantitative: {
              amount:
                this.selectedIndex > -1
                  ? +(+this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.quantitative?.amount)?.toFixed(0)
                  : '',
              wallet:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.quantitative?.wallet
                  : undefined,
            },
            reputationLevel: {
              id: this.reputations[index]?.id || '',
              reputationLevel:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.reputationLevel
                  : '',

              levelInterval:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.max -
                    this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.levelInterval.min
                  : '',
              color:
                this.selectedIndex > -1
                  ? this.loyaltySettings?.onsiteConverter?.physical?.remunerations[this.selectedIndex]?.reputationLevel?.color
                  : '',
            },
          },
        ],
      },
    });
    this.initialValues = this.loyaltyForm.value;
    this.isConverterWebButtonDisabled = true;
    this.isConverterPhysicalButtonDisabled = true;
    this.isConverterMobileButtonDisabled = true;
    this.changeDetectorRef.markForCheck();
  }

  getFistLevel(color, reputationLevel) {
    this.selectedPrelevel = true;
    this.remunerationIndex = 0;
    this.selectedReputationLevel = reputationLevel;
    this.selectedReputationColor = color;
  }

  savePrelevel() {
    this.isPreLevelButtonDisabled = true;
    const perks = {
      ...FormHelper.getDifference(this.initialValues.prelevel.perks, this.loyaltyForm.get('prelevel').value.perks),
    };
    const input: any = {
      id: this.loyaltySettings.id,
      prelevel: {
        ...FormHelper.getDifference(
          omit(this.initialValues.prelevel, 'picture', 'perks', 'cardPicture', 'onsiteConverter'),
          omit(this.loyaltyForm.get('prelevel').value, 'picture', 'perks', 'cardPicture', 'onsiteConverter'),
        ),
        ...(isEqual(this.initialValues?.prelevel?.picture, this.loyaltyForm.get('prelevel').value.picture)
          ? {}
          : {
              picture: this.loyaltyForm.get('prelevel').value.picture,
            }),
        ...(keys(perks)?.length ? { perks } : {}),
      },
    };
    this.loyaltyService
      .updateLoyaltySettings(input)
      .pipe(
        catchError((error) => {
          this.modalService.dismissAll();
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.modalService.dismissAll();
        this.changeDetectorRef.markForCheck();
      });
  }

  onChange(event) {
    this.loyaltyForm.get(['subscribers', 'verification']).patchValue(event);
    this.loyaltyService
      .updateLoyaltySettings({
        id: this.loyaltySettings.id,
        subscribers: this.loyaltyForm.get('subscribers').value,
      })
      .pipe(
        catchError((error) => {
          this.modalError();
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe(() => {
        this.position();
        this.changeDetectorRef.markForCheck();
      });
  }

  onEventLog(field: string, data: any): void {
    if (data?.color && field === 'reputation') {
      this.reputationsForm.get('color').patchValue(data?.color);
    }
    if (data?.color && field === 'prelevel') {
      this.loyaltyForm.get(['prelevel', 'color']).patchValue(data?.color);
    }
  }

  onTabChange() {
    this.isConverterButtonDisabled = true;
    this.selectedPrelevel = true;
    this.selectedRepLevel = null;
  }

  getPrelevel() {
    this.selectedPrelevel = true;
    this.selectedRepLevel = null;
    this.selectedReputationLevel = null;
  }

  upload(uploadField: string): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    let input: any;
    fileInput.onchange = async () => {
      const file = fileInput.files[0];
      this.loadingQuantitativePic = uploadField === 'quantitative' ? true : false;
      this.loadingQualitativePic = uploadField === 'qualitative' ? true : false;
      this.isLoading = uploadField === 'level' ? true : false;
      this.loadingPrelevel = uploadField === 'prelevel' ? true : false;
      this.changeDetectorRef.markForCheck();
      const posId = this.storageHelper.getData('posId');
      const timestamp = Date.now();
      const fileName = `${posId}_${timestamp}_${file.name}`;
      this.generateS3SignedUrlGQL
        .fetch({
          fileName,
          fileType: file.type,
        })
        .subscribe(async (res) => {
          const picture = await this.amazonS3Helper.uploadS3AwsWithSignature(
            res.data.generateS3SignedUrl.message,
            file,
            fileName,
            AWS_CREDENTIALS.storage,
            AWS_CREDENTIALS.region,
          );
          this.loadingQuantitativePic = false;
          this.loadingQualitativePic = false;
          this.isLoading = false;
          this.loadingPrelevel = false;
          if (uploadField === 'qualitative') {
            this.loyaltyForm.get(uploadField).patchValue({
              picture: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
            input = {
              id: this.loyaltySettings.id,
              qualitative: omit(this.loyaltyForm.value.qualitative, 'active'),
            };
            this.updateLoyaltySettings(input);
          } else if (uploadField === 'quantitative') {
            this.loyaltyForm.get(uploadField).patchValue({
              picture: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
            input = {
              id: this.loyaltySettings.id,
              quantitative: omit(this.loyaltyForm.value.quantitative, 'active'),
            };
            this.updateLoyaltySettings(input);
          } else if (uploadField === 'level') {
            this.reputationsForm.patchValue({
              picture: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
          } else if (uploadField === 'prelevel') {
            this.loyaltyForm.get('prelevel').patchValue({
              picture: {
                path: picture.path,
                baseUrl: picture.baseUrl,
              },
            });
          }
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  onChangeStatus(enable: boolean) {
    this.updateLoyaltySettings({
      id: this.loyaltySettings.id,
      referral: { enable },
    });
  }

  update(event: any, fieldTarget: string, parent?: string) {
    let input: any;
    if (parent === 'loyaltyCard') {
      this.loyaltyForm.get('loyaltyCard').get(fieldTarget).patchValue(event);
      input = {
        id: this.loyaltySettings.id,
        loyaltyCard: {
          ...(this.loyaltyForm.get(['loyaltyCard', 'digital']).value === this.initialValues.loyaltyCard?.digital ? {} : { digital: event }),
          ...(this.loyaltyForm.get(['loyaltyCard', 'physical']).value === this.initialValues?.loyaltyCard?.physical ? {} : { physical: event }),
        },
      };
    } else if (fieldTarget === 'quantitative') {
      this.loyaltyForm.get(['quantitative', 'active']).patchValue(event);
      input = {
        id: this.loyaltySettings.id,
        quantitative: {
          ...(this.loyaltyForm.get(['quantitative', 'active']).value === this.initialValues?.quantitative?.active
            ? {}
            : { active: this.loyaltyForm.get(['quantitative', 'active']).value }),
        },
      };
    } else if (fieldTarget === 'qualitative') {
      this.loyaltyForm.get(['qualitative', 'active']).patchValue(event);
      input = {
        id: this.loyaltySettings.id,
        qualitative: {
          ...(this.loyaltyForm.get(['qualitative', 'active']).value === this.initialValues?.qualitative?.active
            ? {}
            : { active: this.loyaltyForm.get(['qualitative', 'active']).value }),
        },
      };
    } else if (parent === 'leaderboard') {
      this.loyaltyForm.get('leaderboard').get(fieldTarget).patchValue(event);
      input = {
        id: this.loyaltySettings.id,
        leaderboard: {
          ...(this.loyaltyForm.get(['leaderboard', 'active']).value === this.initialValues.leaderboard?.active ? {} : { active: event }),
          ...(this.loyaltyForm.get(['leaderboard', 'overall']).value === this.initialValues?.leaderboard?.overall ? {} : { overall: event }),
          ...(this.loyaltyForm.get(['leaderboard', 'monthly']).value === this.initialValues?.leaderboard?.monthly ? {} : { monthly: event }),
          ...(this.loyaltyForm.get(['leaderboard', 'weekly']).value === this.initialValues?.leaderboard?.weekly ? {} : { weekly: event }),
          ...(this.loyaltyForm.get(['leaderboard', 'daily']).value === this.initialValues?.leaderboard?.daily ? {} : { daily: event }),
          ...(this.loyaltyForm.get(['leaderboard', 'blur']).value === this.initialValues?.leaderboard?.blur ? {} : { blur: event }),
        },
      };
    } else if (parent === 'onsiteConverter') {
      this.loyaltyForm.get('onsiteConverter').get(fieldTarget).patchValue(event);
      input = {
        id: this.loyaltySettings.id,
        onsiteConverter: {
          ...(this.loyaltyForm.get(['onsiteConverter', 'active']).value === this.initialValues.onsiteConverter?.active ? {} : { active: event }),
        },
      };
    }
    this.updateLoyaltySettings(input);
  }

  updateLoyaltySettings(input: any) {
    this.loyaltyService
      .updateLoyaltySettings(input)
      .pipe(
        catchError((error) => {
          this.modalError();
          this.loadingCardPrelevel = false;
          this.loadingCardlevel = false;
          this.changeDetectorRef.markForCheck();
          return throwError(() => new Error(error));
        }),
      )
      .subscribe((res) => {
        if (res) {
          this.position();
          this.modalService.dismissAll();
          this.loadingCardPrelevel = false;
          this.loadingCardlevel = false;
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  position() {
    this.translate.get('MENUITEMS.TS.WORK_SAVED').subscribe((workSaved: string) => {
      Swal.fire({
        position: 'top-end',
        icon: 'success',
        title: workSaved,
        showConfirmButton: false,
        timer: 1500,
      });
    });
  }

  modalError(text?: string) {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: text ? text : sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  ngOnDestroy(): void {
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = null;
    this.questTypeService.parnterPageIndex = 0;
    this.questTypeService.targetsByPartner$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
