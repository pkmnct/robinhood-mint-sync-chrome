const fs = require("fs");
const https = require("https");
const unzipper = require("unzipper");

const directory = "./.stellar";

const downloadStellar = async () => {
  return new Promise((resolve, reject) => {
    if (!fs.existsSync(directory)) fs.mkdirSync(directory);

    const output = directory + "/html5up-stellar.zip";
    const file = fs.createWriteStream(output);

    const request = https.get("https://html5up.net/stellar/download", (response) => {
      if (response.statusCode !== 200) {
        reject(
          new Error(
            `Failed to download Stellar. Try manually downloading from https://html5up.net/stellar. Place the html5up-stellar.zip in ./.stellar' (${response.statusCode})`
          )
        );
        return;
      }

      response.pipe(file);
    });

    // The destination stream is ended by the time it's called
    file.on("finish", () => resolve(output));

    request.on("error", (err) => {
      fs.unlink(output, () => reject(err));
    });

    file.on("error", (err) => {
      fs.unlink(output, () => reject(err));
    });

    request.end();
  });
};

const unzipStellar = (stellar) => {
  return new Promise((resolve, reject) => {
    const stellarZip = fs.createReadStream(stellar);
    stellarZip.pipe(unzipper.Extract({ path: directory }));
    stellarZip.on("finish", () => resolve(output));
    stellarZip.on("error", (err) => {
      fs.unlink(stellar, () => reject(err));
    });
  });
};

const handleError = (error) => {
  if (error instanceof Error) {
    console.error(error);
    process.exit(-1);
  }
};

const init = async () => {
  console.log("Downloading Stellar. Please Wait...");
  const stellar = await downloadStellar();
  handleError(stellar);
  console.log(`Stellar downloaded to ${stellar}`);
  const unzip = await unzipStellar(stellar);
  handleError(unzip);
  console.log(`Stellar unzipped to ${stellar}`);
};

init();
