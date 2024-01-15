const mongoose = require('mongoose');

async function connectToDatabase() {
    try {
        await mongoose.connect(`mongodb://${Bun.env.DB_USER}:${Bun.env.DB_PWD}@${Bun.env.DB_HOST}:${Bun.env.DB_PORT}/${Bun.env.DB_NAME}`);
        console.log('Successfully connected to database', `SERVER ${Bun.env.DB_HOST} | USER ${Bun.env.DB_USER} | DB ${Bun.env.DB_NAME}`);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
}

let dbConnected = await connectToDatabase();

export { dbConnected };