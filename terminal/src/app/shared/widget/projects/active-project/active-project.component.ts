import { Component, Input } from '@angular/core';
import { ProjectType } from '@sifca-monorepo/terminal-generator';

@Component({
  selector: 'app-active-project',
  templateUrl: './active-project.component.html',
  styleUrls: ['./active-project.component.scss'],
})

/**
 * Active Project Component
 */
export class ActiveProjectComponent {
  // Upcoming Activities
  @Input() activeProjects: ProjectType[];
}
