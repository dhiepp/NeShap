const MongoClient = require('mongodb').MongoClient;

// Connection URL and database name
// const url = 'mongodb://localhost:27017';
// Heroku config var
const url = process.env.DATABASE_URL;
const dbName = 'neshap';
let client;

// Use connect method to connect to the server
async function connect() {
	client = await MongoClient.connect(url, { useUnifiedTopology: true });
}

module.exports = {
	async getCollection(name) {
		if (client === undefined) {
			await connect();
		}
		return client.db(dbName).collection(name);
	},
};
