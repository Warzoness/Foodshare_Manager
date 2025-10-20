import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/dashboard/recent-orders - Get recent orders for seller dashboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '5');

    console.log('Seller dashboard recent orders API called with limit:', limit);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/dashboard/recent-orders?limit=${limit}`;
    
    console.log('Fetching recent orders from backend URL:', fullUrl);

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
      console.error('Backend seller dashboard recent orders error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to fetch recent orders',
          data: []
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Backend seller dashboard recent orders success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching seller dashboard recent orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch recent orders',
        data: []
      },
      { status: 500 }
    );
  }
}
