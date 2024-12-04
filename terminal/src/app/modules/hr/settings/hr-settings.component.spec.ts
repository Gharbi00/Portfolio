import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HRSettingsComponent } from './hr-settings.component';

describe('HRSettingsComponent', () => {
  let component: HRSettingsComponent;
  let fixture: ComponentFixture<HRSettingsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ HRSettingsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HRSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
