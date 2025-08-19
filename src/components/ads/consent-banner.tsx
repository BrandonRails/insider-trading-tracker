/**
 * Consent Banner - GDPR/CCPA compliance for ad personalization
 */

"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { adManager } from "@/lib/ads"
import { cn } from "@/lib/utils"
import { Shield, Cookie, Settings, CheckCircle, XCircle } from "lucide-react"

interface ConsentPreferences {
  necessary: boolean
  analytics: boolean
  advertising: boolean
  personalization: boolean
}

interface ConsentBannerProps {
  className?: string
}

export function ConsentBanner({ className }: ConsentBannerProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [showDetails, setShowDetails] = React.useState(false)
  const [preferences, setPreferences] = React.useState<ConsentPreferences>({
    necessary: true, // Always required
    analytics: false,
    advertising: false,
    personalization: false,
  })

  React.useEffect(() => {
    // Check if user has already provided consent
    const hasConsent = localStorage.getItem("consent_provided")
    const consentData = adManager.getConsentData()
    
    // Show banner if no consent provided and no existing consent data
    if (!hasConsent && !consentData?.hasConsent) {
      setIsVisible(true)
    }
  }, [])

  const handleAcceptAll = () => {
    const fullConsent: ConsentPreferences = {
      necessary: true,
      analytics: true,
      advertising: true,
      personalization: true,
    }
    
    saveConsent(fullConsent)
    setIsVisible(false)
  }

  const handleRejectAll = () => {
    const minimalConsent: ConsentPreferences = {
      necessary: true,
      analytics: false,
      advertising: false,
      personalization: false,
    }
    
    saveConsent(minimalConsent)
    setIsVisible(false)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
    setIsVisible(false)
  }

  const saveConsent = (consentPrefs: ConsentPreferences) => {
    // Save to localStorage
    localStorage.setItem("consent_provided", "true")
    localStorage.setItem("consent_preferences", JSON.stringify(consentPrefs))
    localStorage.setItem("consent_timestamp", new Date().toISOString())

    // Update ad manager
    adManager.updateConsent({
      hasConsent: consentPrefs.advertising && consentPrefs.personalization,
      gdprApplies: true, // Assume GDPR applies for safety
      vendors: {
        "google": consentPrefs.advertising,
        "analytics": consentPrefs.analytics,
      },
    })

    // Track consent choice
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("consent", "update", {
        analytics_storage: consentPrefs.analytics ? "granted" : "denied",
        ad_storage: consentPrefs.advertising ? "granted" : "denied",
        ad_user_data: consentPrefs.personalization ? "granted" : "denied",
        ad_personalization: consentPrefs.personalization ? "granted" : "denied",
      })
    }
  }

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === "necessary") return // Cannot disable necessary cookies
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!isVisible) return null

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 p-4",
      "bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
      "border-t border-border shadow-lg",
      className
    )}>
      <div className="container max-w-6xl mx-auto">
        <Card className="border-0 bg-transparent shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-start gap-3">
              <Cookie className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div className="flex-1">
                <CardTitle className="text-lg mb-2">
                  We value your privacy
                </CardTitle>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use cookies and similar technologies to enhance your experience, 
                  analyze site traffic, and serve personalized ads. You can manage your 
                  preferences below or accept all to continue.
                </p>
              </div>
            </div>
          </CardHeader>

          {showDetails && (
            <CardContent className="pt-0">
              <div className="space-y-4">
                <h3 className="font-medium flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Cookie Preferences
                </h3>
                
                <div className="grid gap-3">
                  {[
                    {
                      key: "necessary" as const,
                      title: "Necessary Cookies",
                      description: "Essential for website functionality and security",
                      required: true,
                    },
                    {
                      key: "analytics" as const,
                      title: "Analytics Cookies",
                      description: "Help us understand how visitors interact with our website",
                      required: false,
                    },
                    {
                      key: "advertising" as const,
                      title: "Advertising Cookies",
                      description: "Used to display relevant ads and measure ad effectiveness",
                      required: false,
                    },
                    {
                      key: "personalization" as const,
                      title: "Personalization Cookies",
                      description: "Customize content and ads based on your interests",
                      required: false,
                    },
                  ].map((category) => (
                    <div
                      key={category.key}
                      className="flex items-center justify-between p-3 rounded-lg border bg-card"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-sm">{category.title}</h4>
                          {category.required && (
                            <Badge variant="secondary" className="text-xs">
                              Required
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "ml-3 p-1 h-8 w-8",
                          preferences[category.key] 
                            ? "text-green-600 hover:text-green-700" 
                            : "text-red-600 hover:text-red-700"
                        )}
                        onClick={() => togglePreference(category.key)}
                        disabled={category.required}
                      >
                        {preferences[category.key] ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  <span>
                    Your data is protected according to our Privacy Policy and applicable 
                    data protection laws (GDPR, CCPA).
                  </span>
                </div>
              </div>
            </CardContent>
          )}

          <CardFooter className="pt-4 gap-3 flex-wrap">
            {!showDetails ? (
              <>
                <Button onClick={handleAcceptAll} className="flex-1 sm:flex-initial">
                  Accept All
                </Button>
                <Button 
                  variant="outline" 
                  onClick={handleRejectAll}
                  className="flex-1 sm:flex-initial"
                >
                  Reject All
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => setShowDetails(true)}
                  className="flex-1 sm:flex-initial"
                >
                  Customize
                </Button>
              </>
            ) : (
              <>
                <Button onClick={handleSavePreferences} className="flex-1 sm:flex-initial">
                  Save Preferences
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowDetails(false)}
                  className="flex-1 sm:flex-initial"
                >
                  Back
                </Button>
              </>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}

/**
 * Privacy Settings Component - For settings page
 */
export function PrivacySettings() {
  const [preferences, setPreferences] = React.useState<ConsentPreferences>({
    necessary: true,
    analytics: false,
    advertising: false,
    personalization: false,
  })

  React.useEffect(() => {
    // Load current preferences
    const saved = localStorage.getItem("consent_preferences")
    if (saved) {
      setPreferences(JSON.parse(saved))
    }
  }, [])

  const handleSave = () => {
    localStorage.setItem("consent_preferences", JSON.stringify(preferences))
    localStorage.setItem("consent_timestamp", new Date().toISOString())

    // Update ad manager
    adManager.updateConsent({
      hasConsent: preferences.advertising && preferences.personalization,
      gdprApplies: true,
      vendors: {
        "google": preferences.advertising,
        "analytics": preferences.analytics,
      },
    })

    // Show success message
    alert("Privacy preferences updated successfully!")
  }

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === "necessary") return
    
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Privacy Settings
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage how we collect and use your data to personalize your experience.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {[
          {
            key: "necessary" as const,
            title: "Essential Cookies",
            description: "Required for basic site functionality and security",
            required: true,
          },
          {
            key: "analytics" as const,
            title: "Analytics",
            description: "Help us improve the site by analyzing usage patterns",
            required: false,
          },
          {
            key: "advertising" as const,
            title: "Advertising",
            description: "Show you relevant ads and support our free service",
            required: false,
          },
          {
            key: "personalization" as const,
            title: "Personalization",
            description: "Customize content and features based on your preferences",
            required: false,
          },
        ].map((category) => (
          <div
            key={category.key}
            className="flex items-center justify-between p-4 rounded-lg border"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium">{category.title}</h3>
                {category.required && (
                  <Badge variant="secondary" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {category.description}
              </p>
            </div>
            <Button
              variant={preferences[category.key] ? "default" : "outline"}
              size="sm"
              onClick={() => togglePreference(category.key)}
              disabled={category.required}
              className="ml-4"
            >
              {preferences[category.key] ? "Enabled" : "Disabled"}
            </Button>
          </div>
        ))}
      </CardContent>
      
      <CardFooter>
        <Button onClick={handleSave} className="w-full">
          Save Privacy Settings
        </Button>
      </CardFooter>
    </Card>
  )
}