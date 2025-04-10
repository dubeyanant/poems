"use client";

import { useEffect, useRef, useState } from "react";

export default function Poem() {
	const [currentDate, setCurrentDate] = useState("");
	const [userInput, setUserInput] = useState("");
	const [isFocused, setIsFocused] = useState(false);
	const editableDivRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const today = new Date();
		const options: Intl.DateTimeFormatOptions = {
			year: "numeric",
			month: "long",
			day: "numeric",
		};
		setCurrentDate(today.toLocaleDateString(undefined, options));
	}, []);

	const handleInput = (event: React.FormEvent<HTMLDivElement>) => {
		setUserInput(event.currentTarget.textContent ?? "");
	};

	const handleFocus = () => {
		setIsFocused(true);
	};

	const handleBlur = () => {
		setIsFocused(false);
	};

	return (
		<div className="flex flex-col h-screen max-w-5xl mx-auto p-6">
			<div className="text-lg mb-4">{currentDate}</div>
			<div
				ref={editableDivRef}
				contentEditable={true}
				onInput={handleInput}
				onFocus={handleFocus}
				onBlur={handleBlur}
				suppressContentEditableWarning={true}
				className={`relative text-2xl pl-1 focus:outline-none italic ${
					!userInput && !isFocused ? "show-placeholder" : ""
				}`}
			/>
		</div>
	);
}
