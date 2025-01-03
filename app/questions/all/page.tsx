// app/questions/all/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "../../globals.css"

type QuestionData = {
  id: number;
  text: string;
  hint1: string;
  hint2: string;
  correctAnswer: number;
};

export default function AllQuestionsPage() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadAllQuestions() {
      setLoading(true);
      setError("");

      try {
        const res = await fetch("/api/questions"); // GET /api/questions
        if (!res.ok) {
          const msg = await res.json();
          throw new Error(msg.error || "Failed to fetch questions");
        }

        const data: QuestionData[] = await res.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadAllQuestions();
  }, []);

  if (loading) {
    return <div className="p-4 text-center">Loading questions...</div>;
  }
  if (error) {
    return (
      <div className="p-4 text-center text-red-500">
        Error while fetching questions: {error}
      </div>
    );
  }

  if (questions.length === 0) {
    return <div className="p-4 text-center">No questions found.</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="shadow-md rounded-lg p-6 max-w-3xl w-full max-h-[80vh] overflow-auto no-scrollbar">
        <h1 className="text-2xl font-bold mb-4 text-center text-gray-300">
          Все вопросы
        </h1>

        <table className="bg-blue-700 w-full border-collapse">
          <thead>
            <tr className="bg-blue-800 text-left">
              <th className="p-2 border text-gray-300">ID</th>
              <th className="p-2 border text-gray-300">Question</th>
              <th className="p-2 border text-gray-300">Hint 1</th>
              <th className="p-2 border text-gray-300">Hint 2</th>
              <th className="p-2 border text-gray-300">Correct</th>
              <th className="p-2 border text-center text-gray-300">Actions</th>
            </tr>
          </thead>
          <tbody>
            {questions.map((q) => (
              <tr key={q.id} className="hover:bg-blue-800">
                <td className="p-2 border text-gray-300">{q.id}</td>
                <td className="p-2 border text-gray-300">{q.text}</td>
                <td className="p-2 border text-gray-300">{q.hint1}</td>
                <td className="p-2 border text-gray-300">{q.hint2}</td>
                {/* Now we also display the correctAnswer */}
                <td className="p-2 border text-gray-300">{q.correctAnswer}</td>

                <td className="p-2 border text-center text-gray-300 space-x-2">
                  <Link href={`/questions/edit/${q.id}`}>
                    <button className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700">
                      Править
                    </button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {error && (
          <div className="mt-4 text-center text-red-500">Error: {error}</div>
        )}
      </div>
    </div>
  );
}
