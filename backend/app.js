const express = require("express");
const bodyParser = require("body-parser");
const Post = require("./models/posts"); // Import the Post model
const User = require("./models/user"); // Import the User model
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path"); // Add this line
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs"); // For hashing passwords

require("dotenv").config(); // This line loads the .env file

const app = express();

mongoose
	.connect(process.env.MONGODB_URI)
	.then(() => {
		console.log("Connected to database!");
	})
	.catch(() => {
		console.log("Connection failed!");
	});

app.use(
	cors({
		origin: "http://localhost:4200",
		credentials: true,
	})
);app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Middleware to check if user is authenticated
function authenticateToken(req, res, next) {
	const authHeader = req.headers["authorization"];
	const token = authHeader && authHeader.split(" ")[1];

	if (token == null) return res.sendStatus(401);

	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		if (err) return res.sendStatus(403);
		req.user = user;
		next();
	});
}

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

let failedAttempts = {};
const MAX_ATTEMPTS = 3;
const BLOCK_TIME = 30 * 1000; // 30 seconds

// Login route
app.post("/api/login", async (req, res) => {
	const { usernameOrEmail } = req.body;
	const currentTime = Date.now();

	if (failedAttempts[usernameOrEmail] && failedAttempts[usernameOrEmail].blockUntil > currentTime) {
		const remainingTime = Math.ceil((failedAttempts[usernameOrEmail].blockUntil - currentTime) / 1000);
		return res.status(429).json({ error: `Too many failed attempts. Try again in ${remainingTime} seconds.` });
	} else if (failedAttempts[usernameOrEmail] && failedAttempts[usernameOrEmail].blockUntil <= currentTime) {
		// If block time has passed, reset the failed attempts count
		failedAttempts[usernameOrEmail] = { count: 0 };
	}

	const user = await User.findOne({
		$or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
	});

	if (user == null) {
		return res.status(400).json({ error: "Username/Email does not exist" });
	}

	try {
		if (await bcrypt.compare(req.body.password, user.password)) {
			// Successful login
			failedAttempts[usernameOrEmail] = { count: 0 }; // reset the counter
			const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: "5m" });
			res.json({ message: "Login successful", accessToken: accessToken, user: user });
		} else {
			failedAttempts[usernameOrEmail] = failedAttempts[usernameOrEmail] || { count: 0 };
			failedAttempts[usernameOrEmail].count++;

			if (failedAttempts[usernameOrEmail].count >= MAX_ATTEMPTS) {
				failedAttempts[usernameOrEmail].blockUntil = currentTime + BLOCK_TIME;
				const remainingTime = BLOCK_TIME / 1000;
				return res.status(429).json({ error: `Too many failed attempts. Try again in ${remainingTime} seconds.` });
			}

			res.status(403).json({ error: "Wrong password" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
});

// Register route
app.post("/api/register", async (req, res) => {
	try {
		// Validate the input
		let errors = [];
		if (!req.body.username || req.body.username.length < 3) {
			errors.push("Username must be at least 3 characters.");
		}
		if (!req.body.email || !req.body.email.includes("@")) {
			errors.push("Invalid email.");
		}
		if (!req.body.password || req.body.password.length < 6) {
			errors.push("Password must be at least 6 characters.");
		}
		if (errors.length > 0) {
			return res.status(400).send({ errors: errors });
		}

		const user = new User({
			username: req.body.username,
			email: req.body.email,
			password: req.body.password, // No need to hash here
		});
		const savedUser = await user.save();
		res.send(savedUser);
	} catch (err) {
		console.error(err);
		res.status(500).send({ error: err.message });
	}
});

app.use((req, res, next) => {
	res.setHeader("Access-Control-Allow-Origin", "*");
	res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
	res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE, OPTIONS");
	next();
});

app.post("/api/posts", authenticateToken, (req, res, next) => {
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
	const pageSize = +req.query.pagesize;
	const currentPage = +req.query.page;
	const postQuery = Post.find();
	let fetchedPosts;

	if (pageSize && currentPage) {
		postQuery.skip(pageSize * (currentPage - 1)).limit(pageSize);
	}

	postQuery
		.then((documents) => {
			fetchedPosts = documents;
			return Post.countDocuments();
		})
		.then((count) => {
			res.status(200).json({
				message: "Posts fetched successfully!",
				posts: fetchedPosts,
				maxPosts: count,
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
