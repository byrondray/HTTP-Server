const { parse } = require("url");
const { DEFAULT_HEADER } = require("./util/util.js");
const controller = require("./controller");
const { createReadStream } = require("fs");
const path = require("path");
const fs = require("fs");

function getContentType(fileName) {
  const fileExtension = path.extname(fileName).toLowerCase();
  switch (fileExtension) {
    case ".jpg":
    case ".jpeg":
      return "image/jpeg";
    case ".png":
      return "image/png";
    case ".gif":
      return "image/gif";
    case ".bmp":
      return "image/bmp";
    default:
      return "application/octet-stream";
  }
}

const allRoutes = {
  "/profilePicture:get": (request, response) => {
    const username = request.username;

    const profilePicturePath = path.join(
      __dirname,
      "photos",
      username,
      "profile.jpeg"
    );

    fs.readFile(profilePicturePath, (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "image/jpeg" });
        response.end(data);
      }
    });
  },
  "/homepageHelper.css:get": (request, response) => {
    const cssFilePath = path.join(__dirname, "homepageHelper.css");

    fs.readFile(cssFilePath, (err, data) => {
      if (err) {
        response.writeHead(404, DEFAULT_HEADER);
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(data);
      }
    });
  },
  "/getFeed.css:get": (request, response) => {
    const cssFilePath = path.join(__dirname, "getFeed.css");

    fs.readFile(cssFilePath, (err, data) => {
      if (err) {
        response.writeHead(404, DEFAULT_HEADER);
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "text/css" });
        response.end(data);
      }
    });
  },
  "/profileImages:get": (request, response) => {
    const photo = request.photo;
    const username = request.username;

    const profileImagePath = path.join(__dirname, "photos", username, photo);

    fs.readFile(profileImagePath, (err, data) => {
      if (err) {
        console.error(`Error reading file: ${err.message}`);
        response.writeHead(404, { "Content-Type": "text/plain" });
        response.end("File not found");
      } else {
        response.writeHead(200, { "Content-Type": "image/png" });
        response.end(data);
      }
    });
  },
  "/:get": (request, response) => {
    controller.getHomePage(request, response);
  },
  // GET: localhost:3000/form
  "/form:get": (request, response) => {
    controller.getFormPage(request, response);
  },
  // POST: localhost:3000/form
  "/form:post": (request, response) => {
    controller.sendFormData(request, response);
  },
  // POST: localhost:3000/images
  "/upload:post": (request, response) => {
    controller.uploadImages(request, response);
  },
  // GET: localhost:3000/feed
  // Shows instagram profile for a given user
  "/feed:get": (request, response) => {
    controller.getFeed(request, response);
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


  if (pathname === "/upload" && method.toLowerCase() === "post") {
    controller.uploadImages(request, response);
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
