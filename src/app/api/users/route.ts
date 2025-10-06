import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '0');
    const size = parseInt(searchParams.get('size') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    // Mock data for now - in production this would come from a database
    const mockUsers = [
      {
        id: '1',
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        role: 'SELLER',
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-15T14:30:00Z')
      },
      {
        id: '2',
        name: 'Trần Thị B',
        email: 'tranthib@example.com',
        role: 'SELLER',
        createdAt: new Date('2024-01-05'),
        updatedAt: new Date('2024-01-15T12:15:00Z')
      },
      {
        id: '3',
        name: 'Lê Văn C',
        email: 'levanc@example.com',
        role: 'SELLER',
        createdAt: new Date('2024-01-10'),
        updatedAt: new Date('2024-01-10T16:45:00Z')
      },
      {
        id: '4',
        name: 'Phạm Thị D',
        email: 'phamthid@example.com',
        role: 'SELLER',
        createdAt: new Date('2023-12-15'),
        updatedAt: new Date('2024-01-10T16:45:00Z')
      },
      {
        id: '5',
        name: 'Admin System',
        email: 'admin@foodshare.com',
        role: 'ADMIN',
        createdAt: new Date('2023-12-01'),
        updatedAt: new Date('2024-01-15T15:20:00Z')
      }
    ];

    // Filter users based on search, role, and status
    let filteredUsers = mockUsers;

    if (search) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) ||
        user.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    // Calculate pagination
    const totalElements = filteredUsers.length;
    const totalPages = Math.ceil(totalElements / size);
    const startIndex = page * size;
    const endIndex = Math.min(startIndex + size, totalElements);
    const content = filteredUsers.slice(startIndex, endIndex);

    const response = {
      totalElements,
      totalPages,
      size,
      content,
      number: page,
      sort: {
        empty: true,
        sorted: false,
        unsorted: true
      },
      pageable: {
        pageNumber: page,
        pageSize: size,
        sort: {
          empty: true,
          sorted: false,
          unsorted: true
        },
        offset: startIndex,
        paged: true,
        unpaged: false
      },
      first: page === 0,
      last: page >= totalPages - 1,
      numberOfElements: content.length,
      empty: content.length === 0
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      }
    });

  } catch (error) {
    console.error('Error fetching users:', error);
    
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
