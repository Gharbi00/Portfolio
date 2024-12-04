import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { ProductVarietyEnum, ProductStatusEnum } from '@sifca-monorepo/terminal-generator';
import { BarcodesFilterInput, InternalProductFilterInput } from '@sifca-monorepo/terminal-generator';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private action: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private pageId: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private pageTitle: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private parentLink: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private searchString: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private hasFilter: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private listHeader: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);
  private dropDownAction: BehaviorSubject<string> = new BehaviorSubject<string>('');
  private variety: BehaviorSubject<ProductVarietyEnum> = new BehaviorSubject<ProductVarietyEnum>(null);
  private status: BehaviorSubject<ProductStatusEnum[]> = new BehaviorSubject<ProductStatusEnum[]>(null);
  private barcodesFilterInput: BehaviorSubject<BarcodesFilterInput> = new BehaviorSubject<BarcodesFilterInput>(null);
  private filter: BehaviorSubject<InternalProductFilterInput> = new BehaviorSubject<InternalProductFilterInput>(null);

  posId: string;

  get variety$(): Observable<ProductVarietyEnum> {
    return this.variety.asObservable();
  }
  set variety$(value: any) {
    this.variety.next(value);
  }
  set filter$(value: any) {
    this.filter.next(value);
  }
  get filter$(): Observable<InternalProductFilterInput> {
    return this.filter.asObservable();
  }
  set barcodesFilterInput$(value: any) {
    this.barcodesFilterInput.next(value);
  }
  get barcodesFilterInput$(): Observable<BarcodesFilterInput> {
    return this.barcodesFilterInput.asObservable();
  }
  get hasFilter$(): Observable<boolean> {
    return this.hasFilter.asObservable();
  }
  set hasFilter$(value: any) {
    this.hasFilter.next(value);
  }
  get pageTitle$(): Observable<string> {
    return this.pageTitle.asObservable();
  }
  set pageTitle$(value: any) {
    this.pageTitle.next(value);
  }
  get parentLink$(): Observable<string> {
    return this.parentLink.asObservable();
  }
  set parentLink$(value: any) {
    this.parentLink.next(value);
  }
  get pageId$(): Observable<string> {
    return this.pageId.asObservable();
  }
  set pageId$(value: any) {
    this.pageId.next(value);
  }
  get action$(): Observable<string> {
    return this.action.asObservable();
  }
  set action$(value: any) {
    this.action.next(value);
  }
  get dropDownAction$(): Observable<string> {
    return this.dropDownAction.asObservable();
  }
  set dropDownAction$(value: any) {
    this.dropDownAction.next(value);
  }
  get searchString$(): Observable<string> {
    return this.searchString.asObservable();
  }
  set searchString$(value: any) {
    this.searchString.next(value);
  }
  get status$(): Observable<ProductStatusEnum[]> {
    return this.status.asObservable();
  }
  set status$(value: any) {
    this.status.next(value);
  }
  get listHeader$(): Observable<string[]> {
    return this.listHeader.asObservable();
  }
  set listHeader$(value: any) {
    this.listHeader.next(value);
  }

  constructor(private storageHelper: StorageHelper) {
    this.posId = this.storageHelper.getData('posId');
  }
}
