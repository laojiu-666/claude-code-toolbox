---
description: 智能 git commit，自动生成规范提交信息
argument-hint: [staged|all]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*)
---

提交范围：
- 无参数：仅提交当前对话中涉及改动的文件（从对话上下文识别）
- `staged`：仅提交暂存区内容
- `all`：提交所有改动（自动 git add -A）

执行流程（直接执行，不解释）：
1. `git status --porcelain` 检查是否有改动，无则输出"无可提交内容"并结束
2. 根据参数执行 git add：
   - 无参数：识别当前对话涉及的文件路径，执行 `git add <files>`
   - `staged`：不执行 add，直接使用暂存区
   - `all`：执行 `git add -A`
3. `git diff --cached --name-only` 获取待提交文件
4. `git diff --cached` 获取具体改动内容，分析功能变更

提交信息格式：
```
<type>[模块名] 一句话总结

- 具体功能点1
- 具体功能点2
```

公共代码（无模块名）：
```
<type> 一句话总结

- 具体功能点1
- 具体功能点2
```

type 类型：
- feat: 新功能
- fix: 修复
- refactor: 重构
- docs: 文档
- style: 样式/格式
- chore: 构建/工具
- test: 测试

模块识别：
- 优先使用当前对话上下文中出现的模块名称
- 从目录结构识别（如 src/user/、modules/order/）
- 公共代码目录（utils/、common/、shared/、scripts/、config/）不加模块名

示例：
```
feat[user] 新增用户登录功能

- 添加登录接口
- 实现 token 生成
```

```
fix 修复日期工具时区问题

- 统一使用 UTC 时间
```

生成提交信息后展示给用户，用户回复 ok 或直接回车后执行 `git commit`。
