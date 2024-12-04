import { getRefreshToken } from "../controller/authController.mjs";
let tokens = {};

const setTokens = (localId, idToken, refreshToken, expiresIn) => {
    const expirationTime = Date.now() + expiresIn * 1000; // Calculate expiration in milliseconds
    tokens[localId] = { idToken, refreshToken, expirationTime };
};

const getIdToken = (localId) => {
    const userTokens = tokens[localId];
    if (!userTokens) return null; // Token not found
  
    // Check if token is expired and refresh if necessary
    if (isTokenExpired(localId)) {
      console.log(`Token expired for user ${localId}, refreshing...`);
      getRefreshToken(localId); // Implement this function to refresh the token
      return userTokens.idToken; // Return the old idToken temporarily while refreshing
    }
  
    return userTokens.idToken;
  };
const clearTokens = (localId) => {
    delete tokens[localId];
};

const isTokenExpired = (localId) => {
    const userTokens = tokens[localId];
    if (!userTokens) return true;
    return Date.now() > userTokens.expirationTime;
};

const startTokenValidation = () => {
    setInterval(async () => {
        const localIds = Object.keys(tokens);
        for (const localId of localIds) {
            if (isTokenExpired(localId)) {
                console.log(`Token expired for user ${localId}. Refreshing...`);
                await getRefreshToken(localId);
            }
        }
    }, 60 * 1000); // Check every 1 minute
};


export { setTokens, getIdToken, clearTokens, isTokenExpired, startTokenValidation };