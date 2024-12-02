import { firestoreAPI } from "../config/api.js";

const getUsers = async (request, h) => {
    try {
        const response = await firestoreAPI.getUsers();
        const usersList = response.data.documents.map(doc => ({
            id: doc.name.split('/').pop(),
            ...doc.fields,
        }));
        return h.response(usersList).code(200);
    } catch (error) {
        console.error('Error fetching data:', error);
        return h.response({ error: 'Failed to fetch data' }).code(500);
    }
};

const getUserById = async (request, h) => {
    try {
        const { id } = request.params; // Extract the ID from the request parameters
        const response = await firestoreAPI.getUser(id); // Call Firestore API with the document ID

        if (!response.data || !response.data.fields) {
            return h.response({ error: 'User not found' }).code(404); // Handle not found
        }

        const user = {
            id: response.data.name.split('/').pop(),
            ...Object.keys(response.data.fields).reduce((acc, key) => {
                acc[key] = response.data.fields[key].stringValue; // Convert Firestore fields format
                return acc;
            }, {}),
        };

        return h.response(user).code(200);
    } catch (error) {
        console.error('Error fetching user by ID:', error);
        return h.response({ error: 'Failed to fetch user data' }).code(500);
    }
};

const addUsers = async (request, h) => {
    try {
        const { Email, Name, Phone, Photo } = request.payload;

        const data = {
            fields: {
                Email: { stringValue: Email },
                Name: { stringValue: Name },
                Phone: { stringValue: Phone },
                Photo: { stringValue: Photo },
            },
        };

        const response = await firestoreAPI.addUser(data);

        if (response.status === 403) {
            return h
                .response({ error: 'Unauthorized to access this, please contact administrator' })
                .code(403);
        }

        return h.response({
            message: 'Data added successfully',
            documentPath: response.data.name, 
        }).code(201);
    } catch (error) {
        console.error('Error adding data:', error);
        return h.response({ error: 'Failed to add data' }).code(500);
    }
};

export { getUsers, getUserById, addUsers };