/**
 * BullMQ Job Queue Configuration - ETL Pipeline Management
 * Production-ready queue system with monitoring and error handling
 */

import { Queue, Worker, Job, QueueEvents } from "bullmq"
import { redis } from "@/lib/redis"
import { prisma } from "@/lib/prisma"

// Queue definitions with different priorities and configurations

export const secFilingQueue = new Queue("sec-filing", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential",
      delay: 5000,
    },
  },
})

export const politicianFilingQueue = new Queue("politician-filing", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: "exponential", 
      delay: 10000,
    },
  },
})

export const alertQueue = new Queue("alerts", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 500,
    removeOnFail: 100,
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 2000,
    },
  },
})

export const enrichmentQueue = new Queue("enrichment", {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 50,
    removeOnFail: 25,
    attempts: 2,
    backoff: {
      type: "fixed",
      delay: 5000,
    },
  },
})

// Job interfaces

export interface SecFilingJobData {
  type: "discover" | "fetch" | "parse"
  url?: string
  accessionNo?: string
  filingId?: string
  formType?: string
}

export interface PoliticianFilingJobData {
  type: "discover-house" | "discover-senate" | "fetch-pdf" | "parse-ptr"
  url?: string
  filingId?: string
  chamber?: "house" | "senate"
}

export interface AlertJobData {
  type: "check-rules" | "send-email" | "send-push"
  userId?: string
  transactionIds?: string[]
  alertRuleId?: string
}

export interface EnrichmentJobData {
  type: "resolve-person" | "resolve-company" | "calculate-performance" | "update-prices"
  transactionId?: string
  personId?: string
  companyId?: string
  ticker?: string
}

// SEC Filing Workers

const secFilingWorker = new Worker(
  "sec-filing",
  async (job: Job<SecFilingJobData>) => {
    const { type, url, accessionNo, filingId, formType } = job.data
    
    console.log(`Processing SEC filing job: ${type}`, { accessionNo, formType })
    
    try {
      switch (type) {
        case "discover":
          return await discoverSecFilings()
          
        case "fetch":
          if (!url || !accessionNo) throw new Error("Missing required data for fetch job")
          return await fetchSecFiling(url, accessionNo)
          
        case "parse":
          if (!filingId) throw new Error("Missing filingId for parse job")
          return await parseSecFiling(filingId)
          
        default:
          throw new Error(`Unknown SEC filing job type: ${type}`)
      }
    } catch (error) {
      console.error(`SEC filing job failed: ${type}`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 5,
    removeOnComplete: 100,
    removeOnFail: 50,
  }
)

// Politician Filing Workers

const politicianFilingWorker = new Worker(
  "politician-filing", 
  async (job: Job<PoliticianFilingJobData>) => {
    const { type, url, filingId, chamber } = job.data
    
    console.log(`Processing politician filing job: ${type}`, { chamber, url })
    
    try {
      switch (type) {
        case "discover-house":
          return await discoverHouseFilings()
          
        case "discover-senate":
          return await discoverSenateFilings()
          
        case "fetch-pdf":
          if (!url) throw new Error("Missing URL for fetch-pdf job")
          return await fetchPoliticianPdf(url)
          
        case "parse-ptr":
          if (!filingId) throw new Error("Missing filingId for parse-ptr job")
          return await parsePoliticianFiling(filingId)
          
        default:
          throw new Error(`Unknown politician filing job type: ${type}`)
      }
    } catch (error) {
      console.error(`Politician filing job failed: ${type}`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 3,
    removeOnComplete: 100,
    removeOnFail: 50,
  }
)

// Alert Workers

const alertWorker = new Worker(
  "alerts",
  async (job: Job<AlertJobData>) => {
    const { type, userId, transactionIds, alertRuleId } = job.data
    
    console.log(`Processing alert job: ${type}`, { userId, alertRuleId })
    
    try {
      switch (type) {
        case "check-rules":
          return await checkAlertRules()
          
        case "send-email":
          if (!userId || !transactionIds) throw new Error("Missing data for send-email job")
          return await sendEmailAlert(userId, transactionIds)
          
        case "send-push":
          if (!userId || !transactionIds) throw new Error("Missing data for send-push job")
          return await sendPushAlert(userId, transactionIds)
          
        default:
          throw new Error(`Unknown alert job type: ${type}`)
      }
    } catch (error) {
      console.error(`Alert job failed: ${type}`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 10,
    removeOnComplete: 500,
    removeOnFail: 100,
  }
)

// Enrichment Workers

const enrichmentWorker = new Worker(
  "enrichment",
  async (job: Job<EnrichmentJobData>) => {
    const { type, transactionId, personId, companyId, ticker } = job.data
    
    console.log(`Processing enrichment job: ${type}`, { transactionId, ticker })
    
    try {
      switch (type) {
        case "resolve-person":
          if (!transactionId) throw new Error("Missing transactionId for resolve-person job")
          return await resolvePerson(transactionId)
          
        case "resolve-company":
          if (!transactionId) throw new Error("Missing transactionId for resolve-company job")
          return await resolveCompany(transactionId)
          
        case "calculate-performance":
          if (!transactionId) throw new Error("Missing transactionId for calculate-performance job")
          return await calculatePerformance(transactionId)
          
        case "update-prices":
          if (!ticker) throw new Error("Missing ticker for update-prices job")
          return await updatePrices(ticker)
          
        default:
          throw new Error(`Unknown enrichment job type: ${type}`)
      }
    } catch (error) {
      console.error(`Enrichment job failed: ${type}`, error)
      throw error
    }
  },
  {
    connection: redis,
    concurrency: 8,
    removeOnComplete: 50,
    removeOnFail: 25,
  }
)

// Job processing functions (mock implementations - replace with real logic)

async function discoverSecFilings() {
  console.log("🔍 Discovering SEC filings...")
  
  // Mock implementation - in production, call SEC EDGAR API
  const mockFilings = [
    { accessionNo: "0000320193-25-000001", formType: "4", url: "https://example.com/filing1" },
    { accessionNo: "0000789019-25-000002", formType: "4", url: "https://example.com/filing2" },
  ]
  
  // Queue fetch jobs for new filings
  for (const filing of mockFilings) {
    await secFilingQueue.add("fetch", {
      type: "fetch",
      url: filing.url,
      accessionNo: filing.accessionNo,
      formType: filing.formType,
    })
  }
  
  return { discovered: mockFilings.length }
}

async function fetchSecFiling(url: string, accessionNo: string) {
  console.log(`📥 Fetching SEC filing: ${accessionNo}`)
  
  // Mock fetch - in production, download from SEC EDGAR
  await new Promise(resolve => setTimeout(resolve, 1000))
  
  // Create filing record
  const filing = await prisma.filing.create({
    data: {
      source: "SEC",
      formType: "4",
      url,
      filingDate: new Date(),
      accessionNo,
      checksum: `mock-${accessionNo}`,
      rawXml: "<mock>XML content</mock>",
      status: "PENDING",
    }
  })
  
  // Queue parse job
  await secFilingQueue.add("parse", {
    type: "parse",
    filingId: filing.id,
  })
  
  return { filingId: filing.id }
}

async function parseSecFiling(filingId: string) {
  console.log(`🔍 Parsing SEC filing: ${filingId}`)
  
  // Mock parsing - in production, parse XML/XBRL content
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // Update filing status
  await prisma.filing.update({
    where: { id: filingId },
    data: {
      status: "COMPLETED", 
      processedAt: new Date(),
    }
  })
  
  // Mock transaction creation
  // In production, extract actual transaction data
  
  return { parsed: true }
}

async function discoverHouseFilings() {
  console.log("🔍 Discovering House PTR filings...")
  // Mock implementation
  return { discovered: 0 }
}

async function discoverSenateFilings() {
  console.log("🔍 Discovering Senate STOCK Act filings...")
  // Mock implementation
  return { discovered: 0 }
}

async function fetchPoliticianPdf(url: string) {
  console.log(`📥 Fetching politician PDF: ${url}`)
  // Mock implementation
  return { fetched: true }
}

async function parsePoliticianFiling(filingId: string) {
  console.log(`🔍 Parsing politician filing: ${filingId}`)
  // Mock implementation
  return { parsed: true }
}

async function checkAlertRules() {
  console.log("🚨 Checking alert rules...")
  // Mock implementation - in production, check all active alert rules
  return { rulesChecked: 0 }
}

async function sendEmailAlert(userId: string, transactionIds: string[]) {
  console.log(`📧 Sending email alert to user: ${userId}`)
  // Mock implementation - in production, send actual email
  return { sent: true }
}

async function sendPushAlert(userId: string, transactionIds: string[]) {
  console.log(`🔔 Sending push alert to user: ${userId}`)
  // Mock implementation - in production, send push notification
  return { sent: true }
}

async function resolvePerson(transactionId: string) {
  console.log(`👤 Resolving person for transaction: ${transactionId}`)
  // Mock implementation - in production, deduplicate and enrich person data
  return { resolved: true }
}

async function resolveCompany(transactionId: string) {
  console.log(`🏢 Resolving company for transaction: ${transactionId}`)
  // Mock implementation - in production, resolve CIK to ticker/company
  return { resolved: true }
}

async function calculatePerformance(transactionId: string) {
  console.log(`📈 Calculating performance for transaction: ${transactionId}`)
  // Mock implementation - in production, calculate actual stock performance
  return { calculated: true }
}

async function updatePrices(ticker: string) {
  console.log(`💰 Updating prices for ticker: ${ticker}`)
  // Mock implementation - in production, fetch from market data API
  return { updated: true }
}

// Queue management utilities

export async function addRecurringJobs() {
  console.log("⏰ Setting up recurring jobs...")
  
  // Discover SEC filings every 15 minutes
  await secFilingQueue.add(
    "discover",
    { type: "discover" },
    {
      repeat: { pattern: "*/15 * * * *" },
      jobId: "discover-sec-filings",
    }
  )
  
  // Discover politician filings every hour
  await politicianFilingQueue.add(
    "discover-house",
    { type: "discover-house" },
    {
      repeat: { pattern: "0 * * * *" },
      jobId: "discover-house-filings",
    }
  )
  
  await politicianFilingQueue.add(
    "discover-senate", 
    { type: "discover-senate" },
    {
      repeat: { pattern: "30 * * * *" },
      jobId: "discover-senate-filings",
    }
  )
  
  // Check alert rules every 5 minutes
  await alertQueue.add(
    "check-rules",
    { type: "check-rules" },
    {
      repeat: { pattern: "*/5 * * * *" },
      jobId: "check-alert-rules",
    }
  )
  
  console.log("✅ Recurring jobs configured")
}

// Health monitoring

export async function getQueueHealth() {
  const [secStats, politicianStats, alertStats, enrichmentStats] = await Promise.all([
    secFilingQueue.getWaiting(),
    politicianFilingQueue.getWaiting(), 
    alertQueue.getWaiting(),
    enrichmentQueue.getWaiting(),
  ])
  
  return {
    secFiling: {
      waiting: secStats.length,
      active: (await secFilingQueue.getActive()).length,
      completed: (await secFilingQueue.getCompleted()).length,
      failed: (await secFilingQueue.getFailed()).length,
    },
    politicianFiling: {
      waiting: politicianStats.length,
      active: (await politicianFilingQueue.getActive()).length,
      completed: (await politicianFilingQueue.getCompleted()).length,
      failed: (await politicianFilingQueue.getFailed()).length,
    },
    alerts: {
      waiting: alertStats.length,
      active: (await alertQueue.getActive()).length,
      completed: (await alertQueue.getCompleted()).length,
      failed: (await alertQueue.getFailed()).length,
    },
    enrichment: {
      waiting: enrichmentStats.length,
      active: (await enrichmentQueue.getActive()).length,
      completed: (await enrichmentQueue.getCompleted()).length,
      failed: (await enrichmentQueue.getFailed()).length,
    },
  }
}

// Graceful shutdown

export async function closeQueues() {
  console.log("🛑 Closing job queues...")
  
  await Promise.all([
    secFilingWorker.close(),
    politicianFilingWorker.close(),
    alertWorker.close(),
    enrichmentWorker.close(),
    secFilingQueue.close(),
    politicianFilingQueue.close(),
    alertQueue.close(),
    enrichmentQueue.close(),
  ])
  
  console.log("✅ Queues closed")
}

process.on("SIGTERM", closeQueues)
process.on("SIGINT", closeQueues)