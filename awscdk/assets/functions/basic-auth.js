/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
function handler(event) {
  var request = event.request;
  var authHeaders = request.headers.authorization;
  var expected = 'Basic ' + 'dXNlcjpwYXNz'; // user:pass base64 encoded

  if (authHeaders && authHeaders.value === expected) {
    return request;
  }

  return {
    statusCode: 401,
    statusDescription: 'Unauthorized',
    headers: {
      'www-authenticate': { value: 'Basic realm="Access to Console"' },
    },
  };
}
