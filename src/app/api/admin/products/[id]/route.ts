import { NextRequest, NextResponse } from 'next/server';

// GET /api/admin/products/{productId}
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID sản phẩm không hợp lệ",
          data: null
        },
        { status: 400 }
      );
    }


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/products/${productId}`;
    

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
      {
        success: false,
        error: "Có lỗi xảy ra khi lấy thông tin sản phẩm",
        data: null
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/products/{productId}
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID sản phẩm không hợp lệ",
          data: null
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/products/${productId}`;
    

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
      {
        success: false,
        error: "Có lỗi xảy ra khi cập nhật sản phẩm",
        data: null
      },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/products/{productId}
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;

    if (!productId) {
      return NextResponse.json(
        {
          success: false,
          error: "ID sản phẩm không hợp lệ",
          data: null
        },
        { status: 400 }
      );
    }


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/products/${productId}`;
    

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
      {
        success: false,
        error: "Có lỗi xảy ra khi xóa sản phẩm",
        data: null
      },
      { status: 500 }
    );
  }
}

