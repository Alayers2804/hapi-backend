import dotenv from 'dotenv';
import axios from 'axios';


dotenv.config();

const firestoreBaseURL = 'https://firestore.googleapis.com/v1';
const authBaseURL = 'https://identitytoolkit.googleapis.com/v1/';
const refreshTokenURL = 'https://securetoken.googleapis.com/v1/token'
const machineLearningURL = process.env.MACHINE_LEARNING_URL;

const projectId = process.env.FIREBASE_PROJECT_ID;
const apiKey = process.env.FIREBASE_API_KEY

const usersCollection = process.env.USERS_COLLECTION;
const historyCollection = process.env.HISTORY_COLLECTION;

const firestoreAPI = {
    getUsers: () => axios.get(`${firestoreBaseURL}/projects/${projectId}/databases/(default)/documents/${usersCollection}`),
    addUser: (data) => axios.post(`${firestoreBaseURL}/projects/${projectId}/databases/(default)/documents/${usersCollection}`, data),
    getUser: (id) => axios.get(`${firestoreBaseURL}/projects/${projectId}/databases/(default)/documents/${usersCollection}/${id}`),
};

const authenticationAPI = {
    signIn: (loginMethod, data) => axios.post(`${authBaseURL}${loginMethod}?key=${apiKey} `, data),
    signUp: (data) => axios.post(`${authBaseURL}accounts:signUp?key=${apiKey}`, data),
    refreshToken : (data) => axios.post(`${refreshTokenURL}?key=${apiKey}`, data)
}

const profileAPI = {
    getUserData:(idToken) => axios.post(`${authBaseURL}accounts:lookup?key=${apiKey}`, idToken),
    updateProfile:(data) => axios.post(`${authBaseURL}accounts:update?key=${apiKey}`, data)
}

const machineLearningAPI = {
    getPrediction: (data) => axios.post(machineLearningURL, data,{
        headers: {
            ...data.getHeaders(),
        }
    }),
    storeHistory : (data) => axios.post(`${firestoreBaseURL}/projects/${projectId}/databases/(default)/documents/${historyCollection}`, data),
    getHistory: () => axios.get(`${firestoreBaseURL}/projects/${projectId}/databases/(default)/documents/${historyCollection}`),

};

export { firestoreAPI, machineLearningAPI, authenticationAPI, profileAPI };