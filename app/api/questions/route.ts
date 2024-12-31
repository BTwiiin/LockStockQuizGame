// app/api/questions/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const questions = await prisma.question.findMany({ orderBy: { id: "asc" } });
    return NextResponse.json(questions, { status: 200 });
  } catch (e) {
    console.error("GET /api/questions error:", e);
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { text, hint1, hint2, correctAnswer } = await request.json();

    if (!text || !hint1 || !hint2) {
      return NextResponse.json(
        { error: "Missing fields: text, hint1, hint2" },
        { status: 400 }
      );
    }

    let floatAnswer: number | null = null;
    if (correctAnswer !== undefined && correctAnswer !== null) {
      floatAnswer = parseFloat(correctAnswer);
      if (Number.isNaN(floatAnswer)) {
        return NextResponse.json({ error: "Invalid correctAnswer" }, { status: 400 });
      }
    }

    const newQuestion = await prisma.question.create({
      data: {
        text,
        hint1,
        hint2,
        correctAnswer: floatAnswer ?? 0,
      },
    });

    console.log("Created question:", newQuestion);

    // If newQuestion is ever null or undefined, fallback to {}
    return NextResponse.json(newQuestion ?? {}, { status: 201 });

  } catch (e) {
    if (e == null) {
      console.error("POST /api/questions error: null was thrown");
      return NextResponse.json({ error: "Unknown error" }, { status: 500 });
    } else {
      console.error("POST /api/questions error:", e);
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: msg }, { status: 500 });
    }
  }
  
}
