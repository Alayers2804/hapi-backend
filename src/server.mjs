import dotenv from 'dotenv';
import { startTokenValidation } from './util/tokenStore.mjs';
import createServer from './config/hapi.mjs'; 

// Load environment variables
dotenv.config();

const init = async () => {
    const server = await createServer();

    startTokenValidation();

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();