"use client";

import React, { useState, useEffect, KeyboardEvent } from "react";

type QuestionData = {
  id: number;          // DB ID
  text: string;
  hint1: string;
  hint2: string;
  correctAnswer: number;  // float
};

export default function QuestionPage() {
  // 1) Fetched questions from /api/questions
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintsRevealed, setHintsRevealed] = useState(0);
  const [answerRevealed, setAnswerRevealed] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchQuestions() {
      try {
        setLoading(true);
        setError("");
        const res = await fetch("/api/questions");
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

    fetchQuestions();
  }, []);

  // Handle pressing Enter
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Enter") {
        if (hintsRevealed < 2) {
          // Reveal Hint 1 or Hint 2
          setHintsRevealed((prev) => prev + 1);
        } else if (!answerRevealed) {
          // After showing both hints, reveal the correct answer
          setAnswerRevealed(true);
        } else {
          // Move to next question
          setHintsRevealed(0);
          setAnswerRevealed(false);
          setCurrentIndex((prev) => prev + 1);
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown as any);
    return () => window.removeEventListener("keydown", handleKeyDown as any);
  }, [hintsRevealed, answerRevealed]);

  // Loading or error states
  if (loading) {
    return <div className="p-4 text-center">Loading questions...</div>;
  }
  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  // If we have no questions or passed the last question
  if (currentIndex >= questions.length || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-blue-700 shadow-md rounded-lg p-6 max-w-lg w-full text-center">
          <h2 className="text-2xl font-bold mb-4 text-gray-300">Game Over</h2>
          <p className="text-lg text-gray-300">No more questions left!</p>
        </div>
      </div>
    );
  }

  // Current question
  const question = questions[currentIndex];
  const questionNumber = currentIndex + 1;

  const showHint1 = hintsRevealed >= 1;
  const showHint2 = hintsRevealed >= 2;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-blue-700 shadow-md rounded-lg p-6 max-w-lg w-full">
        <h2 className="text-2xl font-bold mb-2 text-center text-gray-300">
          Вопрос #{questionNumber}
        </h2>

        <p className="mb-4 text-center text-gray-300">{question.text}</p>

        {/* Display Hints */}
        <div className="space-y-2 text-center text-gray-100">
          {showHint1 && (
            <p className="font-semibold text-gray-300">
              Подсказка 1: {question.hint1}
            </p>
          )}
          {showHint2 && (
            <p className="font-semibold text-gray-300">
              Подсказка 2: {question.hint2}
            </p>
          )}
        </div>

        {/* Display Correct Answer ONLY after Hint 2 is revealed AND next Enter */}
        {answerRevealed && (
          <div className="mt-4 text-center text-yellow-300 font-bold">
            Правильный ответ: {question.correctAnswer}
          </div>
        )}

        <p className="mt-4 text-sm text-black text-center">
          Press <kbd className="bg-gray-200 p-1 rounded">Enter</kbd> to reveal
          hints, show the correct answer, or advance to the next question.
        </p>
      </div>
    </div>
  );
}
