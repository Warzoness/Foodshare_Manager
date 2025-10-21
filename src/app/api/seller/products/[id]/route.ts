import { NextRequest, NextResponse } from 'next/server';

// GET /api/seller/products/[id] - Get specific product
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID", data: null },
        { status: 400 }
      );
    }


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/products/${productId}`;
    

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
          error: errorText || 'Failed to fetch product detail',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch product", data: null },
      { status: 500 }
    );
  }
}

// PUT /api/seller/products/[id] - Update specific product
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    const updateData = await request.json();
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID", data: null },
        { status: 400 }
      );
    }


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/products/${productId}`;
    

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
          error: errorText || 'Failed to update product',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update product", data: null },
      { status: 500 }
    );
  }
}

// DELETE /api/seller/products/[id] - Delete specific product
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const productId = parseInt(id);
    
    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product ID", data: null },
        { status: 400 }
      );
    }


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/products/${productId}`;
    

    // Forward the request to the backend API
    const response = await fetch(fullUrl, {
      method: 'DELETE',
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
          error: errorText || 'Failed to delete product',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    return NextResponse.json(responseData);
    
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to delete product", data: null },
      { status: 500 }
    );
  }
}
