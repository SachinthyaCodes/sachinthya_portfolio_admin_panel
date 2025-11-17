import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import jwt from 'jsonwebtoken';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Map database fields to frontend expected fields
function mapDbToFrontend(dbProject: any) {
  return {
    id: dbProject.id.toString(), // Ensure ID is a string for API consistency
    name: dbProject.name || dbProject.title, // Frontend expects 'name'
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

// Map frontend fields to database fields
function mapFrontendToDb(frontendData: any) {
  return {
    name: frontendData.name,
    title: frontendData.name, // Keep title for backward compatibility
    category: frontendData.category,
    description: frontendData.description,
    comprehensive_summary: frontendData.comprehensiveSummary,
    tech: Array.isArray(frontendData.tech) ? frontendData.tech : [],
    links: Array.isArray(frontendData.links) ? frontendData.links : [],
    image_url: frontendData.imageUrl,
    is_shown: frontendData.isShown,
    order_index: frontendData.order,
    display_order: frontendData.order // Keep display_order synced
  };
}

function getAuthToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

function verifyToken(token: string): any {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (error) {
    return null;
  }
}

// GET /api/projects - Fetch all projects for the authenticated user
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

    // Map database fields to frontend expected format
    const mappedProjects = (projects || []).map(mapDbToFrontend);
    return NextResponse.json(mappedProjects);

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
    console.log('Projects POST started');
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

    // Parse FormData instead of JSON
    const formData = await request.formData();
    console.log('FormData received:', Object.fromEntries(formData.entries()));

    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const description = formData.get('description') as string;
    const comprehensiveSummary = formData.get('comprehensiveSummary') as string;
    const techString = formData.get('tech') as string;
    const linksString = formData.get('links') as string;
    const isShown = formData.get('isShown') === 'true';
    const order = formData.get('order') ? parseInt(formData.get('order') as string) : undefined;

    if (!name || !description || !category) {
      return NextResponse.json(
        { error: 'Required fields: name, description, category' },
        { status: 400 }
      );
    }

    // Parse JSON strings
    let tech: string[] = [];
    let links: any[] = [];
    
    try {
      tech = techString ? JSON.parse(techString) : [];
    } catch (e) {
      console.error('Error parsing tech:', e);
      tech = [];
    }

    try {
      links = linksString ? JSON.parse(linksString) : [];
    } catch (e) {
      console.error('Error parsing links:', e);
      links = [];
    }

    // Get the next order index if not provided
    let orderIndex = order;
    if (!orderIndex) {
      const { data: lastProjects } = await supabase
        .from('projects')
        .select('order_index')
        .eq('user_id', decoded.userId)
        .order('order_index', { ascending: false })
        .limit(1);

      orderIndex = (lastProjects?.[0]?.order_index || 0) + 1;
    }

    const projectData = {
      name,
      title: name, // Keep title for backward compatibility
      category,
      description,
      comprehensive_summary: comprehensiveSummary || description,
      tech: Array.isArray(tech) ? tech : [],
      links: Array.isArray(links) ? links : [],
      is_shown: isShown || false,
      order_index: orderIndex,
      user_id: decoded.userId,
    };

    console.log('Creating project with data:', projectData);

    const { data: project, error } = await supabase
      .from('projects')
      .insert(projectData)
      .select()
      .single();

    if (error) {
      console.error('Project creation error:', error);
      return NextResponse.json(
        { error: 'Failed to create project' },
        { status: 500 }
      );
    }

    // Return frontend-compatible format
    return NextResponse.json(mapDbToFrontend(project), { status: 201 });

  } catch (error) {
    console.error('Projects POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}