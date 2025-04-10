"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/home");
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex flex-col  justify-center items-center h-screen max-w-5xl mx-auto p-6 text-center">
      <h3>
        “There is no greater agony than bearing an untold story inside you.”
      </h3>
      <h4>— Maya Angelou —</h4>
    </div>
  );
}
