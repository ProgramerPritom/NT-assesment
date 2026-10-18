import { NextResponse } from 'next/server';

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
}

export function successResponse<T>(data: T, status = 200, init?: ResponseInit) {
  return NextResponse.json(
    {
      success: true,
      data,
    },
    { status, ...init }
  );
}

export function errorResponse(
  message: string,
  status = 400,
  code?: string,
  init?: ResponseInit
) {
  return NextResponse.json(
    {
      success: false,
      error: message,
      code,
    },
    { status, ...init }
  );
}
