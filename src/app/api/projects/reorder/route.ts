import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseClient } from '@/lib/supabase-client';
import { authenticateRequest } from '@/lib/auth';

// POST /api/projects/reorder - Reorder projects
export async function POST(request: NextRequest) {
  try {
    const authResult = authenticateRequest(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const user = authResult.user;

    const body = await request.json();
    const { projects } = body; // Array of {id, order_index}

    if (!Array.isArray(projects)) {
      return NextResponse.json(
        { error: 'Projects array is required' },
        { status: 400 }
      );
    }

    const supabase = createSupabaseClient();

    // Update each project's order_index
    const updates = projects.map((project, index) => 
      supabase
        .from('projects')
        .update({ 
          order_index: index + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', project.id)
        .eq('user_id', user.userId)
    );

    const results = await Promise.all(updates);

    // Check for any errors
    const errors = results.filter(result => result.error);
    if (errors.length > 0) {
      console.error('Project reorder errors:', errors);
      return NextResponse.json(
        { error: 'Failed to reorder some projects' },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Projects reordered successfully' });

  } catch (error) {
    console.error('Project reorder error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}