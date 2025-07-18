const fs = require("fs");
const path = require("path");
console.log("🔧 Fixing package.json and lockfile issues...");
const packageJsonPath = path.join(process.cwd(), "package.json");
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
if (packageJson.dependencies && packageJson.dependencies.dotenv) {
  delete packageJson.dependencies.dotenv;
  console.log("✅ Removed dotenv from dependencies");
}
if (packageJson.dependencies && packageJson.dependencies.tailwindcss) {
  if (!packageJson.devDependencies) {
    packageJson.devDependencies = {};
  }
  packageJson.devDependencies.tailwindcss =
    packageJson.dependencies.tailwindcss;
  delete packageJson.dependencies.tailwindcss;
  console.log("✅ Moved tailwindcss to devDependencies");
}
fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
console.log("✅ Updated package.json");
console.log("🚀 Now run: npm install --force");
console.log(
  "📝 Or delete node_modules and package-lock.json, then run npm install"
);
