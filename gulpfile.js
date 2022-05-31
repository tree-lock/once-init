import fs from "fs-extra";
import inquirer from "inquirer";
import util from "util";
import { exec, spawnSync } from "child_process";
import chalk from "chalk";
const execPromise = util.promisify(exec);

export async function publish() {
  // 是否已构建
  if (!fs.existsSync("./dist")) {
    console.log(`请先进行构建, ${chalk.green("npm run build")}`);
    return;
  }
  // 确认版本
  const packageFile = await fs.readJSON("./package.json");
  let version = packageFile.version;
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "version",
      message: `请输入版本号，当前版本为${version ?? "未定义"}\n`,
      default: version,
    },
  ]);
  if (answers.version) {
    // 修改文件版本
    if (version !== answers.version) {
      version = answers.version;
      const packageFile = await fs.readJSON("./package.json");

      packageFile.version = version;
      await Promise.all([
        fs.writeJSON("./package.json", packageFile, {
          spaces: 2,
        }),
      ]);
      console.log(`.env, package.json 的版本号已更新为${version}`);
    }
    // 判断是否是`master`分支，如果是，执行发布，否则拒绝发布并提示只能在`master`分支上执行发布操作
    const branch = (
      await execPromise("git rev-parse --abbrev-ref HEAD")
    ).stdout.trim();
    if (branch === "master") {
      return spawnSync("npm publish", { stdio: "inherit", shell: true });
    } else {
      console.log(
        `当前分支为${chalk.redBright(branch)}, 请在${chalk.green(
          "master"
        )}分支上执行发布操作`
      );
      const answers = await inquirer.prompt([
        {
          type: "confirm",
          name: "switch",
          message: `是否进行自动跳转到master分支并进行版本合并当前分支？`,
          default: false,
        },
      ]);
      if (!answers.switch) {
        return;
      } else {
        spawnSync(`git add . && git commit -m "build: release v${version}"`, {
          stdio: "inherit",
          shell: true,
        });
        spawnSync("git switch master", { stdio: "inherit", shell: true });
        spawnSync("git merge develop", { stdio: "inherit", shell: true });
        spawnSync("npm publish", { stdio: "inherit", shell: true });
        spawnSync("git switch develop", { stdio: "inherit", shell: true });
        const answers = await inquirer.prompt([
          {
            type: "confirm",
            name: "push",
            message: `是否将修改push到gitlab`,
            default: true,
          },
        ]);
        if (answers.push) {
          return spawnSync("git push --all", { stdio: "inherit", shell: true });
        }
      }
    }
  }
}
