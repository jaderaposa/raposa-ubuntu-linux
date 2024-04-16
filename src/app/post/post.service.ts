import { Injectable } from "@angular/core";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Post } from "./post.model";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";

@Injectable({ providedIn: "root" })
export class PostsService {
  private apiUrl = "http://localhost:3000/api/posts";
  private posts: Post[] = [];
  private postsUpdated = new Subject<{ posts: Post[], postCount: number }>();

  constructor(private http: HttpClient) { }

  getPost(_id: string) {
    return this.http.get<{ _id: string, title: string, content: string, imagePath: string }>(this.apiUrl + '/' + _id);
  }

  getPosts(postsPerPage: number, currentPage: number) {
    const queryParams = `?pagesize=${postsPerPage}&page=${currentPage}`;
    this.http.get<{ message: string; posts: Post[], maxPosts: number }>(this.apiUrl + queryParams)
      .subscribe((responseData) => {
        this.posts = responseData.posts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: responseData.maxPosts
        });
      });
  }

  getPostsUpdatedListener() {
    return this.postsUpdated.asObservable();
  }

  addPost(title: string, content: string, image?: File): Observable<any> {
    const postData = new FormData();
    postData.append('title', title);
    postData.append('content', content);
    if (image) { // Check if image is defined
      postData.append('image', image, title);
    }
    return this.http.post<{ message: string, post: Post }>(this.apiUrl, postData)
      .pipe(tap((responseData) => {
        const post: Post = {
          _id: responseData.post._id,
          title: title,
          content: content,
          imagePath: responseData.post.imagePath ? responseData.post.imagePath : ""
        };
        this.posts.push(post);
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: this.posts.length
        });
      }));
  }

  updatePost(_id: string, title: string, content: string, image?: File | string): Observable<any> {
    let postData: Post | FormData;
    if (image && typeof (image) === 'object') {
      postData = new FormData();
      postData.append('_id', _id);
      postData.append('title', title);
      postData.append('content', content);
      postData.append('image', image, title);
    } else {
      postData = { _id: _id, title: title, content: content, imagePath: typeof image === 'string' ? image : "" };
    }
    return this.http.put(this.apiUrl + '/' + _id, postData)
      .pipe(tap(() => {
        const updatedPosts = [...this.posts];
        const oldPostIndex = updatedPosts.findIndex(p => p._id === _id);
        updatedPosts[oldPostIndex] = { _id: _id, title: title, content: content, imagePath: "" };
        this.posts = updatedPosts;
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: this.posts.length
        });
      }));
  }

  deletePost(postId: string) {
    this.http.delete(this.apiUrl + '/' + postId)
      .subscribe(() => {
        console.log('Deleted: ' + postId);
        this.posts = this.posts.filter(post => post._id !== postId);
        this.postsUpdated.next({
          posts: [...this.posts],
          postCount: this.posts.length
        });
      });
  }
}