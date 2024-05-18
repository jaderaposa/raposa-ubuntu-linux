const mongoose = require("mongoose");

const postSchema = mongoose.Schema({
	title: { type: String, required: true },
	content: { type: String, required: true },
	imagePath: { type: String, required: false },
	author: { type: String, required: true }, // change this to String
	timePosted: { type: Date, default: Date.now }, // Add this line
});

module.exports = mongoose.model("Post", postSchema);
