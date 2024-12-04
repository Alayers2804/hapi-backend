import { authenticationAPI, profileAPI } from "../config/api.mjs";
import { getIdToken, setTokens } from "../util/tokenStore.mjs";

const updateProfile = async (request, h) => {
  const { id, name, photoUrl } = request.payload;

  const idToken = getIdToken(id);

  console.log("idToken", idToken);

  try {
    const data = {
      idToken: idToken,
      displayName: name,
      photoUrl: photoUrl,
      returnSecureToken: true,
    };

    const firestoreData = {
      fields: {
        name: { stringValue: name },
        photoUrl: { stringValue: photoUrl },
      },
    };

    const authenticationResponse = await profileAPI.updateProfile(data);

    const updateFirestoreData = await profileAPI.updateData(id, firestoreData);

    console.log("Authentication update response:", authenticationResponse.data);

    console.log("Firestore update response:", updateFirestoreData.data);

    const updatedFields = updateFirestoreData.data.fields;

    return h
      .response({
        email: authenticationResponse.data.email,
        name: updatedFields.name.stringValue, // Extract name from Firestore fields
        photoUrl: updatedFields.photoUrl.stringValue, // Extract photoUrl from Firestore fields
      })
      .code(200);
  } catch (error) {
    console.error(
      "Error update data user",
      error.response?.data || error.message
    );

    // Customize the error response
    const statusCode = error.response?.status || 404;
    const errorDetails = error.response?.data?.error?.message || error.message;

    return h
      .response({
        error: "Error updating data user",
        statusCode,
        details: errorDetails,
      })
      .code(statusCode);
  }
};

const getProfile = async (request, h) => {
  const { id } = request.payload;

  try {
    let idToken = getIdToken(id);
    if (!idToken) {
      return h.response({ error: "ID token not found" }).code(400); // Error if ID token is missing
    }

    const response = await profileAPI.getUserData({ idToken });

    console.log("authentication response", response)

    const firestoreResponse = await authenticationAPI.getUser(id);

    console.log("firestore response", firestoreResponse)
    
    const userData = {
      id: id,
      emailVerified : response.data.users[0].emailVerified,
      createdAt : response.data.users[0].createdAt,
      validSince : response.data.users[0].validSince,
      ...Object.keys(firestoreResponse.data.fields).reduce((acc, key) => {
        acc[key] = firestoreResponse.data.fields[key].stringValue; // Convert Firestore fields format
        return acc;
      }, {}),
    };

    return h.response(userData).code(200);
  } catch (error) {
    console.error("Error getting data user:", error);

    if (error.response) {
      console.error("Response error data:", error.response.data);
      console.error("Response error status:", error.response.status);
    }

    // Customize error response
    const statusCode = error.response?.status || 500; // Default to 500 if no status is provided
    const errorDetails = error.response?.data?.error?.message || error.message;

    return h
      .response({
        error: "Error getting data user",
        statusCode,
        details: errorDetails,
      })
      .code(statusCode);
  }
};

export { getProfile, updateProfile };
