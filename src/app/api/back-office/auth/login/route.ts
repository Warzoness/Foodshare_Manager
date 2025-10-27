import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;


    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Thiếu thông tin bắt buộc' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Email không hợp lệ' 
        },
        { status: 400 }
      );
    }

    // Forward authentication request to backend API
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://foodshare-production-98da.up.railway.app';
    const loginUrl = `${backendUrl}/api/back-office/auth/login`;
    

    try {
      const response = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        
        // Return error with message from backend
        return NextResponse.json(
          { 
            code: response.status.toString(),
            success: false, 
            message: responseData?.message || 'Đăng nhập thất bại' 
          },
          { status: response.status }
        );
      }

      return NextResponse.json(responseData);

    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Lỗi kết nối đến server. Vui lòng thử lại.' 
        },
        { status: 500 }
      );
    }

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server' 
      },
      { status: 500 }
    );
  }
}
