function handler(event) {
  var request = event.request;
  var uri = request.uri;

  if (uri.startsWith("/console/")) {
    request.uri = uri.substring("/console".length);
  } else if (uri === "/console") {
    request.uri = "/";
  }
  return request;
}
