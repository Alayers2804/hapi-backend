import dotenv from 'dotenv';
import axios from 'axios';


dotenv.config();

const projectId = process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.FIREBASE_API_KEY

const firestoreBaseURL = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/`;
const authBaseURL = 'https://identitytoolkit.googleapis.com/v1/';
const refreshTokenURL = 'https://securetoken.googleapis.com/v1/token'
const machineLearningURL = process.env.MACHINE_LEARNING_URL;

const usersCollection = process.env.USERS_COLLECTION;
const historyCollection = process.env.HISTORY_COLLECTION;

const authenticationAPI = {
    signIn: (loginMethod, data) => axios.post(`${authBaseURL}${loginMethod}?key=${apiKey} `, data),
    signUp: (data) => axios.post(`${authBaseURL}accounts:signUp?key=${apiKey}`, data),
    refreshToken : (data) => axios.post(`${refreshTokenURL}?key=${apiKey}`, data),
    addUser: (data, id) => axios.post(`${firestoreBaseURL}${usersCollection}?documentId=${id}`, data),
    getUser: (id) => axios.get(`${firestoreBaseURL}${usersCollection}/${id}`),
}

const profileAPI = {
    getUserData:(idToken) => axios.post(`${authBaseURL}accounts:lookup?key=${apiKey}`, idToken),
    updateProfile:(data) => axios.post(`${authBaseURL}accounts:update?key=${apiKey}`, data),
    updateData:(localId,data) => axios.patch(`${firestoreBaseURL}${usersCollection}/${localId}`, data)
}

const machineLearningAPI = {
    getPrediction: (data) => axios.post(machineLearningURL, data,{
        headers: {
            ...data.getHeaders(),
        }
    }),
    storeHistory : (data) => axios.post(`${firestoreBaseURL}${historyCollection}`, data),
    getHistory: () => axios.get(`${firestoreBaseURL}${historyCollection}`),

};

export { machineLearningAPI, authenticationAPI, profileAPI };