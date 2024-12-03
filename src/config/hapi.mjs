import Hapi from '@hapi/hapi';
import Joi from '@hapi/joi';
import Inert from '@hapi/inert';
import routes from '../routers/routes.mjs';

const createServer = async () => {
    const server = Hapi.server({
        port: process.env.PORT || 8080,
        host: "0.0.0.0",
    });

    server.route(routes);
    await server.register(Inert);
    server.validator(Joi);

    return server;
};

export default createServer;