import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'newsletter',
  templateUrl: './newsletter.component.html',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewsLetterComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
