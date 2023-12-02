const { parse } = require("url");
const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream } = require("fs");
const path = require("path");

const allRoutes = {
  "/profilePicture:get": async (request, response) => {
    const username = request.username;

    const profilePicturePath = path.join(
      __dirname,
      "photos",
      username,
      "profile.jpeg"
    );

    const profilePictureStream = createReadStream(profilePicturePath);

    response.writeHead(200, { "Content-Type": "image/jpeg" });

    profilePictureStream.pipe(response);

    profilePictureStream.on("error", (err) => {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
    });
  },
  "/homepageHelper.css:get": (request, response) => {
    const cssFilePath = path.join(__dirname, "homepageHelper.css");

    const cssStream = createReadStream(cssFilePath);

    cssStream.on("open", () => {
      response.writeHead(200, { "Content-Type": "text/css" });
      cssStream.pipe(response);
    });

    cssStream.on("error", (err) => {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404);
      response.end("File not found");
    });
  },
  "/getFeed.css:get": (request, response) => {
    const cssFilePath = path.join(__dirname, "getFeed.css");

    const cssStream = createReadStream(cssFilePath);

    cssStream.on("open", () => {
      response.writeHead(200, { "Content-Type": "text/css" });
      cssStream.pipe(response);
    });

    cssStream.on("error", (err) => {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404);
      response.end("File not found");
    });
  },
  "/feedImages:get": (request, response) => {
    const photo = request.photo;
    const username = request.username;

    const profileImagePath = path.join(__dirname, "photos", username, photo);

    const imageStream = createReadStream(profileImagePath);

    imageStream.on("open", () => {
      response.writeHead(200, { "Content-Type": "image/png" });
      imageStream.pipe(response);
    });

    imageStream.on("error", (err) => {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
    });
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
  "/settings:get": async (request, response) => {
    controller.getSettings(request, response);
  },
  "/gallery:get": (request, response) => {
    controller.getGallery(request, response);
  },
  "/redX:get": (request, response) => {
    const redXPath = path.join(__dirname, "..", "..", "assets", "redX.png");

    const redXStream = createReadStream(redXPath);

    redXStream.on("open", () => {
      response.writeHead(200, { "Content-Type": "image/png" });
      redXStream.pipe(response);
    });

    redXStream.on("error", (err) => {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
    });
  },
  default: (request, response) => {
    response.writeHead(404, DEFAULT_HEADER);
    createReadStream(path.join(__dirname, "views", "404.html"), "utf8").pipe(
      response
    );
  },
};

function handler(request, response) {
  const { url, method } = request;
  const { pathname } = parse(url, true);

  if (pathname.startsWith("/upload/") && method.toLowerCase() === "post") {
    const username = pathname.split("/")[2];
    request.username = username;
    return allRoutes["/upload:post"](request, response);
  }

  if (pathname.startsWith("/gallery/") && method.toLowerCase() === "get") {
    const username = pathname.split("/")[2];
    request.username = username;
    return allRoutes["/gallery:post"](request, response);
  }

  if (pathname.startsWith("/delete/") && method.toLowerCase() === "delete") {
    const segments = pathname.split("/");
    const username = segments[2];
    const photo = segments[3];

    request.username = username;
    request.photo = photo;
    return allRoutes["/delete:delete"](request, response);
  }

  if (
    pathname.startsWith("/profilePicture/") &&
    method.toLowerCase() === "get"
  ) {
    const username = pathname.split("/")[2];
    if (!username) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Username is missing in the URL");
      return;
    }
    request.username = username;
    return allRoutes["/profilePicture:get"](request, response);
  }

  if (pathname.startsWith("/feedImages/") && method.toLowerCase() === "get") {
    const username = pathname.split("/")[2];
    const photo = pathname.split("/")[3];
    if (!photo) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Username is missing in the URL");
      return;
    }
    request.username = username;
    request.photo = photo;
    return allRoutes["/feedImages:get"](request, response);
  }

  const key = `${pathname}:${method.toLowerCase()}`;
  const chosen = allRoutes[key] || allRoutes.default;

  return Promise.resolve(chosen(request, response)).catch(
    handlerError(response)
  );
}

function handlerError(response) {
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
}

module.exports = handler;
