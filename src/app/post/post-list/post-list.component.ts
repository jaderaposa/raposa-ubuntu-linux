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
    this.postsSub = this.postsService.getPostUpdateListener()
      .subscribe((posts: Post[]) => {
        this.posts = posts;
      });
 }

 ngOnDestroy(): void {
    this.postsSub.unsubscribe();
 }

 // Add the deletePost method here
 deletePost(id: string): void {
    this.postsService.deletePost(id).subscribe(
      response => {
        console.log(response);
        // Optionally, remove the post from the local array
        this.posts = this.posts.filter(post => post.id !== id);
      },
      error => {
        console.error('Error deleting post', error);
      }
    );
 }
}