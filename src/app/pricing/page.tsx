/**
 * Pricing Page - Subscription plans and features
 */

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Check, 
  X, 
  Crown, 
  Zap, 
  Shield,
  TrendingUp,
  Bell,
  Eye,
  BarChart3,
  Download,
  Clock,
  Users,
  Smartphone
} from "lucide-react"

const features = [
  {
    category: "Core Features",
    items: [
      { name: "Real-time insider trades", free: true, pro: true, icon: TrendingUp },
      { name: "Politician disclosure tracking", free: true, pro: true, icon: Users },
      { name: "Basic company profiles", free: true, pro: true, icon: BarChart3 },
      { name: "Search functionality", free: true, pro: true, icon: Eye },
      { name: "Mobile responsive design", free: true, pro: true, icon: Smartphone },
    ]
  },
  {
    category: "Alerts & Notifications",
    items: [
      { name: "Basic email alerts", free: false, pro: true, icon: Bell },
      { name: "Real-time push notifications", free: false, pro: true, icon: Zap },
      { name: "Custom alert thresholds", free: false, pro: true, icon: Bell },
      { name: "SMS notifications", free: false, pro: true, icon: Smartphone },
      { name: "Slack/Discord webhooks", free: false, pro: true, icon: Bell },
    ]
  },
  {
    category: "Advanced Analytics",
    items: [
      { name: "Performance tracking", free: false, pro: true, icon: BarChart3 },
      { name: "Historical trade analysis", free: false, pro: true, icon: Clock },
      { name: "Portfolio correlation insights", free: false, pro: true, icon: TrendingUp },
      { name: "Risk assessment metrics", free: false, pro: true, icon: Shield },
      { name: "Export to CSV/Excel", free: false, pro: true, icon: Download },
    ]
  },
  {
    category: "Premium Experience",
    items: [
      { name: "Ad-free experience", free: false, pro: true, icon: Eye },
      { name: "Priority customer support", free: false, pro: true, icon: Crown },
      { name: "Early access to new features", free: false, pro: true, icon: Zap },
      { name: "Advanced filters & sorting", free: false, pro: true, icon: BarChart3 },
      { name: "Unlimited watchlist items", free: false, pro: true, icon: TrendingUp },
    ]
  }
]

const faqs = [
  {
    question: "Why is the pricing so affordable?",
    answer: "We believe critical financial information should be accessible to everyone. Our $0.99/day model allows us to maintain high-quality service while keeping costs low for individual investors."
  },
  {
    question: "Can I cancel anytime?",
    answer: "Yes! You can cancel your subscription at any time. There are no long-term commitments or cancellation fees."
  },
  {
    question: "How accurate is the insider trading data?",
    answer: "All data is sourced directly from official SEC filings and Congressional disclosure reports. We process filings within minutes of publication for maximum accuracy."
  },
  {
    question: "Do you offer refunds?",
    answer: "We offer a 7-day money-back guarantee. If you're not satisfied with Insider Pilot Pro, we'll refund your subscription."
  },
  {
    question: "Is my payment information secure?",
    answer: "Yes! We use Stripe for all payment processing, which is PCI DSS compliant and meets the highest security standards."
  },
  {
    question: "What makes Insider Pilot different?",
    answer: "We focus on speed, accuracy, and user experience. Our real-time alerts and clean interface help you act on insider information faster than traditional platforms."
  }
]

export default function PricingPage() {
  return (
    <div className="container py-8 space-y-16">
      {/* Header */}
      <div className="text-center space-y-6">
        <Badge variant="outline" className="px-4 py-2">
          <Crown className="h-4 w-4 mr-2" />
          Simple, Transparent Pricing
        </Badge>
        
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          Start tracking for just{" "}
          <span className="bg-gradient-to-r from-bullish-500 to-bullish-600 bg-clip-text text-transparent">
            $0.99/day
          </span>
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Get real-time insider trading alerts, advanced analytics, and an ad-free experience. 
          Cancel anytime.
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl">Free</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            <p className="text-muted-foreground">
              Perfect for getting started with insider tracking
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button variant="outline" size="lg" className="w-full">
              Get Started Free
            </Button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Basic insider trade tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Politician disclosure monitoring</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">5 watchlist items</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Ad-supported experience</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Real-time alerts</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Advanced analytics</span>
              </div>
              <div className="flex items-center gap-3">
                <X className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Performance tracking</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-bullish-200 dark:border-bullish-800 shadow-lg">
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <Badge className="px-4 py-1">
              <Crown className="h-3 w-3 mr-1" />
              Most Popular
            </Badge>
          </div>
          
          <CardHeader className="text-center pb-8">
            <CardTitle className="text-2xl">Insider Pilot Pro</CardTitle>
            <div className="mt-4">
              <span className="text-4xl font-bold">$0.99</span>
              <span className="text-muted-foreground">/day</span>
            </div>
            <p className="text-muted-foreground">
              Everything you need to stay ahead of the market
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Button size="lg" className="w-full">
              Start 7-Day Free Trial
            </Button>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm font-medium">Everything in Free</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Real-time alerts & notifications</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Advanced analytics & insights</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Unlimited watchlist items</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Ad-free experience</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Performance tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Export data (CSV/Excel)</span>
              </div>
              <div className="flex items-center gap-3">
                <Check className="h-4 w-4 text-bullish-600" />
                <span className="text-sm">Priority customer support</span>
              </div>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-center text-muted-foreground">
                7-day free trial • Cancel anytime • No long-term commitment
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Comparison */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Compare Features</h2>
          <p className="text-muted-foreground mt-2">
            See exactly what's included in each plan
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {features.map((category) => (
            <div key={category.category} className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-bullish-600">
                {category.category}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="hidden md:block font-medium text-muted-foreground">
                  Feature
                </div>
                <div className="hidden md:block text-center font-medium">
                  Free
                </div>
                <div className="hidden md:block text-center font-medium">
                  Pro
                </div>
                
                {category.items.map((feature) => (
                  <React.Fragment key={feature.name}>
                    <div className="flex items-center gap-3">
                      <feature.icon className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{feature.name}</span>
                    </div>
                    <div className="text-center">
                      {feature.free ? (
                        <Check className="h-4 w-4 text-bullish-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </div>
                    <div className="text-center">
                      {feature.pro ? (
                        <Check className="h-4 w-4 text-bullish-600 mx-auto" />
                      ) : (
                        <X className="h-4 w-4 text-muted-foreground mx-auto" />
                      )}
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-muted/50 rounded-2xl p-8 space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Trusted by thousands of investors</h2>
          <p className="text-muted-foreground mt-2">
            Join the community that's staying ahead of the market
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-2xl font-bold">50,000+</div>
            <div className="text-sm text-muted-foreground">Trades Tracked</div>
          </div>
          <div>
            <div className="text-2xl font-bold">5,000+</div>
            <div className="text-sm text-muted-foreground">Active Users</div>
          </div>
          <div>
            <div className="text-2xl font-bold">99.9%</div>
            <div className="text-sm text-muted-foreground">Uptime</div>
          </div>
          <div>
            <div className="text-2xl font-bold">< 1min</div>
            <div className="text-sm text-muted-foreground">Alert Delivery</div>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold">Frequently Asked Questions</h2>
          <p className="text-muted-foreground mt-2">
            Everything you need to know about Insider Pilot
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-6">
          {faqs.map((faq, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">{faq.question}</h3>
                <p className="text-muted-foreground">{faq.answer}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center space-y-6 bg-gradient-to-br from-bullish-50 to-bullish-100 dark:from-bullish-950 dark:to-bullish-900 rounded-2xl p-12">
        <h2 className="text-3xl font-bold">Ready to get started?</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Join thousands of investors who are staying ahead of the market with Insider Pilot
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" className="px-8">
            Start 7-Day Free Trial
          </Button>
          <Button variant="outline" size="lg" className="px-8">
            Continue with Free Plan
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          No credit card required for free trial • Cancel anytime
        </p>
      </div>
    </div>
  )
}

// Generate metadata for SEO
export function generateMetadata() {
  return {
    title: "Pricing - Start for $0.99/day | Insider Pilot",
    description: "Get real-time insider trading alerts and advanced analytics for just $0.99/day. 7-day free trial, cancel anytime. Join thousands of investors staying ahead of the market.",
    keywords: "insider trading subscription, stock alerts pricing, trading notifications cost, insider pilot pro",
  }
}