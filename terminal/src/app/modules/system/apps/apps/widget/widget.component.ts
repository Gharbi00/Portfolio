import Swal from 'sweetalert2';
import { DOCUMENT, Location } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { every, find, findIndex, isEqual, map, some, values } from 'lodash';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Inject, OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';
import { Observable, Subject, catchError, of, takeUntil, combineLatest, take, switchMap, debounceTime, distinctUntilChanged } from 'rxjs';

import { AmazonS3Helper, StorageHelper } from '@diktup/frontend/helpers';
import {
  PictureType,
  LanguageType,
  WidgetVisualsType,
  TranslationAppEnum,
  LoyaltySettingsType,
  WidgetIntegrationType,
  StaticTranslationType,
  GenerateS3SignedUrlGQL,
  WidgetIntegrationMultilanguageLanguageType,
  PositionEnum,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { PluginType, WidgetIntegrationActionsType } from '@sifca-monorepo/terminal-generator';
import {
  WalletType,
  PredefinedType,
  WalletTypeEnum,
  LandingPageTypeEnum,
  ActivityTypeWithActiveStatusType,
} from '@sifca-monorepo/terminal-generator';

import { WidgetService } from './widget.service';
import { IntegrationAppsService } from '../../apps.service';
import { LoyaltyService } from '../loyalty/loyalty.service';
import { SharedService } from '../../../../../shared/services/shared.service';
import { AWS_CREDENTIALS } from '../../../../../../environments/environment';
import { PosService } from '../../../../../core/services/pos.service';
import { FormHelper } from '@sifca-monorepo/clients';

@Component({
  selector: 'widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();

  page = 0;
  staticPage = 0;
  visualsPage = 0;
  ipAddress: string;
  initialValues: any;
  isChecked: boolean;
  selectedType: string;
  pageChanged: boolean;
  widgetForm: FormGroup;
  actionForm: FormGroup;
  staticForm: FormGroup;
  initStaticValues: any;
  isButtonDisabled = true;
  pagination: IPagination;
  selectedTranslation: any;
  selectedStaticApp = 'web';
  isAddTranslation: boolean;
  isReferenceExist: boolean;
  selectedVisualsApp = 'web';
  selectedCheckIndex: number;
  visualsPageChanged: boolean;
  isTestButtonDisabled = true;
  isLoginButtonDisabled = true;
  isThemeButtonDisabled = true;
  checkedValues: boolean[] = [];
  widget: WidgetIntegrationType;
  isActionButtonDisabled = true;
  isStaticButtonDisabled = true;
  initialActivityTypeValues: any;
  visualsPagination: IPagination;
  wallets = values(WalletTypeEnum);
  contentLanguages: LanguageType[];
  positions = values(PositionEnum);
  pages = values(LandingPageTypeEnum);
  selectedContentLanguage: LanguageType;
  selctedTranslation: StaticTranslationType;
  selectedActivity: WidgetIntegrationActionsType;
  selectedStaticTranslation: StaticTranslationType;
  selectedActivityType: ActivityTypeWithActiveStatusType;
  selectedLanguage: WidgetIntegrationMultilanguageLanguageType;
  wallet$: Observable<WalletType[]> = this.loyaltyService.wallet$;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  plugin$: Observable<PluginType> = this.integrationAppsService.plugin$;
  searchForm: FormGroup = this.formBuilder.group({ searchString: [''] });
  predefined$: Observable<PredefinedType[]> = this.widgetService.predefined$;
  languages$: Observable<LanguageType[]> = this.posService?.infiniteLanguages$;
  isLastPredefined$: Observable<boolean> = this.widgetService.isLastPredefined$;
  widgetVisuals$: Observable<WidgetVisualsType[]> = this.widgetService.widgetVisuals$;
  loyaltySettings$: Observable<LoyaltySettingsType> = this.loyaltyService.loyaltySettings$;
  loadingStaticTranslations$: Observable<boolean> = this.widgetService.loadingStaticTranslations$;
  loadingVisualsTranslations$: Observable<boolean> = this.widgetService.loadingVisualsTranslations$;
  staticTranslations$: Observable<StaticTranslationType[]> = this.widgetService.staticTranslations$;

  validateAndAddIp = (ip: string) => {
    const ipv4Pattern =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/;
    if (ipv4Pattern.test(ip) || ipv6Pattern.test(ip)) {
      return ip;
    } else {
      this.translate.get('COMMON.ENTER_VALID_IP_ADDRESS').subscribe((sthWentWrong: string) => {
        Swal.fire({
          title: 'Oops...',
          text: sthWentWrong,
          icon: 'warning',
          showCancelButton: false,
          confirmButtonColor: 'rgb(3, 142, 220)',
          cancelButtonColor: 'rgb(243, 78, 78)',
        });
      });
      return null;
    }
  };
  isPositionButtonDisabled = true;

  get remuneration(): FormArray {
    return this.actionForm.get('remuneration') as FormArray;
  }
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  get languages(): FormArray {
    return this.widgetForm?.get(['multilanguage', 'languages']) as FormArray;
  }

  get translation() {
    return this.staticForm.get('translation');
  }

  constructor(
    private location: Location,
    private modalService: NgbModal,
    private posService: PosService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private widgetService: WidgetService,
    private sharedService: SharedService,
    private storageHelper: StorageHelper,
    private loyaltyService: LoyaltyService,
    private amazonS3Helper: AmazonS3Helper,
    private changeDetectorRef: ChangeDetectorRef,
    private integrationAppsService: IntegrationAppsService,
    private generateS3SignedUrlGQL: GenerateS3SignedUrlGQL,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.integrationAppsService.findPluginByURL(this.location.path()).subscribe();
  }

  ngOnInit(): void {
    this.loyaltyService.walletPageIndex = 0;
    this.loyaltyService.wallet$ = [];
    this.searchForm.valueChanges
      .pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((searchValues) => {
          this.widgetService.searchString = searchValues.searchString;
          return this.widgetService.getStaticTranslationsByTargetAndLanguagePaginated(
            this.selectedContentLanguage?.id,
            this.selectedStaticApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE,
          );
        }),
      )
      .subscribe(() => {
        this.changeDetectorRef.markForCheck();
      });
    this.widgetService.getPublicIp().subscribe((data: any) => {
      this.ipAddress = data.ip;
    });
    this.widgetService.widget$.pipe(takeUntil(this.unsubscribeAll)).subscribe((widget: WidgetIntegrationType) => {
      this.widget = widget;
      this.contentLanguages = (widget?.multilanguage?.languages || []).map((lang) => lang.language);
      this.selectedContentLanguage = this.contentLanguages?.[0];
      this.selectedType = widget?.icon ? 'icon' : 'picture';
      this.widgetForm = this.formBuilder.group({
        multilanguage: this.formBuilder.group({
          active: [this.widget?.multilanguage?.active || false],
          languages: this.formBuilder.array(
            this?.widget?.multilanguage?.languages?.length
              ? map(this?.widget?.multilanguage?.languages, (lng) => {
                  return this.formBuilder.group({
                    default: [lng?.default || false],
                    language: [lng?.language],
                  });
                })
              : [
                  this.formBuilder.group({
                    default: [false],
                    language: [undefined],
                  }),
                ],
          ),
        }),
        login: this.formBuilder.group({
          url: [widget?.login?.url || ''],
        }),
        icon: [widget?.icon || ''],
        theme: [widget?.theme || ''],
        picture: this.formBuilder.group({
          baseUrl: [widget?.picture?.baseUrl || ''],
          path: [widget?.picture?.path || ''],
        }),
        content: this.formBuilder.group({
          pages: [widget?.content?.pages || []],
        }),
        test: this.formBuilder.group({
          ips: [widget?.test?.ips?.length ? widget?.test?.ips : []],
        }),
        position: this.formBuilder.group({
          alignment: [widget?.position?.alignment || undefined],
          positioning: [widget?.position?.positioning],
        }),
      });
      this.initialValues = this.widgetForm.value;
      this.widgetForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((ivalues) => {
        this.isButtonDisabled = isEqual(ivalues, this.initialValues);
      });
      this.widgetForm.get('test').valueChanges.subscribe((values) => {
        this.isTestButtonDisabled = isEqual(this.initialValues.test, values);
      });
      this.widgetForm.get('position').valueChanges.subscribe((values) => {
        this.isPositionButtonDisabled = isEqual(this.initialValues.position, values);
      });
      this.widgetForm.get('login').valueChanges.subscribe((values) => {
        this.isLoginButtonDisabled = isEqual(this.initialValues.login, values);
      });
      this.widgetForm.get('theme').valueChanges.subscribe((values) => {
        this.isThemeButtonDisabled = isEqual(this.initialValues.theme, values);
      });
      this.staticForm = this.formBuilder.group({
        reference: [''],
        translation: this.formBuilder.group({
          language: [widget?.multilanguage.languages?.[0]?.language],
        }),
      });
      this.changeDetectorRef.markForCheck();
    });
    this.widgetService.selectedStaticApp$.pipe(takeUntil(this.unsubscribeAll)).subscribe((app) => {
      this.selectedStaticApp = app;
      this.changeDetectorRef.markForCheck();
    });
    this.widgetService.selectedVisualsApp$.pipe(takeUntil(this.unsubscribeAll)).subscribe((app) => {
      this.selectedVisualsApp = app;
      this.changeDetectorRef.markForCheck();
    });
    if (this.contentLanguages?.length) {
      this.checkStaticInit(TranslationAppEnum.WIDGET_WEB);
    }
    this.checkVisualsInit(TranslationAppEnum.WIDGET_WEB);
    this.widgetService.pagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.pagination = {
        length: pagination?.length,
        page: this.widgetService.staticPageIndex ? this.widgetService.staticPageIndex + 1 : 1,
        size: this.widgetService.pageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.widgetService.staticPageIndex || 0) * this.widgetService.pageLimit,
        endIndex: Math.min(((this.widgetService.staticPageIndex || 0) + 1) * this.widgetService.pageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
    this.widgetService.visualsPagination$.pipe(takeUntil(this.unsubscribeAll)).subscribe((pagination: IPagination) => {
      this.visualsPagination = {
        length: pagination?.length,
        page: this.widgetService.visualsPageIndex ? this.widgetService.visualsPageIndex + 1 : 1,
        size: this.widgetService.visualsPageLimit,
        lastPage: pagination?.length - 1,
        startIndex: (this.widgetService.visualsPageIndex || 0) * this.widgetService.visualsPageLimit,
        endIndex: Math.min(((this.widgetService.visualsPageIndex || 0) + 1) * this.widgetService.visualsPageLimit - 1, pagination?.length - 1),
      };
      this.changeDetectorRef.markForCheck();
    });
  }

  ngAfterViewInit() {
    combineLatest([
      this.loyaltyService.quantitativeWalletsByOwnerPagination(),
      this.loyaltyService.findLoyaltySettingsByTarget(),
      this.widgetService.getPredefinedPaginated(),
      this.posService.findlanguagesPagination(),
    ]).subscribe();
  }

  onChangeTest(active: boolean) {
    this.updateWidgetIntegration({ test: { active } });
  }

  ipAddressValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const ipv4Pattern =
        /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
      const ipv6Pattern = /^([0-9a-fA-F]{1,4}:){7}([0-9a-fA-F]{1,4}|:)$/;
      const isValid = ipv4Pattern.test(control.value) || ipv6Pattern.test(control.value);
      return isValid ? null : { invalidIpAddress: true }; // Return null for valid IP, error object otherwise
    };
  }

  getIpAddress() {
    const ipsControl = this.widgetForm.get(['test', 'ips']);
    const currentIps = ipsControl.value || [];
    if (!currentIps.includes(this.ipAddress)) {
      ipsControl.patchValue([...currentIps, this.ipAddress]);
    }
  }

  resetWidgetVisual(visual: WidgetVisualsType) {
    this.widgetService
      .resetWidgetVisual(this.selectedVisualsApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE, visual?.reference)
      .subscribe();
  }

  downloadImage(picture: PictureType) {
    const url = `${picture?.baseUrl}/${picture?.path}`;
    window.open(url, '_blank');
  }

  uplaodWidgetVisual(id: string) {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    let input: any;
    fileInput.onchange = async () => {
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
          input = {
            picture: {
              path: picture.path,
              baseUrl: picture.baseUrl,
            },
          };
          this.widgetService
            .updateWidgetVisuals(input, id)
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
                this.position();
                this.changeDetectorRef.markForCheck();
              }
            });
        });
    };
    fileInput.click();
  }

  onTabChange(tab: number) {
    this.widgetService.selectedStaticApp$ = 'web';
    if (tab === 6 && !this.selectedContentLanguage) {
      this.checkStaticInit(TranslationAppEnum.WIDGET_WEB);
    }
  }

  onPageChange(page: number) {
    this.staticPage = page;
    if (this.staticPage > 1) {
      this.pageChanged = true;
    }
    this.widgetService.staticPageIndex = page - 1;
    if (this.pageChanged) {
      this.checkStaticInit(this.selectedStaticApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE);
    }
  }

  refreshStaticTranslation() {
    this.widgetService.staticPageIndex = 0;
    this.staticPage = 0;
    this.widgetService
      .refreshStaticTranslations(
        this.selectedStaticApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE,
        this.selectedContentLanguage?.id,
      )
      .subscribe();
  }

  refreshWidgetVisuals() {
    this.widgetService.visualsPageIndex = 0;
    this.page = 0;
    this.widgetService
      .refreshWidgetVisuals(this.selectedVisualsApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE)
      .subscribe();
  }

  onVisualsPageChange(page: number) {
    this.visualsPage = page;
    if (this.visualsPage > 1) {
      this.visualsPageChanged = true;
    }
    this.widgetService.visualsPageIndex = page - 1;
    if (this.visualsPageChanged) {
      this.checkVisualsInit(this.selectedVisualsApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE);
    }
  }

  checkStaticInit(app: TranslationAppEnum) {
    this.widgetService
      .getStaticTranslationsByTargetAndLanguagePaginated(this.selectedContentLanguage?.id, app)
      .pipe(
        switchMap((statics) => {
          if (!statics?.length) {
            return this.widgetService.initStaticTranslations(app, this.selectedContentLanguage?.id);
          }
          return of(null);
        }),
        switchMap((result) => {
          if (result?.length) {
            return this.widgetService.getStaticTranslationsByTargetAndLanguagePaginated(this.selectedContentLanguage?.id, app);
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  checkVisualsInit(app: TranslationAppEnum) {
    this.widgetService
      .getWidgetVisualsByTargetAndAppPaginated(app)
      .pipe(
        switchMap((visuals) => {
          if (!visuals?.length) {
            return this.widgetService.initWidgetVisuals(app);
          }
          return of(null);
        }),
        switchMap((result) => {
          if (result) {
            return this.widgetService.getWidgetVisualsByTargetAndAppPaginated(app);
          }
          return of(null);
        }),
      )
      .subscribe();
  }

  resetTranslation(reference: string) {
    this.widgetService
      .resetStaticTranslation(
        this.selectedStaticApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE,
        reference,
        this.selectedContentLanguage?.id,
      )
      .subscribe();
  }

  onChangeStaticApp(field: string) {
    this.widgetService.staticPageIndex = 0;
    this.widgetService.selectedStaticApp$ = this.selectedStaticApp = field;
    if (field === 'web') {
      this.checkStaticInit(TranslationAppEnum.WIDGET_WEB);
    } else {
      this.checkStaticInit(TranslationAppEnum.WIDGET_MOBILE);
    }
  }

  onChangeVisualsApp(field: string) {
    this.selectedVisualsApp = field;
    if (field === 'web') {
      this.checkVisualsInit(TranslationAppEnum.WIDGET_WEB);
    } else {
      this.checkVisualsInit(TranslationAppEnum.WIDGET_MOBILE);
    }
  }

  saveStatic() {
    this.isButtonDisabled = true;
    // let translation: any;
    let translations = this.selectedStaticTranslation?.translation;
    const index = findIndex(this.selectedStaticTranslation?.translation, (trs) => trs?.language?.id === this.selectedContentLanguage?.id);
    if (index > -1 && this.isAddTranslation === false) {
      translations.splice(index, 1);
    }
    // translation = [
    //   ...map(translations, (trans) => {
    //     return {
    //       ...omit(trans, 'language', 'contentId'),
    //       _id: trans?._id,
    //       language: trans?.language?.id,
    //       content: trans?.content,
    //     };
    //   }),
    //   {
    //     ...omit(this.translation.value, 'language', 'id', 'contentId'),
    //     ...(this.translation?.get('language').value?.name && this.translation?.get('language').value?.name !== 'Default'
    //       ? { language: this.translation.value?.language?.id }
    //       : {}),
    //     content: this.translation.value?.content,
    //   },
    // ];
    const updateInput = {
      id: this.selectedStaticTranslation?.id,
      ...(this.translation.value?.contentId ? { contentId: this.translation.value?.contentId } : {}),
      ...(this.translation?.get('language').value?.name ? { language: this.translation.value?.language?.id } : {}),
      content: this.translation.value?.content,
      ...(this.initStaticValues.reference === this.staticForm?.get('reference').value ? {} : { reference: this.staticForm?.get('reference').value }),
    };
    if (this.selectedStaticTranslation) {
      this.widgetService
        .updateStaticTranslation({ ...updateInput, id: this.selectedStaticTranslation?.id })
        .pipe(
          catchError(() => {
            this.modalService.dismissAll();
            this.modalError();
            this.changeDetectorRef.markForCheck();
            return of(null);
          }),
        )
        .subscribe((res: any) => {
          if (res) {
            this.modalService.dismissAll();
            this.position();
            this.changeDetectorRef.markForCheck();
          }
        });
    }
  }

  onChangeLanguage(language: LanguageType) {
    this.staticPage = 0;
    this.widgetService.staticPageIndex = 0;
    this.widgetService
      .getStaticTranslationsByTargetAndLanguagePaginated(
        language?.id,
        this.selectedStaticApp === 'web' ? TranslationAppEnum.WIDGET_WEB : TranslationAppEnum.WIDGET_MOBILE,
      )
      .subscribe(() => {
        this.selectedTranslation = find(this.selectedStaticTranslation?.translation, (trs) => trs?.language.id === language?.id);
        this.selectedContentLanguage = language;
        this.staticForm = this.formBuilder.group({
          reference: [this.selectedStaticTranslation?.reference || ''],
          translation: this.formBuilder.group({
            language: [language],
            content: [this.selectedTranslation?.content || ''],
          }),
        });
        this.isStaticButtonDisabled = true;
        this.changeDetectorRef.markForCheck();
      });
  }

  openStaticModal(content: any, staticTranslation: StaticTranslationType) {
    this.selectedStaticTranslation = staticTranslation;
    this.isAddTranslation = staticTranslation ? false : true;
    this.staticTranslations$
      .pipe(
        take(1),
        switchMap((translations) => {
          this.selctedTranslation = find(translations, (trans) =>
            some(trans.translation, (tr) => tr.language?.id === this.selectedContentLanguage?.id),
          );
          return of(translations);
        }),
      )
      .subscribe();
    const selctedTranslation = find(staticTranslation?.translation, (trs: any) => trs?.language?.id === this.selectedContentLanguage?.id);
    this.modalService.open(content, { centered: true });
    this.staticForm = this.formBuilder.group({
      reference: [staticTranslation?.reference || ''],
      translation: this.formBuilder.group({
        language: [this.selectedContentLanguage],
        content: [selctedTranslation?.content || ''],
        contentId: [selctedTranslation?._id || ''],
      }),
    });
    this.initStaticValues = this.staticForm.value;
    this.staticForm.valueChanges.pipe(takeUntil(this.unsubscribeAll)).subscribe((values) => {
      this.isStaticButtonDisabled = isEqual(values, this.initStaticValues);
    });
    this.staticForm
      .get('reference')
      .valueChanges.pipe(
        takeUntil(this.unsubscribeAll),
        debounceTime(500),
        distinctUntilChanged(),
        switchMap((reference) => {
          this.changeDetectorRef.markForCheck();
          return this.widgetService.targetHasStaticTranslationsReference(reference);
        }),
      )
      .subscribe((res) => {
        this.isReferenceExist = res;
        this.changeDetectorRef.markForCheck();
      });
  }

  openLanguageModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  saveLanguage() {
    const input: any = {
      multilanguage: {
        languages: [
          ...map(this.languages.value, (language) => {
            return {
              language: language?.language.id,
              default: language?.default,
            };
          }),
        ],
      },
    };
    this.modalService.dismissAll();
    this.updateWidgetIntegration(input);
  }

  onCheckStatus(languages: WidgetIntegrationMultilanguageLanguageType[]) {
    return every(languages, (language) => language?.default === false);
  }

  onChangeField(checked: boolean, index: number) {
    this.widget.multilanguage.languages[index].default = checked;
    const input: any = {
      multilanguage: {
        ...this.widget.multilanguage,
        languages: [
          ...map(this.widget.multilanguage.languages, (language) => {
            return {
              language: language?.language.id,
              default: language?.default,
            };
          }),
        ],
      },
    };
    this.updateWidgetIntegration(input);
  }

  onChangeStatus(checked: boolean) {
    const input: any = {
      multilanguage: {
        active: checked,
      },
    };
    this.updateWidgetIntegration(input);
  }

  removeLanguageField(index: number): void {
    this.languages.removeAt(index);
    this.changeDetectorRef.markForCheck();
  }

  addLanguageField(): void {
    const languageFormGroup = this.formBuilder.group({
      language: [undefined, Validators.required],
      default: [false],
    });
    (this.languages as FormArray).push(languageFormGroup);
    this.changeDetectorRef.markForCheck();
  }

  openDeleteModal(content: any, language: any) {
    this.selectedLanguage = language;
    this.modalService.open(content, { size: 'md', centered: true });
  }

  loadMoreLanguages() {
    this.posService.isLastLanguages$.pipe(take(1)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.posService.languagesPageIndex++;
        this.posService.findlanguagesPagination().subscribe();
      }
    });
  }

  deleteLanguage() {
    let languages: any[];
    languages = this.widget?.multilanguage?.languages.filter((item) => item?.language.id !== this.selectedLanguage?.language?.id);
    const input: any = {
      multilanguage: {
        languages: [
          ...map(languages, (language) => {
            return {
              language: language?.language.id,
              default: language?.default,
            };
          }),
        ],
      },
    };
    this.updateWidgetIntegration(input);
  }

  saveLogin() {
    this.isLoginButtonDisabled = true;
    this.updateWidgetIntegration({ login: this.widgetForm.get('login').value });
  }

  saveTheme() {
    this.isThemeButtonDisabled = true;
    this.updateWidgetIntegration({ theme: this.widgetForm.get('theme').value });
  }

  savePosition() {
    this.isPositionButtonDisabled = true;
    this.updateWidgetIntegration({ position: FormHelper.getDifference(this.initialValues.position, this.widgetForm.get('position').value) });
  }

  saveTest() {
    this.isTestButtonDisabled = true;
    this.updateWidgetIntegration({ test: this.widgetForm.get('test').value });
  }

  upload(): void {
    const fileInput = this.document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.name = 'fileUpload';
    fileInput.id = 'fileUpload';
    let input: any;
    fileInput.onchange = async () => {
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
          input = {
            ...(this.selectedType === 'picture'
              ? {
                  picture: {
                    path: picture.path,
                    baseUrl: picture.baseUrl,
                  },
                  icon: '',
                }
              : {}),
          };
          this.updateWidgetIntegration(input);
          this.changeDetectorRef.markForCheck();
        });
    };
    fileInput.click();
  }

  saveAction() {
    this.isActionButtonDisabled = true;
    let remuneration = this.remuneration.value.filter((rem) => rem.amount);
    remuneration = map(this.remuneration.value, (rem) => {
      return {
        ...rem,
        amount: rem?.amount.toString(),
        wallet: rem?.wallet?.id,
      };
    });
    const input: any = {
      ...(remuneration?.length ? { remuneration } : {}),
      ...(this.actionForm.get('recurrence').value.cycle >= 0 && this.actionForm.get('recurrence').value.cycle !== null
        ? {
            recurrence: this.actionForm.get('recurrence').value,
          }
        : {}),
      activity: this.selectedActivityType?.id,
    };
    this.activateWidgetIntegrationAction(input);
  }

  activateWidgetIntegrationAction(input) {
    this.widgetService
      .activateWidgetIntegrationAction(this.widget?.id, input)
      .pipe(
        catchError(() => {
          this.checkedValues[this.selectedCheckIndex] = false;
          this.modalError();
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

  loadMoreWallets() {
    this.loyaltyService.isLastWallet$.pipe(takeUntil(this.unsubscribeAll)).subscribe((isLast: boolean) => {
      if (!isLast) {
        this.loyaltyService.walletPageIndex++;
        this.loyaltyService.quantitativeWalletsByOwnerPagination().subscribe();
      }
    });
  }

  save() {
    this.isButtonDisabled = true;
    const input: any = {
      ...(this.selectedType === 'icon' && this.widgetForm.get('icon').value !== this.initialValues.icon
        ? {
            icon: this.widgetForm.get('icon').value,
            picture: { baseUrl: '', path: '' },
          }
        : {}),
      ...(isEqual(this.widgetForm.get(['content', 'pages'])?.value, this.initialValues?.content?.pages)
        ? {}
        : {
            content: this.widgetForm.get('content').value,
          }),
    };
    this.updateWidgetIntegration(input);
  }

  updateWidgetIntegration(input: any) {
    this.widgetService
      .updateWidgetIntegration(this.widget?.id, input)
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

  onChange(event: boolean, field: any) {
    const input: any = {
      ...(field === 'active' ? { active: event } : {}),
      ...(field === 'profile' ? { content: { profile: event } } : {}),
      ...(field === 'notification' ? { content: { notification: event } } : {}),
      ...(field === 'wallet' ? { content: { wallet: event } } : {}),
      ...(field === 'challenge' ? { content: { challenge: event } } : {}),
      ...(field === 'chat' ? { content: { chat: event } } : {}),
      ...(field === 'campaigns' ? { content: { campaigns: event } } : {}),
      ...(field === 'buttons' ? { content: { buttons: event } } : {}),
      ...(field === 'badges' ? { content: { badges: event } } : {}),
      ...(field === 'leaderboard' ? { content: { leaderboard: event } } : {}),
      ...(field === 'marketplace' ? { content: { marketplace: event } } : {}),
    };
    this.updateWidgetIntegration(input);
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

  modalError() {
    this.translate.get('MENUITEMS.TS.STH_WENT_WRONG').subscribe((sthWentWrong: string) => {
      Swal.fire({
        title: 'Oops...',
        text: sthWentWrong,
        icon: 'warning',
        showCancelButton: false,
        confirmButtonColor: 'rgb(3, 142, 220)',
        cancelButtonColor: 'rgb(243, 78, 78)',
      });
    });
  }

  ngOnDestroy(): void {
    this.widgetService.searchString = '';
    this.widgetService.activityTypes$ = null;
    this.loyaltyService.pageIndex = 0;
    this.loyaltyService.walletPageIndex = 0;
    this.widgetService.staticPageIndex = 0;
    this.widgetService.visualsPageIndex = 0;
    this.loyaltyService.wallet$ = null;
    this.widgetService.predefinedPageIndex = 0;
    this.widgetService.predefined$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
