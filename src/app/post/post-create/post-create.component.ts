import { Component, Output, EventEmitter } from "@angular/core";
import { Post } from "../post.model";
import { NgForm } from "@angular/forms";
import { PostsService } from "../post.service";

@Component({
	selector: "app-post-create",
	templateUrl: "./post-create.component.html",
	styleUrls: ["./post-create.component.css"],
})
export class PostCreateComponent {
	enteredTitle = "";
	enteredContent = "";

  constructor(public postsService : PostsService ){}

	@Output() postCreated = new EventEmitter<Post>();
	onAddPost(form: NgForm) {
		if (form.invalid) {
			return;
		}
		this.postsService
	}
}
