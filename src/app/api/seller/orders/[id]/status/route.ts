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
      console.error('Failed to parse request body as JSON:', {
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error'
      });
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
    
    console.log('Seller order status update API called with params:', {
      orderId,
      status,
      authHeader: authHeader ? 'Present' : 'Missing',
      backendUrl
    });
    const fullUrl = `${backendUrl}/api/seller/orders/${orderId}/status`;
    
    console.log('Updating order status at backend URL:', fullUrl);

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
      console.error('Backend seller order status update error:', {
        httpStatus: response.status,
        statusText: response.statusText,
        errorText,
        orderId,
        newStatus: status,
        fullUrl
      });
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
      console.error('Failed to parse backend response as JSON:', {
        parseError: parseError instanceof Error ? parseError.message : 'Unknown parse error',
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries())
      });
      return NextResponse.json(
        {
          code: "500",
          success: false,
          message: "Backend returned invalid response format"
        },
        { status: 500 }
      );
    }
    
    console.log('Backend seller order status update success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error updating seller order status:', {
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
