import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 }, // Ramp up to 10 users over 30 seconds
    { duration: '1m', target: 50 },  // Ramp up to 50 users over 1 minute
    { duration: '2m', target: 200 }, // Ramp up to 200 users over 2 minutes
    { duration: '1m', target: 200 }, // Stay at 200 users for 1 minute
    { duration: '30s', target: 0 },  // Ramp down to 0 users over 30 seconds
  ],
  thresholds: {
    http_req_duration: ['p(95)<150'], // 95% of requests should be below 150ms
  },
};

const BASE_URL = 'http://localhost:8000';

export default function () {
  // Simulate QR validation request
  const payload = {
    qr_string: 'eyJwYXlsb2FkIjp7ImV2ZW50SWQiOjEsInRpY2tldElkIjoxLCJub25jZSI6InRlc3Qtbm9uY2UtMTIzIiwiaXNzdWVkQXQiOiIyMDIzLTAxLTAxVDAwOjAwOjAwWiJ9LCJzaWduYXR1cmUiOiJ0ZXN0LXNpZ25hdHVyZSJ9', // Base64 encoded test QR
    device_id: `device-${__VU}`,
  };

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer test-token', // This will fail auth but test the endpoint
    },
  };

  const response = http.post(`${BASE_URL}/api/scan/validate-qr`, JSON.stringify(payload), params);

  check(response, {
    'status is 200 or 403': (r) => r.status === 200 || r.status === 403,
    'response time < 150ms': (r) => r.timings.duration < 150,
  });

  sleep(1); // Wait 1 second between requests
}