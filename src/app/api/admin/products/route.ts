import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sort = searchParams.getAll('sort') || [];

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    sort.forEach(sortItem => queryParams.append('sort', sortItem));

    const fullUrl = `${backendUrl}/api/admin/products?${queryParams}`;
    

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
      
      // Return specific error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Authentication required',
            message: 'Backend API requires valid authentication token',
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
          { status: 401 }
        );
      }
      
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);

  } catch (error) {
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch products',
        message: error instanceof Error ? error.message : 'Unknown error',
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