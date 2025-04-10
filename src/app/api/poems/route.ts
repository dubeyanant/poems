import connectToDatabase from "@/lib/mongodb";
import type { Poem } from "@/types/poem";
import type { Collection } from "mongodb";
import { NextResponse } from "next/server";

export async function POST() {
	try {
		const { db } = await connectToDatabase();
		const poemsCollection: Collection<Poem> = db.collection("poems");

		// Get current date and format as DDMMYY
		const now = new Date();
		const day = now.getDate().toString().padStart(2, "0");
		const month = (now.getMonth() + 1).toString().padStart(2, "0"); // Month is 0-indexed
		const year = now.getFullYear().toString().slice(-2); // Last two digits of year
		const customId = `${day}${month}${year}`;

		// Check if a poem with this ID already exists
		const existingPoem = await poemsCollection.findOne({ _id: customId });
		if (existingPoem) {
			return NextResponse.json(
				{
					message: `A poem for today (ID: ${customId}) already exists.`,
				},
				{ status: 409 }, // Conflict
			);
		}

		const newPoem: Poem = {
			_id: customId,
			lines: [],
		};

		const result = await poemsCollection.insertOne(newPoem);

		console.log(`Poem created successfully with ID: ${customId}`);

		// Return the created poem data
		return NextResponse.json(newPoem, { status: 201 }); // 201 Created

		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	} catch (error: any) {
		console.error("Failed to create poem:", error);
		return NextResponse.json(
			{ message: "Failed to create poem", error: error.message },
			{ status: 500 },
		);
	}
}
