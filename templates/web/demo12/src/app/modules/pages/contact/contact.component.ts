import { Component, ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, Inject, PLATFORM_ID } from '@angular/core';

import { Meta, Title } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';

import { AppService, BaseContactComponent, LandingPagesService, PosService, SeoService, SharedService } from '@sifca-monorepo/clients';
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ContactPageComponent extends BaseContactComponent {
  
  constructor(
    protected override renderer: Renderer2,
    protected override metaTagService: Meta,
    protected override appService: AppService,
    protected override seoService: SeoService,
    protected override titleTagService: Title,
    protected override posService: PosService,
    protected override formBuilder: FormBuilder,
    protected override sharedService: SharedService,
    protected override toastrService: ToastrService,
    protected override changeDetectorRef: ChangeDetectorRef,
    protected override landingPagesService: LandingPagesService,
    @Inject(DOCUMENT) protected override document: Document,
    @Inject(PLATFORM_ID) protected override platformId: Object,
  ) {
    super(
      renderer,
      metaTagService,
      appService,
      seoService,
      titleTagService,
      posService,
      formBuilder,
      sharedService,
      toastrService,
      changeDetectorRef,
      landingPagesService,
      document,
      platformId,
    );
  }}
