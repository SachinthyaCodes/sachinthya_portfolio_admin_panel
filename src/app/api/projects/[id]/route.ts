import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseClient } from '@/lib/supabase-client';
import jwt from 'jsonwebtoken';

// Map database fields to frontend expected fields
function mapDbToFrontend(dbProject: Record<string, unknown>) {
  return {
    id: String(dbProject.id), // Ensure ID is a string for API consistency
    name: dbProject.name || dbProject.title, // Frontend expects 'name'
    category: dbProject.category,
    description: dbProject.description,
    comprehensiveSummary: dbProject.comprehensive_summary || dbProject.description,
    tech: Array.isArray(dbProject.tech) ? dbProject.tech : (typeof dbProject.technology === 'string' ? dbProject.technology.split(',').map((t: string) => t.trim()) : []),
    imageUrl: dbProject.image_url,
    links: Array.isArray(dbProject.links) ? dbProject.links : [],
    isShown: dbProject.is_shown,
    order: dbProject.order_index || dbProject.display_order || undefined,
    createdAt: dbProject.created_at ? new Date(String(dbProject.created_at)) : undefined,
    updatedAt: dbProject.updated_at ? new Date(String(dbProject.updated_at)) : undefined
  };
}

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function verifyToken(token: string): { userId: string; email: string } | null {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as jwt.JwtPayload & { userId: string; email: string };
    return decoded;
  } catch {
    return null;
  }
}

// GET /api/projects/[id] - Get a single project
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient();

    const { data: project, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', decoded.userId)
      .single();

    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapDbToFrontend(project));

  } catch (error) {
    console.error('Project GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/projects/[id] - Update a project
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔄 PATCH /api/projects/${params.id} - Partial project update`);
    
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      // Check Content-Type to determine if it's FormData or JSON
      const contentType = request.headers.get('content-type') || '';
      console.log('📝 PATCH Content-Type:', contentType);
      
      if (contentType.includes('multipart/form-data')) {
        // Handle FormData
        const formData = await request.formData();
        console.log('📝 PATCH FormData received:', Object.fromEntries(formData.entries()));
        
        // Convert FormData to object
        body = {};
        const imageFile = formData.get('image') as File | null;
        
        formData.forEach((value, key) => {
          if (key === 'image') {
            // Skip - we'll handle image separately
            return;
          } else if (key === 'tech' || key === 'links') {
            try {
              body[key] = value ? JSON.parse(value as string) : [];
            } catch {
              body[key] = (value as string).split(',').map(item => item.trim()).filter(item => item);
            }
          } else if (key === 'isShown') {
            body[key] = value === 'true';
          } else if (key === 'order') {
            body[key] = parseInt(value as string) || 0;
          } else {
            body[key] = value;
          }
        });

        // Handle image upload if present
        if (imageFile && imageFile.size > 0) {
          // Get the current project to find old image URL
          const supabase = createSupabaseClient();
          const { data: currentProject } = await supabase
            .from('projects')
            .select('image_url')
            .eq('id', params.id)
            .single();

          const { replaceImage } = await import('@/lib/storage');
          const newImageUrl = await replaceImage(currentProject?.image_url, imageFile, 'projects');
          
          if (newImageUrl) {
            body.imageUrl = newImageUrl;
          } else {
            console.error('Failed to upload/replace image');
          }
        }
        
        console.log('✅ Converted FormData to object:', body);
      } else {
        // Handle JSON
        const rawBody = await request.text();
        console.log('📝 Raw PATCH JSON body:', rawBody);
        
        if (!rawBody || rawBody.trim() === '') {
          return NextResponse.json(
            { error: 'Request body is empty' },
            { status: 400 }
          );
        }
        
        body = JSON.parse(rawBody);
        console.log('✅ Parsed PATCH JSON body:', body);
      }
    } catch (parseError) {
      console.error('❌ PATCH body parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request body format',
          details: `Body parsing failed: ${parseError}`
        },
        { status: 400 }
      );
    }
    
    // Map frontend fields to database fields for partial updates
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) {
      updateData.name = body.name;
      updateData.title = body.name; // Keep title synced
    }
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.comprehensiveSummary !== undefined) updateData.comprehensive_summary = body.comprehensiveSummary;
    if (body.tech !== undefined) updateData.tech = Array.isArray(body.tech) ? body.tech : [];
    if (body.links !== undefined) updateData.links = Array.isArray(body.links) ? body.links : [];
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.isShown !== undefined) updateData.is_shown = body.isShown;
    if (body.order !== undefined) {
      updateData.order_index = body.order;
      updateData.display_order = body.order; // Keep display_order synced
    }
    
    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const supabase = createSupabaseClient();

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', decoded.userId)
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    return NextResponse.json(mapDbToFrontend(updatedProject));

  } catch (error) {
    console.error('Error updating project:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`🔄 PUT /api/projects/${params.id} - Full project update`);
    
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    let body: Record<string, unknown>;
    try {
      // Check Content-Type to determine if it's FormData or JSON
      const contentType = request.headers.get('content-type') || '';
      console.log('📝 PUT Content-Type:', contentType);
      
      if (contentType.includes('multipart/form-data')) {
        // Handle FormData
        const formData = await request.formData();
        console.log('📝 PUT FormData received:', Object.fromEntries(formData.entries()));
        
        // Convert FormData to object
        body = {};
        const imageFile = formData.get('image') as File | null;
        
        formData.forEach((value, key) => {
          if (key === 'image') {
            // Skip - we'll handle image separately
            return;
          }

          if (key === 'tech' || key === 'links') {
            try {
              body[key] = value ? JSON.parse(value as string) : [];
            } catch {
              body[key] = (value as string).split(',').map(item => item.trim()).filter(item => item);
            }
          } else if (key === 'isShown') {
            body[key] = value === 'true';
          } else if (key === 'order') {
            body[key] = parseInt(value as string) || 0;
          } else {
            body[key] = value;
          }
        });

        // Handle image upload if present
        if (imageFile && imageFile.size > 0) {
          // Get the current project to find old image URL
          const supabase = createSupabaseClient();
          const { data: currentProject } = await supabase
            .from('projects')
            .select('image_url')
            .eq('id', params.id)
            .single();

          const { replaceImage } = await import('@/lib/storage');
          const newImageUrl = await replaceImage(currentProject?.image_url, imageFile, 'projects');
          
          if (newImageUrl) {
            body.imageUrl = newImageUrl;
          } else {
            console.error('Failed to upload/replace image');
          }
        }

        console.log('✅ Converted FormData to object:', body);
      } else {
        // Handle JSON
        const rawBody = await request.text();
        console.log('📝 Raw PUT JSON body:', rawBody);
        
        if (!rawBody || rawBody.trim() === '') {
          return NextResponse.json(
            { error: 'Request body is empty' },
            { status: 400 }
          );
        }
        
        body = JSON.parse(rawBody);
        console.log('✅ Parsed PUT JSON body:', body);
      }
    } catch (parseError) {
      console.error('❌ PUT body parsing error:', parseError);
      return NextResponse.json(
        { 
          error: 'Invalid request body format',
          details: `Body parsing failed: ${parseError}`
        },
        { status: 400 }
      );
    }
    
    // Map frontend fields to database fields
    const updateData: Record<string, unknown> = {};
    if (body.name !== undefined) {
      updateData.name = body.name;
      updateData.title = body.name; // Keep title synced
    }
    if (body.category !== undefined) updateData.category = body.category;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.comprehensiveSummary !== undefined) updateData.comprehensive_summary = body.comprehensiveSummary;
    if (body.tech !== undefined) updateData.tech = Array.isArray(body.tech) ? body.tech : [];
    if (body.links !== undefined) updateData.links = Array.isArray(body.links) ? body.links : [];
    if (body.imageUrl !== undefined) updateData.image_url = body.imageUrl;
    if (body.isShown !== undefined) updateData.is_shown = body.isShown;
    if (body.order !== undefined) updateData.order_index = body.order;
    
    // Add updated timestamp
    updateData.updated_at = new Date().toISOString();

    const supabase = createSupabaseClient();

    const { data: project, error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', params.id)
      .eq('user_id', decoded.userId)
      .select()
      .single();

    if (error) {
      console.error('Project update error:', error);
      return NextResponse.json(
        { error: 'Failed to update project' },
        { status: 500 }
      );
    }

    if (!project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(mapDbToFrontend(project));

  } catch (error) {
    console.error('Project PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/projects/[id] - Delete a project
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = getAuthToken(request);
    if (!token) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid token' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseClient();

    // Get the project first to retrieve image URL
    const { data: project } = await supabase
      .from('projects')
      .select('image_url')
      .eq('id', params.id)
      .eq('user_id', decoded.userId)
      .single();

    // Delete the project from database
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', params.id)
      .eq('user_id', decoded.userId);

    if (error) {
      console.error('Project deletion error:', error);
      return NextResponse.json(
        { error: 'Failed to delete project' },
        { status: 500 }
      );
    }

    // Delete associated image from storage if exists
    if (project?.image_url) {
      const { deleteImage } = await import('@/lib/storage');
      await deleteImage(project.image_url);
    }

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}