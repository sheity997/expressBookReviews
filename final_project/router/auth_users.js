const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    // Filter the users array for any user with the same username and password
    let validusers = users.filter((user) => {
        return (user.username === username && user.password === password);
    });
    // Return true if any valid user is found, otherwise false
    if (validusers.length > 0) {
        return true;
    } else {
        return false;
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(404).json({ message: "Error logging in" });
    }

    // Authenticate user
    if (authenticatedUser(username, password)) {
        // Generate JWT access token
        let accessToken = jwt.sign({
            data: username
        }, 'access', { expiresIn: 60 * 60 });

        // Store access token and username in session
        req.session.authorization = {
            accessToken, username
        }
        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({ message: "Invalid Login. Check username and password" });
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let review = req.body.review; // BODY, nu params
    let userrev = req.session.authorization.username;

    if (!books[isbn]) {
        return res.status(404).json({message: "ISBN was not found"});
    }

    if (!review || review.trim() === "") {
        return res.status(400).json({message: "Review cannot be empty"});
    }

    // Adăugăm sau modificăm review-ul
    books[isbn].reviews[userrev] = review;
    return res.status(200).json({
        message: `The review '${review}' was added successfully to the book with isbn = ${isbn}`
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    let isbn = req.params.isbn;
    let userrev = req.session.authorization.username;

    // Verificăm dacă ISBN-ul există
    if (!books[isbn]) {
        return res.status(404).json({ message: "ISBN was not found" });
    }

    // Verificăm dacă userul are review pentru această carte
    if (!books[isbn].reviews[userrev]) {
        return res.status(404).json({ message: "You have not added a review for this book" });
    }

    // Ștergem review-ul
    delete books[isbn].reviews[userrev];

    return res.status(200).json({
        message: `Your review was deleted successfully from the book with ISBN ${isbn}`
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
