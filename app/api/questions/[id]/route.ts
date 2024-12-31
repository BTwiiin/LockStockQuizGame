// app/api/questions/[id]/route.ts
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type ParamsPromise = Promise<{ id: string }>;

// GET /api/questions/[id] - Fetch a single question by ID
export async function GET(request: Request, { params }: { params: ParamsPromise }) {
  try {
    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    return NextResponse.json(question, { status: 200 });
  } catch (error: any) {
    console.error("Error fetching question:", error);
    return NextResponse.json({ error: "Failed to fetch question" }, { status: 500 });
  }
}

// PUT /api/questions/[id]
export async function PUT(request: Request, { params }: { params: ParamsPromise }) {
  try {
    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    const { text, hint1, hint2, correctAnswer } = await request.json();

    // Basic validation
    if (!text || !hint1 || !hint2) {
      return NextResponse.json(
        { error: "Missing fields: text, hint1, or hint2" },
        { status: 400 }
      );
    }

    let floatAnswer: number | undefined;
    if (correctAnswer !== undefined) {
      floatAnswer = parseFloat(correctAnswer);
      if (Number.isNaN(floatAnswer)) {
        return NextResponse.json({ error: "Invalid correctAnswer" }, { status: 400 });
      }
    }

    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text,
        hint1,
        hint2,
        correctAnswer: floatAnswer,
      },
    });

    return NextResponse.json(updatedQuestion, { status: 200 });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update question" }, { status: 500 });
  }
}


// DELETE /api/questions/[id] - Delete a question by ID
export async function DELETE(request: Request, { params }: { params: ParamsPromise }) {
  try {
    const { id } = await params;
    const questionId = parseInt(id, 10);

    if (isNaN(questionId)) {
      return NextResponse.json({ error: "Invalid question ID" }, { status: 400 });
    }

    await prisma.question.delete({
      where: { id: questionId },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question" }, { status: 500 });
  }
}
