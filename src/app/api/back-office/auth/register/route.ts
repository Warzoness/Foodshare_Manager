import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    // Validate required fields
    if (!name || !email || !password) {
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

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Mật khẩu phải có ít nhất 6 ký tự' 
        },
        { status: 400 }
      );
    }

    // Validate password complexity - must have at least 1 uppercase and 1 lowercase
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    
    if (!hasUppercase || !hasLowercase) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Mật khẩu phải có ít nhất 1 chữ hoa và 1 chữ thường' 
        },
        { status: 400 }
      );
    }

    // Call external API to register user
    const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://foodshare-production-98da.up.railway.app';
    
    try {
      const response = await fetch(`${externalApiUrl}/api/back-office/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { 
            success: false, 
            message: responseData?.message || 'Đăng ký thất bại' 
          },
          { status: response.status }
        );
      }

      // Return the response from external API
      return NextResponse.json(responseData);

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
    console.error('Register error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server' 
      },
      { status: 500 }
    );
  }
}
