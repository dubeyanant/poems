import { type Db, MongoClient, ServerApiVersion } from "mongodb";

if (!process.env.MONGODB_URI) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_URI"');
}
if (!process.env.MONGODB_DB) {
	throw new Error('Invalid/Missing environment variable: "MONGODB_DB"');
}

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;
const options = {
	serverApi: {
		version: ServerApiVersion.v1,
		strict: true,
		deprecationErrors: true,
	},
};

let client: MongoClient | null = null;
let clientPromise: Promise<MongoClient> | null = null;
let cachedDb: Db | null = null;

async function connectToDatabase(): Promise<{ client: MongoClient; db: Db }> {
	if (cachedDb && client) {
		console.log("=> using cached database instance");
		return { client, db: cachedDb };
	}

	if (process.env.NODE_ENV === "development") {
		// In development mode, use a global variable so that the value
		// is preserved across module reloads caused by HMR (Hot Module Replacement).
		// Ensure the clientPromise is correctly typed globally
		const globalWithMongo = global as typeof globalThis & {
			_mongoClientPromise?: Promise<MongoClient>;
		};

		if (!globalWithMongo._mongoClientPromise) {
			client = new MongoClient(uri, options);
			globalWithMongo._mongoClientPromise = client.connect();
			console.log("=> creating new development connection");
		}
		clientPromise = globalWithMongo._mongoClientPromise;
	} else {
		// In production mode, it's best to not use a global variable.
		if (!clientPromise) {
			client = new MongoClient(uri, options);
			clientPromise = client.connect();
			console.log("=> creating new production connection");
		}
	}

	try {
		const connectedClient = await clientPromise;
		const db = connectedClient.db(dbName);
		client = connectedClient; // Cache the client
		cachedDb = db; // Cache the db instance
		console.log("=> connected to database:", dbName);
		return { client: connectedClient, db };
	} catch (e) {
		console.error("Failed to connect to MongoDB", e);
		// If connection fails, reset the promise to allow retrying
		clientPromise = null;
		client = null;
		cachedDb = null;
		throw e; // Re-throw the error to be handled by the caller
	}
}

export default connectToDatabase;
