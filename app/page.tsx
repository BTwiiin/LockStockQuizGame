// app/page.tsx
import { Button } from "flowbite-react";

export default function Home() {
  return (
    <div className="grid place-content-center h-screen w-full">
      <div className="flex flex-col space-y-4">
        <Button.Group className="w-full text-white">
          <Button
            href={`/questions/show`}
            className="w-full flex items-center justify-center outline outline-2
                       outline-blue-700 rounded-full p-3 pl-8 pr-8 m-2 hover:scale-105 bg-blue-700"
          >
            Начать игру
          </Button>
          <Button
            href={`/questions/new`}
            className="w-full flex items-center justify-center outline outline-2
                       outline-blue-700 rounded-full p-3 pl-8 pr-8 m-2 hover:scale-105 bg-blue-700"
          >
            Создать вопрос
          </Button>
          <Button
            href={`/questions/all`}
            className="w-full flex items-center justify-center outline outline-2
                       outline-blue-700 rounded-full p-3 pl-8 pr-8 m-2 hover:scale-105 bg-blue-700"
          >
            Список вопросов
          </Button>
          <Button
            className="w-full flex items-center justify-center outline outline-2
                       outline-blue-700 rounded-full p-3 pl-8 pr-8 m-2 hover:scale-105 bg-blue-700"
          >
            Настройки
          </Button>
          <Button
            className="w-full flex items-center justify-center outline outline-2
                       outline-blue-700 rounded-full p-3 pl-8 pr-8 m-2 hover:scale-105 bg-blue-700"
          >
            О проекте
          </Button>
        </Button.Group>
      </div>
    </div>
  );
}
