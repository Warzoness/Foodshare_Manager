import { NextRequest, NextResponse } from 'next/server';

interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: string;
}

// GET /api/back-office/users - Lấy danh sách users
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

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

      const response = await fetch(`${externalApiUrl}/api/back-office/users?${queryParams}`, {
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
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi lấy danh sách users'
      },
      { status: 500 }
    );
  }
}

// POST /api/back-office/users - Tạo user mới
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const body: CreateUserRequest = await request.json();
    const { name, email, password, role } = body;

    // Validation
    if (!name || !email || !password || !role) {
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

    // Validate password
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: 'Mật khẩu phải có ít nhất 6 ký tự'
        },
        { status: 400 }
      );
    }

    // Validate role
    if (!['ADMIN', 'SELLER', 'USER', 'MODERATOR'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vai trò không hợp lệ'
        },
        { status: 400 }
      );
    }

    // Call external API to create user
    const externalApiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://foodshare-production-98da.up.railway.app';
    
    try {
      const response = await fetch(`${externalApiUrl}/api/back-office/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ name, email, password, role }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        return NextResponse.json(
          { 
            success: false, 
            message: responseData?.message || 'Không thể tạo user' 
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
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi tạo user'
      },
      { status: 500 }
    );
  }
}
