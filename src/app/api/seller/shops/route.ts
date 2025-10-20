import { NextRequest, NextResponse } from 'next/server';

// Database connection - replace with your actual database setup
// This is a placeholder for real database operations

// Interface for create shop request
interface CreateShopRequest {
  name: string;
  address: string;
  phone: string;
  imageUrl: string;
  latitude: number;
  longitude: number;
  description: string;
  rating: number;
  status: string;
}

export async function GET(request: NextRequest) {
  try {
    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const shopsUrl = `${backendUrl}/api/seller/shops`;
    
    console.log('Forwarding seller shops request to backend:', shopsUrl);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    const response = await fetch(shopsUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
    });

    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('Backend seller shops error:', response.status, responseData);
      return NextResponse.json(
        { 
          success: false,
          error: responseData?.message || 'Failed to fetch shops',
          data: []
        },
        { status: response.status }
      );
    }

    console.log('Backend seller shops success:', responseData);
    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Error fetching seller shops:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch shops',
        data: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateShopRequest = await request.json();
    
    // Validate required fields
    if (!body.name || !body.address || !body.phone) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: name, address, phone are required",
          data: null
        },
        { status: 400 }
      );
    }

    console.log('Seller create shop API called with data:', body);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/shops`;
    
    console.log('Creating shop via backend URL:', fullUrl);

    // Forward the request to the backend API
    const response = await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend seller create shop error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to create shop',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Backend seller create shop success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json(
      {
        code: "INTERNAL_SERVER_ERROR",
        success: false,
        data: null,
        message: "Failed to create shop"
      },
      { status: 500 }
    );
  }
}

// Handle individual shop operations (PUT, DELETE)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Shop ID is required", data: null },
        { status: 400 }
      );
    }

    // TODO: Replace with real database operation
    // Example: const updatedShop = await db.shop.update({ where: { id: parseInt(id) }, data: updateData });
    
    return NextResponse.json(
      {
        success: false,
        error: "Database not connected. Please implement database operations.",
        data: null
      },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json(
      { success: false, error: "Failed to update shop", data: null },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json(
        { success: false, error: "Shop ID is required", data: null },
        { status: 400 }
      );
    }

    // TODO: Replace with real database operation
    // Example: const deletedShop = await db.shop.delete({ where: { id: parseInt(id) } });
    
    return NextResponse.json(
      {
        success: false,
        error: "Database not connected. Please implement database operations.",
        data: null
      },
      { status: 501 }
    );
    
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json(
      { success: false, error: "Failed to delete shop", data: null },
      { status: 500 }
    );
  }
}
