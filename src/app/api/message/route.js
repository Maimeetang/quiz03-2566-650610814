import { DB, readDB, writeDB } from "@/app/libs/DB";
import { checkToken } from "@/app/libs/checkToken";
import { nanoid } from "nanoid";
import { NextResponse } from "next/server";

export const GET = async (request) => {
  readDB();
  const roomId = request.nextUrl.searchParams.get("roomId");
  const foundRoom = DB.rooms.find((x) => x.roomId === roomId);
  if (!foundRoom)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  if (foundRoom) {
    const messageList = [];
    for (const ms of DB.messages) {
      if (ms.roomId === roomId) {
        messageList.push(ms.messageId);
      }
    }

    const messages = [];
    for (const messageId of messageList) {
      const message = DB.messages.find((x) => x.messageId === messageId);
      messages.push(message);
    }
    return NextResponse.json({
      ok: true,
      messages,
    });
  }
};

export const POST = async (request) => {
  readDB();

  const body = await request.json();
  const { roomId, messageText } = body;
  const foundRoom = DB.messages.find((x) => x.roomId === roomId);
  if (!foundRoom)
    return NextResponse.json(
      {
        ok: false,
        message: `Room is not found`,
      },
      { status: 404 }
    );

  const messageId = nanoid();

  DB.messages.push({
    roomId,
    messageId,
    messageText,
  });

  writeDB();

  return NextResponse.json({
    ok: true,
    messageId: messageId,
    message: "Message has been sent",
  });
};

export const DELETE = async (request) => {
  const payload = checkToken();

  if (payload == null || payload.role !== "SUPER_ADMIN")
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid token",
      },
      { status: 401 }
    );

  readDB();
  const body = await request.json();
  const { messageId } = body;
  const foundMessage = DB.messages.find((x) => x.messageId === messageId);

  if (!foundMessage)
    return NextResponse.json(
      {
        ok: false,
        message: "Message is not found",
      },
      { status: 404 }
    );

  const foundMessageIndex = DB.messages.findIndex(
    (x) => x.messageId === messageId
  );
  DB.messages.splice(foundMessageIndex, 1);

  writeDB();

  return NextResponse.json({
    ok: true,
    message: "Message has been deleted",
  });
};
