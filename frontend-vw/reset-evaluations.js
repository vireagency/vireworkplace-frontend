/**
 * Comprehensive Reset Script for HR and Staff Evaluations
 *
 * This script will:
 * 1. Clear all completed evaluations from localStorage
 * 2. Clear all submitted evaluations from localStorage
 * 3. Clear any pending submissions
 * 4. Reset sidebar counts
 * 5. Force refresh the page
 *
 * Run this in the browser console (F12) to reset everything
 */

(function resetAllEvaluations() {
  console.log("🔄 RESETTING ALL EVALUATIONS DATA...\n");

  // Step 1: Clear completed evaluations
  console.log("📱 STEP 1: Clearing completed evaluations from localStorage...");
  const completedBefore = JSON.parse(
    localStorage.getItem("completedEvaluations") || "[]"
  );
  localStorage.removeItem("completedEvaluations");
  localStorage.setItem("completedEvaluations", JSON.stringify([]));
  console.log(`✅ Cleared ${completedBefore.length} completed evaluations`);

  // Step 2: Clear submitted evaluations
  console.log("📱 STEP 2: Clearing submitted evaluations from localStorage...");
  const submittedBefore = JSON.parse(
    localStorage.getItem("submittedEvaluations") || "[]"
  );
  localStorage.removeItem("submittedEvaluations");
  localStorage.setItem("submittedEvaluations", JSON.stringify([]));
  console.log(`✅ Cleared ${submittedBefore.length} submitted evaluations`);

  // Step 3: Clear pending submissions
  console.log("📱 STEP 3: Clearing pending submissions from localStorage...");
  const pendingBefore = JSON.parse(
    localStorage.getItem("pendingEvaluationSubmissions") || "[]"
  );
  localStorage.removeItem("pendingEvaluationSubmissions");
  localStorage.setItem("pendingEvaluationSubmissions", JSON.stringify([]));
  console.log(`✅ Cleared ${pendingBefore.length} pending submissions`);

  // Step 4: Clear any other evaluation-related data
  console.log(
    "📱 STEP 4: Clearing other evaluation-related localStorage data..."
  );
  const keysToRemove = [
    "evaluationFormData",
    "evaluationDrafts",
    "evaluationProgress",
    "hrEvaluations",
    "staffEvaluations",
    "evaluationCache",
  ];

  let removedCount = 0;
  keysToRemove.forEach((key) => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      removedCount++;
      console.log(`✅ Removed ${key}`);
    }
  });
  console.log(`✅ Cleared ${removedCount} additional evaluation data entries`);

  // Step 5: Reset sidebar counts
  console.log("📱 STEP 5: Resetting sidebar counts...");
  if (window.forceSetEvaluationsZero) {
    window.forceSetEvaluationsZero();
    console.log("✅ Sidebar evaluations count set to 0");
  }

  // Step 6: Dispatch reset events
  console.log("📱 STEP 6: Dispatching reset events...");
  try {
    // Notify that evaluations have been reset
    window.dispatchEvent(
      new CustomEvent("evaluationsReset", {
        detail: {
          completedCleared: completedBefore.length,
          submittedCleared: submittedBefore.length,
          pendingCleared: pendingBefore.length,
          timestamp: new Date().toISOString(),
        },
      })
    );
    console.log("✅ Reset event dispatched");

    // Force sidebar refresh
    if (window.forceRefreshSidebarCount) {
      window.forceRefreshSidebarCount();
      console.log("✅ Sidebar count refreshed");
    }
  } catch (error) {
    console.warn("⚠️ Error dispatching reset events:", error);
  }

  // Step 7: Summary
  console.log("\n✅ RESET COMPLETE!");
  console.log("📊 Summary:");
  console.log(`   - Completed evaluations cleared: ${completedBefore.length}`);
  console.log(`   - Submitted evaluations cleared: ${submittedBefore.length}`);
  console.log(`   - Pending submissions cleared: ${pendingBefore.length}`);
  console.log(`   - Additional data cleared: ${removedCount}`);
  console.log("\n🔄 The page will refresh in 3 seconds to apply changes...");

  // Step 8: Auto-refresh page
  setTimeout(() => {
    console.log("🔄 Refreshing page...");
    window.location.reload();
  }, 3000);

  return {
    success: true,
    cleared: {
      completed: completedBefore.length,
      submitted: submittedBefore.length,
      pending: pendingBefore.length,
      additional: removedCount,
    },
    message:
      "All evaluations data has been reset. Page will refresh in 3 seconds.",
  };
})();
