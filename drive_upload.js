import fs from "fs";
import path from "path";
import { google } from "googleapis";
import { authorizeGoogle } from "./google_auth.js";

export async function uploadFileToDrive(localFilePath, mimeType = "text/csv") {
  const auth = await authorizeGoogle();
  const drive = google.drive({ version: "v3", auth });

  const fileName = path.basename(localFilePath);

  try {
    const res = await drive.files.create({
      requestBody: {
        name: fileName,
        mimeType,
      },
      media: {
        mimeType,
        body: fs.createReadStream(localFilePath),
      },
    });

    console.log("📁 File uploaded to Drive:", res.data.name || fileName);
  } catch (err) {
    console.error("❌ Drive upload failed:", err.message);
  }
}
