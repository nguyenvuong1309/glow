# Glow App - Appium E2E Test Plan

## Project Overview
- **App:** Glow - React Native Service Booking App
- **Platform:** iOS (iPhone 17 Pro Max Simulator - iOS 26.2)
- **Bundle ID:** com.vuongnguyen.glow
- **Test Framework:** Appium + WebDriverIO + Jest
- **Date Created:** 2026-03-17

---

## Setup Status

| Step | Status | Notes |
|------|--------|-------|
| Install Appium | ✅ Done | v3.2.2 |
| Install XCUITest driver | ✅ Done | v10.32.1 |
| Install WebDriverIO | ✅ Done | @wdio/cli |
| Add testID to screens | ✅ Done | All major screens |
| Build iOS app for simulator | ✅ Done | Debug-iphonesimulator |
| Verify Appium connection | ✅ Done | Port 4723 |

---

## Test Cases

### Batch 1: Onboarding & Navigation (TC-001 → TC-005)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-001 | Onboarding - Hiển thị 3 slides và skip | OnboardingScreen | ✅ Passed |
| TC-002 | Onboarding - Swipe qua các slides và nhấn Get Started | OnboardingScreen | ✅ Passed |
| TC-003 | Tab Navigation - Chuyển đổi giữa 4 tabs | MainNavigator | ✅ Passed |
| TC-004 | Home Screen - Hiển thị categories, services, greeting | HomeScreen | ✅ Passed |
| TC-005 | Home Screen - Search services | HomeScreen | ✅ Passed |

### Batch 2: Service Browsing (TC-006 → TC-010)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-006 | Service List - Hiển thị danh sách services | ServiceListScreen | ✅ Passed |
| TC-007 | Service List - Filter theo category | ServiceListScreen | ✅ Passed |
| TC-008 | Service List - Search services | ServiceListScreen | ✅ Passed |
| TC-009 | Service Detail - Hiển thị thông tin chi tiết service | ServiceDetailScreen | ✅ Passed |
| TC-010 | Service Detail - Xem gallery ảnh | ServiceDetailScreen | ✅ Passed |

### Batch 3: Authentication (TC-011 → TC-015)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-011 | Login Screen - Hiển thị đúng các nút login | LoginScreen | ✅ Passed |
| TC-012 | Login Screen - Skip login | LoginScreen | ✅ Passed |
| TC-013 | Profile - Guest mode hiển thị sign in prompt | ProfileScreen | ✅ Passed |
| TC-014 | Profile - Chuyển đổi ngôn ngữ | ProfileScreen | ✅ Passed |
| TC-015 | Booking History - Yêu cầu đăng nhập khi chưa auth | BookingHistoryScreen | ✅ Passed |

### Batch 4: Booking Flow (TC-016 → TC-020)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-016 | Booking - Yêu cầu đăng nhập khi nhấn Book Now | ServiceDetailScreen | ✅ Passed |
| TC-017 | Booking - Hiển thị service info và date picker | BookingScreen | ✅ Passed |
| TC-018 | Booking - Chọn date và hiển thị time slots | BookingScreen | ✅ Passed |
| TC-019 | Booking - Validation form (thiếu date/time) | BookingScreen | ✅ Passed |
| TC-020 | Booking Confirm - Hiển thị thông tin booking | BookingConfirmScreen | ✅ Passed |

### Batch 5: Booking Management (TC-021 → TC-025)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-021 | Booking History - Hiển thị danh sách booking | BookingHistoryScreen | ✅ Passed |
| TC-022 | Booking History - Chuyển đổi calendar/list view | BookingHistoryScreen | ✅ Passed |
| TC-023 | Booking History - Cancel booking | BookingHistoryScreen | ✅ Passed |
| TC-024 | Spending - Hiển thị thống kê chi tiêu | SpendingScreen | ✅ Passed |
| TC-025 | Spending - Navigate giữa các tháng | SpendingScreen | ✅ Passed |

### Batch 6: Review & Favorites (TC-026 → TC-030)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-026 | Review - Hiển thị star rating và comment form | ReviewScreen | ✅ Passed |
| TC-027 | Review - Validation (thiếu star rating) | ReviewScreen | ✅ Passed |
| TC-028 | Favorites - Hiển thị empty state | FavoritesScreen | ✅ Passed |
| TC-029 | Favorites - Toggle favorite trên service card | ServiceDetailScreen | ✅ Passed |
| TC-030 | Favorites - Hiển thị danh sách favorites | FavoritesScreen | ✅ Passed |

### Batch 7: Provider Features (TC-031 → TC-035)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-031 | Provider Profile - Hiển thị thông tin provider | ProviderProfileScreen | ✅ Passed |
| TC-032 | Provider Dashboard - Hiển thị thống kê | ProviderDashboardScreen | ✅ Passed |
| TC-033 | Provider Dashboard - Navigate giữa các tháng | ProviderDashboardScreen | ✅ Passed |
| TC-034 | Booking Requests - Hiển thị danh sách requests | BookingRequestsScreen | ✅ Passed |
| TC-035 | Booking Requests - Approve/Reject actions | BookingRequestsScreen | ✅ Passed |

### Batch 8: Service Management (TC-036 → TC-040)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-036 | Post Service - Hiển thị form tạo service | PostServiceScreen | ✅ Passed |
| TC-037 | Post Service - Validation form (thiếu fields) | PostServiceScreen | ✅ Passed |
| TC-038 | Post Service - Chọn category | PostServiceScreen | ✅ Passed |
| TC-039 | My Services - Hiển thị danh sách services đã đăng | MyServicesScreen | ✅ Passed |
| TC-040 | My Services - Tap để edit service | MyServicesScreen | ✅ Passed |

### Batch 9: UI & UX (TC-041 → TC-045)

| ID | Test Case | Screen | Status |
|----|-----------|--------|--------|
| TC-041 | Home - Pull to refresh | HomeScreen | ✅ Passed |
| TC-042 | Service List - Pull to refresh | ServiceListScreen | ✅ Passed |
| TC-043 | Home - Skeleton loading state | HomeScreen | ✅ Passed |
| TC-044 | Profile - Menu navigation items | ProfileScreen | ✅ Passed |
| TC-045 | Language switching | ProfileScreen | ✅ Passed |

---

## Progress Summary

| Batch | Tests | Passed | Failed | Pending |
|-------|-------|--------|--------|---------|
| Batch 1 | 5 | 5 | 0 | 0 |
| Batch 2 | 5 | 5 | 0 | 0 |
| Batch 3 | 5 | 5 | 0 | 0 |
| Batch 4 | 5 | 5 | 0 | 0 |
| Batch 5 | 5 | 5 | 0 | 0 |
| Batch 6 | 5 | 5 | 0 | 0 |
| Batch 7 | 5 | 5 | 0 | 0 |
| Batch 8 | 5 | 5 | 0 | 0 |
| Batch 9 | 5 | 5 | 0 | 0 |
| **Total** | **45** | **45** | **0** | **0** |

---

## Test Run History

| Run | Date | Batch | Result | Notes |
|-----|------|-------|--------|-------|
| 1 | 2026-03-17 | Batch 1 | 5/5 Passed | Onboarding & Navigation |
| 2 | 2026-03-17 | Batch 2 | 5/5 Passed | Service Browsing |
| 3 | 2026-03-17 | Batch 3 | 5/5 Passed | Authentication |
| 4 | 2026-03-17 | Batch 4 | 5/5 Passed | Booking Flow |
| 5 | 2026-03-17 | Batch 5 | 5/5 Passed | Booking Management |
| 6 | 2026-03-17 | Batch 6 | 5/5 Passed | Review & Favorites |
| 7 | 2026-03-17 | Batch 7 | 5/5 Passed | Provider Features |
| 8 | 2026-03-17 | Batch 8 | 5/5 Passed | Service Management |
| 9 | 2026-03-17 | Batch 9 | 5/5 Passed | UI & UX |
