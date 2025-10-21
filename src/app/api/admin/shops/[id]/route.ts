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


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/shops/${shopId}`;
    

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
    
    return NextResponse.json(data);

  } catch (error) {
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

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/shops/${shopId}`;
    

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
    
    return NextResponse.json(data);

  } catch (error) {
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


    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/admin/shops/${shopId}`;
    

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
    
    return NextResponse.json(data);

  } catch (error) {
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
