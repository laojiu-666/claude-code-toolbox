#!/usr/bin/env node

import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 配置
const COMMANDS_DIR = process.env.CLAUDE_COMMANDS_DIR || path.join(os.homedir(), '.claude', 'commands');
const LOCAL_COMMANDS_DIR = path.join(__dirname, '..', 'commands');

// Claude 主题色
const theme = {
  primary: chalk.hex('#D97757'),      // Claude 橙色
  secondary: chalk.hex('#B8856C'),    // 浅橙色
  success: chalk.hex('#7AA874'),      // 绿色
  warning: chalk.hex('#E5C07B'),      // 黄色
  muted: chalk.hex('#6B7280'),        // 灰色
  text: chalk.hex('#E5E5E5'),         // 文本色
};

// 命令列表及描述
const COMMANDS = [
  { name: 'report', file: 'report.md', desc: '从多个项目的 git 提交记录生成统一日报/周报' },
  { name: 'report-scan', file: 'report-scan.md', desc: '扫描指定路径下所有 git 项目并写入配置文件' },
  { name: 'merge', file: 'merge.md', desc: '交互式分支合并工具' },
  { name: 'commit', file: 'commit.md', desc: '智能 git commit，自动生成规范提交信息' },
];

// 检查命令是否已安装
function isInstalled(cmdFile) {
  return fs.existsSync(path.join(COMMANDS_DIR, cmdFile));
}

// 获取命令状态
function getCommandStatus() {
  return COMMANDS.map(cmd => ({
    ...cmd,
    installed: isInstalled(cmd.file)
  }));
}

// 安装命令
function installCommand(cmdFile) {
  const src = path.join(LOCAL_COMMANDS_DIR, cmdFile);
  const dest = path.join(COMMANDS_DIR, cmdFile);
  try {
    fs.mkdirSync(COMMANDS_DIR, { recursive: true });
    fs.copyFileSync(src, dest);
    return true;
  } catch (err) {
    console.log(theme.primary(`  安装失败: ${cmdFile} - ${err.message}`));
    return false;
  }
}

// 卸载命令
function uninstallCommand(cmdFile) {
  const dest = path.join(COMMANDS_DIR, cmdFile);
  try {
    if (fs.existsSync(dest)) {
      fs.unlinkSync(dest);
    }
    return true;
  } catch (err) {
    console.log(theme.primary(`  卸载失败: ${cmdFile} - ${err.message}`));
    return false;
  }
}

// 显示 Logo
function showLogo() {
  console.clear();
  console.log(theme.primary(`
   ██████╗ ██████╗████████╗
  ██╔════╝██╔════╝╚══██╔══╝
  ██║     ██║        ██║
  ██║     ██║        ██║
  ╚██████╗╚██████╗   ██║
   ╚═════╝ ╚═════╝   ╚═╝
  `));
  console.log(theme.muted('  Claude Code Toolbox\n'));
}

// 主菜单
async function mainMenu(isFirst = true) {
  if (isFirst) {
    showLogo();
  }

  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: theme.text('请选择操作：'),
      choices: [
        { name: theme.text('📦 安装/更新命令'), value: 'install' },
        { name: theme.text('🗑️  卸载命令'), value: 'uninstall' },
        { name: theme.text('📋 查看已安装命令'), value: 'list' },
        { name: theme.text('🚀 全部安装'), value: 'install-all' },
        new inquirer.Separator(theme.muted('─────────────────')),
        { name: theme.muted('❌ 退出'), value: 'exit' }
      ],
      prefix: theme.primary('›'),
    }
  ]);

  let shouldWait = true;

  switch (action) {
    case 'install':
      shouldWait = await installMenu();
      break;
    case 'uninstall':
      shouldWait = await uninstallMenu();
      break;
    case 'list':
      await listInstalled();
      break;
    case 'install-all':
      await installAll();
      break;
    case 'exit':
      console.log(theme.muted('再见！'));
      process.exit(0);
  }

  if (shouldWait) {
    await waitForKey();
  }

  // 返回主菜单
  showLogo();
  await mainMenu(false);
}

// 等待用户按键继续
async function waitForKey() {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: theme.muted('按 Enter 返回主菜单...'),
      prefix: '',
    }
  ]);
}

// 安装菜单
async function installMenu() {
  const commands = getCommandStatus();

  // 分类：未安装 / 已安装
  const notInstalled = commands.filter(cmd => !cmd.installed);
  const installed = commands.filter(cmd => cmd.installed);

  const choices = [
    ...(notInstalled.length > 0 ? [new inquirer.Separator(theme.warning('── 未安装 ──'))] : []),
    ...notInstalled.map(cmd => ({
      name: theme.text(`/${cmd.name} - ${cmd.desc}`),
      value: cmd.file,
      checked: true
    })),
    ...(installed.length > 0 ? [new inquirer.Separator(theme.success('── 已安装（可更新） ──'))] : []),
    ...installed.map(cmd => ({
      name: theme.text(`/${cmd.name} - ${cmd.desc}`),
      value: cmd.file,
      checked: false
    })),
  ];

  console.log(theme.muted('  空格=选择  a=全选  i=反选  Enter=确认  输入0返回\n'));

  // 添加返回选项作为单独的问题
  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: theme.text('选择要安装/更新的命令：'),
      choices,
      instructions: false,
      prefix: theme.primary('›'),
    }
  ]);

  // 询问是否确认或返回
  if (selected.length === 0) {
    const { back } = await inquirer.prompt([
      {
        type: 'list',
        name: 'back',
        message: theme.text('未选择任何命令'),
        choices: [
          { name: theme.muted('↩ 返回主菜单'), value: true },
        ],
        prefix: theme.primary('›'),
      }
    ]);
    return false;
  }

  const { confirmAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'confirmAction',
      message: theme.text(`已选择 ${selected.length} 个命令`),
      choices: [
        { name: theme.success('✓ 确认安装'), value: 'confirm' },
        { name: theme.muted('↩ 返回主菜单'), value: 'back' },
      ],
      prefix: theme.primary('›'),
    }
  ]);

  if (confirmAction === 'back') {
    return false;
  }

  const spinner = ora({ text: '正在安装...', color: 'yellow' }).start();

  for (const file of selected) {
    installCommand(file);
  }

  spinner.succeed(theme.success(`已安装 ${selected.length} 个命令到 ${COMMANDS_DIR}`));
  return true;
}

// 卸载菜单
async function uninstallMenu() {
  const commands = getCommandStatus().filter(cmd => cmd.installed);

  if (commands.length === 0) {
    console.log(theme.warning('没有已安装的命令'));
    return true;
  }

  const choices = commands.map(cmd => ({
    name: theme.text(`/${cmd.name} - ${cmd.desc}`),
    value: cmd.file
  }));

  console.log(theme.muted('  空格=选择  a=全选  i=反选  Enter=确认  输入0返回\n'));

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: theme.text('选择要卸载的命令：'),
      choices,
      instructions: false,
      prefix: theme.primary('›'),
    }
  ]);

  if (selected.length === 0) {
    const { back } = await inquirer.prompt([
      {
        type: 'list',
        name: 'back',
        message: theme.text('未选择任何命令'),
        choices: [
          { name: theme.muted('↩ 返回主菜单'), value: true },
        ],
        prefix: theme.primary('›'),
      }
    ]);
    return false;
  }

  const { confirmAction } = await inquirer.prompt([
    {
      type: 'list',
      name: 'confirmAction',
      message: theme.warning(`确定要卸载 ${selected.length} 个命令吗？`),
      choices: [
        { name: theme.primary('✓ 确认卸载'), value: 'confirm' },
        { name: theme.muted('↩ 返回主菜单'), value: 'back' },
      ],
      prefix: theme.primary('›'),
    }
  ]);

  if (confirmAction === 'back') {
    return false;
  }

  const spinner = ora({ text: '正在卸载...', color: 'yellow' }).start();

  for (const file of selected) {
    uninstallCommand(file);
  }

  spinner.succeed(theme.success(`已卸载 ${selected.length} 个命令`));
  return true;
}

// 查看已安装
async function listInstalled() {
  const commands = getCommandStatus();
  const installed = commands.filter(cmd => cmd.installed);

  console.log(theme.secondary(`\n安装目录: ${COMMANDS_DIR}\n`));

  if (installed.length === 0) {
    console.log(theme.warning('暂无已安装的命令'));
  } else {
    console.log(theme.success(`已安装的命令 (${installed.length}/${commands.length})：`));
    installed.forEach(cmd => {
      console.log(`  ${theme.primary('/')}${theme.text(cmd.name)} ${theme.muted('-')} ${theme.muted(cmd.desc)}`);
    });
  }

  const notInstalled = commands.filter(cmd => !cmd.installed);
  if (notInstalled.length > 0) {
    console.log(theme.muted(`\n未安装的命令 (${notInstalled.length})：`));
    notInstalled.forEach(cmd => {
      console.log(`  ${theme.muted('/')}${theme.muted(cmd.name)} ${theme.muted('-')} ${theme.muted(cmd.desc)}`);
    });
  }

  console.log('');
}

// 全部安装
async function installAll() {
  const spinner = ora({ text: '正在安装所有命令...', color: 'yellow' }).start();

  for (const cmd of COMMANDS) {
    installCommand(cmd.file);
  }

  spinner.succeed(theme.success(`已安装全部 ${COMMANDS.length} 个命令到 ${COMMANDS_DIR}`));
}

// 启动
mainMenu().catch(err => {
  console.error(theme.primary('错误：'), err.message);
  process.exit(1);
});
