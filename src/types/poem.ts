import type { ObjectId } from "mongodb";

export interface Poem {
	_id?: ObjectId; // MongoDB automatically adds this
	date: Date;
	lines: string[];
}
