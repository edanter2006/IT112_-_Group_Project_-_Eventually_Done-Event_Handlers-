How to Run EVENT-UALLY DONE Locally
Follow these steps to set up and run the project on your computer:<br>


1. Prerequisites
Make sure you have Node.js installed on your machine.<br><br>


2. Clone the Repository
Open your terminal and run:<br>
`git clone https://github.com/edanter2006/IT112_-_Group_Project_-_Eventually_Done-Event_Handlers-.git`<br>
`cd "Event Handlers"`<br><br>
or download the file from github directly.<br><br><br>


3. Install Dependencies
Install all required Node packages:<br>
`npm install`<br><br><br>


5. Create the Environment File (.env)<br>
In the main project folder, create a new file named .env and paste the following inside (replace the placeholder values with your own MongoDB connection string and a secret key):<br>
`PORT=3000`<br>
`MONGO_URI=<your_mongodb_connection_string_here>`(replace "<>" with MongolDB connection string)<br>
`JWT_SECRET=<your_secret_key_here>`(replace "<>" with any random string or your choosing)<br><br><br>


5. Start the Server
Run the backend server:<br>
`node server.js` <br>
(Or use `npm run dev`/`npm start` if nodemon is configured)<br><br><br>



6. Open the App
Open your web browser and go to:<br>
"http://localhost:3000"
