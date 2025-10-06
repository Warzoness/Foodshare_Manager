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

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://foodshare-production-98da.up.railway.app';
    const productsUrl = `${backendUrl}/api/seller/shops/${shopId}/products`;
    
    console.log('Forwarding seller shop products request to backend:', productsUrl);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    const response = await fetch(productsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Backend seller shop products error:', response.status, responseData);
      return NextResponse.json(
        { 
          success: false,
          error: responseData?.message || 'Failed to fetch shop products',
          data: []
        },
        { status: response.status }
      );
    }

    console.log('Backend seller shop products success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching shop products:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch shop products",
        data: []
      },
      { status: 500 }
    );
  }
}

