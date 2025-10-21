import { NextRequest, NextResponse } from 'next/server';

// GET /api/orders - Get orders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sort = searchParams.getAll('sort') || [];


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const queryParams = new URLSearchParams();
    
    if (status) queryParams.append('status', status);
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    sort.forEach(sortItem => queryParams.append('sort', sortItem));

    const fullUrl = `${backendUrl}/api/orders?${queryParams}`;
    // Forward the request to the backend API
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to fetch orders',
          data: []
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch orders",
        data: []
      },
      { status: 500 }
    );
  }
}
