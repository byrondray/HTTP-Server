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

async function processUsersData(jsonFilePath) {
  try {
    const users = await readJsonFile(jsonFilePath);

    const processedData = users.map((user) => {
      return {
        id: user.id,
        description: user.description,
        username: user.username,
        stats: {
          posts: user.stats.posts,
          followers: user.stats.followers,
          following: user.stats.following,
        },
        profile: user.profile,
        photos: user.photos,
      };
    });

    return processedData;
  } catch (err) {
    console.error("Error processing users data:", err);
    throw err;
  }
}

async function getProfileImagePath() {
  const jsonFilePath = path.join("..", "database", "data.json");
  const users = await processUsersData(jsonFilePath);

  const user = users.find((user) => user.username === username);

  if (!user || !user.profile) {
    throw new Error("User not found or profile image is missing");
  }

  const profileImagePath = path.join(
    __dirname,
    "photos",
    user.username,
    user.profile
  );
  return profileImagePath;
}

module.exports = {
  readJsonFile,
  getQueryParam,
  processUsersData,
  getProfileImagePath,
  };
