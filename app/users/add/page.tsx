"use client";

import { useState } from "react";
import { useGameStore } from "../../hooks/useGameStore";
import { Button } from "flowbite-react";
import Link from "next/link";

export default function AddUsersPage() {
  const addUser = useGameStore((s) => s.addUser);
  const users = useGameStore((s) => s.users);

  const [name, setName] = useState("");
  const [balance, setBalance] = useState(1000);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 gap-4">
      <h1 className="text-2xl font-bold text-white">Добавить игроков</h1>

      <div className="flex flex-col space-y-4 w-full max-w-sm p-4 shadow rounded bg-blue-600">
        {/* Форма для добавления нового игрока */}
        <div className="space-y-2">
          <label className="font-medium text-white">Имя игрока</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <label className="font-medium text-white">Начальный баланс</label>
          <input
            type="number"
            className="border rounded px-2 py-1 w-full"
            value={balance}
            onChange={(e) => setBalance(parseFloat(e.target.value) || 0)}
          />

          <div className="grid place-content-center">
            <Button
              onClick={() => {
                if (name.trim()) {
                  addUser(name.trim(), balance);
                  setName("");
                  setBalance(1000);
                }
              }}
              className="mt-2 hover:bg-blue-400"
            >
              Добавить игрока
            </Button>
          </div>
        </div>

        {/* Список текущих игроков */}
        <div className="border border-blue-500 p-3 rounded mt-2">
          <h2 className="font-bold text-white mb-2">Текущие игроки</h2>
          {users.length === 0 ? (
            <p className="text-white">Пока нет игроков</p>
          ) : (
            users.map((u) => (
              <div key={u.id} className="text-white">
                {u.name} — {u.balance}
              </div>
            ))
          )}
        </div>

        {/* Переход к странице игры */}
        <div className="grid place-content-center">
          <Link href="/questions/show" className="mt-2">
            <Button color="success" className="hover:bg-blue-400">
              К игре
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
