import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'sifca-monorepo-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss'],
})

/**
 * Sitemap Component
 */
export class SitemapComponent implements OnInit {
  // bread crumb items
  breadCrumbItems!: Array<{}>;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    /**
     * BreadCrumb
     */
    this.translate.get('MENUITEMS.TS.HOME').subscribe((home: string) => {
      this.translate.get('MENUITEMS.TS.SITEMAP').subscribe((sitemap: string) => {
        this.breadCrumbItems = [{ label: home }, { label: sitemap, active: true }];
      });
    });
  }
}
