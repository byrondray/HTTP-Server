const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const path = require("path");
const {
  parseRequest,
  handleUpload,
  handleGallery,
  handleDelete,
  handleProfilePicture,
  handleFeedImages,
  streamFile,
} = require("./handlerHelper");

const allRoutes = {
  "/profilePicture:get": (request, response) => {
    const profilePicturePath = path.join(
      __dirname,
      "photos",
      request.username,
      "profile.jpeg"
    );
    streamFile(profilePicturePath, response, "image/jpeg");
  },
  "/homepageHelper.css:get": (request, response) => {
    const cssFilePath = path.join(__dirname, "homepageHelper.css");
    streamFile(cssFilePath, response, "text/css");
  },
  "/getFeed.css:get": (request, response) => {
    const cssFilePath = path.join(__dirname, "getFeed.css");
    streamFile(cssFilePath, response, "text/css");
  },
  "/feedImages:get": (request, response) => {
    const profileImagePath = path.join(
      __dirname,
      "photos",
      request.username,
      request.photo
    );
    streamFile(profileImagePath, response, "image/png");
  },
  "/:get": (request, response) => {
    controller.getHomePage(request, response);
  },
  "/upload:post": (request, response) => {
    controller.uploadImages(request, response);
  },
  "/delete:delete": (request, response) => {
    controller.deleteImage(request, response);
  },
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
  },
  "/settings:get": (request, response) => {
    controller.getSettings(request, response);
  },
  "/gallery:get": (request, response) => {
    controller.getGallery(request, response);
  },
  "/redX:get": (request, response) => {
    const redXPath = path.join(__dirname, "..", "..", "assets", "redX.png");
    streamFile(redXPath, response, "image/png");
  },

  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER);
    const errorPagePath = path.join(__dirname, "views", "404.html");
    streamFile(errorPagePath, response, "text/html");
  },
};

const handler = (request, response) => {
  const { pathname, method } = parseRequest(request);
  request.pathname = pathname;
  request.method = method;

  if (pathname.startsWith("/upload/") && method === "post") {
    return handleUpload(request, response, allRoutes);
  }

  if (pathname.startsWith("/gallery/") && method === "get") {
    return handleGallery(request, response, allRoutes);
  }

  if (pathname.startsWith("/delete/") && method === "delete") {
    return handleDelete(request, response, allRoutes);
  }

  if (pathname.startsWith("/profilePicture/") && method === "get") {
    return handleProfilePicture(request, response, allRoutes);
  }

  if (pathname.startsWith("/feedImages/") && method === "get") {
    return handleFeedImages(request, response, allRoutes);
  }

  const key = `${pathname}:${method}`;
  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(
    handlerError(response)
  );
};

const handlerError = (response) => {
  return (error) => {
    console.log("Something bad has  happened**", error.stack);
    response.writeHead(500, DEFAULT_HEADER);
    response.write(
      JSON.stringify({
        error: "internet server error!!",
      })
    );

    return response.end();
  };
};

module.exports = handler;
