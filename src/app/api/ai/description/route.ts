import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { name, activeIngredient } = await req.json();

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "openrouter/free",
        messages: [
          {
            role: "user",
            content: `Дай краткое описание лекарства на русском (1-2 предложения):
- для чего назначают
- основное действие
Отдельно укажи: отпускается ли в Казахстане по рецепту (Rx) или без рецепта (OTC).
Название: ${name}
${activeIngredient ? `Действующее вещество: ${activeIngredient}` : ""}

Ответ ТОЛЬКО в JSON формате:
{"purpose": "...", "prescriptionType": "rx|otc|unknown"}`,
          },
        ],
        max_tokens: 200,
      }),
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return NextResponse.json(JSON.parse(jsonMatch[0]));
    }

    return NextResponse.json({ purpose: content, prescriptionType: "unknown" });
  } catch {
    return NextResponse.json({ error: "Ошибка при обращении к ИИ" }, { status: 500 });
  }
}
