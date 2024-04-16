import { Component, Output, EventEmitter } from "@angular/core";
import { Post } from "../post.model";
import { NgForm } from "@angular/forms";
import { PostsService } from "../post.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-post-create",
  templateUrl: "./post-create.component.html",
  styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent {
  enteredTitle = "";
  enteredContent = "";

  constructor(public postsService: PostsService, private router: Router) { }

  @Output() postCreated = new EventEmitter<Post>();
  onAddPost(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.postsService.addPost(form.value.title, form.value.content);
    this.router.navigate(['/list']);
  }
}
