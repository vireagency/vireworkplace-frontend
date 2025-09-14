/**
 * Test script for Goals API
 * Run this in the browser console to test the goals API
 */

console.log('=== GOALS API TEST ===');

// Test the goals API
async function testGoalsAPI() {
  const accessToken = localStorage.getItem('access_token');
  
  if (!accessToken) {
    console.error('❌ No access token found in localStorage');
    return;
  }

  console.log('🔑 Access token found, length:', accessToken.length);
  console.log('🔑 Token preview:', accessToken.substring(0, 20) + '...');

  try {
    // Test GET all goals
    console.log('📡 Testing GET all goals...');
    const response = await fetch('https://vireworkplace-backend-hpca.onrender.com/api/v1/dashboard/hr/performance/goals', {
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
      console.log('✅ Goals fetched successfully!');
      console.log('📊 Goals count:', responseData.data?.length || 0);
    } else {
      console.error('❌ Goals fetch failed:', responseData);
    }
  } catch (error) {
    console.error('❌ Network error:', error);
  }
}

// Run the test
testGoalsAPI();
