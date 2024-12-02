import { getUserById, getUsers, addUsers } from "../controller/userController.js";
import { signInUsers, signUpUsers,getRefreshToken } from "../controller/authController.js";
import { getProfile, updateProfile } from "../controller/profileController.js";
import { uploadImage, getHistory } from "../controller/mlController.js";
import Joi from '@hapi/joi';




export const routesPlugin = [{

    method: 'GET',
    path: '/users',
    handler: getUsers,
},
{
    method: 'POST',
    path: '/users',
    handler: addUsers,

},
{
    method: 'GET',
    path: `/users/{id}`,
    handler: getUserById
},
{
    method:'POST',
    path:'/users/signin',
    handler:signInUsers
},
{
    method:'POST',
    path:'/users/signup',
    handler:signUpUsers
},
{
    method:'POST',
    path:"/users/refreshToken",
    handler:getRefreshToken
},
{
    method:'POST',
    path:"/users/getProfile",
    handler:getProfile
},
{
    method:'POST',
    path:"/users/updateProfile",
    handler:updateProfile
},
{
    method: 'POST',
    path: '/machine-learning/upload',
    options: {
        validate: {
            payload: Joi.object({
                image: Joi.required(),
            }),
        },
        payload: {
            maxBytes: 10485760, // 10 MB max file size
            output: 'file',
            parse: true,
            multipart: true
        },
    },
    handler: uploadImage.getPrediction,
},
{
    method:'GET',
    path:'/machine-learning/history',
    handler:getHistory,
},
{
    method: 'GET',
    path: '/',
    handler: (request, h) => {
        return "hello world";
    },
}
];

export default routesPlugin;


