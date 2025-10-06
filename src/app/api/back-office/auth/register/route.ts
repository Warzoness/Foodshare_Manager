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

    // Mock successful registration
    const mockUser = {
      id: Math.floor(Math.random() * 1000) + 1,
      name,
      email,
      role: 'SELLER',
      accessToken: `mock_token_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      message: 'Đăng ký thành công',
      data: mockUser
    });

  } catch (error) {
    console.error('Register API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Lỗi server' 
      },
      { status: 500 }
    );
  }
}
