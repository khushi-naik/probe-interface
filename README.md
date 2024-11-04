# probe-interface
Consists of 3 pages-
- Landing page (index.ejs) is where you enter participant details before you start collecting participant alarm/trend data.
- Alarm identification (alarmIdentification.ejs): participant can report on 1 or more vital alarms.
- Probe/ Trend identification (trendIdentification.ejs): participant has to report on ALL vitals.

## Getting Started
Follow these instructions to set up and run the application on your local machine.

### Prerequisites
You must have Nodejs installed on your machine.

### Installation
1. **Clone the repository**

   Use the following command to clone this repository to your local machine:

   ```bash
   git clone https://github.com/khushi-naik/probe-interface
2. Navigate to the project directory
   ```bash
   cd probe-interface
3. Install the required packages by running:
    ```bash
   npm install
4. Run the application by:
    ```bash
   node index.js

Access the application in browser using: http://machine_ip:port_number

## Extra
- Run the application on the phone in landscape mode and preferrably in desktop view.
- If you want all participant's data in one file instead of separate files then remove "req.session.participantNumber" from line 96 and 135 inside index.js


