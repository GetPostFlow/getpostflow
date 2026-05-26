import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const demoTasks = [
      {
        id: 'task-1',
        title: 'Set up Northwind brand kit',
        description: 'Once intake is complete, populate brand kit with client assets.',
        clientName: 'Northwind Studio',
        status: 'todo',
        priority: 'high',
        assignedTo: 'Sarah Johnson',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-2',
        title: 'Reply to Acme wholesale inquiry',
        description: 'Corporate catering company is waiting on bulk pricing information.',
        clientName: 'Acme Bakery',
        status: 'in_progress',
        priority: 'high',
        assignedTo: 'Mike Chen',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-3',
        title: 'Schedule Sunrise fall menu content',
        description: 'Move the Fall Menu Launch post to published schedule.',
        clientName: 'Sunrise Cafe',
        status: 'todo',
        priority: 'medium',
        assignedTo: 'Jessica Martinez',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-4',
        title: 'Approve Acme sourdough draft post',
        description: 'Review and approve the Monday Morning Sourdough Drop post.',
        clientName: 'Acme Bakery',
        status: 'todo',
        priority: 'high',
        assignedTo: 'Sarah Johnson',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-5',
        title: 'Send Northwind intake reminder',
        description: 'Client has not completed their intake form after 3 days.',
        clientName: 'Northwind Studio',
        status: 'in_progress',
        priority: 'low',
        assignedTo: 'Mike Chen',
        dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-6',
        title: 'Draft Acme Bakery May content calendar',
        description: 'Create 8-12 posts for the May calendar across IG, FB, TikTok.',
        clientName: 'Acme Bakery',
        status: 'in_progress',
        priority: 'medium',
        assignedTo: 'Jessica Martinez',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-7',
        title: 'Review Sunrise Cafe brand strategy',
        description: 'Review and provide feedback on the brand strategy draft.',
        clientName: 'Sunrise Cafe',
        status: 'done',
        priority: 'high',
        assignedTo: 'Sarah Johnson',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: 'task-8',
        title: 'Update Northwind portfolio',
        description: 'Add recent project photos to the studio portfolio.',
        clientName: 'Northwind Studio',
        status: 'done',
        priority: 'low',
        assignedTo: 'Mike Chen',
        dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ];

    return NextResponse.json({ tasks: demoTasks });
  } catch (error) {
    console.error('Error fetching demo tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch demo tasks' }, { status: 500 });
  }
}
