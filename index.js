// server.js
const express = require('express');
const bodyParser = require('body-parser');
const xlsx = require('xlsx');
const path = require('path');
const fs = require('fs');
const net = require('net');
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

// TCP server setup
/*const TCP_PORT = 80; // Port for the TCP server
const tcpServer = net.createServer((socket) => {
  console.log('TCP client connected');

  // Handle incoming data from the Unity application
  socket.on('data', (data) => {
    console.log('Received data from Unity:', data.toString());
    
    // You can add your data processing logic here
    // For example, parse the data and save it to a file or send a response

  });

  // Handle client disconnection
  socket.on('end', () => {
    console.log('TCP client disconnected');
  });

  // Handle errors
  socket.on('error', (err) => {
    console.error('TCP server error:', err);
  });
});

// Start the TCP server
tcpServer.listen(TCP_PORT, () => {
  console.log(`TCP server is running on port ${TCP_PORT}`);
});
*/

app.get('/', (req, res) => {
  res.render('index');
})

app.get('/alarm', (req, res) => {
  const message = req.session.alarmmessage;
  req.session.alarmmessage = null;
  res.render('alarmIdentification', { message });
})

app.post('/alarm', (req, res) => {
  req.session.participantNumber = req.body.participantNumber;
  req.session.date = req.body.date;
  req.session.blockName = req.body.blockName;
  res.redirect('/alarm');
})

app.get('/trend', (req,res)=>{
  const message = req.session.trendmessage;
  req.session.trendmessage = null;
  res.render('trendIdentification', { message });
})

app.get('/probe', (req, res) => {
  const message = req.session.message;
  const vitalState  = req.session.vitalState;
  req.session.message = null;
  res.render('probeCollection', { message, vitalState });
});

app.post('/alarmsubmit', async (req,res) => {
  const { participantNumber, date, blockName} = req.session;
  const { alarmInputData } = req.body;
  if(!alarmInputData){
    req.session.alarmmessage = 'Alarm data not provided!';
    return res.redirect('/alarm');
  }
  console.log("alarm input data "+alarmInputData + " length ");
  const alarmData = JSON.parse(alarmInputData);
  const filePath = path.join(__dirname, req.session.participantNumber+'alarmData.xlsx');
  let workbook;

  if(fs.existsSync(filePath)){
    workbook = xlsx.readFile(filePath);
  }
  else{
    workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([["Date", "Participant Number"
    , "Block Name", "Alarm number", "Vital Sign", "Value", "Timestamp" ]]);
    xlsx.utils.book_append_sheet(workbook,worksheet,'Sheet1');
    xlsx.writeFile(workbook, filePath);
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const latestAlarmNumber = getLatestAlarmNumber(worksheet);
  const newAlarmNumber = latestAlarmNumber+1;

  Object.keys(alarmData).forEach((vital) => {
    const { value, timestamp } = alarmData[vital];
    const newRow = [date, participantNumber, blockName, newAlarmNumber, vital, value, timestamp]; // Include alarm number
    xlsx.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });
  });

  // Write to file
  xlsx.writeFile(workbook, filePath);
  req.session.alarmmessage = 'Alarm Data has been saved successfully!';
  res.redirect('/alarm');
});

app.post('/trendsubmit', async (req,res) => {
  const { participantNumber, date, blockName} = req.session;
  const { trendInputData } = req.body;
  if(!trendInputData){
    req.session.alarmmessage = 'Trend data not provided!';
    return res.redirect('/trend');
  }
  console.log("trend input data "+trendInputData + " length ");
  const trendData = JSON.parse(trendInputData);
  const filePath = path.join(__dirname, req.session.participantNumber+'trendData.xlsx');
  let workbook;

  if(fs.existsSync(filePath)){
    workbook = xlsx.readFile(filePath);
  }
  else{
    workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.aoa_to_sheet([["Date", "Participant Number"
    , "Block Name", "Probe number", "Vital Sign", "Trend", "Timestamp" ]]);
    xlsx.utils.book_append_sheet(workbook,worksheet,'Sheet1');
    xlsx.writeFile(workbook, filePath);
  }

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];
  const latestProbeNumber = getLatestAlarmNumber(worksheet);
  const newProbeNumber = latestProbeNumber+1;

  Object.keys(trendData).forEach((vital) => {
    const { value, timestamp } = trendData[vital];
    const newRow = [date, participantNumber, blockName, newProbeNumber, vital, value, timestamp]; // Include alarm number
    xlsx.utils.sheet_add_aoa(worksheet, [newRow], { origin: -1 });
  });

  // Write to file
  xlsx.writeFile(workbook, filePath);
  req.session.trendmessage = 'Trend Data has been saved successfully!';
  res.redirect('/trend');
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

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

//helper functions here
function getLatestAlarmNumber(worksheet) {
  const range = xlsx.utils.decode_range(worksheet['!ref']);
  let latestAlarmNumber = 0;

  // Check if there are rows, and get the alarm number from the last row
  for (let row = range.s.r; row <= range.e.r; row++) {
    const cellAddress = { c: 3, r: row }; // Assuming Alarm Number is in column A
    const cell = worksheet[xlsx.utils.encode_cell(cellAddress)];
    if (cell && !isNaN(cell.v)) {
      latestAlarmNumber = parseInt(cell.v);
    }
  }
  return latestAlarmNumber;
}