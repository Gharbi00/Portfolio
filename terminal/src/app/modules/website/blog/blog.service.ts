import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, map as rxMap } from 'rxjs';
import {
  BlogGQL,
  BlogType,
  BlogInput,
  UpdateBlogInput,
  VisibilityStatusEnum,
  CreateBlogGQL,
  UpdateBlogGQL,
  DeleteBlogGQL,
  PublishBlogGQL,
  FindBlogsByTargetPaginatedGQL,
} from '@sifca-monorepo/terminal-generator';
import { IPagination } from '@diktup/frontend/models';
import { StorageHelper } from '@diktup/frontend/helpers';

@Injectable({
  providedIn: 'root',
})
export class BlogService {
  private blog: BehaviorSubject<BlogType> = new BehaviorSubject(null);
  private blogs: BehaviorSubject<BlogType[]> = new BehaviorSubject(null);
  private pagination: BehaviorSubject<IPagination> = new BehaviorSubject(null);

  pageIndex = 0;
  filterLimit = 10;
  searchString = '';
  status: VisibilityStatusEnum[] = [];

  get pagination$(): Observable<IPagination> {
    return this.pagination.asObservable();
  }
  get blog$(): Observable<BlogType> {
    return this.blog.asObservable();
  }
  set blog$(value: any) {
    this.blog.next(value);
  }
  get blogs$(): Observable<BlogType[]> {
    return this.blogs.asObservable();
  }

  constructor(
    private blogGQL: BlogGQL,
    private storageHelper: StorageHelper,
    private createBlogGQL: CreateBlogGQL,
    private updateBlogGQL: UpdateBlogGQL,
    private deleteBlogGQL: DeleteBlogGQL,
    private publishBlogGQL: PublishBlogGQL,
    private findBlogsByTargetPaginatedGQL: FindBlogsByTargetPaginatedGQL,
  ) {}

  blogById(id: string): Observable<BlogType> {
    return this.blogGQL.fetch({ id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.blog.next(response.data.blog);
          return response.data.blog;
        }
      }),
    );
  }

  findBlogsByTargetPaginated(): Observable<BlogType[]> {
    return this.findBlogsByTargetPaginatedGQL
      .fetch({
        ...(this.status?.length ? { status: this.status } : {}),
        pagination: { page: this.pageIndex, limit: this.filterLimit },
        searchString: this.searchString,
        target: { pos: this.storageHelper.getData('posId') },
      })
      .pipe(
        rxMap(({ data }: any) => {
          if (data) {
            this.pagination.next({
              page: this.pageIndex,
              size: this.filterLimit,
              length: data.findBlogsByTargetPaginated?.count,
            });
            this.blogs.next(data.findBlogsByTargetPaginated.objects);
            return data.findBlogsByTargetPaginated.objects;
          }
        }),
      );
  }

  createBlog(input: BlogInput): Observable<BlogType[]> {
    return this.createBlogGQL.mutate({ input: { ...input, target: { pos: this.storageHelper.getData('posId') } } }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          return data.createBlog;
        }
      }),
    );
  }

  updateBlog(id: string, input: UpdateBlogInput): Observable<BlogType> {
    return this.updateBlogGQL.mutate({ id, input }).pipe(
      rxMap(({ data }: any) => {
        if (data) {
          this.blog.next(data.updateBlog);
          return data.updateBlog;
        }
      }),
    );
  }

  /**
   * updateSectionsBlog
   */
  updateSectionsBlog(id: string, input: UpdateBlogInput): Observable<BlogType> {
    return this.updateBlogGQL.mutate({ id, input }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          this.blog.next(response.data.updateBlog);
          return response.data.updateBlog;
        }
      }),
    );
  }

  /**
   * publish Blog
   */
  publishBlog(id: string): Observable<BlogType[]> {
    return this.publishBlogGQL.mutate({ id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          const blogs = this.blogs.value;
          const index = blogs.findIndex((b) => b.id === id);
          blogs[index] = response.data.publishBlog;
          this.blogs.next(blogs);
          return blogs;
        }
      }),
    );
  }
  /**
   * delete Blog
   */
  deleteBlog(id: string): Observable<BlogType[]> {
    return this.deleteBlogGQL.mutate({ id }).pipe(
      rxMap((response: any) => {
        if (response.data) {
          const blogs = this.blogs.value;
          const index = blogs.findIndex((b) => b.id === id);
          blogs[index] = response.data.deleteBlog;
          this.blogs.next(blogs);
          return blogs;
        }
      }),
    );
  }
}
