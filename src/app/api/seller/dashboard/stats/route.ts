import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/dashboard/stats - Get seller dashboard statistics
export async function GET(request: NextRequest) {
  try {

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/dashboard/stats`;
    

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
          error: errorText || 'Failed to fetch dashboard stats',
          data: {
            todayOrders: 0,
            todayRevenue: 0,
            activeProducts: 0,
            pendingOrders: 0
          }
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
        error: 'Failed to fetch dashboard stats',
        data: {
          todayOrders: 0,
          todayRevenue: 0,
          activeProducts: 0,
          pendingOrders: 0
        }
      },
      { status: 500 }
    );
  }
}
