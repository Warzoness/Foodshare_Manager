import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    
    if (isNaN(shopId)) {
      return NextResponse.json(
        { success: false, error: "Invalid shop ID", data: null },
        { status: 400 }
      );
    }

    // Extract query parameters for pagination and filtering
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortDirection = searchParams.get('sortDirection') || 'desc';
    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    
    // Build query parameters for backend API
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    queryParams.append('sortBy', sortBy);
    queryParams.append('sortDirection', sortDirection);

    const productsUrl = `${backendUrl}/api/seller/shops/${shopId}/products?${queryParams}`;
    const response = await fetch(productsUrl, {
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
          error: errorText || 'Failed to fetch shop products',
          data: {
            content: [],
            totalElements: 0,
            totalPages: 0,
            size: size,
            number: page,
            first: true,
            last: true,
            numberOfElements: 0
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
        error: "Failed to fetch shop products",
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 0,
          first: true,
          last: true,
          numberOfElements: 0
        }
      },
      { status: 500 }
    );
  }
}

