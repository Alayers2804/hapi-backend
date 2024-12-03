import { profileAPI } from "../config/api.mjs";

const updateProfile = async (request, h) => {

    const { idToken, displayName, photoUrl } = request.payload

    try {

        const data = {
            idToken: idToken,
            displayName: displayName,
            photoUrl: photoUrl,
            returnSecureToken: true
        }

        const response = await profileAPI.updateProfile(data)

        console.log(response.data)

        return h.response({
            email: response.data.email,
            displayName: response.data.displayName,
            photoUrl: response.data.photoUrl,
            idToken: response.data.idToken,
            refreshToken: response.data.refreshToken,
            exipresIn: response.data.exipresIn
        })

    } catch (error) {

        console.error("Error getting data user", error.response?.data || error.message);

        // Customize the error response
        const statusCode = error.response?.status || 404;
        const errorDetails = error.response?.data?.error?.message || error.message;

        return h.response({
            error: "Error getting data user",
            statusCode,
            details: errorDetails,
        }).code(statusCode);

    }

}


const getProfile = async (request, h) => {

    const { idToken } = request.payload

    try {

        const response = await profileAPI.getUserData({idToken});

        if (!response.data.users || response.data.users.length === 0) {
            return h.response({ error: "No users found" }).code(404);
        }

        const user = response.data.users[0];

        const userData = {
            email: user.email,
            displayName: user.displayName || "No display name provided",
            photoUrl: user.photoUrl || "No photo URL provided",
        };

        return h.response(userData).code(200);

    } catch (error) {

        console.error("Error getting data user", error.response?.data || error.message);

        // Customize the error response
        const statusCode = error.response?.status || 404;
        const errorDetails = error.response?.data?.error?.message || error.message;

        return h.response({
            error: "Error getting data user",
            statusCode,
            details: errorDetails,
        }).code(statusCode);

    }

}

export { getProfile, updateProfile };