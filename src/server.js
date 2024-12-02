import dotenv from 'dotenv'; // Use import for ESM
import createServer from './config/hapi.js'; // Use `.js` extension for ESM

// Load environment variables
dotenv.config();

const init = async () => {
    const server = await createServer();

    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.error(err);
    process.exit(1);
});

init();