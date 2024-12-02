import { authenticationAPI } from "../config/api.js";

const signInUsers = async (request, h) => {
    const { email, password, loginMethod = "email" } = request.payload;

    try {
        // Default to email if loginMethod is not provided or empty
        let endpoint;
        if (loginMethod.toLowerCase() === "email") {
            endpoint = "accounts:signInWithPassword"; // Firebase REST API endpoint for email/password
        } else {
            return h.response({ error: "Unsupported login method" }).code(400);
        }

        // Prepare the payload for email/password authentication
        const data = {
            email: email,
            password: password,
            returnSecureToken: true, // This is required for Firebase email/password authentication
        };

        // Call the authentication API with the resolved endpoint
        const response = await authenticationAPI.signIn(endpoint, data);

        // Return the successful response
        return h.response({
            message: "Sign-in successful",
            idToken: response.data.idToken,
            email: email,
            registered: response.data.registered,
            refreshToken: response.data.refreshToken,
            localId: response.data.localId,
            expiresIn: response.data.expiresIn,
        }).code(200);
    } catch (error) {
        // Log error details for debugging
        console.error("Error during sign-in:", error.response?.data || error.message);

        // Customize the error response
        const statusCode = error.response?.status || 500;
        const errorDetails = error.response?.data?.error?.message || error.message;

        return h.response({
            error: "Failed to sign in",
            statusCode,
            details: errorDetails,
        }).code(statusCode);
    }
};

const signUpUsers = async (request, h) => {

    const { email, password } = request.payload;

    try {

        const data = {
            email: email,
            password: password,
            returnSecureToken: true
        }

        const response = await authenticationAPI.signUp(data)

        return h.response({
            message: "Sign-up successful",
            idToken: response.data.idToken,
            email: email,
            refreshToken: response.data.refreshToken,
            expiresIn: response.data.expiresIn,
            localId: response.data.localId,
        }).code(200);


    } catch (error) {
        console.error("Error during sign-in:", error.response?.data || error.message);

        // Customize the error response
        const statusCode = error.response?.status || 500;
        const errorDetails = error.response?.data?.error?.message || error.message;

        return h.response({
            error: "Failed to sign up",
            statusCode,
            details: errorDetails,
        }).code(statusCode);
    }
}

const getRefreshToken = async (request, h) => {

    const { grant_type = "refresh_token", refresh_token } = request.payload;

    try {
        const data = {
            grant_type: grant_type,
            refresh_token: refresh_token
        }

        const response = await authenticationAPI.refreshToken(data)
        

        return h.response({
            expires_in : response.data.expires_in,
            token_type : response.data.token_type,
            refresh_token : response.data.refresh_token,
            id_token : response.data.id_token,
            user_id:response.data.user_id,
            project_id : response.data.project_id
        })

    } catch (error) {

        console.error("Error getting refresh token", error.response?.data || error.message);

        // Customize the error response
        const statusCode = error.response?.status || 500;
        const errorDetails = error.response?.data?.error?.message || error.message;

        return h.response({
            error: "Error getting refresh token",
            statusCode,
            details: errorDetails,
        }).code(statusCode);

    }
}




export { signInUsers, signUpUsers, getRefreshToken };