const functions = require('firebase-functions');
const cors = require('cors')({ origin: true }); // Allow all origins; adjust if needed

// Example Cloud Function for Dialogflow
exports.dialogflow = functions.https.onRequest((req, res) => {
  // Wrap your function code with the CORS middleware
  cors(req, res, () => {
    // Process the request, for example:
    // (You can add your Dialogflow integration code here)

    // For testing purposes, simply return a JSON response:
    res.json({ response: "Hello from your Cloud Function with CORS!" });
  });
});
