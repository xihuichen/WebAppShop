const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const path = require('path');
const ejs = require('ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files
app.set('view engine', 'ejs'); // Set EJS as templating engine

// Connect to database
const mysql = require('mysql');
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'G00425703'
});

connection.connect((err) => {
  if (err) {
    console.error('Error connecting to database: ', err);
    return;
  }
  console.log('Connected to database!');
});

// Route to serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Route to handle login POST request
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'user' && password === 'pass') {
    // Redirect to the shop on successful login
    res.redirect('/shop');
  } else {
    res.status(401).send('Invalid credentials');
  }
});

// Route to serve the shopping page
app.get('/shop', (req, res) => {
  // Retrieve products from the database and pass them to the EJS template
  connection.query("SELECT * FROM productdata", (err, rows) => {
    if (err) {
      res.status(500).send('Error retrieving data from database');
    } else {
      res.render('shop.ejs', { products: rows });
    }
  });
});

// Route to handle purchase POST request
app.post('/purchase', (req, res) => {
  const { productId, quantity } = req.body;
  // Logic to calculate total price based on productId and quantity
  connection.query("SELECT price FROM productdata WHERE id = ?", [productId], (err, rows) => {
    if (err) {
      res.status(500).send('Error processing your purchase');
    } else {
      const totalPrice = rows[0].price * quantity;
      // Render a template with the total cost or send back the total cost
      res.render('summary.ejs', { total: totalPrice, quantity: quantity });
    }
  });
});

// Start the server
app.listen(3000, () => {
  console.log('Server started on port 3000');
});
