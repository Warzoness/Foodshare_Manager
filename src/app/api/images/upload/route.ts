import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    // Add CORS headers
    const headers = new Headers();
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    headers.set('Access-Control-Allow-Headers', 'Content-Type');
    
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const files = formData.getAll('files') as File[];

    // Handle single file upload
    if (file && files.length === 0) {
      return await handleSingleFileUpload(file, headers);
    }
    
    // Handle multiple files upload
    if (files.length > 0) {
      return await handleMultipleFilesUpload(files, headers);
    }

    return NextResponse.json(
      {
        success: false,
        error: 'No file provided',
        data: null,
        message: 'No file provided'
      },
      { status: 400, headers }
    );

  } catch (error) {
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload image',
        data: null,
        message: 'An unexpected error occurred'
      },
      { 
        status: 500, 
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        } 
      }
    );
  }
}

async function handleSingleFileUpload(file: File, headers: Headers) {
  if (!file) {
    return NextResponse.json(
      {
        success: false,
        error: 'No file provided',
        data: null,
        message: 'No file provided'
      },
      { status: 400, headers }
    );
  }

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return NextResponse.json(
      {
        success: false,
        error: 'File must be an image',
        data: null,
        message: 'File must be an image'
      },
      { status: 400, headers }
    );
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      {
        success: false,
        error: 'File size too large',
        data: null,
        message: 'File size must be less than 10MB'
      },
      { status: 400, headers }
    );
  }

  // Forward the file to the real backend
  const backendUrl = 'https://foodshare-production-98da.up.railway.app/api/images/upload';
  
  // Create new FormData for the backend request
  const backendFormData = new FormData();
  backendFormData.append('file', file);

  // Forward the request to the real backend
  const backendResponse = await fetch(backendUrl, {
    method: 'POST',
    body: backendFormData,
    headers: {
      'Accept': 'application/json',
    }
  });

  const backendData = await backendResponse.json();

  if (!backendResponse.ok) {
    return NextResponse.json(
      {
        success: false,
        error: backendData.message || 'Backend upload failed',
        data: null,
        message: 'Backend upload failed'
      },
      { status: backendResponse.status, headers }
    );
  }

  // Return the backend response with CORS headers
  return NextResponse.json(backendData, { 
    status: 200, 
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  });
}

async function handleMultipleFilesUpload(files: File[], headers: Headers) {
  if (files.length === 0) {
    return NextResponse.json(
      {
        success: false,
        error: 'No files provided',
        data: null,
        message: 'No files provided'
      },
      { status: 400, headers }
    );
  }

  // Validate all files
  for (const file of files) {
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        {
          success: false,
          error: 'All files must be images',
          data: null,
          message: 'All files must be images'
        },
        { status: 400, headers }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        {
          success: false,
          error: 'File size too large',
          data: null,
          message: 'File size must be less than 10MB'
        },
        { status: 400, headers }
      );
    }
  }

  // Upload all files
  const uploadPromises = files.map(async (file) => {
    const backendUrl = 'https://foodshare-production-98da.up.railway.app/api/images/upload';
    const backendFormData = new FormData();
    backendFormData.append('file', file);

    const backendResponse = await fetch(backendUrl, {
      method: 'POST',
      body: backendFormData,
      headers: {
        'Accept': 'application/json',
      }
    });

    const backendData = await backendResponse.json();
    
    if (!backendResponse.ok) {
      throw new Error(backendData.message || 'Backend upload failed');
    }

    return backendData.data;
  });

  try {
    const results = await Promise.all(uploadPromises);
    
    return NextResponse.json(
      {
        success: true,
        data: results,
        message: 'Files uploaded successfully'
      },
      { 
        status: 200, 
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to upload files',
        data: null,
        message: 'Failed to upload files'
      },
      { status: 500, headers }
    );
  }
}
