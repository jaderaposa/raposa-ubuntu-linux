const express = require("express");
const bodyParser = require("body-parser");
const Post = require("./models/posts"); // Import the Post model
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path"); // Add this line
const app = express();

mongoose
	.connect("mongodb+srv://jaderaposa:jademongodatabase@jadedb.gb4oedl.mongodb.net/node-angular?retryWrites=true&w=majority&appName=JadeDB")
	.then(() => {
		console.log("Connected to database!");
	})
	.catch(() => {
		console.log("Connection failed!");
	});

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Multer configuration
const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, "images");
	},
	filename: (req, file, cb) => {
		cb(null, Date.now() + "-" + file.originalname);
	},
});

app.use(multer({ storage: storage }).single("image"));

app.use("/images", express.static(path.join("images"))); // Add this line

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
	next();
});

app.post("/api/posts", (req, res, next) => {
	const url = req.protocol + "://" + req.get("host");
	let imagePath = null;
	if (req.file) {
		imagePath = url + "/images/" + req.file.filename;
	}
	const post = new Post({
		title: req.body.title,
		content: req.body.content,
		imagePath: imagePath, // use imagePath variable here
	});
	post.save().then((createdPost) => {
		res.status(201).json({
			message: "Post added successfully",
			post: {
				id: createdPost._id,
				title: createdPost.title,
				content: createdPost.content,
				imagePath: createdPost.imagePath,
			},
		});
	});
});

app.put("/api/posts/:id", (req, res, next) => {
	let imagePath = req.body.imagePath;
	if (req.file) {
		const url = req.protocol + "://" + req.get("host");
		imagePath = url + "/images/" + req.file.filename;
	}
	const post = {
		title: req.body.title,
		content: req.body.content,
		imagePath: imagePath,
	};
	Post.updateOne({ _id: req.params.id }, post)
		.then((result) => {
			res.status(200).json({ message: "Update successful!" });
		})
		.catch((error) => {
			res.status(500).json({ message: "An error occurred!" });
		});
});

app.get("/api/posts", (req, res, next) => {
	Post.find().then((documents) => {
		res.status(200).json({
			message: "Posts fetched successfully!",
			posts: documents,
		});
	});
});

app.get("/api/posts/:id", (req, res, next) => {
	const postId = req.params.id;
	Post.findById(postId)
		.then((post) => {
			if (post) {
				res.status(200).json(post);
			} else {
				res.status(404).json({ message: "Post not found!" });
			}
		})
		.catch((error) => {
			res.status(500).json({
				message: "Fetching post failed!",
			});
		});
});

app.delete("/api/posts/:id", (req, res) => {
	const postId = req.params.id;
	Post.findByIdAndDelete(postId)
		.then(() => res.status(200).send({ message: "Post deleted successfully" }))
		.catch((err) => res.status(500).send({ message: "Error deleting post", error: err }));
});

module.exports = app;
