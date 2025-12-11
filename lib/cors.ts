import { NextResponse } from "next/server";

/**
 * Adds CORS headers to a NextResponse
 * @param response The NextResponse to add headers to
 * @param options CORS configuration options
 */
export function addCorsHeaders(
  response: NextResponse,
  options: {
    origin?: string | string[];
    methods?: string[];
    allowedHeaders?: string[];
    credentials?: boolean;
  } = {}
) {
  const {
    origin = "*",
    methods = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders = ["Content-Type", "Authorization"],
    credentials = false,
  } = options;

  const originHeader =
    origin === "*"
      ? "*"
      : Array.isArray(origin)
      ? origin.join(", ")
      : origin;

  response.headers.set("Access-Control-Allow-Origin", originHeader);
  response.headers.set(
    "Access-Control-Allow-Methods",
    methods.join(", ")
  );
  response.headers.set(
    "Access-Control-Allow-Headers",
    allowedHeaders.join(", ")
  );

  if (credentials) {
    response.headers.set("Access-Control-Allow-Credentials", "true");
  }

  // CORS preflight cache
  response.headers.set("Access-Control-Max-Age", "86400");

  return response;
}

/**
 * Creates a CORS response for OPTIONS requests (preflight)
 */
export function createCorsPreflightResponse(options?: {
  origin?: string | string[];
  methods?: string[];
  allowedHeaders?: string[];
}) {
  const response = new NextResponse(null, { status: 204 });
  return addCorsHeaders(response, options);
}

