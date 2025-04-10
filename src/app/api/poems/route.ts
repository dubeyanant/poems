import connectToDatabase from "@/lib/mongodb"; // Adjust path if needed
import type { Collection, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

// Define an interface for your Poem data structure (optional but recommended)
interface Poem {
	_id?: ObjectId; // MongoDB automatically adds this
	date: Date;
	lines: string[];
}

export async function POST() {
	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems"); // Use your desired collection name

		// --- ID Generation Note ---
		// MongoDB automatically generates a unique `_id` (ObjectId).
		// Relying on "current + 1" for a primary ID is generally NOT recommended
		// in distributed systems like MongoDB due to potential race conditions
		// and complexity in ensuring uniqueness and sequence.
		//
		// If you absolutely need a sequential integer ID, you'd typically use a
		// separate "counters" collection to atomically increment a value.
		// However, for simplicity and standard practice, we'll use MongoDB's `_id`.
		// If you need a human-readable ID besides _id, consider adding a timestamp
		// or generating a UUID for a separate field.

		// Example: Find the highest customId if you were implementing sequential IDs (more complex)
		// const lastPoem = await poemsCollection.find().sort({ customId: -1 }).limit(1).toArray();
		// const nextId = (lastPoem[0]?.customId || 0) + 1;

		const newPoem: Poem = {
			// customId: nextId, // Uncomment and implement if using sequential IDs
			date: new Date(), // Set current date
			lines: [], // Start with an empty array of strings
		};

		const result = await poemsCollection.insertOne(newPoem);

		// You can fetch the newly created document if needed
		const createdPoem = await poemsCollection.findOne({
			_id: result.insertedId,
		});

		if (!createdPoem) {
			throw new Error("Failed to retrieve the created poem.");
		}

		console.log("Poem created successfully:", createdPoem);

		// Return the created poem data
		return NextResponse.json(createdPoem, { status: 201 }); // 201 Created

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Failed to create poem:", error);
		// Return an error response
		return NextResponse.json(
			{ message: "Failed to create poem", error: error.message },
			{ status: 500 }, // Internal Server Error
		);
	}
}
