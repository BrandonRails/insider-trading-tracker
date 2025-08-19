/**
 * Queue Monitoring API - Admin endpoint for job queue health
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { getQueueHealth } from "@/lib/queues"

export async function GET(request: NextRequest) {
  try {
    // Require admin authentication
    await requireAdmin()
    
    const health = await getQueueHealth()
    
    return NextResponse.json({
      status: "healthy",
      queues: health,
      timestamp: new Date().toISOString(),
    })
    
  } catch (error: any) {
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("Queue health API error:", error)
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}