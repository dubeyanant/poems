"use client";

import { useEffect, useState } from "react";
import QuoteDisplay from "@/components/QuoteDisplay";
import PoemEditor from "@/components/PoemEditor";

export default function Home() {
  const [showPoem, setShowPoem] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowPoem(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return <div>{showPoem ? <PoemEditor /> : <QuoteDisplay />}</div>;
}
