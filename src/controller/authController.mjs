import { authenticationAPI } from "../config/api.mjs";
import { setTokens, clearTokens, isTokenExpired, getIdToken } from "../util/tokenStore.mjs";

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

    setTokens(
      response.data.localId,
      response.data.idToken,
      response.data.refreshToken
    );

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

    setTokens(
      response.data.localId,
      response.data.idToken,
      response.data.refreshToken
    );

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

export { signInUsers, signUpUsers, getRefreshToken };
