import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VehiculeContractsComponent } from './contracts.component';

describe('VehiculeContractsComponent', () => {
  let component: VehiculeContractsComponent;
  let fixture: ComponentFixture<VehiculeContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ VehiculeContractsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(VehiculeContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
