import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

// Map database fields to frontend expected fields
function mapDbToFrontend(dbProject: any) {
  return {
    id: dbProject.id.toString(), // Ensure ID is a string for API consistency
    name: dbProject.name || dbProject.title,
    category: dbProject.category,
    description: dbProject.description,
    comprehensiveSummary: dbProject.comprehensive_summary || dbProject.description,
    tech: Array.isArray(dbProject.tech) ? dbProject.tech : (dbProject.technology ? dbProject.technology.split(',').map((t: string) => t.trim()) : []),
    imageUrl: dbProject.image_url,
    links: Array.isArray(dbProject.links) ? dbProject.links : [],
    isShown: dbProject.is_shown,
    order: dbProject.order_index || dbProject.display_order || undefined,
    createdAt: dbProject.created_at ? new Date(dbProject.created_at) : undefined,
    updatedAt: dbProject.updated_at ? new Date(dbProject.updated_at) : undefined
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

    const supabase = createSupabaseServerClient();

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

    const body = await request.json();
    
    // Map frontend fields to database fields for partial updates
    const updateData: any = {};
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

    const supabase = createSupabaseServerClient();

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

    const body = await request.json();
    
    // Map frontend fields to database fields
    const updateData: any = {};
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

    const supabase = createSupabaseServerClient();

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

    const supabase = createSupabaseServerClient();

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

    return NextResponse.json({ message: 'Project deleted successfully' });

  } catch (error) {
    console.error('Project DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}