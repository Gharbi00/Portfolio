import { OnInit, Component, OnDestroy, ChangeDetectorRef, ViewEncapsulation, ChangeDetectionStrategy } from '@angular/core';

import { RequestsService } from '../requests.service';
import { RequestType } from '@sifca-monorepo/terminal-generator';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SharedService } from '../../../../shared/services/shared.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'requests-details',
  templateUrl: './details.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RequestDetailsComponent implements OnInit, OnDestroy {
  private unsubscribeAll: Subject<any> = new Subject<any>();
  requestForm: FormGroup;
  request: RequestType;
  breadCrumbItems!: Array<{}>;
  navigating$: Observable<boolean> = this.sharedService.navigating$;
  get primaryColor(): string {
    return this.sharedService.primaryColor;
  }

  get secondaryColor(): string {
    return this.sharedService.secondaryColor;
  }

  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private sharedService: SharedService,
    private requestsService: RequestsService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.translate.get('MENUITEMS.TS.WEBSITE').subscribe((website: string) => {
      this.translate.get('MENUITEMS.TS.GALLERY').subscribe((gallery: string) => {
        this.breadCrumbItems = [{ label: website }, { label: gallery, active: true }];
      });
    });
    this.requestsService.request$.pipe(takeUntil(this.unsubscribeAll)).subscribe((request: RequestType) => {
      this.request = request;
      this.requestForm = this.formBuilder.group({
        type: [request?.type || ''],
        status: [request?.status || ''],
        requestor: this.formBuilder.group({
          firstName: [request?.requestor?.firstName || ''],
          lastName: [request?.requestor?.lastName || ''],
          email: [request?.requestor?.email || ''],
          address: this.formBuilder.group({
            address: [request?.requestor?.address?.address || ''],
            postCode: [request?.requestor?.address?.postCode || ''],
            city: [request?.requestor.address?.city || ''],
            country: [request?.requestor.address?.country?.name || ''],
          }),
          phone: this.formBuilder.group({
            number: [request?.requestor?.phone?.number || ''],
            countryCode: [request?.requestor?.phone?.countryCode || ''],
          }),
        }),
        request: this.formBuilder.group({
          subject: [request?.request?.subject || ''],
          content: [request?.request?.content || ''],
        }),
      });
      this.changeDetectorRef.markForCheck();
    });
  }

  close(): void {
    this.router.navigate(['..'], { relativeTo: this.activatedRoute });
  }

  ngOnDestroy() {
    this.request = null;
    this.requestsService.request$ = null;
    this.unsubscribeAll.next(true);
    this.unsubscribeAll.complete();
  }
}
