/**
 * SEC EDGAR Data Ingestion - Production Ready Pipeline
 * Handles Form 3/4/5 discovery, fetching, and parsing with proper error handling
 */

import { XMLParser } from "fast-xml-parser"
import { prisma } from "@/lib/prisma"
import crypto from "crypto"

// SEC EDGAR API configuration
const SEC_BASE_URL = "https://data.sec.gov"
const SEC_EDGAR_URL = "https://www.sec.gov/Archives/edgar/data"
const SEC_SUBMISSIONS_URL = `${SEC_BASE_URL}/submissions`
const SEC_COMPANY_FACTS_URL = `${SEC_BASE_URL}/companyfacts`

// Rate limiting - SEC requires 10 requests per second max
const RATE_LIMIT_DELAY = 100 // 100ms between requests
const MAX_RETRIES = 3
const REQUEST_TIMEOUT = 30000 // 30 seconds

// Required headers for SEC API compliance
const SEC_HEADERS = {
  "User-Agent": "Insider Pilot insider-pilot@example.com",
  "Accept": "application/json, application/xml, text/xml, */*",
  "Accept-Encoding": "gzip, deflate",
  "Host": "data.sec.gov",
}

interface SecSubmission {
  cik: string
  entityName: string
  filings: {
    recent: {
      accessionNumber: string[]
      filingDate: string[]
      reportDate: string[]
      acceptanceDateTime: string[]
      form: string[]
      fileNumber: string[]
      filmNumber: string[]
      items: string[]
      size: number[]
      isXBRL: number[]
      isInlineXBRL: number[]
      primaryDocument: string[]
      primaryDocDescription: string[]
    }
  }
}

interface ParsedTransaction {
  personName: string
  personTitle: string
  isOfficer: boolean
  isDirector: boolean
  companyName: string
  companyTicker?: string
  transactionDate: string
  transactionCode: "A" | "D" | "S" | "P"
  securityTitle: string
  shares: number
  pricePerShare?: number
  sharesOwnedAfter: number
  ownershipType: "D" | "I" // Direct or Indirect
}

class SecEdgarClient {
  private lastRequestTime = 0

  private async delay(): Promise<void> {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < RATE_LIMIT_DELAY) {
      await new Promise(resolve => 
        setTimeout(resolve, RATE_LIMIT_DELAY - timeSinceLastRequest)
      )
    }
    
    this.lastRequestTime = Date.now()
  }

  private async makeRequest(
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> {
    await this.delay()
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT)
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...SEC_HEADERS,
          ...options.headers,
        },
        signal: controller.signal,
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        throw new Error(`SEC API error: ${response.status} ${response.statusText}`)
      }
      
      // Check rate limit headers
      const remaining = response.headers.get("X-RateLimit-Remaining")
      if (remaining && parseInt(remaining) < 5) {
        console.warn("SEC API rate limit approaching, slowing down requests")
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      return response
    } catch (error) {
      clearTimeout(timeoutId)
      throw error
    }
  }

  async getCompanySubmissions(cik: string): Promise<SecSubmission | null> {
    const paddedCik = cik.padStart(10, "0")
    const url = `${SEC_SUBMISSIONS_URL}/CIK${paddedCik}.json`
    
    try {
      console.log(`📥 Fetching submissions for CIK: ${paddedCik}`)
      
      const response = await this.makeRequest(url)
      const data = await response.json() as SecSubmission
      
      console.log(`✅ Found ${data.filings.recent.accessionNumber.length} filings for ${data.entityName}`)
      
      return data
    } catch (error) {
      console.error(`❌ Failed to fetch submissions for CIK ${paddedCik}:`, error)
      return null
    }
  }

  async getFilingDocument(
    cik: string, 
    accessionNumber: string, 
    primaryDocument: string
  ): Promise<string | null> {
    const paddedCik = cik.padStart(10, "0")
    const cleanAccessionNumber = accessionNumber.replace(/-/g, "")
    const url = `${SEC_EDGAR_URL}/${paddedCik}/${cleanAccessionNumber}/${primaryDocument}`
    
    try {
      console.log(`📄 Fetching document: ${primaryDocument}`)
      
      const response = await this.makeRequest(url, {
        headers: {
          "Accept": "application/xml, text/xml, text/html, */*",
        }
      })
      
      const content = await response.text()
      
      console.log(`✅ Downloaded document (${content.length} bytes)`)
      
      return content
    } catch (error) {
      console.error(`❌ Failed to fetch document ${primaryDocument}:`, error)
      return null
    }
  }

  async discoverRecentFilings(
    ciks: string[],
    formTypes: string[] = ["3", "4", "5"],
    daysBack: number = 30
  ): Promise<Array<{
    cik: string
    accessionNumber: string
    filingDate: string
    formType: string
    primaryDocument: string
    companyName: string
  }>> {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysBack)
    
    const discoveries: any[] = []
    
    for (const cik of ciks) {
      try {
        const submissions = await this.getCompanySubmissions(cik)
        
        if (!submissions) continue
        
        const { recent } = submissions.filings
        
        for (let i = 0; i < recent.accessionNumber.length; i++) {
          const filingDate = new Date(recent.filingDate[i])
          const formType = recent.form[i]
          
          // Filter by date and form type
          if (filingDate >= cutoffDate && formTypes.includes(formType)) {
            discoveries.push({
              cik,
              accessionNumber: recent.accessionNumber[i],
              filingDate: recent.filingDate[i],
              formType,
              primaryDocument: recent.primaryDocument[i],
              companyName: submissions.entityName,
            })
          }
        }
        
        // Small delay between companies to be respectful
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error) {
        console.error(`Failed to process CIK ${cik}:`, error)
        continue
      }
    }
    
    console.log(`🔍 Discovered ${discoveries.length} recent filings`)
    
    return discoveries.sort((a, b) => 
      new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()
    )
  }
}

// XML Parser configuration
const xmlParser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  textNodeName: "#text",
  parseAttributeValue: true,
  parseTagValue: true,
  trimValues: true,
})

export class SecFilingParser {
  parseForm4(xmlContent: string): ParsedTransaction[] {
    try {
      const parsedXml = xmlParser.parse(xmlContent)
      const ownershipDocument = parsedXml.ownershipDocument || parsedXml
      
      if (!ownershipDocument) {
        throw new Error("Invalid Form 4 XML structure")
      }
      
      // Extract issuer information
      const issuer = ownershipDocument.issuer
      const companyName = issuer?.issuerName?.["#text"] || issuer?.issuerName || ""
      const companyTicker = issuer?.issuerTradingSymbol?.["#text"] || issuer?.issuerTradingSymbol || ""
      
      // Extract reporting owner information
      const reportingOwner = ownershipDocument.reportingOwner
      const personName = reportingOwner?.reportingOwnerId?.rptOwnerName?.["#text"] || 
                         reportingOwner?.reportingOwnerId?.rptOwnerName || ""
      
      const ownerRelationship = reportingOwner?.reportingOwnerRelationship || {}
      const isOfficer = ownerRelationship?.isOfficer === "1" || ownerRelationship?.isOfficer === true
      const isDirector = ownerRelationship?.isDirector === "1" || ownerRelationship?.isDirector === true
      const personTitle = ownerRelationship?.officerTitle?.["#text"] || 
                         ownerRelationship?.officerTitle || ""
      
      // Extract transactions
      const transactions: ParsedTransaction[] = []
      const nonDerivativeTable = ownershipDocument.nonDerivativeTable
      
      if (nonDerivativeTable?.nonDerivativeTransaction) {
        const transactionArray = Array.isArray(nonDerivativeTable.nonDerivativeTransaction) 
          ? nonDerivativeTable.nonDerivativeTransaction 
          : [nonDerivativeTable.nonDerivativeTransaction]
        
        for (const transaction of transactionArray) {
          try {
            const transactionDate = transaction.transactionDate?.value?.["#text"] || 
                                   transaction.transactionDate?.value || ""
            
            const transactionCode = transaction.transactionCoding?.transactionCode?.["#text"] || 
                                   transaction.transactionCoding?.transactionCode || ""
            
            const securityTitle = transaction.securityTitle?.value?.["#text"] || 
                                 transaction.securityTitle?.value || "Common Stock"
            
            const transactionAmounts = transaction.transactionAmounts || {}
            const shares = parseFloat(transactionAmounts.transactionShares?.value?.["#text"] || 
                                    transactionAmounts.transactionShares?.value || "0")
            
            const pricePerShare = parseFloat(transactionAmounts.transactionPricePerShare?.value?.["#text"] || 
                                           transactionAmounts.transactionPricePerShare?.value || "0") || undefined
            
            const ownershipNature = transaction.ownershipNature || {}
            const sharesOwnedAfter = parseFloat(ownershipNature.directOrIndirectOwnership?.value?.["#text"] || 
                                              ownershipNature.directOrIndirectOwnership?.value || "0")
            
            const ownershipType = ownershipNature.natureOfOwnership?.value?.["#text"] === "I" ? "I" : "D"
            
            if (shares > 0 && transactionDate && transactionCode) {
              transactions.push({
                personName,
                personTitle,
                isOfficer,
                isDirector,
                companyName,
                companyTicker,
                transactionDate,
                transactionCode: transactionCode as "A" | "D" | "S" | "P",
                securityTitle,
                shares,
                pricePerShare,
                sharesOwnedAfter,
                ownershipType,
              })
            }
          } catch (transactionError) {
            console.warn("Failed to parse individual transaction:", transactionError)
            continue
          }
        }
      }
      
      console.log(`📊 Parsed ${transactions.length} transactions from Form 4`)
      
      return transactions
    } catch (error) {
      console.error("Failed to parse Form 4 XML:", error)
      throw new Error(`Form 4 parsing failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }
}

// Main ingestion pipeline
export class SecDataPipeline {
  private client = new SecEdgarClient()
  private parser = new SecFilingParser()

  async ingestRecentFilings(
    targetCiks: string[] = [],
    daysBack: number = 7
  ): Promise<{
    discovered: number
    processed: number
    errors: number
  }> {
    console.log("🚀 Starting SEC data ingestion pipeline...")
    
    // If no CIKs provided, get from existing companies
    if (targetCiks.length === 0) {
      const companies = await prisma.company.findMany({
        where: {
          cik: { not: null }
        },
        select: { cik: true },
        take: 100, // Limit to avoid overwhelming SEC API
      })
      
      targetCiks = companies
        .map(c => c.cik!)
        .filter(cik => cik.length > 0)
    }
    
    console.log(`🎯 Targeting ${targetCiks.length} companies`)
    
    // Discover recent filings
    const discoveries = await this.client.discoverRecentFilings(
      targetCiks,
      ["4"], // Focus on Form 4 for now
      daysBack
    )
    
    let processed = 0
    let errors = 0
    
    // Process each discovered filing
    for (const discovery of discoveries) {
      try {
        await this.processFiling(discovery)
        processed++
        
        // Progress logging
        if (processed % 10 === 0) {
          console.log(`📈 Progress: ${processed}/${discoveries.length} filings processed`)
        }
        
      } catch (error) {
        console.error(`Failed to process filing ${discovery.accessionNumber}:`, error)
        errors++
      }
    }
    
    console.log(`✅ SEC ingestion complete: ${processed} processed, ${errors} errors`)
    
    return {
      discovered: discoveries.length,
      processed,
      errors,
    }
  }

  private async processFiling(discovery: any): Promise<void> {
    const checksum = crypto
      .createHash("sha256")
      .update(`${discovery.cik}-${discovery.accessionNumber}`)
      .digest("hex")
    
    // Check if already processed
    const existing = await prisma.filing.findUnique({
      where: { checksum }
    })
    
    if (existing) {
      console.log(`⏭️  Skipping already processed filing: ${discovery.accessionNumber}`)
      return
    }
    
    // Download the filing document
    const xmlContent = await this.client.getFilingDocument(
      discovery.cik,
      discovery.accessionNumber,
      discovery.primaryDocument
    )
    
    if (!xmlContent) {
      throw new Error("Failed to download filing document")
    }
    
    // Create filing record
    const filing = await prisma.filing.create({
      data: {
        source: "SEC",
        formType: discovery.formType,
        url: `${SEC_EDGAR_URL}/${discovery.cik.padStart(10, "0")}/${discovery.accessionNumber.replace(/-/g, "")}/${discovery.primaryDocument}`,
        filingDate: new Date(discovery.filingDate),
        accessionNo: discovery.accessionNumber,
        rawXml: xmlContent,
        checksum,
        status: "PENDING",
      }
    })
    
    // Parse transactions from the filing
    if (discovery.formType === "4") {
      try {
        const transactions = this.parser.parseForm4(xmlContent)
        
        await this.saveTransactions(filing.id, transactions, discovery.cik)
        
        // Update filing status
        await prisma.filing.update({
          where: { id: filing.id },
          data: {
            status: "COMPLETED",
            processedAt: new Date(),
          }
        })
        
        console.log(`✅ Processed ${transactions.length} transactions from ${discovery.accessionNumber}`)
        
      } catch (parseError) {
        await prisma.filing.update({
          where: { id: filing.id },
          data: {
            status: "FAILED",
            errorMsg: parseError instanceof Error ? parseError.message : "Parse error",
          }
        })
        
        throw parseError
      }
    }
  }

  private async saveTransactions(
    filingId: string, 
    transactions: ParsedTransaction[],
    cik: string
  ): Promise<void> {
    for (const transaction of transactions) {
      try {
        // Find or create person
        let person = await prisma.person.findFirst({
          where: {
            name: transaction.personName,
            type: "CORPORATE_INSIDER",
          }
        })
        
        if (!person) {
          person = await prisma.person.create({
            data: {
              name: transaction.personName,
              type: "CORPORATE_INSIDER",
              title: transaction.personTitle,
            }
          })
        }
        
        // Find or create company
        let company = await prisma.company.findFirst({
          where: {
            OR: [
              { cik },
              { ticker: transaction.companyTicker },
              { name: transaction.companyName },
            ]
          }
        })
        
        if (!company) {
          company = await prisma.company.create({
            data: {
              name: transaction.companyName,
              ticker: transaction.companyTicker || "",
              cik,
            }
          })
        }
        
        // Calculate estimated value
        const estimatedValue = transaction.pricePerShare 
          ? transaction.shares * transaction.pricePerShare
          : null
        
        // Create transaction record
        await prisma.transaction.create({
          data: {
            personId: person.id,
            companyId: company.id,
            filingId,
            tradeType: transaction.transactionCode === "A" ? "BUY" : "SELL",
            securityType: transaction.securityTitle,
            quantity: transaction.shares,
            price: transaction.pricePerShare,
            estimatedValue,
            transactionDate: new Date(transaction.transactionDate),
            reportedDate: new Date(),
            beneficialOwnerType: transaction.ownershipType === "D" ? "DIRECT" : "INDIRECT",
            sourceConfidence: 0.95, // High confidence for SEC data
          }
        })
        
      } catch (transactionError) {
        console.error("Failed to save transaction:", transactionError)
        // Continue processing other transactions
      }
    }
  }
}

// Export main pipeline instance
export const secPipeline = new SecDataPipeline()