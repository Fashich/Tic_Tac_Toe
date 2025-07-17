import { NextRequest, NextResponse } from 'next/server';
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { protocol, origin, path, method, headers, body: requestBody } = body;
    if (!protocol || !origin || !path || !method) {
      return NextResponse.json(
        { error: 'Missing required fields: protocol, origin, path, method' },
        { status: 400 }
      );
    }
    const url = `${protocol}://${origin}${path}`;
    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    };
    if (requestBody && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) {
      if (requestBody instanceof FormData) {
        fetchOptions.body = requestBody;
        delete (fetchOptions.headers as Record<string, string>)['Content-Type'];
      } else if (typeof requestBody === 'string') {
        fetchOptions.body = requestBody;
      } else {
        fetchOptions.body = JSON.stringify(requestBody);
      }
    }
    const response = await fetch(url, fetchOptions);
    const responseData = await response.text();
    let parsedData;
    
    try {
      parsedData = JSON.parse(responseData);
    } catch {
      parsedData = responseData;
    }
    return NextResponse.json(parsedData, { 
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('Content-Type') || 'application/json',
      }
    });
  } catch (error) {
    console.error('Proxy error:', error);
    return NextResponse.json(
      { error: 'Internal proxy error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
export async function GET(request: NextRequest) {
  return NextResponse.json(
    { error: 'GET method not supported. Use POST with method field in body.' },
    { status: 405 }
  );
}
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'PUT method not supported. Use POST with method field in body.' },
    { status: 405 }
  );
}