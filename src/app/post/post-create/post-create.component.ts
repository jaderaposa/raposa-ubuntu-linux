import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { NgForm } from "@angular/forms";
import { PostsService } from "../post.service";
import { Router, ActivatedRoute, ParamMap } from "@angular/router";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent implements OnInit {
  enteredTitle = "";
  enteredContent = "";
  postId: string = '';
  post: Post | null = null;
  isLoading = false;
  title = '';
  content = '';

  constructor(public postsService: PostsService, private router: Router, public route: ActivatedRoute) { }

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        const postIdFromRoute = paramMap.get('postId');
        if (postIdFromRoute !== null) {
          this.postId = postIdFromRoute;
          this.isLoading = true;
          this.postsService.getPost(this.postId).subscribe(postData => {
            this.isLoading = false;
            this.title = postData.title;
            this.content = postData.content;
          });
        }
      } else {
        this.postId = '';
        this.title = '';
        this.content = '';
      }
    });
  }

  @Output() postCreated = new EventEmitter<Post>();

  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.postId) {
      this.postsService.updatePost(this.postId, form.value.title, form.value.content).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/list']);
      });
    } else {
      this.postsService.addPost(form.value.title, form.value.content).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/list']);
      });
    }
  }
}