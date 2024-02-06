import { Component } from "@angular/core";

@Component({
	selector: "app-post-create",
	templateUrl: "./post-create.component.html",
})
export class PostCreateComponent {
	entered_text = "";
	former_text = "something";
	onAddPost() {
		this.entered_text = this.former_text;
	}
}
