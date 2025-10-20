import { NextRequest, NextResponse } from 'next/server';

// Interface for create product request
interface CreateProductRequest {
  shopId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  detailImageUrl: string;
  quantityAvailable: number;
  quantityPending: number;
  status: string;
}

// GET /api/seller/products - Get all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const shopId = searchParams.get('shopId');
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const sort = searchParams.getAll('sort') || [];

    console.log('Seller products API called with params:', {
      shopId,
      page,
      size,
      sort
    });

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const queryParams = new URLSearchParams();
    
    if (shopId) queryParams.append('shopId', shopId);
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    sort.forEach(sortItem => queryParams.append('sort', sortItem));

    const fullUrl = `${backendUrl}/api/seller/products?${queryParams}`;
    
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
      console.error('Backend seller products error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to fetch products',
          data: []
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Backend seller products success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch products",
        data: []
      },
      { status: 500 }
    );
  }
}

// POST /api/seller/products - Create new product
export async function POST(request: NextRequest) {
  try {
    const body: CreateProductRequest = await request.json();
    
    // Validate required fields
    if (!body.shopId || !body.categoryId || !body.name || !body.description || !body.price) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields: shopId, categoryId, name, description, price are required",
          data: null
        },
        { status: 400 }
      );
    }

    console.log('Seller create product API called with data:', body);

    // Get authorization header from request
    const authHeader = request.headers.get('Authorization');

    // Get backend URL from environment
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const fullUrl = `${backendUrl}/api/seller/products`;
    
    console.log('Creating product via backend URL:', fullUrl);

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
      console.error('Backend seller create product error:', response.status, errorText);
      return NextResponse.json(
        { 
          success: false,
          error: errorText || 'Failed to create product',
          data: null
        },
        { status: response.status }
      );
    }

    const responseData = await response.json();
    console.log('Backend seller create product success:', responseData);
    return NextResponse.json(responseData);
    
  } catch (error) {
    console.error('Error creating seller product:', error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create product",
        data: null
      },
      { status: 500 }
    );
  }
}
