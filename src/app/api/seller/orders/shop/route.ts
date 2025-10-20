import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/orders/shop - Get orders for seller shops
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const shopId = searchParams.get('shopId');
    const status = searchParams.get('status');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';

    console.log('Seller shop orders API called with params:', {
      shopId, status, fromDate, toDate, page, size, sortBy, sortDirection
    });

    // Build query parameters for the backend API
    const queryParams = new URLSearchParams();
    
    if (shopId) queryParams.append('shopId', shopId);
    if (status) queryParams.append('status', status);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortDirection', sortDirection);

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/orders/shop?${queryParams}`;
    
    console.log('Fetching from backend URL:', fullUrl);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

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
      console.error('Backend seller shop orders error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to fetch shop orders',
          data: {
            content: [],
            page: 0,
            size: 20,
            totalElements: 0,
            totalPages: 0,
            hasNext: false,
            hasPrevious: false
          }
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Backend seller shop orders success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching seller shop orders:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shop orders',
        data: {
          content: [],
          page: 0,
          size: 20,
          totalElements: 0,
          totalPages: 0,
          hasNext: false,
          hasPrevious: false
        }
      },
      { status: 500 }
    );
  }
}
