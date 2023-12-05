const { DEFAULT_HEADER } = require("./util/util.js");
const { streamFile } = require("./controllerHelper.js");
const controller = require("./controller");
const path = require("path");
const {
  parseRequest,
  handleUpload,
  handleGallery,
  handleProfilePicture,
  handleFeedImages,
} = require("./handlerHelper");

const allRoutes = {
  "/profilePicture:get": (request, response) => {
    controller.getProfilePicture(request, response);
  },
  "/homepageHelper.css:get": (request, response) => {
    controller.getHomepageCss(request, response);
  },
  "/getFeed.css:get": (request, response) => {
    controller.getFeedCss(request, response);
  },
  "/refreshFeed:get": (request, response) => {
    controller.refreshFeed(request, response);
  },
  "/feedImages:get": (request, response) => {
    controller.feedImages(request, response);
  },
  "/:get": (request, response) => {
    controller.getHomePage(request, response);
  },
  "/upload:post": (request, response) => {
    controller.uploadImages(request, response);
  },
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
  },
  "/gallery:get": (request, response) => {
    controller.getGallery(request, response);
  },
  "/redX:get": (request, response) => {
    controller.redX(request, response);
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
