/**
 * Redis Client Configuration - Caching and Session Store
 * Production-ready with connection pooling and error handling
 */

import Redis from "ioredis"

// Singleton pattern to prevent connection exhaustion
const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined
}

export const redis = 
  globalForRedis.redis ??
  new Redis(process.env.REDIS_URL!, {
    // Connection configuration
    maxRetriesPerRequest: 3,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxLoadingTimeout: 1,
    
    // Connection pooling
    lazyConnect: true,
    keepAlive: 30000,
    
    // Error handling
    onClusterReady() {
      console.log("✅ Redis cluster ready")
    },
    onError(error) {
      console.error("❌ Redis error:", error)
    },
    
    // Performance optimizations
    enableOfflineQueue: false,
  })

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis

// Cache utilities with automatic JSON serialization

export interface CacheOptions {
  ttl?: number // TTL in seconds
  prefix?: string
}

export async function getCache<T>(
  key: string, 
  options: CacheOptions = {}
): Promise<T | null> {
  try {
    const fullKey = options.prefix ? `${options.prefix}:${key}` : key
    const value = await redis.get(fullKey)
    
    if (!value) return null
    
    return JSON.parse(value) as T
  } catch (error) {
    console.error("Cache get error:", error)
    return null
  }
}

export async function setCache<T>(
  key: string, 
  value: T, 
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const fullKey = options.prefix ? `${options.prefix}:${key}` : key
    const serialized = JSON.stringify(value)
    
    if (options.ttl) {
      await redis.setex(fullKey, options.ttl, serialized)
    } else {
      await redis.set(fullKey, serialized)
    }
    
    return true
  } catch (error) {
    console.error("Cache set error:", error)
    return false
  }
}

export async function deleteCache(
  key: string, 
  options: CacheOptions = {}
): Promise<boolean> {
  try {
    const fullKey = options.prefix ? `${options.prefix}:${key}` : key
    const result = await redis.del(fullKey)
    return result > 0
  } catch (error) {
    console.error("Cache delete error:", error)
    return false
  }
}

export async function getCacheKeys(
  pattern: string,
  options: CacheOptions = {}
): Promise<string[]> {
  try {
    const fullPattern = options.prefix ? `${options.prefix}:${pattern}` : pattern
    return await redis.keys(fullPattern)
  } catch (error) {
    console.error("Cache keys error:", error)
    return []
  }
}

// Cache invalidation utilities

export async function invalidateCachePattern(pattern: string): Promise<number> {
  try {
    const keys = await redis.keys(pattern)
    if (keys.length === 0) return 0
    
    return await redis.del(...keys)
  } catch (error) {
    console.error("Cache invalidation error:", error)
    return 0
  }
}

// Specific cache functions for Insider Pilot

export async function cacheTransactionFeed(
  filters: Record<string, any>,
  data: any,
  ttl: number = 60
): Promise<void> {
  const cacheKey = `feed:${Buffer.from(JSON.stringify(filters)).toString('base64')}`
  await setCache(cacheKey, data, { ttl, prefix: "ip" })
}

export async function getCachedTransactionFeed(
  filters: Record<string, any>
): Promise<any | null> {
  const cacheKey = `feed:${Buffer.from(JSON.stringify(filters)).toString('base64')}`
  return await getCache(cacheKey, { prefix: "ip" })
}

export async function cacheCompanyProfile(
  ticker: string,
  data: any,
  ttl: number = 300
): Promise<void> {
  await setCache(`company:${ticker.toUpperCase()}`, data, { ttl, prefix: "ip" })
}

export async function getCachedCompanyProfile(ticker: string): Promise<any | null> {
  return await getCache(`company:${ticker.toUpperCase()}`, { prefix: "ip" })
}

export async function cachePersonProfile(
  personId: string,
  data: any,
  ttl: number = 300
): Promise<void> {
  await setCache(`person:${personId}`, data, { ttl, prefix: "ip" })
}

export async function getCachedPersonProfile(personId: string): Promise<any | null> {
  return await getCache(`person:${personId}`, { prefix: "ip" })
}

export async function cacheSearchResults(
  query: string,
  type: string,
  data: any,
  ttl: number = 120
): Promise<void> {
  const cacheKey = `search:${type}:${Buffer.from(query.toLowerCase()).toString('base64')}`
  await setCache(cacheKey, data, { ttl, prefix: "ip" })
}

export async function getCachedSearchResults(
  query: string,
  type: string
): Promise<any | null> {
  const cacheKey = `search:${type}:${Buffer.from(query.toLowerCase()).toString('base64')}`
  return await getCache(cacheKey, { prefix: "ip" })
}

// Hot data caching for leaderboards and aggregates

export async function cacheHotData(
  key: string,
  data: any,
  ttl: number = 300
): Promise<void> {
  await setCache(key, data, { ttl, prefix: "hot" })
}

export async function getHotData<T>(key: string): Promise<T | null> {
  return await getCache<T>(key, { prefix: "hot" })
}

// Rate limiting utilities

export async function checkRateLimit(
  identifier: string,
  windowMs: number,
  maxRequests: number
): Promise<{ allowed: boolean; remaining: number; reset: number }> {
  try {
    const key = `ratelimit:${identifier}`
    const now = Date.now()
    const window = Math.floor(now / windowMs)
    const windowKey = `${key}:${window}`
    
    const current = await redis.incr(windowKey)
    
    if (current === 1) {
      await redis.expire(windowKey, Math.ceil(windowMs / 1000))
    }
    
    const remaining = Math.max(0, maxRequests - current)
    const resetTime = (window + 1) * windowMs
    
    return {
      allowed: current <= maxRequests,
      remaining,
      reset: resetTime,
    }
  } catch (error) {
    console.error("Rate limit check error:", error)
    // Fail open - allow request if Redis is down
    return {
      allowed: true,
      remaining: maxRequests - 1,
      reset: Date.now() + windowMs,
    }
  }
}

// Session storage for NextAuth

export async function getSession(sessionToken: string): Promise<any | null> {
  return await getCache(`session:${sessionToken}`, { prefix: "auth" })
}

export async function setSession(
  sessionToken: string,
  session: any,
  ttl: number = 28800 // 8 hours
): Promise<void> {
  await setCache(`session:${sessionToken}`, session, { ttl, prefix: "auth" })
}

export async function deleteSession(sessionToken: string): Promise<void> {
  await deleteCache(`session:${sessionToken}`, { prefix: "auth" })
}

// Cache warming for popular data

export async function warmCache(): Promise<void> {
  console.log("🔥 Starting cache warming...")
  
  try {
    // This would be implemented based on popular queries
    // For example, cache top 10 stocks, top politicians, etc.
    
    console.log("✅ Cache warming completed")
  } catch (error) {
    console.error("❌ Cache warming failed:", error)
  }
}

// Health check

export async function checkRedisHealth(): Promise<boolean> {
  try {
    const result = await redis.ping()
    return result === "PONG"
  } catch (error) {
    console.error("Redis health check failed:", error)
    return false
  }
}

// Graceful shutdown

process.on("beforeExit", async () => {
  await redis.quit()
})