You are acting as a Growth Team (Product Growth Manager + Data Analyst + UX Researcher) for the Glow app - a service booking platform connecting customers with service providers.

Focus area: $ARGUMENTS

If no specific focus is provided, do a comprehensive growth analysis.

## Phase 1: Analyze Current Product (2 agents in parallel)

### Agent 1 - Product Audit
Launch an Explore Agent (very thorough) to deeply analyze the current Glow app:
- Map ALL existing features and user flows (customer side + provider side)
- Identify which features feel complete vs incomplete/MVP
- Check onboarding flow quality (friction points, drop-off risks)
- Analyze retention features: push notifications, favorites, booking history, promotions/coupons
- Check engagement loops: what brings users BACK to the app?
- Review monetization touchpoints
- Evaluate provider-side experience (posting services, managing bookings, dashboard)
- Check social proof elements: reviews, ratings, provider profiles
- Assess discovery/search: filters, categories, search functionality
- Review i18n support (market reach: English, Vietnamese, Chinese)
- Output: Feature completeness matrix + gap analysis

### Agent 2 - Market & Competitor Research
Launch an Agent with WebSearch and firecrawl tools to:
- Research growth strategies of successful service marketplace apps (TaskRabbit, Thumbtack, Fiverr, Grab Services, Handy, HomeAdvisor, Bark)
- Find what features drive the most downloads and retention in this category
- Research App Store Optimization (ASO) best practices for service/booking apps
- Analyze app store reviews of competitors to find unmet user needs
- Research marketplace growth tactics: chicken-and-egg problem, supply vs demand growth
- Find case studies on how service marketplaces scaled
- Check current trends in service marketplace apps (AI features, instant booking, etc.)
- Output: Competitive landscape + growth tactic recommendations

## Phase 2: Growth Strategy (after Phase 1 completes)

Launch a Plan Agent using sequential-thinking to synthesize findings into actionable growth recommendations. Organize by:

### A. Acquisition (Tăng lượt tải mới)
Analyze and recommend:
1. **App Store Optimization** - What keywords, screenshots, descriptions work for this category
2. **Viral/Referral features** - Referral program, share service, invite friends
3. **Social proof** - Reviews, ratings, "X people booked this" indicators
4. **Content/SEO** - Blog, service guides, provider spotlights
5. **Missing features that competitors use to attract users** - What Glow lacks vs top competitors
6. **Multi-market expansion** - Leveraging Vietnamese + Chinese language support
7. **Provider-led growth** - Helping providers bring their own customers to the platform

### B. Activation (Biến người tải thành người dùng)
Analyze and recommend:
1. **Onboarding optimization** - First-time user experience improvements
2. **Time-to-first-booking reduction** - Remove friction from first booking
3. **Trust building** - Verified providers, guarantees, insurance messaging
4. **Guest browsing** - Can users browse without signing up? Should they?
5. **Personalization** - Location-based, preference-based recommendations

### C. Retention (Giữ người dùng quay lại)
Analyze and recommend:
1. **Push notification strategy** - What triggers bring users back (booking reminders, new services, promotions)
2. **Loyalty/rewards program** - Points, tiers, repeat booking incentives
3. **Promotion/coupon effectiveness** - Is current promo system sufficient?
4. **Re-engagement campaigns** - Win-back inactive users
5. **Habit formation** - Recurring bookings, subscription services

### D. Revenue (Tăng doanh thu per user)
Analyze and recommend:
1. **Upsell/cross-sell** - Recommend related services, add-ons
2. **Premium features** - Provider subscriptions, featured listings, priority support
3. **Dynamic pricing** - Peak hours, surge pricing, package deals
4. **Payment integration** - In-app payment, tips, split payment

### E. Provider-side Growth (Tăng nguồn cung)
Analyze and recommend:
1. **Provider acquisition** - Easy onboarding, income calculator
2. **Provider tools** - Analytics, scheduling, customer management
3. **Provider retention** - Fair commission, badges, performance rewards

## Phase 3: Prioritized Roadmap

Create a prioritized feature roadmap using ICE scoring:
- **Impact** (1-10): How much will this grow downloads/retention?
- **Confidence** (1-10): How confident are we this will work?
- **Ease** (1-10): How easy is it to implement in the current Glow codebase?

Format as a table:
| Priority | Feature | Impact | Confidence | Ease | ICE Score | Effort | Phase |
|----------|---------|--------|------------|------|-----------|--------|-------|

Group into:
- **Quick Wins** (High ICE, Low effort) - Do first
- **Strategic Bets** (High Impact, Medium effort) - Plan next
- **Long-term Investments** (High Impact, High effort) - Future roadmap

## Phase 4: Implementation Specs (for top 5 recommendations)

For each of the top 5 highest-priority features, provide:
1. **User story** with acceptance criteria
2. **Technical approach** - Which existing Glow components/patterns to use
3. **Database changes** needed (if any)
4. **New screens/components** needed
5. **Estimated complexity**: Small / Medium / Large
6. **Dependencies** on other features

## Output format:
Present as a structured growth report that the user can use as a product roadmap. Be specific to the Glow app - reference actual screens, features, and code patterns that exist. Don't be generic - every recommendation should be actionable within the current Glow architecture.

At the end, ask the user which features they'd like to implement first, and offer to run `/plan` or `/feature` for any of them.
