import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Token xác thực không hợp lệ' 
        },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Forward request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://foodshare-production-98da.up.railway.app';
    const meUrl = `${backendUrl}/api/back-office/auth/me`;
    
    console.log('Forwarding me request to backend:', meUrl);

    try {
      const response = await fetch(meUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        console.error('Backend me error:', response.status, responseData);
        return NextResponse.json(
          { 
            success: false, 
            message: responseData?.message || 'Không thể lấy thông tin user' 
          },
          { status: response.status }
        );
      }

      console.log('Backend me success:', responseData);
      return NextResponse.json(responseData);

    } catch (error) {
      console.error('Error forwarding me request:', error);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lỗi kết nối đến server. Vui lòng thử lại.' 
        },
        { status: 500 }
      );
    }


  } catch (error) {
    console.error('Get current user API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server' 
      },
      { status: 500 }
    );
  }
}
