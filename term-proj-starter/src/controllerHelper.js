const fs = require("fs/promises");
const path = require("path");
const { URL } = require("url");

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

module.exports = {
  readJsonFile,
  getQueryParam,
};
