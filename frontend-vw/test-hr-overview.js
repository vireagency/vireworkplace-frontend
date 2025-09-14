/**
 * Test script for HR Overview API integration
 * Run this in the browser console to test the HR overview API
 */

console.log('=== HR OVERVIEW API TEST ===');

// Test the HR overview API
async function testHROverview() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    console.error('❌ No access token found in localStorage');
    return;
  }

  console.log('🔑 Access token found, length:', accessToken.length);
  console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');

  try {
    const response = await fetch('https://vireworkplace-backend-hpca.onrender.com/api/v1/dashboard/hr/overview', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    });

    console.log('📡 Response status:', response.status);
    console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const responseData = await response.json();
    console.log('📡 Response data:', responseData);

    if (response.ok) {
      console.log('✅ HR Overview data fetched successfully!');
      console.log('📊 Active Employees:', responseData.data?.activeEmployees);
      console.log('📊 Remote Workers:', responseData.data?.totalRemoteWorkersToday);
      console.log('📊 No Check-In:', responseData.data?.noCheckInToday);
      console.log('📊 Productivity Index:', responseData.data?.productivityIndex);
      console.log('📊 Incomplete Tasks:', responseData.data?.incompleteTasks);
      console.log('📊 Department Performance:', responseData.data?.departmentPerformance);
    } else {
      console.error('❌ HR Overview fetch failed:', responseData);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run the test
testHROverview();
