/**
 * SEC Data Ingestion API - Manual trigger for admin users
 */

import { NextRequest, NextResponse } from "next/server"
import { requireAdmin } from "@/lib/auth-utils"
import { secPipeline } from "@/lib/sec-edgar"
import { z } from "zod"

const ingestRequestSchema = z.object({
  ciks: z.array(z.string()).optional(),
  daysBack: z.number().min(1).max(30).default(7),
  force: z.boolean().default(false),
})

export async function POST(request: NextRequest) {
  try {
    // Require admin authentication
    const admin = await requireAdmin()
    
    const body = await request.json()
    
    // Validate request
    const validation = ingestRequestSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request", details: validation.error.issues },
        { status: 400 }
      )
    }
    
    const { ciks, daysBack, force } = validation.data
    
    console.log(`🚀 Manual SEC ingestion triggered by admin: ${admin.email}`)
    console.log(`Parameters: daysBack=${daysBack}, ciks=${ciks?.length || 0}, force=${force}`)
    
    // Start ingestion
    const startTime = Date.now()
    
    const result = await secPipeline.ingestRecentFilings(
      ciks || [],
      daysBack
    )
    
    const duration = Date.now() - startTime
    
    console.log(`✅ SEC ingestion completed in ${duration}ms`)
    
    // Return results
    return NextResponse.json({
      success: true,
      result: {
        ...result,
        duration,
        triggeredBy: admin.email,
        timestamp: new Date().toISOString(),
      }
    })
    
  } catch (error: any) {
    if (error.message === "Authentication required" || error.message === "Admin access required") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    console.error("SEC ingestion API error:", error)
    
    return NextResponse.json(
      { 
        error: "Ingestion failed", 
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}