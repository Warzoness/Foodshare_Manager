import { NextRequest, NextResponse } from 'next/server';

// PUT /api/seller/orders/[id]/status - Update order status
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const orderId = parseInt(id);
    
    if (isNaN(orderId)) {
      return NextResponse.json(
        { code: "400", success: false, message: "Invalid order ID" },
        { status: 400 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      
      return NextResponse.json(
        { code: "400", success: false, message: "Invalid request body format" },
        { status: 400 }
      );
    }
    
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { code: "400", success: false, message: "Status is required" },
        { status: 400 }
      );
    }

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    
   
    const fullUrl = `${backendUrl}/api/seller/orders/${orderId}/status`;
    

    // Forward the request to the backend API
    const response = await fetch(fullUrl, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const errorText = await response.text();
    
      return NextResponse.json(
        { 
          code: response.status.toString(),
          success: false,
          message: errorText || 'Failed to update order status'
        },
        { status: response.status }
      );
    }

    let responseData;
    try {
      responseData = await response.json();
    } catch (parseError) {
      
      return NextResponse.json(
        {
          code: "500",
          success: false,
          message: "Backend returned invalid response format"
        },
        { status: 500 }
      );
    }
    
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.log('Unexpected error in order status update:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined
    });
    return NextResponse.json(
      {
        code: "500",
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      },
      { status: 500 }
    );
  }
}
