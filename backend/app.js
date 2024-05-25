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
const nodemailer = require("nodemailer");
const crypto = require("crypto");

require("dotenv").config(); // This line loads the .env file

const app = express();

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL,
		pass: process.env.PASSWORD,
	},
});

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
			// Check if the user's account is verified
			if (!user.isVerified) {
				return res.status(401).json({ error: "Your account has not been verified. Please check your email for a verification link." });
			}
			// Successful login
			failedAttempts[usernameOrEmail] = { count: 0 }; // reset the counter
			const accessToken = jwt.sign(user.toJSON(), process.env.ACCESS_TOKEN_SECRET, { expiresIn: "60s" });
			res.json({ message: "Login successful", accessToken: accessToken, user: user });
		} else {
			failedAttempts[usernameOrEmail] = failedAttempts[usernameOrEmail] || { count: 0 };
			failedAttempts[usernameOrEmail].count++;

			if (failedAttempts[usernameOrEmail].count >= MAX_ATTEMPTS) {
				failedAttempts[usernameOrEmail].blockUntil = currentTime + BLOCK_TIME;
				const remainingTime = BLOCK_TIME / 1000;
				return res.status(429).json({ error: `Too many failed attempts. Try again in ${remainingTime} seconds.` });
			}

			const remainingAttempts = MAX_ATTEMPTS - failedAttempts[usernameOrEmail].count;
			res.status(403).json({ error: "Wrong password,", remainingAttempts: remainingAttempts });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
  }

});

// Register route
// Register route
app.post("/api/register", async (req, res) => {
    try {
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
        if (req.body.password !== req.body.confirmPassword) {
            errors.push("Passwords do not match.");
        }

        // Check if username or email already exists
        const existingUser = await User.findOne({
            $or: [{ username: req.body.username }, { email: req.body.email }],
        });

        if (existingUser) {
            if (existingUser.username === req.body.username) {
                errors.push("Username already exists.");
            }
            if (existingUser.email === req.body.email) {
                errors.push("Email already exists.");
            }
        }

        if (errors.length > 0) {
            return res.status(400).send({ errors: errors });
        }

        // Create a new user
        const user = new User({
            username: req.body.username,
            email: req.body.email,
            password: req.body.password,
        });

        // Generate a token
        const token = crypto.randomBytes(20).toString("hex");

        // Save the token to the user's document
        user.token = token;

        // Save the user
        const savedUser = await user.save();

        // Send the token to the user's email
        const mailOptions = {
            from: process.env.EMAIL, // This is your email
            to: user.email, // This is the user's email
            subject: "Account Verification",
            text: `Please verify your account by clicking the following link: http://localhost:3000/api/verify?token=${token}`,
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email sent: " + info.response);
            }
        });

        res.send(savedUser);
    } catch (err) {
        console.error(err);
        res.status(500).send({ error: err.message });
    }
});

app.get("/api/verify", async (req, res) => {
	// Get the token from the query parameters
	const token = req.query.token;

	// Find the user with this token
	const user = await User.findOne({ token: token });

	if (!user) {
		return res.status(400).send("Invalid token.");
	}

	// Verify the user's account
	user.isVerified = true;
	user.token = undefined; // Remove the token as it's no longer needed
	await user.save();

	res.send("Your account has been verified. You can now log in.");
});


app.post("/api/send-reset-code", async (req, res) => {
	const { email } = req.body;

	let user;
	try {
		user = await User.findOne({ email });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to retrieve user." });
	}

	if (!user) {
		return res.status(400).json({ error: "User with this email does not exist." });
	}

	// Generate a reset token
	const resetToken = crypto.randomBytes(20).toString("hex");

	// Save the reset token to the user's document
	user.resetToken = resetToken;
	try {
		await user.save();
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to save reset token." });
	}

	// Send the reset token to the user's email
	const mailOptions = {
		from: process.env.EMAIL,
		to: user.email,
		subject: "Password Reset Code",
		text: `Your password reset code is: ${resetToken}`,
	};

	transporter.sendMail(mailOptions, function (error, info) {
		if (error) {
			console.log(error);
			return res.status(500).json({ error: "Failed to send email." });
		} else {
			console.log("Email sent: " + info.response);
			return res.json({ message: "Password reset code sent." });
		}
	});
});

app.post("/api/validate-reset-code", async (req, res) => {
	const { email, code } = req.body;

	let user;
	try {
		user = await User.findOne({ email });
	} catch (error) {
		console.error(error);
		return res.status(500).json({ error: "Failed to retrieve user." });
	}

	if (!user || !user.resetToken || user.resetToken.toString().toLowerCase() !== code.toString().toLowerCase()) {
		return res.status(400).json({ error: "Invalid reset code." });
	}

	// The reset code is valid, allow the user to reset their password
	res.json({ message: "Reset code is valid." });
});

app.post("/api/reset-password", async (req, res) => {
	try {
		const { email, newPassword } = req.body;

		// Validate input
		if (!email || !newPassword) {
			return res.status(400).json({ error: "Email and password are required." });
		}

		const user = await User.findOne({ email });

		if (!user) {
			return res.status(400).json({ error: "User with this email does not exist." });
		}

		// Update the user's password
		user.password = newPassword;
		await user.save();

		res.json({ message: "Your password has been reset. You can now log in." });
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: "Server error." });
	}
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
		author: req.user.username, // set the author to the currently authenticated user's username
	});
	post.save().then((createdPost) => {
		res.status(201).json({
			message: "Post added successfully",
			post: {
				id: createdPost._id,
				title: createdPost.title,
				content: createdPost.content,
				imagePath: createdPost.imagePath,
				author: createdPost.author, // include the author in the response
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
