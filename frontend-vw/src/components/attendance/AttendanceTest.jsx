/**
 * Attendance Test Component
 *
 * This component provides a simple interface to test the attendance API endpoints
 * and verify that the integration is working correctly.
 */

import React, { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { attendanceApi } from "@/services/attendanceApi";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

const AttendanceTest = () => {
  const { user, accessToken } = useAuth();
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState({});

  const testApiEndpoint = async (endpointName, apiCall) => {
    if (!accessToken) {
      toast.error("No access token available");
      return;
    }

    try {
      setTesting(true);
      console.log(`Testing ${endpointName}...`);

      const result = await apiCall(accessToken);

      setResults((prev) => ({
        ...prev,
        [endpointName]: {
          success: result.success,
          data: result.data,
          error: result.error,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));

      if (result.success) {
        toast.success(`${endpointName} test successful`);
        console.log(`${endpointName} result:`, result.data);
      } else {
        toast.error(`${endpointName} test failed: ${result.error}`);
        console.error(`${endpointName} error:`, result.error);
      }
    } catch (error) {
      console.error(`Error testing ${endpointName}:`, error);
      toast.error(`${endpointName} test failed: ${error.message}`);

      setResults((prev) => ({
        ...prev,
        [endpointName]: {
          success: false,
          error: error.message,
          timestamp: new Date().toLocaleTimeString(),
        },
      }));
    } finally {
      setTesting(false);
    }
  };

  const testEndpoints = {
    "Get Status": () => attendanceApi.getStatus(accessToken),
    "Get Overview": () => attendanceApi.getOverview(accessToken),
    "Check In (Office)": () =>
      attendanceApi.checkIn(accessToken, {
        workingLocation: "office",
        latitude: 5.767477,
        longitude: -0.180019,
      }),
    "Check In (Remote)": () =>
      attendanceApi.checkIn(accessToken, {
        workingLocation: "remote",
      }),
    "Check Out": () =>
      attendanceApi.checkOut(accessToken, {
        dailySummary: "Test check-out from admin dashboard",
      }),
    "Get History": () =>
      attendanceApi.getHistory(accessToken, user?.id, {
        period: "monthly",
        limit: 10,
      }),
    "Get Stats": () => attendanceApi.getStats(accessToken, user?.id),
  };

  const runAllTests = async () => {
    for (const [name, apiCall] of Object.entries(testEndpoints)) {
      await testApiEndpoint(name, apiCall);
      // Small delay between tests
      await new Promise((resolve) => setTimeout(resolve, 500));
    }
  };

  const clearResults = () => {
    setResults({});
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance API Test Suite</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Test Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={runAllTests}
            disabled={testing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {testing ? "Running Tests..." : "Run All Tests"}
          </Button>

          {Object.entries(testEndpoints).map(([name, apiCall]) => (
            <Button
              key={name}
              onClick={() => testApiEndpoint(name, apiCall)}
              disabled={testing}
              variant="outline"
              size="sm"
            >
              Test {name}
            </Button>
          ))}

          <Button onClick={clearResults} variant="outline" size="sm">
            Clear Results
          </Button>
        </div>

        {/* Results Display */}
        {Object.keys(results).length > 0 && (
          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Test Results</h3>
            {Object.entries(results).map(([endpoint, result]) => (
              <div
                key={endpoint}
                className={`p-3 rounded-lg border ${
                  result.success
                    ? "bg-green-50 border-green-200"
                    : "bg-red-50 border-red-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{endpoint}</span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        result.success
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {result.success ? "SUCCESS" : "FAILED"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {result.timestamp}
                    </span>
                  </div>
                </div>

                {result.success ? (
                  <div className="text-sm text-gray-600">
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(result.data, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    Error: {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* User Info */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Current User</h4>
          <div className="text-sm text-gray-600">
            <p>ID: {user?.id || "Not available"}</p>
            <p>
              Name: {user?.firstName} {user?.lastName}
            </p>
            <p>Role: {user?.role}</p>
            <p>Token: {accessToken ? "Available" : "Not available"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AttendanceTest;
