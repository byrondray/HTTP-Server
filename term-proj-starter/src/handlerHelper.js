const parse = require("url").parse;
const { createReadStream } = require("fs");

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

function handleDelete(request, response, allRoutes) {
  const urlParts = request.pathname.split("/");
  const username = urlParts[2];
  const photo = urlParts[3];

  request.username = username;
  request.photo = photo;
  return allRoutes["/delete:delete"](request, response);
}

function handleProfilePicture(request, response, allRoutes) {
  const username = request.pathname.split("/")[2];
  if (!username) {
    response.writeHead(400, { "Content-Type": "text/plain" });
    response.end("Username is missing in the URL");
    return;
  }
  request.username = username;
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

const streamFile = (filePath, response, contentType) => {
  const stream = createReadStream(filePath);

  stream.on("open", () => {
    response.writeHead(200, { "Content-Type": contentType });
    stream.pipe(response);
  });

  stream.on("error", (err) => {
    console.error(`Error reading file: ${err.message}`);
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("File not found");
  });
};

const handleStreamError = (stream, response) => {
  stream.on("error", (err) => {
    console.error(`Error reading file: ${err.message}`);
    response.writeHead(404, { "Content-Type": "text/plain" });
    response.end("File not found");
  });
};

module.exports = {
  parseRequest,
  handleUpload,
  handleGallery,
  handleDelete,
  handleProfilePicture,
  handleFeedImages,
  streamFile,
  handleStreamError,
};
