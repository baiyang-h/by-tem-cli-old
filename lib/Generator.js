const chalk = require("chalk");
const ora = require("ora"); // 控制台loading
const downloadGitRepo = require("download-git-repo"); // 不支持 Promise
const util = require("util");
const path = require("path");
const inquirer = require("inquirer"); // 命令行询问用户问题，记录回答结果
const temConfig = require("../config/template")

// 添加加载动画
async function wrapLoading(fn, message, ...args) {
  // 使用 ora 初始化，传入提示信息 message
  const spinner = ora(message);
  // 开始加载动画
  spinner.start();

  try {
    // 执行传入方法 fn
    const result = await fn(...args);
    // 状态为修改为成功
    spinner.succeed();
    return result;
  } catch (error) {
    console.log(error)
    // 状态为修改为失败
    spinner.fail("请求失败 ...");
  }
}


class Generator {
  constructor(name, targetDir) {
    // 目录名称
    this.name = name;
    // 创建位置
    this.targetDir = targetDir;
    // 对 download-git-repo 进行 promise 化改造
    this.downloadGitRepo = util.promisify(downloadGitRepo);
  }

  /**
   * 获取选择的框架 vue react
   * 1. 从远程拉取模板数据
   * 2. 用户选择自己新下载的模板名称
   * 3. return 用户选择的名称
   */
  async getRepo() {
    const { repo } = await inquirer.prompt({
      name: "repo",
      type: "list",
      choices: ['react', 'vue'],
      message: "请选择框架",
    });
    return repo
  }

  /**
   * 获取框架对应的模板
   * 1. 基于 repo 结果，远程拉取对应的模板列表   repo有 vue、react
   * 2. 用户选择自己需要下载的模板
   * 3. return 用户选择的模板名
   */
  async getTem(repo) {
    const temList = temConfig[repo.toLowerCase()];
    // 过滤我们需要的名称
    const temNames = temList.map(item => item.name);
    // 用户选择自己需要下载的 template
    const { name } = await inquirer.prompt({
      name: "name",
      type: "list",
      choices: temNames,
      message: "请选择您要下载的模板",
    });
    return {
      name,
      path: temList.find(item => item.name === name).path
    };
  }

  // 下载远程模板
  async download(temInfo) {
    console.log(temInfo)
    await wrapLoading(
      this.downloadGitRepo,   // 远程下载方法
      "等待下载模板", // 加载提示信息
      temInfo.path,
      path.resolve(process.cwd(), this.targetDir),
    )
  }

  // 核心创建逻辑
  async create() {
    // 1）选择框架
    const repo = await this.getRepo();

    // 2) 获取模板名称
    const temInfo = await this.getTem(repo);

    console.log(11111, process.argv)

    // 3）下载模板到模板目录
    await this.download(temInfo);

    // 4）模板使用提示
    console.log(`\r\nSuccessfully created project ${chalk.cyan(this.name)}`);
    console.log(`\r\n  cd ${chalk.cyan(this.name)}`);
  }


}

module.exports = Generator
