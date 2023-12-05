const parse = require("url").parse;

function parseRequest(request) {
  const { url, method } = request;
  const { pathname } = parse(url, true);
  return { pathname, method: method.toLowerCase() };
}

function handleUpload(request, response, allRoutes) {
  const username = request.pathname.split("/")[2];
  request.username = username;
  return allRoutes["/upload:post"](request, response);
}

function handleGallery(request, response, allRoutes) {
  const username = request.pathname.split("/")[2];
  request.username = username;
  return allRoutes["/gallery:post"](request, response);
}

function handleProfilePicture(request, response, allRoutes) {
  const username = request.pathname.split("/")[2];
  const profile = request.pathname.split("/")[3];
  if (!username) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Username is missing in the URL");
    return;
  }
  request.username = username;
  request.profile = profile;
  return allRoutes["/profilePicture:get"](request, response);
}

function handleFeedImages(request, response, allRoutes) {
  const urlParts = request.pathname.split("/");
  const username = urlParts[2];
  const photo = urlParts[3];
  if (!photo) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Photo ID is missing in the URL");
    return;
  }
  request.username = username;
  request.photo = photo;
  return allRoutes["/feedImages:get"](request, response);
}

module.exports = {
  parseRequest,
  handleUpload,
  handleGallery,
  handleProfilePicture,
  handleFeedImages,
};
