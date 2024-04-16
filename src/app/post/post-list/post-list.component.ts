import { Component, OnDestroy, OnInit } from '@angular/core';
import { Post } from '../post.model';
import { PostsService } from '../post.service';
import { Subscription } from 'rxjs';

@Component({
 selector: 'app-post-list',
 templateUrl: './post-list.component.html',
 styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
 posts: Post[] = [];
 private postsSub!: Subscription;

 constructor(public postsService: PostsService) { }

  ngOnInit() {
    this.postsService.getPosts();
    this.postsSub = this.postsService.getPostsUpdatedListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
  }

  ngOnDestroy() {
    this.postsSub.unsubscribe();
  }

  onDeletePost(postId: string) {
    this.postsService.deletePost(postId);
  }
}