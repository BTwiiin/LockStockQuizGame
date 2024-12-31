"use client";

import { useState } from "react";

export default function NewQuestionPage() {
  const [text, setText] = useState("");
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, hint1, hint2, correctAnswer }),
      });

      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || "Failed to create question");
      }

      // Created question
      await res.json();
      setSuccess(true);
      // Clear form
      setText("");
      setHint1("");
      setHint2("");
      setCorrectAnswer("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Add New Question</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label>Question Text</label>
          <input
            className="border w-full px-2 py-1"
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Hint 1</label>
          <input
            className="border w-full px-2 py-1"
            value={hint1}
            onChange={(e) => setHint1(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Hint 2</label>
          <input
            className="border w-full px-2 py-1"
            value={hint2}
            onChange={(e) => setHint2(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label>Correct Answer (float)</label>
          <input
            className="border w-full px-2 py-1"
            type="number"
            step="any" // allows float input
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(e.target.value)}
          />
        </div>

        {error && <p className="text-red-500">{error}</p>}
        {success && <p className="text-green-500">Question created!</p>}

        <button type="submit" className="bg-blue-500 text-white px-3 py-1">
          Submit
        </button>
      </form>
    </div>
  );
}
