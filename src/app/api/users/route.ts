import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Call external API to get users
    const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://foodshare-production-98da.up.railway.app';
    
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        size: size.toString(),
        ...(search && { search }),
        ...(role && { role }),
      });

      const response = await fetch(`${externalApiUrl}/api/users?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { 
            success: false, 
            message: responseData?.message || 'Không thể lấy danh sách users' 
          },
          { status: response.status }
        );
      }

      // Return the response from external API
      return NextResponse.json(responseData, {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      });

    } catch (apiError) {
      console.error('External API error:', apiError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lỗi kết nối đến server' 
        },
        { status: 503 }
      );
    }

  } catch (error) {
    console.error('Users API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch users',
        data: null,
        message: 'An unexpected error occurred'
      },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        }
      }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
