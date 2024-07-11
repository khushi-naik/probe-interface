// server.js
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Replace this URL with your deployed Google Apps Script URL
const googleScriptURL = 'https://script.google.com/macros/s/AKfycbyK3gD6T0UZUuG7mjrSvetpZSiVTGdXFCBf1yBDUkotE66rUShG3aJ4fUqfLOl5xnou/exec';

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // to serve HTML form

app.post('/submit', async (req, res) => {
  try {
    const response = await axios.post(googleScriptURL, req.body);
    res.send(response.data);
  } catch (error) {
    console.error('Error: ', error);
    res.send('There was an error submitting the form');
  }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
