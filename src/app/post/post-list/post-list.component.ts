import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../post.service';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  private postsSub!: Subscription;
  totalPosts = 10; // You will need to update this with the actual total number of posts
  postsPerPage = 5; // This is the number of posts per page
  currentPage = 1;
  @ViewChild(MatPaginator) paginator: MatPaginator | null = null;

  constructor(public postsService: PostsService, private router: Router) { }

  ngOnInit() {
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
    this.postsSub = this.postsService.getPostsUpdatedListener()
      .subscribe((postData: { posts: Post[], postCount: number }) => {
        this.posts = postData.posts;
        this.totalPosts = postData.postCount;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDeletePost(postId: string) {
    this.postsService.deletePost(postId);
  }

  onEditPost(postId: string) {
    this.router.navigate(['/create', postId]);
  }

  onChangedPage(pageData: PageEvent) {
    this.postsPerPage = pageData.pageSize;
    this.currentPage = pageData.pageIndex + 1;
    this.postsService.getPosts(this.postsPerPage, this.currentPage);
  }
}