import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'sifca-monorepo-settings',
  templateUrl: './hr-settings.component.html',
  styleUrls: ['./hr-settings.component.scss'],
})

/**
 * Profile Settings Component
 */
export class HRSettingsComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}

  /**
   * Multiple Default Select2
   */
  selectValue = ['Illustrator', 'Photoshop', 'CSS', 'HTML', 'Javascript', 'Python', 'PHP'];
}
