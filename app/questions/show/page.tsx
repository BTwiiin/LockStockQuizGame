"use client";

import React, { useEffect, useState } from "react";
import { useGameStore } from "../../hooks/useGameStore";
import { Button } from "flowbite-react";

type QuestionData = {
  id: number;
  text: string;
  hint1: string;
  hint2: string;
  correctAnswer: number;
};

export default function QuestionPage() {
  const {
    roundPhase,
    currentQuestionIndex,
    users,
    actionIndex,
    check,
    bet,
    fold,
    pot,
    currentBet,
    nextPhase,
    awardWinner,
    startNewQuestion,
    setGuess,
  } = useGameStore();

  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [error, setError] = useState("");
  const [betValue, setBetValue] = useState(0);

  // Поле для ввода ответа (догадки) во время "guessing"
  const [guessValue, setGuessValue] = useState(0);

  // Загрузка вопросов с сервера
  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch("/api/questions");
        if (!res.ok) {
          const msg = await res.json();
          throw new Error(msg.error || "Не удалось загрузить вопросы");
        }
        const data: QuestionData[] = await res.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      }
    }
    loadQuestions();
  }, []);

  // Когда текущий индекс вопроса меняется, выбираем соответствующий вопрос
  useEffect(() => {
    if (questions[currentQuestionIndex]) {
      setQuestion(questions[currentQuestionIndex]);
    } else {
      setQuestion(null);
    }
  }, [questions, currentQuestionIndex]);

  // Если раунд перешёл в "answer", вычисляем победителя
  useEffect(() => {
    if (roundPhase === "answer" && question) {
      awardWinner(question.correctAnswer);
    }
  }, [roundPhase, question, awardWinner]);

  // Если ошибка
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  // Если нет вопроса (или всё ещё загружаются)
  if (!question) return <div className="p-4">Нет вопросов или идёт загрузка...</div>;

  // Показываем поле для ввода ответа, если сейчас фаза "guessing" и пользователь не "folded"
  const currentUser = users[actionIndex];
  const showGuessInput = roundPhase === "guessing" && currentUser && !currentUser.folded;

  return (
    <div className="flex flex-col items-center justify-center p-4 gap-4 min-h-screen">
      <div className="max-w-2xl mx-auto rounded shadow p-4 space-y-4 bg-blue-600">
        <h1 className="text-xl font-bold text-white">
          Вопрос №{currentQuestionIndex + 1}
        </h1>
        <p className="text-white">{question.text}</p>

        {/* Показываем подсказки в зависимости от roundPhase */}
        {(roundPhase === "hint1" ||
          roundPhase === "bet2" ||
          roundPhase === "hint2" ||
          roundPhase === "bet3" ||
          roundPhase === "answer") && (
          <p className="text-white">Подсказка 1: {question.hint1}</p>
        )}
        {(roundPhase === "hint2" ||
          roundPhase === "bet3" ||
          roundPhase === "answer") && (
          <p className="text-white">Подсказка 2: {question.hint2}</p>
        )}
        {roundPhase === "answer" && (
          <p className="text-yellow-400 font-semibold">
            Правильный ответ: {question.correctAnswer}
          </p>
        )}

        {/* Блок ввода ответа (догадки) на этапе "guessing" */}
        {showGuessInput && (
          <div className="border border-blue-400 p-3 rounded space-y-2">
            <p className="text-white font-semibold">
              {currentUser?.name}, введите ваш ответ:
            </p>
            <input
              type="number"
              className="border rounded px-2 py-1 w-24"
              value={guessValue}
              onChange={(e) => setGuessValue(parseFloat(e.target.value) || 0)}
            />
            <Button
              color="info"
              onClick={() => {
                setGuess(guessValue);
                setGuessValue(0);
              }}
            >
              Отправить ответ
            </Button>
          </div>
        )}

        {/* Список игроков */}
        <div className="border p-2 rounded">
          <p className="font-bold mb-2 text-white">Игроки</p>
          <div className="space-y-1">
            {users.map((u, i) => (
              <div key={u.id} className={`font-medium ${
                i === actionIndex ? "text-yellow-300" : "text-white"
              }`}>
                <span>
                  {u.name}
                </span>{" "}
                — Баланс: {u.balance} — Сброс: {u.folded ? "Да" : "Нет"}
                {roundPhase === "answer" && (
                  <>
                    {u.guess !== undefined && ` — Ответ: ${u.guess}`}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Основные действия и ставки */}
        <div className="flex flex-col space-y-2">
          <p className="text-white">
            Банк: {pot} | Текущая ставка: {currentBet}
          </p>

          {/* Управление ставками (на этапах bet1, bet2, bet3) */}
          {["bet1", "bet2", "bet3"].includes(roundPhase) && (
            <div className="flex items-center space-x-2">
              <input
                type="number"
                className="border rounded px-2 py-1 w-24"
                value={betValue}
                onChange={(e) => setBetValue(parseFloat(e.target.value) || 0)}
              />
              <Button color="info" onClick={() => bet(betValue)}>
                Ставка/Повышение
              </Button>
              <Button color="gray" onClick={() => check()}>
                Чек
              </Button>
              <Button color="failure" onClick={() => fold()}>
                Пас
              </Button>
            </div>
          )}

          {/* Кнопка для принудительного перехода к следующему этапу */}
          {roundPhase !== "answer" && (
            <Button color="warning" onClick={nextPhase}>
              Следующий этап
            </Button>
          )}

          {/* Начать новый вопрос после ответа */}
          {roundPhase === "answer" && (
            <Button color="success" onClick={() => startNewQuestion()}>
              Следующий вопрос
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
