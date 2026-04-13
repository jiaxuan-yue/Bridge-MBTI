import express from "express";
import cors from "cors";
import { LLMClient, Config } from "coze-coding-dev-sdk";

const app = express();
const port = process.env.PORT || 9091;

// MBTI 知识库
const MBTI_LIBRARY = {
  NT_Group: {
    INTJ: {
      role: "建筑师 / 理性分析者",
      encoding_style: "结论先行，逻辑闭环，极度精简，关注长期影响而非短期情绪。",
      decoding_preference: "喜欢事实、逻辑推演和前瞻性计划。讨厌无意义的寒暄和情绪勒索。",
      barrier_tips: "直接说核心逻辑，不要绕圈子，不要试图用情绪打动他们。"
    },
    ENTP: {
      role: "挑战者 / 智多星",
      encoding_style: "幽默且具挑衅性，思维跳跃，喜欢拆解对方逻辑，常说“有没有可能”。",
      decoding_preference: "喜欢智力碰撞和新奇脑洞。讨厌死板的规章制度和教条主义。",
      barrier_tips: "给他们辩论的空间，用“有趣”和“可能”来吸引他们的注意力。"
    },
    INTP: {
      role: "逻辑学家 / 思想家",
      encoding_style: "客观抽离，措辞严谨但发散，喜欢讨论理论框架而非具体执行。",
      decoding_preference: "喜欢深度解析和本质探讨。讨厌被催促下结论或处理琐碎的社交细节。",
      barrier_tips: "尊重他们的私人思维空间，用“理论上讲”开启话题。"
    },
    ENTJ: {
      role: "指挥官 / 领导者",
      encoding_style: "强指令性，目标导向，关注效率和结果，语气坚定且不容置疑。",
      decoding_preference: "喜欢结果汇报和战略计划。讨厌拖泥带水和缺乏执行力的表现。",
      barrier_tips: "只汇报进度和结果，不要讲过程中的委屈，下一步动作要明确。"
    }
  },
  NF_Group: {
    INFJ: {
      role: "提倡者 / 洞察者",
      encoding_style: "温和但坚定，富有隐喻，关注行为背后的深层意义和人类共性。",
      decoding_preference: "喜欢真诚的深度交流和价值观共鸣。讨厌虚伪的恭维和肤浅的谈话。",
      barrier_tips: "展示你的真诚，不要只谈利益，要谈这件事对人的意义。"
    },
    ENFP: {
      role: "竞选者 / 快乐小狗",
      encoding_style: "高能量，富有感染力，表达感性且充满各种可能性。",
      decoding_preference: "喜欢积极的情绪反馈和创意认可。讨厌被泼冷水或被死板流程束缚。",
      barrier_tips: "多用感叹号和肯定词，保护他们的热情，肯定他们的独特性。"
    },
    INFP: {
      role: "调停者 / 理想主义者",
      encoding_style: "委婉且带有强烈个人情感色彩，关注自我价值观的表达，追求和谐。",
      decoding_preference: "喜欢情感支持和温柔的接纳。最怕被评判、被否定其独特的感受。",
      barrier_tips: "先肯定感受，再谈事实。避免使用任何攻击性或硬邦邦的逻辑词。"
    },
    ENFJ: {
      role: "主人公 / 教育家",
      encoding_style: "热情且极具鼓动性，善于照顾集体情绪，强调团结与成长。",
      decoding_preference: "喜欢被需要的感、被认可的贡献。讨厌冷漠和破坏集体和谐的行为。",
      barrier_tips: "表达对他人的感激，多说“我们”，强调合作的价值。"
    }
  },
  SJ_Group: {
    ISTJ: {
      role: "物流师 / 检查员",
      encoding_style: "务实、严谨、关注时间表和具体细节，用证据说话。",
      decoding_preference: "喜欢清晰的指令、已验证的事实和稳定的流程。讨厌变动和不确定性。",
      barrier_tips: "提供具体的数字和截止日期，遵循既定规则，不要空谈。"
    },
    ESTJ: {
      role: "总经理 / 组织者",
      encoding_style: "直接、果断，强调规则、效率和等级制度，关注现实执行。",
      decoding_preference: "喜欢结果导向的陈述和权责分明的计划。讨厌混乱和不守规矩。",
      barrier_tips: "守时、守规，直接给出解决问题的具体方案，不要挑战其权威。"
    },
    ISFJ: {
      role: "守卫者 / 守护者",
      encoding_style: "细致周到，关注他人的实际需求和过去的成功经验，语气温和。",
      decoding_preference: "喜欢具体的感谢、安全感和对传统的尊重。讨厌冲突和激进的改变。",
      barrier_tips: "表达具体的谢意，强调这件事的安全性，温和地请求协助。"
    },
    ESFJ: {
      role: "执政官 / 社交家",
      encoding_style: "健谈且关注社交礼仪，善于协调资源来帮助他人，强调常识。",
      decoding_preference: "喜欢赞美、集体共识和社交细节。讨厌被孤立或被否定社交价值。",
      barrier_tips: "多谈论社交和社区，表达对他们的关心，给予正向的社交反馈。"
    }
  },
  SP_Group: {
    ISTP: {
      role: "鉴赏家 / 手艺人",
      encoding_style: "冷静观察，极简表达，关注工具的使用和实际问题的解决。",
      decoding_preference: "喜欢高效的解决方案和实际操作体验。讨厌宏大的口号和情感拉扯。",
      barrier_tips: "直接谈怎么修、怎么做，不要谈虚的，给他们独立操作的空间。"
    },
    ESTP: {
      role: "企业家 / 挑战者",
      encoding_style: "直接、有趣、关注当下的机会和行动，不喜欢长篇大论。",
      decoding_preference: "喜欢直爽、刺激、有结果的谈话。讨厌理论研究和优柔寡断。",
      barrier_tips: "挑重点说，语气要酷，给出能立刻见效的行动建议。"
    },
    ISFP: {
      role: "艺术家 / 创作者",
      encoding_style: "随性、注重美感和个人空间，通过当下的感受来交流。",
      decoding_preference: "喜欢感官美感、自由和温和的互动。讨厌被控制和高压竞争。",
      barrier_tips: "用柔和的语气，谈论美感和舒适度，尊重他们的步调。"
    },
    ESFP: {
      role: "表演者 / 聚光灯",
      encoding_style: "活泼有趣，关注当下的快乐和体验，表达极具画面感。",
      decoding_preference: "喜欢即时的赞美、新鲜感和愉快的氛围。讨厌无聊的数据和沉重的理论。",
      barrier_tips: "让谈话变得有趣，多夸他们，关注当下的快乐体验。"
    }
  }
};

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP'
] as const;

type MBTIType = typeof MBTI_TYPES[number];

type TranslationMode = 'listen' | 'speak';

interface MBTIInfo {
  role: string;
  encoding_style: string;
  decoding_preference: string;
  barrier_tips: string;
}

// 获取 MBTI 信息
const getMBTIInfo = (type: string): MBTIInfo | null => {
  const allTypes: Record<string, MBTIInfo> = {};
  
  // 展平所有类型
  Object.values(MBTI_LIBRARY).forEach(group => {
    Object.entries(group).forEach(([key, value]) => {
      allTypes[key] = value as MBTIInfo;
    });
  });
  
  return allTypes[type] || null;
};

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 翻译接口 - 流式输出
app.post('/api/v1/translate', async (req, res) => {
  try {
    const { 
      myType, 
      targetType, 
      inputText, 
      mode 
    }: { 
      myType: MBTIType; 
      targetType: MBTIType; 
      inputText: string; 
      mode: TranslationMode;
    } = req.body;

    // 参数验证
    if (!myType || !targetType || !inputText || !mode) {
      return res.status(400).json({ error: '缺少必要参数' });
    }

    if (!MBTI_TYPES.includes(myType) || !MBTI_TYPES.includes(targetType)) {
      return res.status(400).json({ error: '无效的 MBTI 类型' });
    }

    if (mode !== 'listen' && mode !== 'speak') {
      return res.status(400).json({ error: '无效的翻译模式' });
    }

    // 获取 MBTI 信息
    const myInfo = getMBTIInfo(myType);
    const targetInfo = getMBTIInfo(targetType);

    if (!myInfo || !targetInfo) {
      return res.status(400).json({ error: '无法获取 MBTI 信息' });
    }

    // 设置 SSE 响应头
    res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, no-transform, must-revalidate');
    res.setHeader('Connection', 'keep-alive');

    // 确定发言者和接收者
    const speakerMbti = mode === 'listen' ? targetType : myType;
    const speakerInfo = mode === 'listen' ? targetInfo : myInfo;
    const listenerMbti = mode === 'listen' ? myType : targetType;
    const listenerInfo = mode === 'listen' ? myInfo : targetInfo;

    // 构建系统提示词
    const systemPrompt = `# Intro Section (身份定义)
你是一位专业的"工程协作翻译官"，专注于 MBTI 人格之间的精准沟通翻译。

## 职业边界
- 你仅负责基于已选定的 MBTI 类型进行翻译，严禁猜测或假设未选定的人格特征
- 你的唯一任务是语义对齐和情感转码，不提供心理咨询或人格分析
- 每一轮翻译都是独立的原子任务，不参考或依赖任何历史对话

# System Section (环境约束)
## 受控 Runtime 环境
- 当前是受控的单轮翻译环境，不存在多轮对话上下文
- 每次翻译都是全新的原子任务，完全隔离，不受过往历史污染
- 所有决策仅基于当前输入和以下装配的人格参数

# Context & Assembly (运行时装配区)
- 发言者人格: ${speakerMbti}
- 发言者编码风格: ${speakerInfo.encoding_style}
- 接收者人格: ${listenerMbti}
- 接收者解码偏好: ${listenerInfo.decoding_preference}
- 潜在冲突预警: ${listenerInfo.barrier_tips}

# Doing Tasks Section (执行规范)
## 反过度重构原则
1. **先诊断冲突点**：在动手翻译前，先分析 ${speakerMbti} 和 ${listenerMbti} 之间的核心冲突维度（如 N/S、T/F、J/P）
2. **最小改动原则**：只修改必要的表达方式，保留 90% 以上的原意
3. **双向适配**：既考虑接收者的解码偏好，也尊重发言者的核心表达

## 执行流程
1. **冲突诊断**：识别当前 ${speakerMbti} 表达中可能与 ${listenerMbti} 产生摩擦的元素
2. **意图解构**：剥离 ${speakerMbti} 原始表达中的人格冗余（如 T 的生硬或 F 的发散），提取核心诉求
3. **适配重构**：按照 ${listenerInfo.decoding_preference} 的偏好，将诉求重新包装成目标人格最易接受的形式
4. **障碍消除**：针对 ${listenerInfo.barrier_tips} 进行专项优化

# Translation Protocol (执行协议)
- **保持原意**：严禁改变或丢失用户的原始事实信息，核心信息保真度 > 90%
- **语感适配**：
    - 若目标是 NT，增加逻辑词，减少语气助词，强调因果关系
    - 若目标是 NF，增加共情词，强调意义和价值，多用温暖表达
    - 若目标是 SJ，增加细节和确定性，提供具体步骤和时间点
    - 若目标是 SP，增加行动点和即时感，强调当下体验

# Output Format (App 渲染格式)
请按以下 JSON 格式输出：
{
  "translated_text": "翻译后的文本内容",
  "psychological_strategy": "简短说明为什么要这样翻译（基于人格差异的逻辑）",
  "danger_zone": "一句给发送者的建议，避免触发对方雷区"
}

请直接返回 JSON，不要有其他额外文字。`;

    const config = new Config();
    const client = new LLMClient(config);

    const messages = [
      { role: "system" as const, content: systemPrompt },
      { role: "user" as const, content: inputText }
    ];

    const stream = client.stream(messages, { 
      model: "doubao-seed-1-8-251228",
      temperature: 0.7 
    });

    let fullResponse = "";
    
    for await (const chunk of stream) {
      if (chunk.content) {
        const content = chunk.content.toString();
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    // 发送结束标记
    res.write(`data: [DONE]\n\n`);
    res.end();

  } catch (error) {
    console.error('翻译错误:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: '翻译失败，请稍后重试' });
    } else {
      res.write(`data: ${JSON.stringify({ error: '翻译失败' })}\n\n`);
      res.write(`data: [DONE]\n\n`);
      res.end();
    }
  }
});

// 获取 MBTI 列表
app.get('/api/v1/mbti-types', (req, res) => {
  res.json({ types: MBTI_TYPES });
});

// 健康检查
app.get('/api/v1/health', (req, res) => {
  console.log('Health check success');
  res.status(200).json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}/`);
});
