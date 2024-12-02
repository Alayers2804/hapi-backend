import { machineLearningAPI } from '../config/api.js';
import FormData from 'form-data';
import fs from 'fs';

const uploadController = {
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

            const responseJson = {
                data: cleanedText,
                predict_time: response.data.data.predict_time,
                predicted_class : response.data.data.predicted_class,
                confidence : response.data.data.confidence 
            }

            console.log(JSON.stringify(responseJson, null, 2));

            return h.response(responseJson).code(200);

            

        } catch (error) {
            console.error('Error uploading file:', error);
            return h.response({ error: 'File upload failed' }).code(500);
        }
    },
};

function cleanText(input) {
    // Remove symbols and extra whitespace
    return input
        .replace(/[^a-zA-Z0-9\s.,]/g, "") // Remove non-alphanumeric and non-basic punctuation
        .replace(/\s+/g, " ") // Replace multiple spaces with a single space
        .trim(); // Trim leading and trailing spaces
}

export default uploadController;