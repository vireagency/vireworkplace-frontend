# HR Evaluations API Integration Summary

## ✅ All APIs Properly Integrated

### 1. **Create Evaluation Review** ✅

**Endpoint:** `POST /api/v1/dashboard/hr/evaluations/reviews/create`

**Implementation:** `src/services/evaluations.js` - `createEvaluationReview()`

**Usage:** `src/screens/UserDashboards/HRDashboard/EvaluationCreator.jsx`

**Request Format:**

```javascript
{
  formName: "Q1 Performance Review",
  formType: "Quarterly",  // Must match enum: Annual, Quarterly, Probation, Project-Based
  description: "Quarterly performance review for Q1",
  reviewPeriod: "2024-Q1",
  reviewDeadline: "2024-09-30",
  sections: [
    {
      title: "Technical Skills",
      questions: [
        { questionText: "Rate coding skills", type: "rating", required: true },
        { questionText: "Rate debugging ability", type: "rating", required: true }
      ]
    }
  ],
  employees: ["64efc7a2c5a2a12345f0d9a6"]
}
```

**Features:**

- Full validation of required fields
- Section and question validation
- Employee array validation
- Detailed error logging
- Transform question data before sending

---

### 2. **Fetch Submitted Evaluations** ✅

**Endpoint:** `GET /api/v1/dashboard/hr/evaluations/reviews/submissions?status=submitted&page=1&limit=5`

**Implementation:** `src/services/evaluations.js` - `getSubmittedEvaluations()`

**Usage:** `src/screens/UserDashboards/HRDashboard/HREvaluationsPage.jsx`

**Parameters:**

- `status`: "submitted" (default)
- `page`: 1 (default)
- `limit`: 10 (default)

**Response Handling:**

```javascript
const result = await evaluationsApi.getSubmittedEvaluations(accessToken, {
  page: 1,
  limit: 10,
  status: "submitted",
});

if (result.success) {
  const submissions = Array.isArray(result.data)
    ? result.data
    : result.data?.data || result.data?.submissions || [];
  // Process submissions...
}
```

**Features:**

- Pagination support
- Status filtering
- Graceful fallback handling
- Multiple data structure support

---

### 3. **Fetch Evaluation by ID** ✅

**Endpoint:** `GET /api/v1/dashboard/hr/evaluations/reviews/{id}`

**Implementation:** `src/services/evaluations.js` - `getEvaluationById()`

**Usage:** Available for detail views and editing

**Example:**

```javascript
const result = await evaluationsApi.getEvaluationById(
  evaluationId,
  accessToken
);

if (result.success) {
  const evaluation = result.data;
  // Display evaluation details...
}
```

**Features:**

- Single evaluation fetch
- Error handling for 404 (not found)
- Detailed logging

---

### 4. **Fetch Pending/Overdue Evaluations** ✅

**Endpoint:** `GET /api/v1/dashboard/hr/evaluations/reviews?status=pending&page=1&limit=5`

**Implementation:** `src/services/evaluations.js` - `getPendingEvaluations()`

**Usage:** `src/screens/UserDashboards/HRDashboard/HREvaluationsPage.jsx`

**Parameters:**

- `status`: "pending" or "overdue"
- `page`: 1 (default)
- `limit`: 10 (default)

**Example:**

```javascript
const result = await evaluationsApi.getPendingEvaluations(accessToken, {
  status: "pending",
  page: 1,
  limit: 10,
});

if (result.success) {
  const pendingEvals = Array.isArray(result.data)
    ? result.data
    : result.data?.data || [];
  // Process pending evaluations...
}
```

**Features:**

- Status filtering (pending/overdue)
- Pagination support
- Used for "Upcoming Deadlines" section

---

### 5. **Fetch All Evaluations** ✅

**Endpoint:** `GET /api/v1/dashboard/hr/evaluations/reviews`

**Implementation:** `src/services/evaluations.js` - `getAllEvaluations()`

**Usage:** `src/screens/UserDashboards/HRDashboard/HREvaluationsPage.jsx`

**Example:**

```javascript
const result = await evaluationsApi.getAllEvaluations(accessToken);

if (result.success) {
  const allEvaluations = Array.isArray(result.data)
    ? result.data
    : result.data?.data || [];
  // Process all evaluations...
}
```

**Features:**

- Fetches all evaluations without filters
- Used for statistics calculation
- Combined with other endpoints for comprehensive view

---

## 📊 Data Flow in HR Evaluations Page

### **Parallel API Calls:**

```javascript
const [allEvaluationsResult, staffSubmittedResult, pendingResult] =
  await Promise.all([
    evaluationsApi.getAllEvaluations(accessToken),
    evaluationsApi.getStaffSubmittedEvaluations(accessToken, {
      page: submittedPage,
      limit: submittedLimit,
    }),
    evaluationsApi.getPendingEvaluations(accessToken, {
      page: pendingPage,
      limit: pendingLimit,
      status: "pending",
    }),
  ]);
```

### **Statistics Calculation:**

```javascript
// In Progress: Evaluations assigned but not submitted by staff
const inProgress = allEvals.filter((evaluation) => {
  const evalId = evaluation._id || evaluation.id;
  return (
    !submittedIds.has(evalId) &&
    (evaluation.status === "pending" ||
      evaluation.status === "assigned" ||
      evaluation.status === "in_progress")
  );
}).length;

// Completed: Evaluations submitted by staff
const completed = staffSubmissions.length;

// Overdue: Evaluations past deadline and not submitted
const overdue = allEvals.filter((evaluation) => {
  const evalId = evaluation._id || evaluation.id;
  const dueDate = evaluation.reviewDeadline || evaluation.dueDate;
  const isPastDeadline = dueDate && new Date(dueDate) < now;
  const notSubmitted = !submittedIds.has(evalId);
  return isPastDeadline && notSubmitted;
}).length;

// Average Score: From staff submissions
const avgScore =
  staffSubmissions
    .filter((s) => s.score || s.overallScore || s.rating)
    .reduce((sum, s) => sum + (s.score || s.overallScore || s.rating || 0), 0) /
  completedWithScores.length;
```

---

## 🔄 Staff Submission Flow

### **Staff Submits Evaluation:**

1. Staff fills form at `/staff/evaluations/{id}/form`
2. Data sent to: `POST /api/v1/dashboard/staff/evaluations/reviews/{id}/response`
3. HR notified via: `POST /api/v1/dashboard/hr/evaluations/reviews/{id}/staff-submitted`

### **HR Views Submissions:**

1. HR page fetches from: `GET /api/v1/dashboard/hr/evaluations/reviews/submissions?status=submitted`
2. Displays in "Recent Submissions" section
3. Updates statistics cards
4. Shows in "Recent Submissions" tab

---

## 🛡️ Error Handling

### **Graceful Degradation:**

```javascript
// If submissions endpoint fails, fallback to main reviews
try {
  const response = await axios.get(
    `${EVALUATIONS_API_BASE}/reviews/submissions`,
    {
      headers: getAuthHeaders(accessToken),
      params: queryParams,
    }
  );
  return { success: true, data: response.data };
} catch (submissionsError) {
  // Fallback: Get all reviews and filter for submitted
  const allReviewsResponse = await axios.get(
    `${EVALUATIONS_API_BASE}/reviews`,
    {
      headers: getAuthHeaders(accessToken),
      params: queryParams,
    }
  );

  const submittedReviews = reviewsData.filter(
    (review) => review.status === "submitted" || review.status === "completed"
  );

  return { success: true, data: submittedReviews };
}
```

### **UI Error Handling:**

- Shows warning banner if API fails
- Continues to display page with empty data
- Logs errors to console for debugging
- Auto-refresh every 30 seconds to retry

---

## 📝 Key Files

### **API Service:**

- `src/services/evaluations.js` - All HR evaluation API calls

### **HR Pages:**

- `src/screens/UserDashboards/HRDashboard/HREvaluationsPage.jsx` - Main evaluations dashboard
- `src/screens/UserDashboards/HRDashboard/EvaluationCreator.jsx` - Create evaluations

### **Staff Pages:**

- `src/screens/UserDashboards/StaffDashboard/pages/EvaluationsOverview.jsx` - Staff view
- `src/screens/UserDashboards/StaffDashboard/pages/EvaluationForm.jsx` - Staff submit

---

## ✅ Summary

All HR Evaluation APIs are properly integrated and working:

1. ✅ **Create Evaluation** - POST `/reviews/create`
2. ✅ **Get Submissions** - GET `/reviews/submissions?status=submitted`
3. ✅ **Get by ID** - GET `/reviews/{id}`
4. ✅ **Get Pending** - GET `/reviews?status=pending`
5. ✅ **Get All** - GET `/reviews`

The implementation includes:

- ✅ Proper authentication headers
- ✅ Query parameter support
- ✅ Pagination
- ✅ Error handling with fallbacks
- ✅ Data transformation
- ✅ Multiple data structure support
- ✅ Comprehensive logging
