import { machineLearningAPI } from "../config/api.mjs";
import FormData from "form-data";
import fs from "fs";
import * as cheerio from 'cheerio';
const uploadImage = {
  getPrediction: async (request, h) => {
    const file = request.payload.image;

    if (!file) {
      return h.response({ error: "Photo is required" }).code(400);
    }

    try {
      const mimeType = file.headers["content-type"];
      const fileName = file.filename;

      if (!mimeType.startsWith("image/")) {
        return h.response({ error: "Only image files are allowed" }).code(400);
      }

      const fileStream = fs.createReadStream(file.path);

      const form = new FormData();
      form.append("image", fileStream, fileName);

      // Step 1: Get prediction response
      const response = await machineLearningAPI.getPrediction(form);

      if (!response.data || !response.data.data) {
        return h
          .response({ error: "Prediction API returned invalid data" })
          .code(500);
      }

      // Step 2: Prepare Firestore data
      const data = {
        fields: {
          GenText: { stringValue: response.data.data.GenText},
          predict_time: {
            doubleValue: parseFloat(response.data.data.predict_time),
          }, 
          predicted_class: { stringValue: response.data.data.predicted_class },
          confidence: {
            doubleValue: parseFloat(response.data.data.confidence),
          }, 
          timestamp: { timestampValue: new Date().toISOString() }, 
        },
      };

      // Step 3: Respond to user immediately
      const responseJson = {
        GenText: response.data.data.GenText,
        predict_time: response.data.data.predict_time,
        predicted_class: response.data.data.predicted_class,
        confidence: response.data.data.confidence,
      };

      // Step 4: Store in Firestore asynchronously
      (async () => {
        try {
          const firestoreResponse = await machineLearningAPI.storeHistory(data);
          if (firestoreResponse.status !== 200) {
            console.error(
              "Error storing history:",
              firestoreResponse.data?.error || "Unknown error from Firestore"
            );
          } else {
            console.log("Data stored successfully in Firestore.");
          }
        } catch (error) {
          console.error(
            "Error storing data to Firestore:",
            error.response?.data || error.message || error
          );
        }
      })();
      return h.response(responseJson).code(200);
    } catch (error) {
      console.error("Error during processing:", error);
      return h.response({ error: "File upload failed" }).code(500);
    }
  },
};

const getHistory = async (request, h) => {
  try {
    const response = await machineLearningAPI.getHistory();

    // Transform the Firestore document structure
    const historyCollection = response.data.documents.map((doc) => {
      const fields = doc.fields || {};
      return {
        id: doc.name.split("/").pop(), // Extract Firestore document ID
        GenText: fields.GenText?.stringValue || null,
        predict_time: fields.predict_time?.doubleValue || null,
        predicted_class: fields.predicted_class?.stringValue || null,
        confidence: fields.confidence?.doubleValue || null,
      };
    });

    return h.response(historyCollection).code(200);
  } catch (error) {
    console.error("Error fetching data:", error);
    return h.response({ error: "Failed to fetch data" }).code(500);
  }
};


export { uploadImage, getHistory };
