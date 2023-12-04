const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");
const ejs = require("ejs");
const { formidable } = require("formidable");

const readJsonFile = async (filePath) => {
  try {
    const fullPath = path.join(__dirname, filePath);
    const data = await fs.readFile(fullPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    throw err;
  }
};

const getQueryParam = (reqUrl, paramName, host) => {
  const urlObj = new URL(reqUrl, `http://${host}`);
  return urlObj.searchParams.get(paramName);
};

const writeUserData = async (users) => {
  await fs.writeFile(
    path.join(__dirname, "..", "database", "data.json"),
    JSON.stringify(users, null, 2),
    "utf8"
  );
};

const findUserByUsername = (users, username) => {
  return users.find((u) => u.username === username);
};

const renderTemplate = async (templateName, data) => {
  return await ejs.renderFile(path.join(__dirname, templateName), data);
};

const initializeForm = (uploadDir) => {
  const form = formidable({});
  form.uploadDir = uploadDir;
  form.keepExtensions = true;
  return form;
};

const processUploadedFile = async (files, username) => {
  const oldPath = files.upload[0].filepath;
  const filename = files.upload[0].originalFilename;
  const newPath = path.join(__dirname, "photos", username, filename);

  await fs.rename(oldPath, newPath);

  const users = await readJsonFile("../database/data.json");
  const user = findUserByUsername(users, username);
  if (user) {
    user.photos.push(filename);
  }

  await writeUserData(users);

  return filename;
};

const sendErrorResponse = (response, message) => {
  response.writeHead(500, { "Content-Type": "text/plain" });
  response.end(message);
};

const sendRedirectResponse = (response, location) => {
  response.writeHead(302, { Location: location });
  response.end();
};

const deletePhoto = async (username, photo, user) => {
  const photoIndex = user.photos.indexOf(photo);
  user.photos.splice(photoIndex, 1);

  const photoPath = path.join(__dirname, "photos", username, photo);
  await fs.unlink(photoPath);
};

module.exports = {
  readJsonFile,
  getQueryParam,
  writeUserData,
  findUserByUsername,
  renderTemplate,
  initializeForm,
  processUploadedFile,
  sendErrorResponse,
  sendRedirectResponse,
  deletePhoto,
};
