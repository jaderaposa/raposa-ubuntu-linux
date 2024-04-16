const express = require("express");
const bodyParser = require("body-parser");
const Post = require("./models/posts"); // Import the Post model
const mongoose = require("mongoose");
const cors = require("cors");
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

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
	next();
});

app.post("/api/posts", (req, res, next) => {
	const post = new Post({
		title: req.body.title,
		content: req.body.content,
	});
	post.save().then((createdPost) => {
		res.status(201).json({
			message: "Post added successfully",
			postId: createdPost._id,
		});
	});
});

app.put("/api/posts/:id", (req, res, next) => {
	const post = new Post({
		_id: req.body.id,
		title: req.body.title,
		content: req.body.content,
	});
	Post.updateOne({ _id: req.params.id }, post)
		.then((result) => {
			res.status(200).json({ message: "Update successful!" });
		})
		.catch((error) => {
			res.status(500).json({ message: "An error occurred!" });
		});
});

app.get("/api/posts", (req, res, next) => {
	const posts = [
		{
			id: "fadf12421l",
			title: "First server-side post",
			content: "This is coming from the server",
		},
		{
			id: "ksajflaj132",
			title: "Second server-side post",
			content: "This is coming from the server!",
		},
  ];

	Post.find().then((documents) => {
		const allPosts = posts.concat(
			documents.map((document) => {
				return {
					id: document._id.toString(),
					title: document.title,
					content: document.content,
				};
			})
		);
		res.status(200).json({
			message: "Posts fetched successfully!",
			posts: allPosts,
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

// Add the DELETE route here
app.delete('/api/posts/:id', (req, res) => {
  const postId = req.params.id;
  Post.findByIdAndDelete(postId)
     .then(() => res.status(200).send({ message: 'Post deleted successfully' }))
     .catch(err => res.status(500).send({ message: 'Error deleting post', error: err }));
 });


module.exports = app;
