# Budget Tracker - Testing Guide

This guide walks you through testing all features of the Budget Tracker application.

## Prerequisites

- [x] App running locally with `npm run dev`
- [x] Environment variables configured in `.env.local`
- [x] Database migrations completed
- [x] Browser open to http://localhost:3000

---

## Test Suite 1: Authentication

### Test 1.1: Sign Up
**Steps:**
1. Go to http://localhost:3000
2. Click "Create Account"
3. Enter email: `test@example.com`
4. Enter password: `TestPassword123`
5. Confirm password: `TestPassword123`
6. Click "Sign Up"

**Expected Result:**
- Account created
- Redirected to dashboard
- Can see "test@example.com" in navbar

### Test 1.2: Sign In
**Steps:**
1. Go to http://localhost:3000/auth/signin
2. Enter email: `test@example.com`
3. Enter password: `TestPassword123`
4. Click "Sign In"

**Expected Result:**
- Successfully logged in
- Redirected to dashboard
- Session maintained

### Test 1.3: Sign Out
**Steps:**
1. Click "Sign Out" button in navbar
2. Try to access `/dashboard`

**Expected Result:**
- Logged out successfully
- Redirected to home page
- Cannot access protected routes

### Test 1.4: Invalid Credentials
**Steps:**
1. Try to sign in with wrong password
2. Try to sign in with non-existent email

**Expected Result:**
- Error message displayed
- Not logged in
- Page stays on sign in

---

## Test Suite 2: Income Management

### Test 2.1: Add Main Income
**Steps:**
1. Sign in
2. Go to "Debts" tab
3. In "Your Income" section, enter:
   - Main Income: 5000
   - Side Income: (leave empty)
4. Click "Save Income"

**Expected Result:**
- Income saved
- Shows "Total Monthly Income: $5,000"
- Overview tab shows updated income

### Test 2.2: Add Side Income
**Steps:**
1. In Income section, update to:
   - Main Income: 5000
   - Side Income: 500
2. Click "Save Income"

**Expected Result:**
- Total updates to $5,500
- Both values saved
- Reflected in Overview metrics

---

## Test Suite 3: Manual Debt Entry

### Test 3.1: Add Credit Card Debt
**Steps:**
1. In "Debts" tab, scroll to "Add Debt Manually"
2. Fill in:
   - Name: Chase Sapphire Credit Card
   - Type: Revolving (Credit Card)
   - Category: Credit Card
   - Balance: 5000
   - Interest Rate: 18.5
   - Credit Limit: 15000
   - Minimum Payment: 150
3. Click "Add Debt"

**Expected Result:**
- Debt appears in table
- Shows all entered values
- Total debt updates in dashboard

### Test 3.2: Add Auto Loan
**Steps:**
1. Add another debt:
   - Name: Toyota Camry Loan
   - Type: Loan
   - Category: Auto Loan
   - Balance: 15000
   - Interest Rate: 4.5
   - Monthly Payment: 350
   - Payoff Date: 2026-12-31
   - Term: 36
2. Click "Add Debt"

**Expected Result:**
- Loan added to table
- Shows loan details
- Debt breakdown updates

### Test 3.3: Add Utility
**Steps:**
1. Add utility:
   - Name: Electric Bill
   - Type: Utility
   - Category: Electric
   - Balance: 0 (or monthly charge)
   - Interest Rate: 0
   - Monthly Payment: 150
2. Click "Add Debt"

**Expected Result:**
- Utility added
- Appears as green in type indicator
- Included in monthly obligations

### Test 3.4: Edit Debt
**Steps:**
1. Note: Edit button would go in debt table (future enhancement)
2. Current workaround: Delete and re-add with correct values

### Test 3.5: Delete Debt
**Steps:**
1. Click "Delete" button on a debt row
2. Confirm deletion
3. Debt disappears from table

**Expected Result:**
- Debt removed from database
- Table updates
- Totals recalculate

---

## Test Suite 4: File Upload & AI Analysis

### Test 4.1: Upload PDF Statement
**Steps:**
1. In "Debts" tab, click "Upload Statements"
2. Click "Select File" or drag-drop a PDF
3. Choose a sample bank/credit card statement PDF
4. Wait for upload and analysis

**Expected Result:**
- File uploaded to Supabase
- AI extracts debt information
- New debts appear with extracted data
- Shows confidence scores

### Test 4.2: Upload Image Statement
**Steps:**
1. Take/use a screenshot of a credit card statement
2. Save as PNG or JPG
3. Upload via "Select File"
4. Wait for analysis

**Expected Result:**
- Image uploaded
- AI analyzes the image
- Extracts debt items similar to PDF

### Test 4.3: Review Extracted Data
**Steps:**
1. After upload, review the extracted debts
2. Check that:
   - Name is correct
   - Balance is accurate
   - Interest rate captured
   - Type assigned correctly

**Expected Result:**
- Data matches statement
- Can manually edit if needed
- Can delete if incorrect

---

## Test Suite 5: Dashboard & Visualization

### Test 5.1: Overview Tab
**Steps:**
1. Click "Overview" tab
2. Verify displays:
   - Monthly Income card
   - Total Debt card
   - Debt-to-Income card
   - Monthly Obligations card

**Expected Result:**
- All metrics display correctly
- Charts render without errors
- Numbers match calculated values

### Test 5.2: Debt Breakdown Chart
**Steps:**
1. On Overview, look for pie chart
2. Verify shows:
   - Revolving debt amount
   - Loan debt amount
   - Utility debt amount

**Expected Result:**
- Chart displays all debt types
- Colors are distinct
- Labels show amounts

### Test 5.3: Income vs Obligations Chart
**Steps:**
1. On Overview, look for bar chart
2. Compare income bar to obligations bar

**Expected Result:**
- Shows income on one bar
- Shows total monthly obligations on another
- Easy to see if obligations exceed income

### Test 5.4: Debts Tab Table
**Steps:**
1. Click "Debts" tab
2. Review debt table
3. Try sorting:
   - Click "Sort by Balance"
   - Click "Sort by Interest Rate"

**Expected Result:**
- Table displays all debts
- Sortable columns work
- Shows name, type, balance, rate, payment

### Test 5.5: Mobile Responsiveness
**Steps:**
1. Open developer tools (F12)
2. Toggle device toolbar
3. Test on mobile view (375px width)
4. Navigate through tabs

**Expected Result:**
- Layout adapts to mobile
- Charts stack vertically
- Forms are readable
- Navigation works

---

## Test Suite 6: Analysis & Recommendations

### Test 6.1: View Analysis
**Steps:**
1. Click "Analysis" tab
2. Wait for AI to generate analysis
3. Review sections:
   - Financial Health Summary
   - Debt-to-Income Analysis
   - Debt Payoff Strategies
   - Spending Habits & Insights
   - Income Growth Ideas

**Expected Result:**
- Summary acknowledges your situation
- Strategies show Snowball, Avalanche, Balanced
- Each strategy has pros/cons
- Insights are relevant to your debt
- Income ideas are tailored

### Test 6.2: Strategy Comparison
**Steps:**
1. Review the 3 strategies
2. Read pros and cons for each
3. Consider which fits best

**Expected Result:**
- Strategies make sense
- Pros/cons are realistic
- Can explain why to choose each

### Test 6.3: Spending Insights
**Steps:**
1. Read the spending insights
2. Verify they match your situation

**Expected Result:**
- Insights are accurate
- Language is encouraging
- Suggestions are actionable

---

## Test Suite 7: Data Persistence

### Test 7.1: Data Survives Page Refresh
**Steps:**
1. Add income and debts
2. Refresh page (F5)
3. Check if data is still there

**Expected Result:**
- All data persists
- No data loss
- Can continue where left off

### Test 7.2: Multiple Session Test
**Steps:**
1. Sign out
2. Close browser
3. Reopen browser
4. Sign in again

**Expected Result:**
- Can sign back in
- All data is still there
- Session properly persisted

### Test 7.3: Different Month Budget
**Steps:**
1. Wait for next month to arrive (or manually test)
2. Sign in next month
3. Check if new budget created

**Expected Result:**
- New monthly budget created
- Can track progress month-to-month
- Previous month data accessible

---

## Test Suite 8: Error Handling

### Test 8.1: Network Error Handling
**Steps:**
1. Disconnect internet
2. Try to add debt or upload file
3. Reconnect internet

**Expected Result:**
- Error message displayed
- Can retry after reconnecting
- App doesn't crash

### Test 8.2: Invalid Form Input
**Steps:**
1. Try to add debt without required fields
2. Try to enter negative numbers
3. Try invalid email format

**Expected Result:**
- Validation errors shown
- Form prevents submission
- Helpful error messages

### Test 8.3: File Upload Validation
**Steps:**
1. Try to upload file > 10MB
2. Try to upload invalid file type
3. Try empty file upload

**Expected Result:**
- Error message for each scenario
- File not uploaded
- Can try again with valid file

---

## Test Suite 9: Security

### Test 9.1: Password Security
**Steps:**
1. Sign up with password: `test123`
2. Password should be rejected (too short)

**Expected Result:**
- Minimum 8 characters enforced
- Error message explains requirement

### Test 9.2: Session Security
**Steps:**
1. Sign in
2. Try to manually access `/api/debts`
3. Try to access other user's data

**Expected Result:**
- API requires authentication
- Cannot access without session
- Cannot access other user's data

### Test 9.3: Environment Variables
**Steps:**
1. Check `.env.local` is in `.gitignore`
2. Verify `.env.local` not committed to git

**Expected Result:**
- Secrets not exposed
- .env.local excluded from version control

---

## Performance Testing

### Test P.1: Page Load Time
**Steps:**
1. Open Network tab in DevTools
2. Reload page
3. Check load time

**Expected Result:**
- Load time < 3 seconds
- No significant delays

### Test P.2: Chart Rendering
**Steps:**
1. Add 20+ debts
2. View Overview tab charts

**Expected Result:**
- Charts render smoothly
- No lag or freezing
- Interactive and responsive

### Test P.3: Form Submission
**Steps:**
1. Add large amount of debts
2. Submit forms
3. Check submission time

**Expected Result:**
- Responses < 1 second
- Loading indicators show
- No timeout errors

---

## Acceptance Criteria

✅ All authentication flows work
✅ Income can be added and updated
✅ Debts can be added, edited, deleted manually
✅ Files can be uploaded and analyzed
✅ Dashboard displays correct metrics
✅ Charts render without errors
✅ Analysis generates with recommendations
✅ Data persists across sessions
✅ Mobile responsive
✅ Error messages are clear
✅ No sensitive data exposed
✅ Performance is acceptable

---

## Known Limitations (For Future Enhancement)

- [ ] Edit debt functionality (currently delete/re-add)
- [ ] Export to PDF report
- [ ] Email notifications
- [ ] Mobile app version
- [ ] Bank API integration
- [ ] Advanced filtering/search
- [ ] Custom categories
- [ ] Shared budgets
- [ ] Dark mode

---

## Bug Report Template

If you find issues, please note:

**Title:** Brief description

**Steps to Reproduce:**
1. Step 1
2. Step 2
3. Step 3

**Expected Behavior:**
What should happen

**Actual Behavior:**
What actually happened

**Screenshots:**
If applicable

**Environment:**
- Browser: 
- OS:
- Error message (if any):

---

## Success Indicators

After testing, you should be able to:

✅ Create account and log in
✅ Enter income (main + side)
✅ Add debts manually
✅ Upload statements and get AI analysis
✅ See visualizations of your debt
✅ Get personalized payoff strategies
✅ Track your progress over time
✅ Feel confident using the app

**If all tests pass, your Budget Tracker is production-ready!** 🎉

---

For questions or issues, check the README.md troubleshooting section.
