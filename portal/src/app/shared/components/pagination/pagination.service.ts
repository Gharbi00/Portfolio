import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PaginationService {
  actualPage: number;
  blogs = [];
  constructor() {}
}
