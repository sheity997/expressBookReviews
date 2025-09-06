const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Register a new user
public_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!isValid(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
    return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        // Dacă există, trimitem detaliile cărții
        return res.json(JSON.stringify(books[isbn],null,4));
    } else {
        // Dacă nu există, trimitem un mesaj
        return res.status(404).json({ message: "ISBN was not found" });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
    const authorName = req.params.author;

    // Filtrăm cărțile după autor
    let result = Object.values(books).filter(book => book.author === authorName);

    if (result.length > 0) {
        // Dacă există cărți pentru acest autor
        return res.send(JSON.stringify(result,null,4));
    } else {
        // Dacă nu există nici o carte
        return res.status(404).json({ message: "No books found for this author" });
    }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
    const titleName = req.params.title;

    let result = Object.values(books).filter(book =>book.title === titleName);

    if (result.length > 0) {
        return res.send(JSON.stringify(result,null,4));
    } else {
        return res.status(404).json({ message: "No books found with this name"})
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;

    if (books[isbn]) {
        // Dacă există, trimitem detaliile cărții
        return res.send(JSON.stringify(books[isbn].reviews,null,4));
    } else {
        // Dacă nu există, trimitem un mesaj
        return res.status(404).json({ message: "ISBN was not found" });
    }
});

module.exports.general = public_users;
