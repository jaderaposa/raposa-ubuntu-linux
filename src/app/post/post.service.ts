import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class PostsService {
  private apiUrl = "http://localhost:3000/api/posts"; // Adjusted URL to match the backend route
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) { }

  getPosts() {
    this.http.get<{ message: string; posts: Post[] }>(this.apiUrl).subscribe((postData) => {
      this.posts = postData.posts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  getPostsUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { id: "", title: title, content: content };
    this.http.post<{ message: string, postId: string }>(this.apiUrl, post).subscribe((responseData) => {
      console.log(responseData.message);
      // Update the post object with the ID returned from the server
      post.id = responseData.postId;
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
    });
  }

  deletePost(postId: string) {
    this.http.delete('http://localhost:3000/api/posts/' + postId)
      .subscribe(() => {
        console.log('Deleted: ' + postId);
        this.posts = this.posts.filter(post => post.id !== postId);
        this.postsUpdated.next([...this.posts]);
      });
  }
}