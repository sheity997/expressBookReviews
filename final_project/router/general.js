const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');


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
public_users.get('/', async function (req, res) {
    try {
        // Wrap the books object in a Promise to simulate async behavior
        const getBooks = () => {
            return new Promise((resolve, reject) => {
                if (books) {
                    resolve(books);
                } else {
                    reject("No books available");
                }
            });
        };

        const bookList = await getBooks();
        return res.send(JSON.stringify(bookList, null, 4));

    } catch (error) {
        return res.status(500).json({ message: "Error fetching books", error: error });
    }
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;

        // Wrap logic in a Promise
        const getBookByISBN = (isbn) => {
            return new Promise((resolve, reject) => {
                if (books[isbn]) {
                    resolve(books[isbn]);
                } else {
                    reject("ISBN not found");
                }
            });
        };

        const book = await getBookByISBN(isbn);
        return res.send(JSON.stringify(book, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    try {
        const authorName = req.params.author;

        // Wrap logic in a Promise
        const getBooksByAuthor = (author) => {
            return new Promise((resolve, reject) => {
                let result = Object.values(books).filter(book => book.author === author);

                if (result.length > 0) {
                    resolve(result);
                } else {
                    reject("No books found for this author");
                }
            });
        };

        const booksByAuthor = await getBooksByAuthor(authorName);
        return res.send(JSON.stringify(booksByAuthor, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
    }
});

// Get all books based on title
public_users.get('/title/:title', async function (req, res) {
    try {
        const titleName = req.params.title;

        // Wrap logic in a Promise
        const getBooksByTitle = (title) => {
            return new Promise((resolve, reject) => {
                let result = Object.values(books).filter(book => book.title === title);

                if (result.length > 0) {
                    resolve(result);
                } else {
                    reject("No books found with this title");
                }
            });
        };

        const booksByTitle = await getBooksByTitle(titleName);
        return res.send(JSON.stringify(booksByTitle, null, 4));

    } catch (error) {
        return res.status(404).json({ message: error });
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
