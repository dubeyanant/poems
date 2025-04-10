import type { ObjectId } from "mongodb";

export interface Poem {
	_id: string; // Custom ID in DDMMYY format
	lines: string[];
}
