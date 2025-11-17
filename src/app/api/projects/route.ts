import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import jwt from 'jsonwebtoken';

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

// GET /api/projects - List all projects for the authenticated user
export async function GET(request: NextRequest) {
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

    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', decoded.userId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error('Projects fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch projects' },
        { status: 500 }
      );
    }

    return NextResponse.json(projects);

  } catch (error) {
    console.error('Projects GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
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
    const { title, description, technology, category, status, priority } = body;

    if (!title || !description || !technology || !category) {
      return NextResponse.json(
        { error: 'Required fields: title, description, technology, category' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Get the next order index
    const { data: lastProject } = await supabase
      .from('projects')
      .select('order_index')
      .eq('user_id', decoded.userId)
      .order('order_index', { ascending: false })
      .limit(1)
      .single();

    const nextOrderIndex = (lastProject?.order_index || 0) + 1;

    const { data: project, error } = await supabase
      .from('projects')
      .insert([
        {
          title,
          description,
          technology,
          category,
          status: status || 'active',
          priority: priority || 'medium',
          order_index: nextOrderIndex,
          user_id: decoded.userId,
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Project creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    return NextResponse.json(project, { status: 201 });

  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}