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
        { 
          success: false, 
          error: "Invalid shop ID", 
          data: null 
        },
        { status: 400 }
      );
    }

    console.log('Admin shop detail API called for shop ID:', shopId);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/shops/${shopId}`;
    
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
            success: false,
            error: 'Authentication required',
            message: 'Backend API requires valid authentication token',
            data: null
          },
          { status: 401 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Shop not found',
            message: `Shop with ID ${shopId} not found`,
            data: null
          },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend shop detail response:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error fetching admin shop detail:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch shop detail',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    
    if (isNaN(shopId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid shop ID", 
          data: null 
        },
        { status: 400 }
      );
    }

    const updateData = await request.json();
    console.log('Admin shop update API called for shop ID:', shopId, 'with data:', updateData);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/shops/${shopId}`;
    
    console.log('Updating via backend URL:', fullUrl);

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
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      
      // Return specific error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Authentication required',
            message: 'Backend API requires valid authentication token',
            data: null
          },
          { status: 401 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Shop not found',
            message: `Shop with ID ${shopId} not found`,
            data: null
          },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend shop update response:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error updating admin shop:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update shop',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const shopId = parseInt(id);
    
    if (isNaN(shopId)) {
      return NextResponse.json(
        { 
          success: false, 
          error: "Invalid shop ID", 
          data: null 
        },
        { status: 400 }
      );
    }

    console.log('Admin shop delete API called for shop ID:', shopId);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/shops/${shopId}`;
    
    console.log('Deleting via backend URL:', fullUrl);

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
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      
      // Return specific error based on status code
      if (response.status === 401) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Authentication required',
            message: 'Backend API requires valid authentication token',
            data: null
          },
          { status: 401 }
        );
      }
      
      if (response.status === 404) {
        return NextResponse.json(
          { 
            success: false,
            error: 'Shop not found',
            message: `Shop with ID ${shopId} not found`,
            data: null
          },
          { status: 404 }
        );
      }
      
      throw new Error(`Backend API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('Backend shop delete response:', data);
    
    return NextResponse.json(data);

  } catch (error) {
    console.error('Error deleting admin shop:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to delete shop',
        message: error instanceof Error ? error.message : 'Unknown error',
        data: null
      },
      { status: 500 }
    );
  }
}
