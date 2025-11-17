import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase';
import { authenticateRequest } from '@/lib/auth';

// PATCH /api/projects/[id]/toggle-visibility - Toggle project visibility
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authorization required' },
        { status: 401 }
      );
    }

    const supabase = createSupabaseServerClient();

    // Get the current project
    const { data: project, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .single();

    if (fetchError || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }

    // Toggle visibility
    const newIsShown = !project.is_shown;
    let newDisplayOrder = project.display_order;

    if (newIsShown) {
      // If showing the project, find the next available display order
      const { data: shownProjects } = await supabase
        .from('projects')
        .select('display_order')
        .eq('user_id', user.userId)
        .eq('is_shown', true)
        .not('display_order', 'is', null)
        .order('display_order', { ascending: true });

      // Find the next available display order (1-5)
      const usedOrders = shownProjects?.map(p => p.display_order) || [];
      for (let i = 1; i <= 5; i++) {
        if (!usedOrders.includes(i)) {
          newDisplayOrder = i;
          break;
        }
      }

      // If all slots are taken, don't allow showing more
      if (newDisplayOrder === project.display_order && usedOrders.length >= 5) {
        return NextResponse.json(
          { error: 'Maximum of 5 projects can be shown at once' },
          { status: 400 }
        );
      }
    } else {
      // If hiding the project, remove display order
      newDisplayOrder = null;
    }

    // Update the project
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({ 
        is_shown: newIsShown,
        display_order: newDisplayOrder,
        updated_at: new Date().toISOString()
      })
      .eq('id', params.id)
      .eq('user_id', user.userId)
      .select()
      .single();

    if (updateError) {
      console.error('Project visibility toggle error:', updateError);
      return NextResponse.json(
        { error: 'Failed to toggle project visibility' },
        { status: 500 }
      );
    }

    // If we hid a project and it had a display order, reorder remaining projects
    if (!newIsShown && project.display_order) {
      await reorderDisplayAfterHiding(user.userId, project.display_order);
    }

    return NextResponse.json(updatedProject);

  } catch (error) {
    console.error('Project visibility toggle error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function reorderDisplayAfterHiding(userId: string, hiddenDisplayOrder: number) {
  const supabase = createSupabaseServerClient();
  
  try {
    // Get all shown projects with display order higher than the hidden one
    const { data: projectsToReorder } = await supabase
      .from('projects')
      .select('id, display_order')
      .eq('user_id', userId)
      .eq('is_shown', true)
      .gt('display_order', hiddenDisplayOrder)
      .not('display_order', 'is', null);

    if (!projectsToReorder || projectsToReorder.length === 0) return;

    // Update each project's display order to move up by 1
    for (const project of projectsToReorder) {
      if (project.display_order) {
        await supabase
          .from('projects')
          .update({ 
            display_order: project.display_order - 1,
            updated_at: new Date().toISOString()
          })
          .eq('id', project.id);
      }
    }
  } catch (error) {
    console.error('Error reordering projects after hiding:', error);
  }
}