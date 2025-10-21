import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/shops/[id] - Get specific shop
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


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/shops/${shopId}`;
    

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
          error: errorText || 'Failed to fetch shop detail',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch shop", data: null },
      { status: 500 }
    );
  }
}

// PUT /api/seller/shops/[id] - Update specific shop
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    const updateData = await request.json();
    
    if (isNaN(shopId)) {
      return NextResponse.json(
        { success: false, error: "Invalid shop ID", data: null },
        { status: 400 }
      );
    }


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/shops/${shopId}`;
    

    // Forward the request to the backend API
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to update shop',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update shop", data: null },
      { status: 500 }
    );
  }
}

// DELETE /api/seller/shops/[id] - Delete specific shop
export async function DELETE(
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

    // TODO: Replace with real database operation
    // Example: const deletedShop = await db.shop.delete({ where: { id: shopId } });
    
    return NextResponse.json(
      {
        success: false,
        error: "Database not connected. Please implement database operations.",
        data: null
      },
      { status: 501 }
    );
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete shop", data: null },
      { status: 500 }
    );
  }
}
