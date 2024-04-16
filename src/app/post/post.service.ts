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

  getPost(id: string) {
    return this.http.get<{ _id: string, title: string, content: string }>('http://localhost:3000/api/posts/' + id);
  }

  getPosts() {
    this.http.get<{ message: string; posts: Post[] }>(this.apiUrl).subscribe((postData) => {
      this.posts = postData.posts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  getPostsUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string): Observable<any> {
    const post: Post = { id: "", title: title, content: content };
    return this.http.post<{ message: string, postId: string }>(this.apiUrl, post)
      .pipe(tap((responseData) => {
        post.id = responseData.postId;
        this.posts.push(post);
        this.postsUpdated.next([...this.posts]);
      }));
  }

  updatePost(id: string, title: string, content: string): Observable<any> {
    const post: Post = { id, title, content };
    return this.http.put(this.apiUrl + '/' + id, post)
      .pipe(tap(() => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p.id === post.id);
        updatedPosts[oldPostIndex] = post;
        this.posts = updatedPosts;
        this.postsUpdated.next([...this.posts]);
      }));
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