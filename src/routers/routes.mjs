import {
  signInUsers,
  signUpUsers,
  getRefreshToken,
  signOutUsers,
} from "../controller/authController.mjs";
import { getProfile, updateProfile } from "../controller/profileController.mjs";
import { uploadImage, getHistory } from "../controller/mlController.mjs";
import Joi from "@hapi/joi";

export const routesPlugin = [
  {
    method: "POST",
    path: "/users/signin",
    handler: signInUsers,
  },
  {
    method: "POST",
    path: "/users/signup",
    handler: signUpUsers,
  },
  {
    method: "POST",
    path: "/users/signout",
    handler: signOutUsers,
  },
  {
    method: "POST",
    path: "/users/refreshToken",
    handler: getRefreshToken,
  },
  {
    method: "POST",
    path: "/users/getProfile",
    handler: getProfile,
  },
  {
    method: "POST",
    path: "/users/updateProfile",
    handler: updateProfile,
  },
  {
    method: "POST",
    path: "/machine-learning/upload",
    options: {
      validate: {
        payload: Joi.object({
          image: Joi.required(),
          id: Joi.string().required(),
        }),
      },
      payload: {
        maxBytes: 10485760, // 10 MB max file size
        output: "file",
        parse: true,
        multipart: true,
      },
    },
    handler: uploadImage.getPrediction,
  },
  {
    method: "POST",
    path: "/machine-learning/history",
    handler: getHistory,
  },
  {
    method: "GET",
    path: "/",
    handler: (request, h) => {
      return "hello world";
    },
  },
];

export default routesPlugin;
