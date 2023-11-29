const { parse } = require("url");
const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream } = require("fs");
const path = require("path");
const fs = require("fs/promises");

const allRoutes = {
  "/profilePicture:get": async (request, response) => {
    const username = request.username;

    const profilePicturePath = path.join(
      __dirname,
      "photos",
      username,
      "profile.jpeg"
    );

    try {
      const profilePictures = await fs.readFile(profilePicturePath);
      response.writeHead(200, { "Content-Type": "image/jpeg" });
      response.end(profilePictures);
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
    }
  },
  "/homepageHelper.css:get": async (request, response) => {
    const cssFilePath = path.join(__dirname, "homepageHelper.css");

    try {
      const css = await fs.readFile(cssFilePath);
      response.writeHead(200, { "Content-Type": "text/css" });
      response.end(css);
    } catch (err) {
      if (err) {
        response.writeHead(404, DEFAULT_HEADER);
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(css);
      }
    }
  },
  "/getFeed.css:get": async (request, response) => {
    const cssFilePath = path.join(__dirname, "getFeed.css");

    try {
      const css = await fs.readFile(cssFilePath);
      response.writeHead(200, { "Content-Type": "text/css" });
      response.end(css);
    } catch (err) {
      if (err) {
        response.writeHead(404, DEFAULT_HEADER);
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(css);
      }
    }
  },
  "/profileImages:get": async (request, response) => {
    const photo = request.photo;
    const username = request.username;

    const profileImagePath = path.join(__dirname, "photos", username, photo);

    try {
      const images = await fs.readFile(profileImagePath);
      response.writeHead(200, { "Content-Type": "image/png" });
      response.end(images);
    } catch (err) {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "image/png" });
        response.end(images);
      }
    }
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
  "/redX:get": async (request, response) => {
    const redXPath = path.join(__dirname, "..", "..", "assets", "redX.png");
    try {
      const redX = await fs.readFile(redXPath);
      response.writeHead(200, { "Content-Type": "image/jpeg" });
      response.end(redX);
    } catch (err) {
      console.error(`Error reading file: ${err.message}`);
      response.writeHead(404, { "Content-Type": "text/plain" });
      response.end("File not found");
    }
  },
  // 404 routes
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

  if (
    pathname.startsWith("/profileImages/") &&
    method.toLowerCase() === "get"
  ) {
    const username = pathname.split("/")[2];
    const photo = pathname.split("/")[3];
    if (!photo) {
      response.writeHead(400, { "Content-Type": "text/plain" });
      response.end("Username is missing in the URL");
      return;
    }
    request.username = username;
    request.photo = photo;
    return allRoutes["/profileImages:get"](request, response);
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
