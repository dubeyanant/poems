export interface Poem {
	_id: string;
	lines: string[];
}

export interface AddLineRequest {
	line: string;
}
