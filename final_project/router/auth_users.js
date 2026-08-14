const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.filter((user) => user.username === username).length > 0;
}

const authenticatedUser = (username,password)=>{ //returns boolean
  return users.filter((user) => user.username === username && user.password === password).length > 0;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!username || !password) {
    return res.status(404).json({message: "Error logging in. Username and password are required."});
  }
  if (!authenticatedUser(username, password)) {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }
  const accessToken = jwt.sign({data: password}, 'access', {expiresIn: 60 * 60});
  req.session.authorization = {accessToken, username};
  return res.status(200).json({message: "User successfully logged in"});
});

// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!review) {
    return res.status(400).json({message: "Review text must be provided as a 'review' query parameter"});
  }
  books[isbn].reviews[username] = review;
  return res.status(200).json({message: "The review for the book with ISBN " + isbn + " has been added/updated"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!books[isbn]) {
    return res.status(404).json({message: "Book not found"});
  }
  if (!books[isbn].reviews[username]) {
    return res.status(404).json({message: "No review by " + username + " found for ISBN " + isbn});
  }
  delete books[isbn].reviews[username];
  return res.status(200).json({message: "Review by " + username + " for ISBN " + isbn + " deleted"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
