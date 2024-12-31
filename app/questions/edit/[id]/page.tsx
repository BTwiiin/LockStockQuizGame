"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type QuestionData = {
  id: number;
  text: string;
  hint1: string;
  hint2: string;
  correctAnswer?: number;
};

export default function EditQuestionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const questionId = parseInt(params.id, 10);

  const [text, setText] = useState("");
  const [hint1, setHint1] = useState("");
  const [hint2, setHint2] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function fetchQuestion() {
      try {
        setLoading(true);
        const res = await fetch(`/api/questions/${questionId}`);
        if (!res.ok) {
          const msg = await res.json();
          throw new Error(msg.error || "Failed to fetch question");
        }
        const data: QuestionData = await res.json();
        setText(data.text);
        setHint1(data.hint1);
        setHint2(data.hint2);
        // Convert to string for input
        setCorrectAnswer(data.correctAnswer?.toString() || "");
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchQuestion();
  }, [questionId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      const res = await fetch(`/api/questions/${questionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, hint1, hint2, correctAnswer }),
      });
      if (!res.ok) {
        const msg = await res.json();
        throw new Error(msg.error || "Failed to update question");
      }
      await res.json();
      setSuccess(true);
      // router.push("/questions/all");
    } catch (err: any) {
      setError(err.message);
    }
  }

  // ...render form same as above, with correctAnswer input
  // ...
}
