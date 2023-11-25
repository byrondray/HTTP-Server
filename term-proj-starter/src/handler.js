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
      return "application/octet-stream"; // Default to binary data
  }
}

const allRoutes = {
  "/profilePicture:get": (request, response) => {
    // Assuming the username has been extracted earlier and attached to the request object
    const username = request.username;

    // Log the username to verify it's being passed correctly
    console.log(`Username received: ${username}`);

    const profileImageFilename = "profile.jpeg";
    const profileImagePath = path.join(
      __dirname,
      "photos",
      username,
      profileImageFilename
    );

    console.log(`Looking for image at: ${profileImagePath}`);

    fs.readFile(profileImagePath, (err, data) => {
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
  // "/profilePicture:get": (request, response) => {
  //   const cssFilePath = path.join(
  //     __dirname,
  //     "photos",
  //     "john123",
  //     "profile.jpeg"
  //   );

  //   fs.readFile(cssFilePath, (err, data) => {
  //     if (err) {
  //       response.writeHead(404, DEFAULT_HEADER);
  //       response.end("File not found");
  //     } else {
  //       response.writeHead(200, { "Content-Type": "image/jpeg" });
  //       response.end(data);
  //     }
  //   });
  // },
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
  "/images:post": (request, response) => {
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

  // Check if the pathname starts with '/profilePicture/' for dynamic username handling
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
    // Pass the username as a property of the request object
    request.username = username;
    // Now call the profilePicture handler
    return allRoutes["/profilePicture:get"](request, response);
  }

  // Handle other routes
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
