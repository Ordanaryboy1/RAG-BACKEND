// import fs from "fs";

// export const extractText = async (filePath) => {
//   const text = fs.readFileSync(filePath, "utf8");
//   return text;
// };



// import { exec } from "child_process";

// export const extractText = (filePath) => {
//   return new Promise((resolve, reject) => {
//     exec(`python scripts/pdf_to_text.py "${filePath}"`, (err, stdout) => {
//       if (err) return reject(err);
//       resolve(stdout);
//     });
//   });
// };





import { exec } from "child_process";

export const extractText = (filePath) => {
  return new Promise((resolve, reject) => {
    exec(
      `python scripts/pdf_to_text.py "${filePath}"`,
      {
        maxBuffer: 1024 * 1024 * 20, // ⭐ 20MB buffer (important for PDFs)
        encoding: "utf8" // ⭐ ensure utf8
      },
      (err, stdout, stderr) => {
        if (err) {
          console.error("Python error:", stderr);
          return reject(err);
        }

        resolve(stdout);
      }
    );
  });
};