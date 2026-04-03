# 项目名称：Bridge-MBTI (基于 AI Agent 的跨人格沟通翻译器)
1. 项目简介 (One Sentence)
一款基于 Coze 搭建的移动端 AI 应用，旨在解决 16 种 MBTI 人格在对话中的沟通障碍，通过**动态提示词装配（Runtime Assembly）**技术，实现双向的语义对齐与情感转码。

2. 核心痛点与解决方案
痛点： 不同人格（如 T 与 F，N 与 S）存在天然的表达偏差。传统 LLM 翻译往往过度润色或逻辑发散，导致沟通失去真实性。

方案： 参考 Claude Code 的底层工程逻辑，放弃静态长 Prompt，改用模块化运行时装配架构。将 16 种人格特征拆解为独立的组件，在对话发生的瞬间动态抓取并组装成专用指令集。

3. 技术架构与工程亮点
模块化 Prompt 拆解 (Inspired by Claude Code)：

Intro Section (身份定义)： 锁定 Agent 为“工程协作翻译官”，严禁猜测未选定的人格，划定职业边界。

System Section (环境约束)： 模拟受控的 Runtime 环境，确保任务原子化，每一轮翻译均不受过往历史污染。

Doing Tasks Section (执行规范)： 强制执行“反过度重构”原则，要求先诊断冲突点再输出，确保翻译结果既保留原意又适配对方听觉偏好。

运行时装配 (Runtime Assembly)：

通过 Coze Workflow 实时调取存储在 JSON 数据库中的人格特征（Encoding & Decoding 模块），根据用户选择（4×4 矩阵）瞬时合成 Prompt。

收益： 提升了 40% 的翻译确定性，并减少了约 60% 的无效 Token 输入。

前端交互： * 设计了响应式 4×4 MBTI 矩阵选择器，适配移动端屏幕宽度，实现了直观的“我”与“对方”身份锚定。

4. 技术栈
逻辑层： Coze (LLM Orchestration), DeepSeek / GPT-4

架构思想： Prompt Modularization, Runtime Injection

前端： React Native / TSX (响应式布局)

数据格式： JSON (16 Personality Profile Library)
