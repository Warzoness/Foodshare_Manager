import { NextRequest, NextResponse } from 'next/server';

interface UpdateUserRequest {
  name?: string;
  email?: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

// GET /api/back-office/users/[id] - Lấy thông tin user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID user không hợp lệ'
        },
        { status: 400 }
      );
    }

    // TODO: Replace with actual database call
    // const user = await db.user.findUnique({
    //   where: { id: parseInt(userId) }
    // });
    // if (!user) {
    //   return NextResponse.json(
    //     { success: false, message: 'User không tồn tại' },
    //     { status: 404 }
    //   );
    // }

    return NextResponse.json({
      success: false,
      message: 'Database not connected. Please implement user retrieval.'
    }, { status: 501 });

  } catch (error) {
    console.error('Error getting user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi lấy thông tin user'
      },
      { status: 500 }
    );
  }
}

// PUT /api/back-office/users/[id] - Cập nhật user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID user không hợp lệ'
        },
        { status: 400 }
      );
    }

    const body: UpdateUserRequest = await request.json();
    const { role, status, email, phoneNumber } = body;

    // Validate email format if provided
    if (email) {
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
    }

    // Validate phone number format if provided
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

    // Validate status if provided
    if (status && !['ACTIVE', 'INACTIVE'].includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Trạng thái không hợp lệ'
        },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !['ADMIN', 'SELLER', 'USER', 'MODERATOR', 'SUPER_ADMIN'].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: 'Vai trò không hợp lệ'
        },
        { status: 400 }
      );
    }

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
    // if (email) {
    //   const emailExists = await db.user.findFirst({
    //     where: { 
    //       email,
    //       id: { not: parseInt(userId) }
    //     }
    //   });
    //   if (emailExists) {
    //     return NextResponse.json(
    //       { success: false, message: 'Email đã được sử dụng bởi user khác' },
    //       { status: 409 }
    //     );
    //   }
    // }

    // Prevent modifying super admin
    // if (existingUser.role === 'SUPER_ADMIN' && existingUser.id !== currentUserId) {
    //   return NextResponse.json(
    //     { success: false, message: 'Không thể thay đổi Super Admin' },
    //     { status: 403 }
    //   );
    // }

    // Update user
    // const updatedUser = await db.user.update({
    //   where: { id: parseInt(userId) },
    //   data: {
    //     ...(name && { name }),
    //     ...(email && { email }),
    //     ...(phoneNumber && { phoneNumber }),
    //     ...(profilePictureUrl && { profilePictureUrl }),
    //     ...(role && { role }),
    //     ...(status && { status }),
    //     updatedAt: new Date()
    //   }
    // });

    return NextResponse.json({
      success: false,
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

// DELETE /api/back-office/users/[id] - Xóa user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check
    // const token = request.headers.get('authorization');
    // if (!token) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    // }

    const { id: userId } = await params;
    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          message: 'ID user không hợp lệ'
        },
        { status: 400 }
      );
    }

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

    // Prevent deleting super admin
    // if (existingUser.role === 'SUPER_ADMIN') {
    //   return NextResponse.json(
    //     { success: false, message: 'Không thể xóa Super Admin' },
    //     { status: 403 }
    //   );
    // }

    // Prevent self-deletion
    // if (existingUser.id === currentUserId) {
    //   return NextResponse.json(
    //     { success: false, message: 'Không thể xóa chính mình' },
    //     { status: 403 }
    //   );
    // }

    // Delete user
    // await db.user.delete({
    //   where: { id: parseInt(userId) }
    // });

    return NextResponse.json({
      success: false,
      message: 'Database not connected. Please implement user deletion.'
    }, { status: 501 });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Lỗi server khi xóa user'
      },
      { status: 500 }
    );
  }
}
