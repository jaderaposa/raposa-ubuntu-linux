import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { Post } from "../post.model";
import { FormGroup, FormControl, Validators } from "@angular/forms";
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
  form: FormGroup = new FormGroup({}); // Initialize form here

  constructor(public postsService: PostsService, private router: Router, public route: ActivatedRoute) { }

  ngOnInit() {
    this.form = new FormGroup({
      'title': new FormControl(null, { validators: [Validators.required, Validators.minLength(3)] }),
      'content': new FormControl(null, { validators: [Validators.required] }),
      'image': new FormControl(null) // Remove the validator here
    });

    this.route.paramMap.subscribe((paramMap: ParamMap) => {
      if (paramMap.has('postId')) {
        const postIdFromRoute = paramMap.get('postId');
        if (postIdFromRoute !== null) {
          this.postId = postIdFromRoute;
          this.isLoading = true;
          this.postsService.getPost(this.postId).subscribe(postData => {
            this.isLoading = false;
            this.post = {
              _id: postData._id, // Add this line
              title: postData.title,
              content: postData.content,
              imagePath: postData.imagePath
            };
            if (this.post) { // Check if this.post is not null
              this.form.setValue({
                'title': this.post.title,
                'content': this.post.content,
                'image': this.post.imagePath
              });
            }
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

  onImagePicked(event: Event) {
    const target = event.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      const file = target.files[0];
      this.form.patchValue({ image: file });
      this.form.get('image')?.updateValueAndValidity();
    }
  }

  onAddPost() {
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    if (this.postId) {
      this.postsService.updatePost(this.postId, this.form.value.title, this.form.value.content, this.form.value.image).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/list']);
      });
    } else {
      this.postsService.addPost(this.form.value.title, this.form.value.content, this.form.value.image).subscribe(() => {
        this.isLoading = false;
        this.router.navigate(['/list']);
      });
    }
    this.form.reset();
  }
}