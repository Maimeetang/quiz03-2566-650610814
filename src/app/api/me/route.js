import { NextResponse } from "next/server";

export const GET = async () => {
  return NextResponse.json({
    ok: true,
    fullName: "Sirawit Kongkham",
    studentId: "650610814",
  });
};
