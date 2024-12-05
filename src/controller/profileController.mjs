import { authenticationAPI, profileAPI } from "../config/api.mjs";
import { getIdToken, setTokens } from "../util/tokenStore.mjs";

const updateProfile = async (request, h) => {
  const { id, name, photoUrl } = request.payload;

  let idToken = getIdToken(id);
  if (idToken == "" || idToken == null) {
    return h
      .response({ error: "ID token not found, Please Login First" })
      .code(401);
  }

  if (name == null || name == "") {
    return h.response({ error: "Please provide new name" }.code(400));
  }

  if (photoUrl == null || photoUrl == "") {
    return h.response({ error: "Please provide new photo profile" });
  }

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

    const updateMaskFieldPaths = Object.keys(firestoreData.fields)
      .map((key) => `updateMask.fieldPaths=${key}`)
      .join("&");

    const authenticationResponse = await profileAPI.updateProfile(data);

    const updateFirestoreData = await profileAPI.updateData(
      id,
      firestoreData,
      updateMaskFieldPaths
    );

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
    if (idToken == "" || idToken == null) {
      return h
        .response({ error: "ID token not found, Please Login First" })
        .code(401);
    }

    const response = await profileAPI.getUserData({ idToken });

    console.log("authentication response", response);

    const firestoreResponse = await authenticationAPI.getUser(id);

    console.log("firestore response", firestoreResponse);

    const userData = {
      id: id,
      emailVerified: response.data.users[0].emailVerified,
      createdAt: response.data.users[0].createdAt,
      validSince: response.data.users[0].validSince,
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
