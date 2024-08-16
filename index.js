// server.js
const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const session = require('express-session');


const app = express();
//connectDb();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public')); // to serve HTML form

app.use(session({
  secret: 'your-secret-key',
  resave: false,
  saveUninitialized: true
}));

app.get('/', (req, res) => {
  res.render('index');
})

app.post('/probe', (req, res) => {
  req.session.participantNumber = req.body.participantNumber;
  req.session.date = req.body.date;
  req.session.blockName = req.body.blockName;
  res.redirect('/probe');
})

app.get('/probe', (req, res) => {
  const message = req.session.message;
  const vitalState  = req.session.vitalState;
  req.session.message = null;
  res.render('probeCollection', { message, vitalState });
});

app.post('/submit', async (req, res) => {
  const { participantNumber, date, blockName} = req.session;
  const { vitalType, currentCondition, trend } = req.body;

  if (!req.session.vitalState) {
    req.session.vitalState = {};
  }
  req.session.vitalState[vitalType] = true;
  console.log(req.session.vitalState);

  if(Object.keys(req.session.vitalState).length === 3){
    req.session.vitalState = {};
  }

  const filePath = path.join(__dirname, 'data.xlsx');

    // Check if the file exists
    let workbook;
    if (fs.existsSync(filePath)) {
        // Read the existing file
        workbook = xlsx.readFile(filePath);
    } else {
        // Create a new workbook and worksheet
        workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.aoa_to_sheet([
            ["Date", "Participant Number", "Block Name", "Vital Type", "Current Condition", "Trend"]
        ]);
        xlsx.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
        xlsx.writeFile(workbook, filePath);
    }

    // Get the first worksheet
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    // Append new row
    const newRow = [date, participantNumber, blockName, vitalType, currentCondition, trend];
    xlsx.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });

    // Write to file
    xlsx.writeFile(workbook, filePath);

    req.session.message = 'Data has been saved successfully!';
    res.redirect('/probe');
    //res.send('Data appended to Excel sheet');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
