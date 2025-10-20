import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sort = searchParams.getAll('sort') || [];

    console.log('Admin shops API called with params:', {
      page, size, search, status, sort
    });

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const queryParams = new URLSearchParams();
    
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    sort.forEach(sortItem => queryParams.append('sort', sortItem));

    const fullUrl = `${backendUrl}/api/admin/shops?${queryParams}`;
    
    console.log('Fetching from backend URL:', fullUrl);

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
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      
      // Return specific error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { 
            code: "UNAUTHORIZED",
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
    console.log('Backend shops response:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching admin shops:', error);
    return NextResponse.json(
      { 
        code: "ERROR",
        success: false,
        error: 'Failed to fetch shops',
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
