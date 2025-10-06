import { NextRequest, NextResponse } from 'next/server';

interface UpdateUserRequest {
  name: string;
  email: string;
  phoneNumber: string;
  profilePictureUrl: string;
  role?: 'ADMIN' | 'SELLER' | 'USER';
}

// POST /api/users/{userId} - Cập nhật thông tin user (Admin, Seller, User)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;
    
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'User ID không hợp lệ'
        },
        { status: 400 }
      );
    }

    const body: UpdateUserRequest = await request.json();
    const { name, email, phoneNumber, profilePictureUrl, role } = body;

    // Validation
    if (!name || !email) {
      return NextResponse.json(
        {
          success: false,
          message: 'Tên và email là bắt buộc'
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

    // Validate phone number format (optional)
    if (phoneNumber) {
      const phoneRegex = /^\d{10,11}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return NextResponse.json(
          {
            success: false,
            message: 'Số điện thoại không hợp lệ (10-11 chữ số)'
          },
          { status: 400 }
        );
      }
    }

    // Validate role if provided
    if (role && !['ADMIN', 'SELLER', 'USER'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Role không hợp lệ'
        },
        { status: 400 }
      );
    }

    // TODO: Add authentication check
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    // TODO: Check permissions - only admin can update roles, users can only update their own info
    // const currentUser = await getCurrentUserFromToken(token);
    // if (currentUser.role !== 'ADMIN' && currentUser.id !== parseInt(userId)) {
    //   return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    // }
    // if (role && currentUser.role !== 'ADMIN') {
    //   return NextResponse.json({ message: 'Only admin can change user roles' }, { status: 403 });
    // }

    // TODO: Replace with actual database call
    // Check if user exists
    // const existingUser = await db.user.findUnique({
    //   where: { id: parseInt(userId) }
    // });
    // if (!existingUser) {
    //   return NextResponse.json(
    //     { success: false, message: 'User không tồn tại' },
    //     { status: 404 }
    //   );
    // }

    // Check if email is already used by another user
    // const emailExists = await db.user.findFirst({
    //   where: { 
    //     email,
    //     id: { not: parseInt(userId) }
    //   }
    // });
    // if (emailExists) {
    //   return NextResponse.json(
    //     { success: false, message: 'Email đã được sử dụng bởi user khác' },
    //     { status: 409 }
    //   );
    // }

    // Update user
    // const updatedUser = await db.user.update({
    //   where: { id: parseInt(userId) },
    //   data: {
    //     name,
    //     email,
    //     phoneNumber,
    //     profilePictureUrl,
    //     ...(role && { role }), // Only update role if provided
    //     updatedAt: new Date()
    //   }
    // });

    // Mock response for now
    const mockUpdatedUser = {
      id: parseInt(userId),
      name,
      email,
      phoneNumber,
      profilePictureUrl,
      role: role || 'USER', // Default role if not provided
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: false,
      data: mockUpdatedUser,
      message: 'Database not connected. Please implement user update.'
    }, { status: 501 });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi cập nhật user'
      },
      { status: 500 }
    );
  }
}
