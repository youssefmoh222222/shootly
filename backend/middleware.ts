


import { NextRequest, NextResponse } from 'next/server'

// Add CORS headers to all responses
function addCorsHeaders(response: NextResponse, request: NextRequest): NextResponse {
  // Get the origin from the request (for development: http://localhost:3000)
  const origin = request.headers.get('origin') || '*';
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  return response;
}

// Main middleware
export function middleware(request: NextRequest) {
  // Handle CORS preflight requests directly
  if (request.method === 'OPTIONS') {
    const response = new NextResponse(null, { status: 204 });
    return addCorsHeaders(response, request);
  }

  // Add CORS headers to all other responses
  const response = NextResponse.next();
  return addCorsHeaders(response, request);
}

export const config = {
  matcher: [
    // Match all API routes
    '/api/:path*',
    // Only run middleware on non-API routes
    '/((?!api/|_next/static|_next/image|favicon.ico).*)',
  ]
}

