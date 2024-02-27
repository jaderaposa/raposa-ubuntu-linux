import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";

@Injectable({ providedIn: "root" })
export class PostsService {
  private posts: Post[] = [];
  private postsUpdated = new Subject<Post[]>();

  constructor(private http: HttpClient) { }

  getPosts() {
    this.http.get<{ message: string; posts: Post[] }>("http://localhost:3000/api/posts").subscribe((postData) => {
      if (!Array.isArray(postData.posts)) {
        console.error("Data from server is not an array:", postData);
        return;
      }
      this.posts = postData.posts;
      this.postsUpdated.next([...this.posts]);
    });
  }

  getPostUpdateListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string) {
    const post: Post = { title: title, content: content };
    this.http.post<{ message: string }>("http://localhost:3000/api/posts", post).subscribe((responseData) => {
      this.posts.push(post);
      this.postsUpdated.next([...this.posts]);
    });
  }
}
