"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type QuestionData = {
  id: number;
  text: string;
  hint1: string;
  hint2: string;
  correctAnswer: number;
};

type EditQuestionPageProps = {
  // NOTE: 'params' is now a Promise containing { id: string }
  params: Promise<{
    id: string;
  }>;
};

export default function EditQuestionPage({ params }: EditQuestionPageProps) {
  const router = useRouter();

  // We'll store the unwrapped ID here
  const [questionId, setQuestionId] = useState<number | null>(null);

  // Form fields
  const [text, setText] = useState("");
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState(0);

  // State for fetching/updating
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  /**
   * 1. Unwrap the 'params' promise to get { id }
   * 2. Set questionId in state
   */
  useEffect(() => {
    let isMounted = true;
    params
      .then((unwrapped) => {
        if (isMounted) {
          const numericId = parseInt(unwrapped.id, 10);
          setQuestionId(numericId);
        }
      })
      .catch((err) => {
        setError(err.message);
      });
    return () => {
      isMounted = false;
    };
  }, [params]);

  /**
   * 2. Once we have questionId, fetch question data
   */
  useEffect(() => {
    if (questionId == null) return; // wait until we unwrap the ID

    async function fetchQuestion() {
      try {
        setLoading(true);
        setError("");

        const res = await fetch(`/api/questions/${questionId}`);
        if (!res.ok) {
          const msg = await res.json().catch(() => ({}));
          throw new Error(msg.error || "Failed to fetch question");
        }

        const data: QuestionData = await res.json();
        setText(data.text);
        setHint1(data.hint1);
        setHint2(data.hint2);
        setCorrectAnswer(data.correctAnswer)
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchQuestion();
  }, [questionId]);

  // Handle form submission (PUT request)
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (questionId == null) {
      setError("No valid question ID");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, hint1, hint2 }),
      });

      if (!res.ok) {
        const msg = await res.json().catch(() => ({}));
        throw new Error(msg.error || "Failed to update question");
      }

      // Updated question (not used here, but we consume it to avoid memory leaks)
      await res.json();

      setSuccess(true);
      // router.push("/questions/all"); // optionally navigate away
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  // Loading / error
  if (loading) {
    return <div className="p-4 text-center">Loading question...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  if (questionId == null) {
    // We haven't unwrapped params yet
    return <div className="p-4 text-center">Unwrapping params...</div>;
  }

  // Render form
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-xl">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Edit Question #{questionId}
        </h1>
        {success && (
          <p className="text-center text-green-600 mb-2">
            Question updated successfully!
          </p>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Question Text (resizable) */}
          <div>
            <label className="block font-medium mb-1">Question Text</label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="border border-gray-300 px-3 py-2 w-full rounded resize overflow-auto"
              rows={3}
            />
          </div>

          {/* Hint 1 (resizable) */}
          <div>
            <label className="block font-medium mb-1">Hint 1</label>
            <textarea
              value={hint1}
              onChange={(e) => setHint1(e.target.value)}
              className="border border-gray-300 px-3 py-2 w-full rounded resize overflow-auto"
              rows={2}
            />
          </div>

          {/* Hint 2 (resizable) */}
          <div>
            <label className="block font-medium mb-1">Hint 2</label>
            <textarea
              value={hint2}
              onChange={(e) => setHint2(e.target.value)}
              className="border border-gray-300 px-3 py-2 w-full rounded resize overflow-auto"
              rows={2}
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Answer</label>
            <input
              value={correctAnswer}
              type="number"
              onChange={(e) => setCorrectAnswer(parseFloat(e.target.value))}
              className="border border-gray-300 px-3 py-2 w-full rounded resize overflow-auto"
            />
          </div>
          <div className="flex justify-between">
            <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
                Обновить вопрос
            </button>
            <button
                type="button"
                onClick={async () => {
                    try {
                    const res = await fetch(`/api/questions/${questionId}`, { method: "DELETE" });
                    if (!res.ok) {
                        const msg = await res.json();
                        throw new Error(msg.error || "Failed to delete question");
                    }
                    // redirect or show a message
                    alert("Question deleted!");
                    router.push("/questions/all"); // for example
                    } catch (err: any) {
                    setError(err.message);
                    }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                Удалить вопрос
                </button>
            </div>
        </form>
      </div>
    </div>
  );
}
