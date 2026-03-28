# Glow App Store Downloads Growth: Market Research Report
**Date:** March 26, 2026
**Scope:** Strategies to increase App Store & Google Play downloads for Glow, a service booking marketplace supporting English, Vietnamese, and Chinese

---

## 1. COMPETITIVE ANALYSIS TABLE

| Competitor | Est. Downloads | Primary Acquisition Channel | Key Growth Tactic | Revenue Model | Unique Differentiator |
|---|---|---|---|---|---|
| **TaskRabbit** | 10M+ (acquired by IKEA) | Brand partnership + IKEA integration | Embedded in IKEA furniture assembly flow; cross-promotion at 400+ stores | 15% service fee + Trust & Support fee | IKEA backing, instant booking |
| **Thumbtack** | 10M+ ($3.2B valuation) | SEO + Google Ads (lead-gen model) | Supply-led growth: onboard pros who bring their own clients to the platform | Lead-based pricing for pros | "Thumbtack Guarantee" money-back promise |
| **Fiverr** | 50M+ ($430.9M rev 2025) | Brand awareness (Super Bowl ad) + SEO | Massive content marketing + Super Bowl TV ads (75% lower CPI than traditional TV) | 20% service fee | AI Video Hub, category expansion |
| **Grab Services** | 300M+ (super app) | Super app ecosystem cross-sell | Cross-pollination from ride-hailing/food to home services; localized trust | Commission per transaction | Super app integration, local payment (MoMo, GrabPay) |
| **Handy** (acquired by Angi) | 5M+ | Retail partnerships | Partnered with Walmart and Wayfair for furniture assembly and installation | Flat service fee | Retail checkout integration |
| **Bark** | 5M+ | SEO + provider-led viral loop | Providers share requests with clients; strong UK/EU local SEO | Paid credits for pros | Reverse marketplace (customer posts, pros respond) |
| **HomeAdvisor/Angi** | 20M+ | Heavy paid media + TV ads | $500M+ annual ad spend; aggressive lead-gen model | Lead fees to pros | Massive brand recognition, Angie's List merger |
| **Meituan** (China) | 600M+ annual users | WeChat Mini Programs + super app | Private traffic via WeChat mini-programs, coupon clock reminders, group buying | Commission + advertising | Deep local service integration, group deals |

### Key Takeaways from Competitors:
- **TaskRabbit** proves strategic brand partnerships (IKEA) can be more powerful than paid UA
- **Thumbtack** shows supply-led growth works: onboard providers who then bring their own clients
- **Fiverr** demonstrates that bold brand campaigns (Super Bowl) combined with content SEO can drive massive organic discovery
- **Grab** proves the super-app cross-sell model dominates Southeast Asia
- **Meituan** shows WeChat Mini Programs are essential for Chinese-speaking markets

---

## 2. TOP 15 GROWTH TACTICS RANKED BY EFFECTIVENESS

### Tier 1: Highest Impact (Implement Immediately)

**1. App Store Optimization (ASO) -- Estimated Impact: +30-50% organic downloads**
- Optimize title: "Glow - Book Home & Beauty Services" (include high-traffic keywords)
- Localize fully for Vietnamese (vi) and Chinese (zh-Hans, zh-Hant) app store listings
- A/B test screenshots showing real booking flow, before/after results, and provider profiles
- Add app preview video showing booking in under 15 seconds
- Target long-tail keywords: "book cleaner near me", "beauty services at home", "dat lich lam dep" (Vietnamese)
- Research shows localized ASO can increase downloads by 128% per locale

**2. Provider-Led Growth Loop -- Estimated Impact: +25-40% new user acquisition**
- Give each provider a unique shareable profile link and QR code
- Providers share Glow profiles with their existing offline clients
- Offer providers a "first 3 months free" or reduced commission for bringing clients to the platform
- Auto-generate provider social media cards (Instagram stories, Facebook posts) from within the app
- This solves the chicken-and-egg problem: providers already have clients, they just need a booking tool

**3. Double-Sided Referral Program -- Estimated Impact: +20-35% organic growth**
- Structure: Both referrer AND new user get a discount (e.g., $10 credit each)
- Benchmarks: Uber's two-sided referral drove 50%+ of early growth; referred users show 200-300% higher conversion rates
- Implementation: Deep-link referral codes that auto-apply discount on first booking
- Add "Invite Friends" as a prominent button in the Profile tab (Glow already has profile features)
- Optimal reward: Service credit (not cash) to drive platform engagement
- Target referral cost: < $5 per install (vs. $1.50-$4.00 CPI for paid ads)

**4. Localized Social Media / TikTok Strategy -- Estimated Impact: +20-30% awareness-to-download**
- Create before/after content for beauty and home services (TikTok's highest-performing content type)
- Feature real providers and their transformations
- Vietnamese market: Focus on Zalo, Facebook Groups (85%+ of Vietnamese internet users use Zalo)
- Use micro-influencers (10K-50K followers) for cost-effective reach
- Create a branded hashtag challenge (e.g., #GlowUp with service providers)

### Tier 2: High Impact (Implement Within 30 Days)

**5. Review Solicitation Strategy -- Estimated Impact: +15-25% conversion rate improvement**
- Trigger in-app review prompt (SKStoreReviewController / Google Play In-App Review API) AFTER a 4+ star internal rating
- Best timing: After successful service completion + positive feedback
- Gate reviews: Ask "How was your experience?" first; route happy users to app store, unhappy users to support
- Respond to ALL negative reviews within 24 hours (proven to increase ratings by 0.5+ stars)
- Target: 4.7+ star rating (apps with 4.5+ get 7x more downloads than those below 4.0)

**6. Content Marketing + Local SEO -- Estimated Impact: +15-20% discovery**
- Create city-specific landing pages: "Best House Cleaning Services in Ho Chi Minh City"
- Blog content targeting "how to find a reliable [service] near me" queries
- Google Business Profile optimization for provider discovery
- AI-driven local search is reshaping discovery in 2026 (Forbes): Structure content for AI answer engines
- Create service guides: "How Much Does House Cleaning Cost in Vietnam?" with app download CTA

**7. Strategic Partnerships -- Estimated Impact: +15-25% new user channels**
- Partner with apartment complexes, co-working spaces, and property management companies
- Salon product brands: Cross-promote Glow for at-home beauty services
- Real estate apps: Offer move-in cleaning/handyman services to new tenants
- Wedding planning platforms: Integrate beauty/styling services

**8. Smart Onboarding + First-Booking Incentive -- Estimated Impact: +10-20% install-to-book conversion**
- Offer 20-30% off first booking (capped at $10-15)
- Show personalized service recommendations based on location during onboarding
- Reduce sign-up friction: Glow already supports Google + Apple Sign-In (good)
- Allow browsing without sign-in, prompt sign-up only at booking (Glow already has "Skip for now" -- good)

### Tier 3: Medium Impact (Implement Within 60 Days)

**9. AI-Powered Matching and Recommendations -- Estimated Impact: +10-15% retention and word-of-mouth**
- AI plugins in marketplaces are transforming two-sided user behaviors and matching
- Smart recommendations: "Users like you also booked..." on the home screen
- Auto-suggest optimal booking times based on provider availability
- AI-powered service descriptions and price suggestions for providers
- Market as an AI feature in app store listing: "AI-Powered Service Matching"

**10. Push Notification Deep Links from External Channels -- Estimated Impact: +10-15% re-engagement**
- Glow already has Firebase messaging set up (good foundation)
- Send personalized push for promotions, nearby new providers, booking reminders
- Use deferred deep links in all marketing: click ad/social post -> app store -> open directly to relevant service
- Supabase edge function for notification triggers already exists in codebase

**11. Seasonal and Event-Based Campaigns -- Estimated Impact: +10-20% download spikes**
- Tet Holiday (Vietnamese New Year): "Glow up your home for Tet" -- cleaning + beauty services
- Wedding season: Beauty and styling service push
- Back-to-school: Tutoring and home organization services
- Lunar New Year (Chinese market): Special promotions and themed content

**12. Cross-Promotion and App Store Featuring -- Estimated Impact: +5-15% organic lift**
- Submit for App Store featuring during seasonal campaigns
- Apple's editorial team favors apps with: localization, accessibility, innovative use of native features
- Add App Clips (iOS) for instant service booking without full install
- Implement Spotlight search integration for service discovery

### Tier 4: Supporting Tactics (Ongoing)

**13. Community Building -- Estimated Impact: +5-10% organic referrals**
- Create Facebook Groups and Zalo communities for local service providers and seekers
- Provider forums for tips, support, and networking
- User-generated content: Encourage service review photos and testimonials
- Vietnamese Facebook groups are a major discovery channel (42% use social media for product validation)

**14. Paid User Acquisition (Targeted) -- Estimated Impact: Scalable but cost-dependent**
- Apple Search Ads: Target competitor brand names and service category keywords
- Google App Campaigns: Automated targeting across Search, YouTube, Play Store
- TikTok Ads: Before/after creative format for beauty/home services
- Meta Ads: Target by location + interest in home services
- Benchmark CPI: iOS $1.50-$3.50 / Android $1.50-$4.00 globally; lower in Vietnam ($0.30-$1.00)

**15. Gamification + Loyalty Mechanics -- Estimated Impact: +5-10% retention-driven referrals**
- Points system for bookings, reviews, and referrals (Glow already has promotions/coupons infrastructure)
- Tier-based rewards: Bronze -> Silver -> Gold customer status
- "Streak" bonuses: Consecutive monthly bookings earn extra discounts
- Provider leaderboards: Top-rated providers get featured placement

---

## 3. ASO CHECKLIST SPECIFIC TO SERVICE/BOOKING CATEGORY

### App Title & Subtitle (Most Critical for Ranking)
- [ ] Title includes primary keyword: "Glow - Book Home & Beauty Services"
- [ ] Subtitle includes secondary keywords: "Cleaning, Repairs, Beauty Near You"
- [ ] Vietnamese localized title: "Glow - Dat Lich Dich Vu Tai Nha"
- [ ] Chinese localized title: "Glow - 预约家政美容服务"
- [ ] Title is under 30 characters (iOS) / 50 characters (Android)

### Keyword Field (iOS Only, 100 chars)
- [ ] Primary keywords: home services, book cleaner, beauty booking, handyman, near me
- [ ] Vietnamese keywords: dich vu, dat lich, lam dep, don dep, sua chua
- [ ] Chinese keywords: 家政, 预约, 美容, 清洁, 上门服务
- [ ] No spaces after commas (maximize character usage)
- [ ] No duplicate words across title + subtitle + keyword field
- [ ] Include competitor brand misspellings as keywords (where allowed)
- [ ] Long-tail keywords: "book house cleaner today", "beauty services at home"

### App Description
- [ ] First 3 lines contain primary value proposition + keywords (only these show before "more")
- [ ] Include social proof: "Trusted by X+ users" or "X+ verified providers"
- [ ] Feature list with benefit-oriented bullets
- [ ] Natural keyword density (avoid keyword stuffing)
- [ ] Localized descriptions for vi and zh (not just translated -- culturally adapted)
- [ ] Call-to-action: "Download free and book your first service today"

### Screenshots (Highest Conversion Impact)
- [ ] First screenshot shows core value: "Book any service in 30 seconds"
- [ ] 6-10 screenshots covering: search, provider profiles, booking flow, reviews, promotions
- [ ] Each screenshot has a benefit headline (not feature description)
- [ ] Show real UI with realistic data (not empty states)
- [ ] Vietnamese and Chinese localized screenshot sets
- [ ] A/B test screenshot order using Apple's Product Page Optimization
- [ ] Include social proof screenshot: ratings, provider count, happy customer quotes

### App Preview Video
- [ ] 15-30 second video showing complete booking journey
- [ ] First 3 seconds must hook: show the problem then the solution
- [ ] No external branding or "download now" text (Apple rejects this)
- [ ] Show app being used on device (screen recording style)
- [ ] Include captions (many users watch without sound)
- [ ] Localized video for Vietnamese market

### Ratings & Reviews
- [ ] In-app review prompt implemented (after positive service completion)
- [ ] Review gating: satisfaction check before directing to store
- [ ] Respond to all 1-2 star reviews within 24 hours
- [ ] Thank all 5-star reviews to encourage more
- [ ] Target: 4.7+ average, 500+ ratings for credibility threshold
- [ ] Flag and report fake/spam reviews

### Category & Store Presence
- [ ] Primary category: Lifestyle (iOS) / House & Home (Android)
- [ ] Secondary category: Utilities or Productivity
- [ ] App Store Connect promotional text updated for seasonal campaigns
- [ ] "What's New" section highlights latest features (not just bug fixes)
- [ ] App size optimized (under 200MB for immediate download)
- [ ] Privacy nutrition labels accurate and complete

### Localization
- [ ] Full metadata localization: en, vi, zh-Hans, zh-Hant
- [ ] Screenshots localized per market
- [ ] Vietnam: Use colloquial Vietnamese keywords (not formal translations)
- [ ] China: Consider traditional vs simplified Chinese for Taiwan/HK vs mainland
- [ ] Apple allows secondary locale keyword indexing (use en-GB to get extra 100 chars)

---

## 4. VIRAL / REFERRAL PROGRAM BENCHMARKS

### Industry Benchmarks (Service Marketplace Apps)

| Metric | Industry Average | Top Performers | Glow Target |
|---|---|---|---|
| Referral participation rate | 2-5% of users | 10-15% (Uber, Dropbox) | 8% |
| Referral conversion rate | 3-5% | 10-15% | 7% |
| K-factor (viral coefficient) | 0.1-0.3 | 0.5-0.7 (Uber early days) | 0.4 |
| Cost per referred install | $2-5 | $0.50-1.50 | $2.00 |
| Referred user LTV vs organic | 16-25% higher | 25-40% higher | 20% higher |
| Referred user retention (Day 30) | 25-35% | 40-50% | 35% |
| Time to first referral | 14-30 days | 3-7 days | 10 days |

### Recommended Referral Program Structure for Glow

**Program: "Glow Together"**

| Element | Design |
|---|---|
| **Reward Structure** | Double-sided: Both referrer and invitee get $10 service credit |
| **Referral Cap** | 20 successful referrals per user (prevents gaming) |
| **Activation Trigger** | Credit unlocks after invitee completes first booking (not just install) |
| **Sharing Mechanics** | Pre-filled message with unique link; shareable via Zalo, iMessage, WhatsApp, Facebook, LINE |
| **Provider Referral** | Providers get $15 credit per referred client (higher value = providers become growth engine) |
| **Tiered Rewards** | 5 referrals = Silver status (5% ongoing discount); 10 = Gold (10% discount); 20 = Platinum (priority booking) |
| **Anti-Gaming** | Phone verification, unique device ID, minimum booking value $20 |
| **Tracking** | Firebase Dynamic Links or Branch.io for attribution across platforms |

### Social Sharing Features That Actually Get Used

1. **Post-Service Sharing** (highest engagement): After booking completion, prompt "Share your experience" with a pre-designed card showing service photo + rating
2. **Provider Profile Sharing**: Providers share their Glow profile on social media (acts as digital business card)
3. **Deal Sharing**: "I just got 30% off on Glow! Use my code" -- discount-driven sharing
4. **Booking Confirmation Share**: "Just booked [service] on Glow" stories for Instagram/TikTok
5. **Review Screenshots**: Shareable review cards with provider rating

### Provider-Led Growth Mechanics (Most Effective for Marketplaces)

- **Provider Business Card**: Auto-generate digital business cards with QR code linking to Glow profile
- **Provider Booking Link**: Each provider gets a unique URL (glow.app/provider/name) to share with existing clients
- **Offline-to-Online Bridge**: Providers put Glow QR codes on physical business cards, receipts, shop signs
- **Commission Incentive**: Reduced platform fee for providers who bring clients to the platform
- **Provider Social Toolkit**: Monthly ready-to-post content templates for providers' social media

---

## 5. MARKET-SPECIFIC INSIGHTS: VIETNAMESE & CHINESE MARKETS

### Vietnam Market

**Market Size & Opportunity:**
- Vietnam's digital economy: $39 billion in 2025, projected to double by 2030
- Online booking software market: $12.85 billion in 2025, growing at 9.76% CAGR
- Mobile payments market: $46.56 billion in 2025 (MoMo, ZaloPay, VNPay dominate)
- 84 million smartphone users, 78.9 million internet users

**Trust Factors (Critical for Vietnamese Consumers):**
- 48% of Vietnamese consumers consult online reviews before spending
- 42% use social media to validate product/service information
- Word-of-mouth and personal recommendations are the #1 trust driver
- Government-issued ID verification for providers significantly increases trust
- Price transparency is essential: hidden fees are the top complaint

**Payment Preferences (Must-Have Integrations):**
1. MoMo (dominant e-wallet, 40M+ users)
2. ZaloPay (integrated with Zalo messaging -- 85% of Vietnamese use Zalo)
3. VNPay (bank QR integration)
4. Cash on delivery (still preferred by 30-40% for services)
5. Bank transfer (via VietQR standard)

**Acquisition Channels for Vietnam:**
1. **Zalo Official Account + Mini App**: Zalo is THE platform for Vietnamese users; create a Zalo Mini App for discovery
2. **Facebook Groups**: Vietnamese consumers heavily use local Facebook groups for service recommendations
3. **TikTok Vietnam**: 60M+ users, fastest-growing platform for under-35 demographic
4. **Local KOLs (Key Opinion Leaders)**: Micro-influencers on TikTok/YouTube Vietnam
5. **Shopee/Lazada cross-promotion**: Vietnamese users trust e-commerce platforms; explore co-marketing

**Cultural Considerations:**
- Tet Holiday (Jan/Feb) is the peak season for cleaning and beauty services
- Vietnamese prefer chat-based booking (integrate Zalo chat or in-app messaging)
- Price sensitivity is high: prominently display discounts and compare-savings features
- Family recommendations carry enormous weight: design referral for family sharing
- Vietnamese users prefer Vietnamese-language customer support (not English fallback)

### Chinese-Speaking Market (Taiwan, Hong Kong, Overseas Chinese)

**Platform Strategy:**
- **WeChat Mini Programs**: Essential for reaching Chinese-speaking users; 450M+ daily active Mini Program users
- Meituan-Dianping model: Group buying + daily deals are effective drivers for service discovery
- **LINE** (for Taiwan): Primary messaging platform; LINE Official Account for business
- **Xiaohongshu (RED)**: Key discovery platform for beauty and lifestyle services among Chinese women

**Trust Factors for Chinese-Speaking Users:**
- Platform guarantee / escrow payment is expected
- Provider certification and verified reviews are table stakes
- Real-time customer support (chat-based) is mandatory
- Social proof via number of completed orders (display prominently)
- Cash-back and group-buying mechanics drive initial adoption

**Payment Preferences:**
- Taiwan: LINE Pay, JKOPay, credit cards
- Hong Kong: Octopus, PayMe, FPS, AliPayHK
- Overseas Chinese: Apple Pay, Google Pay, credit cards
- Mainland China (if applicable): WeChat Pay, Alipay

**Growth Tactics Specific to Chinese Market:**
1. Group-buying / flash deals (Meituan model): "3 friends book, everyone gets 30% off"
2. WeChat sharing with hongbao (red envelope) mechanics
3. KOL partnerships on Xiaohongshu for beauty services
4. Community group buying through WeChat groups
5. Lunar New Year and mid-autumn festival promotional campaigns

---

## 6. COMPETITOR APP STORE REVIEW ANALYSIS: USER PAIN POINTS & OPPORTUNITIES

### What Users Complain About Most (Opportunity for Glow to Differentiate)

| Pain Point | Frequency | Competitors Affected | Glow Opportunity |
|---|---|---|---|
| High/hidden service fees | Very High | TaskRabbit, Thumbtack, HomeAdvisor | Transparent pricing upfront; show total cost before booking |
| Poor customer support (AI bots only) | Very High | Thumbtack, HomeAdvisor | Offer human chat support; in-app messaging with real agents |
| Cancellation policies too strict | High | TaskRabbit | Flexible cancellation up to 2 hours before; no surprise charges |
| Provider no-shows | High | TaskRabbit, Handy | Provider reliability scoring; auto-rebooking if provider cancels |
| Spam from providers | High | HomeAdvisor, Thumbtack | Curated matching, not open bidding; quality over quantity |
| App forces mediocre matches | Medium | TaskRabbit | Let users choose providers based on reviews, not just availability |
| Difficult to get refunds | Medium | All | Streamlined refund process; Glow Guarantee |
| Lack of provider vetting | Medium | Various | Background checks, ID verification, portfolio requirements |

### What Gets Praised (Features to Emphasize in Marketing)

1. **Easy booking flow** -- Users love apps where they can book in under 60 seconds
2. **Transparent reviews with photos** -- Real service photos in reviews build trust
3. **Responsive providers** -- Quick response time is the #1 driver of positive reviews
4. **Price comparisons** -- Ability to see multiple provider quotes
5. **Rescheduling flexibility** -- Glow already has this (RescheduleScreen exists)
6. **Promotions and discounts** -- First-booking discounts drive trial (Glow has promotions infrastructure)

---

## 7. IMMEDIATE ACTION ITEMS FOR GLOW

### Week 1-2: Quick Wins
1. Optimize App Store and Google Play listings with keyword research (see ASO checklist)
2. Create 6 localized screenshots per market (en, vi, zh)
3. Implement in-app review prompt after successful bookings
4. Add "Invite Friends" feature with deep-link referral codes
5. Create provider shareable profile links

### Week 3-4: Growth Infrastructure
6. Set up Apple Search Ads targeting competitor keywords
7. Launch TikTok account with before/after service content
8. Create Zalo Official Account for Vietnamese market
9. Implement first-booking discount ($10 off, funded by reduced provider commission)
10. Build provider social media toolkit (shareable cards, QR codes)

### Month 2: Scale
11. Launch "Glow Together" referral program (double-sided rewards)
12. Partner with 3-5 apartment complexes in target city for exclusive promotions
13. Begin content marketing: city-specific service guides for local SEO
14. Implement AI service matching on home screen
15. Submit app for App Store featuring consideration

### Month 3: Amplify
16. Launch seasonal campaign (tied to nearest holiday)
17. Activate micro-influencer partnerships (5-10 local KOLs)
18. Implement group-buying feature for Chinese-speaking market
19. Provider onboarding campaign: "Bring your clients to Glow, pay 0% commission for 3 months"
20. A/B test all app store creative assets based on first 2 months of data

---

## Sources

- [ASO Best Practices 2026 - Wildnet Edge](https://www.wildnetedge.com/blogs/app-store-optimization-aso-best-practices)
- [Top ASO Tips 2026 - AppTweak](https://www.apptweak.com/en/aso-blog/app-store-optimization-aso-best-practices)
- [ASO Keyword Research 2026 - Mobile Action](https://www.mobileaction.co/blog/aso-keyword-research/)
- [Advanced ASO Strategies 2025 - Dogtown Media](https://www.dogtownmedia.com/aso-2-0-advanced-app-store-optimization-strategies-for-2025/)
- [15 ASO Strategies That Work 2026 - Lengreo](https://lengreo.com/app-store-optimization-strategies/)
- [TaskRabbit 2025 Year in Review](https://www.taskrabbit.com/blog/2025-tasker-year-in-review/)
- [User Acquisition Strategies 2025 - Appodeal](https://appodeal.com/blog/mobile-app-user-acquisition-strategies-for-2025/)
- [Mobile App User Acquisition Strategy 2025 - Survicate](https://survicate.com/blog/mobile-app-user-acquisition-strategy/)
- [Referral Marketing 2025 - Viral Loops](https://viral-loops.com/blog/referral-marketing-in-2025/)
- [Best Mobile App Referral Programs 2026 - GrowSurf](https://growsurf.com/examples/mobile-app-referral-programs)
- [Mobile App Referral Programs - Viral Loops](https://viral-loops.com/blog/mobile-app-referral-program/)
- [Uber-Style Referral Program - Voucherify](https://www.voucherify.io/blog/uber-style-referral-program-with-voucherify)
- [Two-Sided Marketplace Referrals - GrowSurf](https://growsurf.com/glossary/two-sided-marketplace-referral/)
- [How to Launch Mobile App Referral Program - Adapty](https://adapty.io/blog/mobile-app-referral-program/)
- [The Rise of Super Apps: Grab's Strategy - FoxData](https://foxdata.com/en/blogs/the-rise-of-super-apps-in-2025-inside-grabs-strategy/)
- [Grab 2025 Revenue Record $3.37B - CrowdFund Insider](https://www.crowdfundinsider.com/2026/03/268025-se-asia-superapp-grab-2025-revenue-hits-record-3-37bn-as-malaysia-stays-top-market/)
- [19 Marketplace Tactics - NFX](https://www.nfx.com/post/19-marketplace-tactics-for-overcoming-the-chicken-or-egg-problem)
- [Chicken-and-Egg Dilemma - Startup Stash](https://blog.startupstash.com/solving-the-chicken-and-egg-dilemma-for-marketplace-startups-a8b6ebe3670b)
- [How Thumbtack Won On-Demand Services - TechCrunch](https://techcrunch.com/2018/05/05/how-did-thumbtack-win-the-on-demand-services-market/)
- [Thumbtack Business Breakdown - Contrary Research](https://research.contrary.com/company/thumbtack)
- [Thumbtack Business Model - BrineWeb](https://www.brineweb.com/blog/thumbtack-business-model-how-thumbtack-works-and-makes-money)
- [Fiverr Full Year 2025 Results](https://investors.fiverr.com/news-releases/news-release-details/fiverr-announces-fourth-quarter-and-full-year-2025-results/)
- [Vietnam Mobile Payments Market - Mordor Intelligence](https://www.mordorintelligence.com/industry-reports/vietnam-mobile-payments-market)
- [Super Apps Driving Vietnam Mobile Payments - SBS Software](https://sbs-software.com/insights/super-apps-vietnam-mobile-payments/)
- [Vietnamese Consumers Rely on Online Reviews - VietnamNet](https://vietnamnet.vn/en/vietnamese-consumers-rely-on-online-reviews-before-spending-2474022.html)
- [How Vietnamese Consumers Discover Brands 2025 - Cultural Traits](https://culturaltraits.com/brand-discovery-how-does-this-work-for-vietnamese-consumers/)
- [On-Demand Home Services Market 2026-2034 - IntelMarketResearch](https://www.intelmarketresearch.com/on-demand-home-service-app-market-37486)
- [On-Demand Home Services Market Size - Straits Research](https://straitsresearch.com/report/online-on-demand-home-services-market)
- [Vietnam Digital Economy - Phocus Wire](https://www.phocuswire.com/vietnam-online-travel-market-double-2030)
- [App Store Screenshot Guidelines 2026 - The App Launchpad](https://theapplaunchpad.com/blog/app-store-screenshot-guidelines-in-2026)
- [App Store Reviews Guide 2026 - AppReply](https://appreply.co/blog/app-store-reviews-101)
- [How to Improve App Store Rating - Mobile Action](https://www.mobileaction.co/blog/how-to-improve-app-store-rating/)
- [App Store Conversion Rate 2026 - Adapty](https://adapty.io/blog/app-store-conversion-rate/)
- [Cost per Install Rates 2025 - Business of Apps](https://www.businessofapps.com/ads/cpi/research/cost-per-install/)
- [Referral Program Benchmarks 2025 - ReferralCandy](https://www.referralcandy.com/blog/referral-program-benchmarks-whats-a-good-conversion-rate-in-2025)
- [Referral Marketing Statistics 2025 - Impact](https://impact.com/referral/top-10-referral-marketing-statistics/)
- [Local SEO 2026 for AI Search - Forbes](https://www.forbes.com/councils/forbesbusinesscouncil/2026/01/30/is-your-content-strategy-built-for-ai-search-the-future-of-local-seo-in-2026/)
- [Meituan Market Strategy - DaxueConsulting](https://daxueconsulting.com/meituan-market-strategy/)
- [WeChat Mini Programs - S&P Global](https://www.spglobal.com/market-intelligence/en/news-insights/research/mobile-payments-mini-programs-are-key-features-of-chinese-super-apps)
- [AI in Mobile Apps 2026 - Mindster](https://mindster.com/mindster-blogs/ai-in-mobile-apps/)
- [AI Transforming Marketplaces - JourneyH](https://www.journeyh.io/blog/ai-powered-marketplaces-ai-plugins)
- [Handy Growth Strategy - eMarketer](https://www.emarketer.com/content/how-handy-became-known-for-more-than-just-its-home-cleaning-services)
- [Uber Marketing Strategy - Moloco](https://www.moloco.com/blog/uber-marketing-strategy)
- [App Store Localization Guide - AppTweak](https://www.apptweak.com/en/aso-blog/guide-to-app-store-localization)
- [User Acquisition Strategies 2025 - Business of Apps](https://www.businessofapps.com/marketplace/user-acquisition/research/user-acquisition-strategies/)
