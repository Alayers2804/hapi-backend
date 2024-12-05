import { authenticationAPI } from "../config/api.mjs";
import {
  setTokens,
  clearTokens,
  isTokenExpired,
  getIdToken,
} from "../util/tokenStore.mjs";

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

    try {
      // Safely clear tokens
      try {
        clearTokens(response.data.localId);
      } catch (clearError) {
        console.warn(
          "Failed to clear existing tokens:",
          clearError.message || clearError
        );
        // You can choose to continue even if token clearing fails
      }

      // Safely set new tokens
      try {
        setTokens(
          response.data.localId,
          response.data.idToken,
          response.data.refreshToken
        );
      } catch (setError) {
        console.error(
          "Failed to set new tokens:",
          setError.message || setError
        );
        throw new Error("Critical error: Unable to update user tokens.");
      }
    } catch (tokenError) {
      // Handle any error from clearing or setting tokens
      return h
        .response({
          error: "Failed to handle authentication tokens",
          details: tokenError.message || "Unknown error",
        })
        .code(500);
    }
    // Return the successful response
    return h
      .response({
        message: "Sign-in successful",
        idToken: response.data.idToken,
        email: email,
        registered: response.data.registered,
        refreshToken: response.data.refreshToken,
        localId: response.data.localId,
        expiresIn: response.data.expiresIn,
      })
      .code(200);
  } catch (error) {
    // Log error details for debugging
    console.error(
      "Error during sign-in:",
      error.response?.data || error.message
    );

    // Customize the error response
    const statusCode = error.response?.status || 500;
    const errorDetails = error.response?.data?.error?.message || error.message;

    return h
      .response({
        error: "Failed to sign in",
        statusCode,
        details: errorDetails,
      })
      .code(statusCode);
  }
};

const signUpUsers = async (request, h) => {
  const {
    email,
    password,
    name,
    photoUrl = "Not yet provided",
    phoneNumber,
  } = request.payload;

  try {
    if (!emailRegex.test(email)) {
      return h
        .response({
          error: "Invalid email format",
        })
        .code(400);
    }

    if (!phoneNumberRegex.test(phoneNumber)) {
      return h
        .response({
          error: "Invalid phone number format",
        })
        .code(400);
    }
    if (!email || !password || !name || !phoneNumber) {
      return h
        .response({
          error: "Invalid Payload request, One of the data is missing",
        })
        .code(400);
    }

    const data = {
      email: email,
      password: password,
      returnSecureToken: true,
    };

    const response = await authenticationAPI.signUp(data);

    const localId = response.data.localId;

    const customData = {
      fields: {
        email: { stringValue: email },
        password : {stringValue: password},
        name: { stringValue: name },
        phoneNumber: { stringValue: phoneNumber },
        photoUrl: { stringValue: photoUrl },
      },
    };

    (async () => {
      try {
        const firestoreResponse = await authenticationAPI.addUser(
          customData,
          localId
        );
        if (firestoreResponse.status !== 200) {
          console.error(
            "Error storing user data:",
            firestoreResponse.data?.error || "Unknown error from Firestore"
          );
        } else {
          console.log("User registered successfully in Firestore.");
        }
      } catch (error) {
        console.error(
          "Error storing data to Firestore:",
          error.response?.data || error.message || error
        );
      }
    })();

    try {
      // Safely clear tokens
      try {
        clearTokens(response.data.localId);
      } catch (clearError) {
        console.warn(
          "Failed to clear existing tokens:",
          clearError.message || clearError
        );
        // You can choose to continue even if token clearing fails
      }

      // Safely set new tokens
      try {
        setTokens(
          response.data.localId,
          response.data.idToken,
          response.data.refreshToken
        );
      } catch (setError) {
        console.error(
          "Failed to set new tokens:",
          setError.message || setError
        );
        throw new Error("Critical error: Unable to update user tokens.");
      }
    } catch (tokenError) {
      // Handle any error from clearing or setting tokens
      return h
        .response({
          error: "Failed to handle authentication tokens",
          details: tokenError.message || "Unknown error",
        })
        .code(500);
    }

    return h
      .response({
        message: "Sign-up successful",
        idToken: response.data.idToken,
        email: email,
        refreshToken: response.data.refreshToken,
        expiresIn: response.data.expiresIn,
        localId: response.data.localId,
      })
      .code(200);
  } catch (error) {
    console.error(
      "Error during sign-up:",
      error.response?.data || error.message
    );

    // Customize the error response
    const statusCode = error.response?.status || 500;
    const errorDetails = error.response?.data?.error?.message || error.message;

    return h
      .response({
        error: "Failed to sign up",
        statusCode,
        details: errorDetails,
      })
      .code(statusCode);
  }
};

const signOutUsers = async (request, h) => {
  const { id } = request.payload; // Assuming `userId` is sent in the request

  try {
    if(getIdToken(id) == "" || getIdToken(id) == null){
        return h.response({message:"Not found, Please Log in first"}).code(404)
    }
    clearTokens(id);

    // Optionally notify the server or perform any other cleanup actions
    console.log(`User ${id} has been successfully signed out.`);

    return h.response({ message: "Sign-out successful" }).code(200);
  } catch (error) {
    console.error("Error during sign-out:", error.message || error);

    return h
      .response({
        error: "Failed to sign out",
        details: error.message || error,
      })
      .code(500);
  }
};

const getRefreshToken = async (userId) => {
  const userTokens = getIdToken(userId);
  if (!userTokens) throw new Error("User tokens not found.");

  try {
    const data = {
      grant_type: "refresh_token",
      refresh_token: userTokens.refreshToken,
    };

    const response = await authenticationAPI.refreshToken(data);
    setTokens(
      userId,
      response.data.id_token,
      response.data.refresh_token,
      response.data.expires_in
    );
    console.log(`Tokens refreshed for user ${userId}`);
  } catch (error) {
    console.error(
      "Error refreshing token:",
      error.response?.data || error.message
    );
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneNumberRegex = /^\+?[0-9]{7,15}$/;

export { signInUsers, signUpUsers, getRefreshToken, signOutUsers };
