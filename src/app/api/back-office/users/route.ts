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

    // TODO: Replace with actual database call
    // const users = await db.user.findMany({
    //   where: {
    //     ...(role && { role }),
    //     ...(search && {
    //       OR: [
    //         { name: { contains: search, mode: 'insensitive' } },
    //         { email: { contains: search, mode: 'insensitive' } }
    //       ]
    //     })
    //   },
    //   skip: page * size,
    //   take: size,
    //   orderBy: { createdAt: 'desc' }
    // });

    // Mock response for now
    return NextResponse.json({
      success: true,
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page
      },
      message: 'Database not connected. Please implement user management.'
    });

  } catch (error) {
    console.error('Error fetching users:', error);
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

    // TODO: Replace with actual database call
    // Check if email already exists
    // const existingUser = await db.user.findUnique({
    //   where: { email }
    // });
    // if (existingUser) {
    //   return NextResponse.json(
    //     { success: false, message: 'Email đã được sử dụng' },
    //     { status: 409 }
    //   );
    // }

    // Hash password and create user
    // const hashedPassword = await bcrypt.hash(password, 10);
    // const newUser = await db.user.create({
    //   data: {
    //     name,
    //     email,
    //     password: hashedPassword,
    //     role,
    //     status: 'ACTIVE'
    //   }
    // });

    return NextResponse.json({
      success: false,
      message: 'Database not connected. Please implement user creation.'
    }, { status: 501 });

  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi tạo user'
      },
      { status: 500 }
    );
  }
}
