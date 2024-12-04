import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'sifca-issue-notes',
  encapsulation: ViewEncapsulation.None,
  templateUrl: './issue-notes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IssueNotesComponent {}
