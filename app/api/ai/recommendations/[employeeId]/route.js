/**
 * @swagger
 * /api/ai/recommendations/{employeeId}:
 *   get:
 *     summary: Get AI course recommendations
 *     tags: [AI]
 *     security:
 *       - bearerAuth: []
 */

import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/jwt';
import { getAIRecommendations } from '@/lib/ai-recommendations';

export async function GET(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const recommendations = await getAIRecommendations(params.employeeId);

    return NextResponse.json(
      { success: true, data: recommendations },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error in GET /api/ai/recommendations/[employeeId]:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch recommendations' },
      { status: 500 }
    );
  }
}