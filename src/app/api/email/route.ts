import { NextResponse, type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { to, subject, body } = await request.json();

  if (!to || !subject || !body) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  // Здесь подключается email-сервис (Resend, SendGrid, Nodemailer и т.д.)
  // Пример с Resend:
  //
  // import { Resend } from "resend";
  // const resend = new Resend(process.env.RESEND_API_KEY);
  // await resend.emails.send({
  //   from: "Health Tracker <noreply@yourdomain.com>",
  //   to,
  //   subject,
  //   html: body,
  // });

  console.log("Email would be sent:", { to, subject, bodyLength: body.length });

  return NextResponse.json({ success: true, message: "Email sending not configured yet. Set up RESEND_API_KEY or similar." });
}
