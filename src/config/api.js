import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const userBaseURL = 'https://firestore.googleapis.com/v1';
const authBaseURL = 'https://identitytoolkit.googleapis.com/v1/';
const machineLearningURL = "https://ml-api-279551392308.asia-southeast1.run.app/predict_image";

const projectId = process.env.FIREBASE_PROJECT_ID;
const collection = 'users';

const firestoreAPI = {
    getUsers: () => axios.get(`${userBaseURL}/projects/${projectId}/databases/(default)/documents/${collection}`),
    addUser: (data) => axios.post(`${userBaseURL}/projects/${projectId}/databases/(default)/documents/${collection}`, data),
    getUser: (id) => axios.get(`${userBaseURL}/projects/${projectId}/databases/(default)/documents/${collection}/${id}`),
};

const authenticationAPI = {
    signIn: (loginMethod, data) => axios.post(`${authBaseURL}${loginMethod}?key=${process.env.FIREBASE_API_KEY} `, data),
    signUp: (data) => axios.post(`${authBaseURL}accounts:signUp?key=${process.env.FIREBASE_API_KEY}`, data)
}

const machineLearningAPI = {
    getPrediction: (data) => axios.post(machineLearningURL, data,{
        headers: {
            ...data.getHeaders(),
        }
    }),
};

export { firestoreAPI, machineLearningAPI, authenticationAPI };