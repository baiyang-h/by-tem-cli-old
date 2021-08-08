const path = require("path");
const fs = require("fs-extra");
const inquirer = require("inquirer");
const Generator = require("./Generator");

/**
 * 执行创建命令
 */
module.exports = async (name, options) => {
  // 当前命令执行的位置
  const cwd = process.cwd();
  // 需要创建的目录地址
  const targetDir = path.join(cwd, name);

  // 目录是否已经存在？
  if(fs.existsSync(targetDir)) {
    // 是否为强制覆盖？
    if(options.force) {
      await fs.remove(targetDir);
    } else {
      // 询问用户是否确定要覆盖
      const { action } = await inquirer.prompt([
        {
          name: "action",
          type: "list",
          message: "当前文件已经存在，是否覆盖",
          choices: [
            {
              name: "Overwrite",
              value: "overwrite",
            },
            {
              name: "Cancel",
              value: false,
            },
          ],
        },
      ])

      // 返回的是choices 选择项的 value值
      if (!action) { // 选择了Cancel
        return;
      } else if(action === "overwrite") {
        // 移除已存在的目录
        console.log(`\r\nRemoving...`);
        await fs.remove(targetDir);
      }
    }
  }

  // 创建项目
  const generator = new Generator(name, targetDir);
  // 开始创建项目
  generator.create()
}