import { machineLearningAPI } from '../config/api.js';
import FormData from 'form-data';
import fs from 'fs';

const uploadImage = {
    getPrediction: async (request, h) => {
        const file = request.payload.image;

        if (!file) {
            return h.response({ error: 'Photo is required' }).code(400);
        }

        console.log('File Object:', file);

        try {
            const mimeType = file.headers['content-type'];
            const fileName = file.filename;

            if (!mimeType.startsWith('image/')) {
                return h.response({ error: 'Only image files are allowed' }).code(400);
            }

            const fileStream = fs.createReadStream(file.path);

            const form = new FormData();

            form.append('image', fileStream, fileName);

            const response = await machineLearningAPI.getPrediction(form)

            const cleanedText = cleanText(response.data.data.GenText)

            console.log(cleanedText)

            const predictionData = {
                fields: {
                    GenText: { stringValue: cleanedText },
                    predict_time: { stringValue: predictionResponse.data.data.predict_time },
                    predicted_class: { stringValue: predictionResponse.data.data.predicted_class },
                    confidence: { doubleValue: predictionResponse.data.data.confidence },
                    timestamp: { timestampValue: new Date().toISOString() },
                },
            };

            const firestoreResponse = await machineLearningAPI.storeHistory(predictionData)

            console.log("Saved to Firestore:", firestoreResponse.data);

            const responseJson = {
                data: cleanedText,
                predict_time: response.data.data.predict_time,
                predicted_class : response.data.data.predicted_class,
                confidence : response.data.data.confidence 
            }

            return h.response(responseJson).code(200);

            

        } catch (error) {
            console.error('Error uploading file:', error);
            return h.response({ error: 'File upload failed' }).code(500);
        }
    },
};
const getHistory = async (request, h) => {
    try {
        const response = await machineLearningAPI.getHistory();

        // Transform the Firestore document structure
        const historyCollection = response.data.documents.map(doc => {
            const fields = doc.fields || {};
            return {
                id: doc.name.split('/').pop(), // Extract Firestore document ID
                GenText: fields.GenText?.stringValue || null,
                predict_time: fields.predict_time?.doubleValue || null,
                predicted_class: fields.predicted_class?.stringValue || null,
                confidence: fields.confidence?.doubleValue || null,
            };
        });

        return h.response(historyCollection).code(200);
    } catch (error) {
        console.error('Error fetching data:', error);
        return h.response({ error: 'Failed to fetch data' }).code(500);
    }
};

function cleanText(input) {
    // Remove symbols and extra whitespace
    return input
        .replace(/[^a-zA-Z0-9\s.,]/g, "") // Remove non-alphanumeric and non-basic punctuation
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Trim leading and trailing spaces
}

export {uploadImage, getHistory};