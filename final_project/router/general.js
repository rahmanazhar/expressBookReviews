const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Unable to register user. Username and password are required."});
  }
  if (isValid(username)) {
    return res.status(404).json({message: "User already exists!"});
  }
  users.push({"username": username, "password": password});
  return res.status(200).json({message: "User successfully registered. Now you can login"});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn], null, 4));
  }
  return res.status(404).json({message: "Book not found"});
 });

// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = Object.keys(books)
    .filter((isbn) => books[isbn].author === author)
    .map((isbn) => ({"isbn": isbn, ...books[isbn]}));

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify({booksbyauthor: matchingBooks}, null, 4));
  }
  return res.status(404).json({message: "No books found for this author"});
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = Object.keys(books)
    .filter((isbn) => books[isbn].title === title)
    .map((isbn) => ({"isbn": isbn, ...books[isbn]}));

  if (matchingBooks.length > 0) {
    return res.status(200).send(JSON.stringify({booksbytitle: matchingBooks}, null, 4));
  }
  return res.status(404).json({message: "No books found for this title"});
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
  }
  return res.status(404).json({message: "Book not found"});
});

// ----- Tasks 10-13: the same lookups using Promise callbacks / async-await with Axios -----
const BASE_URL = "http://localhost:5000";

// Task 10: Get the book list using async-await with Axios
public_users.get('/async/books', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + '/');
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(500).json({message: "Error fetching the book list"});
  }
});

// Task 11: Get book details based on ISBN using async-await with Axios
public_users.get('/async/isbn/:isbn', async function (req, res) {
  try {
    const response = await axios.get(BASE_URL + '/isbn/' + req.params.isbn);
    return res.status(200).send(response.data);
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }
    return res.status(500).json({message: "Error fetching book details"});
  }
});

// Task 12: Get book details based on author using Promise callbacks with Axios
public_users.get('/async/author/:author', function (req, res) {
  axios.get(BASE_URL + '/author/' + encodeURIComponent(req.params.author))
    .then((response) => res.status(200).send(response.data))
    .catch((error) => {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({message: "Error fetching books by author"});
    });
});

// Task 13: Get book details based on title using Promise callbacks with Axios
public_users.get('/async/title/:title', function (req, res) {
  axios.get(BASE_URL + '/title/' + encodeURIComponent(req.params.title))
    .then((response) => res.status(200).send(response.data))
    .catch((error) => {
      if (error.response) {
        return res.status(error.response.status).json(error.response.data);
      }
      return res.status(500).json({message: "Error fetching books by title"});
    });
});

module.exports.general = public_users;
