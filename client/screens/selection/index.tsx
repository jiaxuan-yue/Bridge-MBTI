import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Screen } from '@/components/Screen';
import { useMBTI } from '@/contexts/MBTIContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';

type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

const MBTI_TYPES: MBTIType[] = [
  // NT - 理性组 (分析) - Row 0
  'INTJ', 'ENTP', 'INTP', 'ENTJ',
  // NF - 理想组 (外交) - Row 1
  'INFJ', 'ENFP', 'INFP', 'ENFJ',
  // SJ - 守卫组 (实干) - Row 2
  'ISTJ', 'ESTJ', 'ISFJ', 'ESFJ',
  // SP - 探险组 (灵活) - Row 3
  'ISTP', 'ESTP', 'ISFP', 'ESFP'
];

// 获取分组图标
const getMBTIIcon = (type: string) => {
  const iconMap: Record<string, string> = {
    'INTJ': 'chess-king',
    'ENTP': 'lightbulb',
    'INTP': 'brain',
    'ENTJ': 'crown',
    'INFJ': 'heart-pulse',
    'ENFP': 'star',
    'INFP': 'feather',
    'ENFJ': 'people-group',
    'ISTJ': 'clipboard-check',
    'ESTJ': 'briefcase',
    'ISFJ': 'shield-halved',
    'ESFJ': 'hands-holding',
    'ISTP': 'wrench',
    'ESTP': 'rocket',
    'ISFP': 'palette',
    'ESFP': 'mask-theater'
  };
  return iconMap[type] || 'circle';
};

// 获取分组颜色和渐变
const getGroupColors = (index: number) => {
  const row = Math.floor(index / 4);
  switch (row) {
    case 0: // NT - 紫色渐变
      return {
        bgStart: '#FAF5FF',
        bgEnd: '#F3E8FF',
        text: '#7C3AED',
        border: '#C4B5FD',
        selectedBorder: '#A855F7',
        iconColor: '#9333EA'
      };
    case 1: // NF - 绿色渐变
      return {
        bgStart: '#F0FDF4',
        bgEnd: '#DCFCE7',
        text: '#16A34A',
        border: '#BBF7D0',
        selectedBorder: '#22C55E',
        iconColor: '#15803D'
      };
    case 2: // SJ - 蓝色渐变
      return {
        bgStart: '#EFF6FF',
        bgEnd: '#DBEAFE',
        text: '#2563EB',
        border: '#BFDBFE',
        selectedBorder: '#3B82F6',
        iconColor: '#1D4ED8'
      };
    case 3: // SP - 黄色渐变
      return {
        bgStart: '#FEFCE8',
        bgEnd: '#FEF9C3',
        text: '#CA8A04',
        border: '#FEF08A',
        selectedBorder: '#EAB308',
        iconColor: '#A16207'
      };
    default:
      return {
        bgStart: '#F9FAFB',
        bgEnd: '#F3F4F6',
        text: '#4B5563',
        border: '#E5E7EB',
        selectedBorder: '#4B5563',
        iconColor: '#6B7280'
      };
  }
};

// MBTI 描述
const getMBTIDescription = (type: MBTIType) => {
  const descriptions: Record<string, string> = {
    'INTJ': '建筑师 - 富有想象力和战略性的思想家',
    'INTP': '逻辑学家 - 具有创造力的发明家，对知识有着止不住的渴望',
    'ENTJ': '指挥官 - 大胆、富有想象力且意志强大的领导者',
    'ENTP': '辩论家 - 聪明好奇的思想者，不会放弃任何智力上的挑战',
    'INFJ': '提倡者 - 安静而神秘，同时鼓舞人心且不知疲倦的理想主义者',
    'INFP': '调停者 - 诗意、善良的利他主义者，总是热情地为正当理由提供帮助',
    'ENFJ': '主人公 - 富有魅力且鼓舞人心的领导者，有使人着迷的能力',
    'ENFP': '竞选者 - 热情、有创造力、社交自由的人，总能找到微笑的理由',
    'ISTJ': '物流师 - 实际且注重事实的个人',
    'ISFJ': '守卫者 - 非常专注且热情的保护者',
    'ESTJ': '总经理 - 出色的管理者',
    'ESFJ': '执政官 - 极有同情心、爱社交、受欢迎的人',
    'ISTP': '鉴赏家 - 大胆而实际的实验家',
    'ISFP': '探险家 - 灵活且有魅力的艺术家',
    'ESTP': '企业家 - 聪明、精力充沛、善于感知的人',
    'ESFP': '表演者 - 自发的、精力充沛的艺人'
  };
  return descriptions[type] || '';
};

export default function SelectionScreen() {
  const [step, setStep] = useState<'my' | 'target'>('my');
  const { myType, targetType, setMyType, setTargetType, isConfigured } = useMBTI();
  const router = useSafeRouter();
  const { width: screenWidth } = Dimensions.get('window');
  
  // 计算字体大小：基于屏幕宽度，最小 10px，最大 16px
  const fontSize = Math.max(10, Math.min(16, screenWidth * 0.035));
  const iconSize = Math.max(16, Math.min(24, screenWidth * 0.05));

  const handleSelectType = (type: MBTIType) => {
    if (step === 'my') {
      setMyType(type);
      setStep('target');
    } else {
      setTargetType(type);
    }
  };

  const handleContinue = () => {
    if (myType && targetType) {
      router.push('/translate');
    }
  };

  const handleBack = () => {
    if (step === 'target') {
      setStep('my');
    }
  };

  // 如果已经配置过，直接跳转到翻译页面
  React.useEffect(() => {
    if (isConfigured) {
      router.replace('/translate');
    }
  }, [isConfigured, router]);

  return (
    <Screen statusBarStyle="light">
      {/* 头部背景 */}
      <View className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-indigo-900 to-purple-900" />
      
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="pt-12 px-6 pb-8">
          {/* 标题 */}
          <View className="mb-8">
            <View className="flex-row items-center mb-2">
              <FontAwesome6 name="heart-pulse" size={28} color="#ffffff" />
              <Text className="text-white text-2xl font-bold ml-3">心语翻译官</Text>
            </View>
            <Text className="text-indigo-200 text-sm">
              让不同人格的沟通变得简单
            </Text>
          </View>

          {/* 进度指示器 */}
          <View className="flex-row mb-8">
            <View className={`flex-1 h-1 rounded-full mr-2 ${step === 'target' ? 'bg-green-400' : 'bg-white'}`} />
            <View className={`flex-1 h-1 rounded-full ${step === 'target' ? 'bg-white' : 'bg-indigo-700'}`} />
          </View>

          {/* 卡片 */}
          <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
            {/* 卡片标题 */}
            <View className="mb-6">
              <View className="flex-row items-center mb-2">
                {step === 'my' ? (
                  <FontAwesome6 name="user" size={24} color="#4f46e5" />
                ) : (
                  <FontAwesome6 name="users" size={24} color="#4f46e5" />
                )}
                <Text className="text-2xl font-bold text-gray-800 ml-2">
                  {step === 'my' ? '选择你的 MBTI' : '选择对方的 MBTI'}
                </Text>
              </View>
              <Text className="text-gray-500 text-sm">
                {step === 'my' ? '这将帮助我们为你定制翻译风格' : '选择沟通对象的人格类型'}
              </Text>
            </View>

            {/* MBTI 网格 - 强制 4 列布局 */}
            <View style={{ width: '100%' }}>
              <View style={{ 
                display: 'flex',
                flexDirection: 'row',
                flexWrap: 'wrap',
                gap: 8,
                width: '100%',
              }}>
                {MBTI_TYPES.map((type, index) => {
                  const colors = getGroupColors(index);
                  const iconName = getMBTIIcon(type);
                  const isSelected = (step === 'my' && myType === type) || (step === 'target' && targetType === type);
                  
                  return (
                    <TouchableOpacity
                      key={type}
                      style={{
                        width: '23%', // 4 列，减去间距
                        aspectRatio: 1, // 正方形
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        borderRadius: 12,
                        borderWidth: isSelected ? 3 : 2,
                        borderColor: isSelected ? colors.selectedBorder : colors.border,
                        backgroundColor: isSelected ? colors.bgEnd : colors.bgStart,
                      }}
                      onPress={() => handleSelectType(type)}
                      activeOpacity={0.7}
                    >
                      <FontAwesome6 
                        name={iconName as any} 
                        size={iconSize} 
                        color={isSelected ? colors.iconColor : '#9CA3AF'} 
                      />
                      <Text style={{
                        fontSize: fontSize,
                        fontWeight: 'bold',
                        color: isSelected ? colors.text : '#6B7280',
                        marginTop: 4,
                      }}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* 已选择的类型描述 */}
            {((step === 'my' && myType) || (step === 'target' && targetType)) && (
              <View className="mt-4 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl">
                <Text className="text-indigo-800 text-sm">
                  {getMBTIDescription((step === 'my' ? myType : targetType) as MBTIType)}
                </Text>
              </View>
            )}

            {/* 按钮 */}
            <View className="flex-row mt-6 gap-3">
              {step === 'target' && (
                <TouchableOpacity
                  className="flex-1 py-4 px-6 bg-gray-100 rounded-xl"
                  onPress={handleBack}
                >
                  <Text className="text-gray-600 font-semibold text-center">上一步</Text>
                </TouchableOpacity>
              )}
              {step === 'target' && targetType && (
                <TouchableOpacity
                  className="flex-1 py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg"
                  onPress={handleContinue}
                >
                  <Text className="text-white font-bold text-center">开始翻译</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
