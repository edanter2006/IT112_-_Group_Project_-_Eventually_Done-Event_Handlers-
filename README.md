How to Run EVENT-UALLY DONE Locally
Follow these steps to set up and run the project on your computer:



1. Prerequisites
Make sure you have Node.js installed on your machine.



2. Clone the Repository
Open your terminal and run:
`git clone https://github.com/edanter2006/IT112_-_Group_Project_-_Eventually_Done-Event_Handlers-.git`
`cd "Event Handlers"`

or download the file from github directly



3. Install Dependencies
Install all required Node packages:
`npm install`



4. Create the Environment File (.env)
In the main project folder, create a new file named .env and paste the following inside (replace the placeholder values with your own MongoDB connection string and a secret key):

`PORT=3000`
`MONGO_URI=<your_mongodb_connection_string_here>` // replace "<>" with MongolDB connection string
`JWT_SECRET=<your_secret_key_here>`               // replace "<>" with any random string or your choosing



5. Start the Server
Run the backend server:
`node server.js`

(Or use <npm start> if nodemon is configured)



6. Open the App
Open your web browser and go to:
"http://localhost:3000"
