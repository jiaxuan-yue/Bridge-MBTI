import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, ActivityIndicator, Keyboard, TouchableWithoutFeedback, Alert } from 'react-native';
import { Screen } from '@/components/Screen';
import { useMBTI } from '@/contexts/MBTIContext';
import { useSafeRouter } from '@/hooks/useSafeRouter';
import { FontAwesome6 } from '@expo/vector-icons';
import RNSSE from 'react-native-sse';

type TranslationMode = 'listen' | 'speak';

interface TranslationResult {
  translated_text: string;
  psychological_strategy: string;
  danger_zone: string;
}

export default function TranslateScreen() {
  const [mode, setMode] = useState<TranslationMode>('listen');
  const [inputText, setInputText] = useState('');
  const [result, setResult] = useState<TranslationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const { myType, targetType, setMyType, setTargetType } = useMBTI();
  const router = useSafeRouter();
  const sseRef = useRef<RNSSE | null>(null);

  // MBTI 颜色
  const getMBTIColor = (type: string) => {
    const group = type.slice(0, 2);
    let color;
    let secondLetter;
    
    switch (group) {
      case 'NT': 
        color = 'from-purple-500 to-indigo-600';
        break;
      case 'NF': 
        color = 'from-green-500 to-emerald-600';
        break;
      case 'SJ': 
        color = 'from-blue-500 to-cyan-600';
        break;
      case 'SP': 
        color = 'from-yellow-500 to-amber-600';
        break;
      default:
        secondLetter = type[1];
        if (secondLetter === 'N') {
          color = 'from-purple-500 to-indigo-600';
        } else {
          color = 'from-blue-500 to-cyan-600';
        }
    }
    return color;
  };

  const handleTranslate = async () => {
    if (!inputText.trim()) {
      Alert.alert('提示', '请输入要翻译的内容');
      return;
    }

    if (!myType || !targetType) {
      Alert.alert('提示', '请先设置 MBTI 类型');
      router.replace('/');
      return;
    }

    setIsLoading(true);
    setResult(null);
    setStreamingText('');
    Keyboard.dismiss();

    try {
      // 关闭之前的连接
      if (sseRef.current) {
        sseRef.current.close();
      }

      /**
       * 服务端文件：server/src/index.ts
       * 接口：POST /api/v1/translate
       * Body 参数：myType: string, targetType: string, inputText: string, mode: 'listen' | 'speak'
       */
      const url = `${process.env.EXPO_PUBLIC_BACKEND_BASE_URL}/api/v1/translate`;
      
      const sse = new RNSSE(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          myType,
          targetType,
          inputText,
          mode,
        }),
        pollingInterval: 0,
      });

      sseRef.current = sse;
      let fullText = '';

      sse.addEventListener('message', (event) => {
        if (event.data === '[DONE]') {
          sse.close();
          setIsLoading(false);
          try {
            // 尝试解析完整的 JSON
            const parsed = JSON.parse(fullText);
            setResult(parsed);
          } catch (e) {
            // 如果解析失败，尝试从流中提取
            setResult({
              translated_text: fullText,
              psychological_strategy: '翻译完成',
              danger_zone: '请谨慎沟通',
            });
          }
          setStreamingText('');
          return;
        }

        try {
          if (event.data) {
            const data = JSON.parse(event.data);
            if (data.content) {
              fullText += data.content;
              setStreamingText(fullText);
            }
          }
        } catch (e) {
          // 忽略解析错误
        }
      });

      sse.addEventListener('error', (error) => {
        console.error('SSE 错误:', error);
        sse.close();
        setIsLoading(false);
        setStreamingText('');
        Alert.alert('错误', '翻译失败，请稍后重试');
      });

    } catch (error) {
      console.error('翻译错误:', error);
      setIsLoading(false);
      setStreamingText('');
      Alert.alert('错误', '翻译失败，请稍后重试');
    }
  };

  const handleReset = () => {
    setInputText('');
    setResult(null);
    setStreamingText('');
    if (sseRef.current) {
      sseRef.current.close();
    }
  };

  const handleReconfigure = () => {
    setMyType(null);
    setTargetType(null);
    router.replace('/');
  };

  // 组件卸载时关闭连接
  useEffect(() => {
    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, []);

  return (
    <Screen statusBarStyle="light">
      {/* 头部背景 */}
      <View className="absolute top-0 left-0 w-full h-56 bg-gradient-to-b from-indigo-900 to-purple-900" />
      
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="flex-1">
          {/* 头部 */}
          <View className="pt-12 px-6 pb-4">
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <FontAwesome6 name="heart-pulse" size={24} color="#ffffff" />
                <Text className="text-white text-xl font-bold ml-2">心语翻译官</Text>
              </View>
              <TouchableOpacity
                className="p-2 bg-white/10 rounded-full"
                onPress={handleReconfigure}
              >
                <FontAwesome6 name="gear" size={20} color="#ffffff" />
              </TouchableOpacity>
            </View>

            {/* MBTI 显示 */}
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <View className={`px-4 py-2 rounded-xl bg-gradient-to-r ${myType ? getMBTIColor(myType) : 'from-gray-500 to-gray-600'}`}>
                  <Text className="text-white text-xs opacity-80">我</Text>
                  <Text className="text-white font-bold text-lg">{myType || '---'}</Text>
                </View>
              </View>
              
              <View className="mx-4">
                <FontAwesome6 name="arrows-left-right" size={20} color="#ffffff" />
              </View>
              
              <View className="flex-1">
                <View className={`px-4 py-2 rounded-xl bg-gradient-to-r ${targetType ? getMBTIColor(targetType) : 'from-gray-500 to-gray-600'}`}>
                  <Text className="text-white text-xs opacity-80">对方</Text>
                  <Text className="text-white font-bold text-lg">{targetType || '---'}</Text>
                </View>
              </View>
            </View>
          </View>

          <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
            {/* 模式切换 */}
            <View className="flex-row mb-4 bg-white/10 p-1 rounded-2xl">
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${mode === 'listen' ? 'bg-white shadow-md' : ''}`}
                onPress={() => {
                  setMode('listen');
                  handleReset();
                }}
              >
                <View className="flex-row items-center justify-center">
                  <FontAwesome6 name="ear-listen" size={16} color={mode === 'listen' ? '#4f46e5' : '#9ca3af'} />
                  <Text className={`text-center font-semibold ml-2 ${mode === 'listen' ? 'text-indigo-700' : 'text-white/70'}`}>
                    听他说话
                  </Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                className={`flex-1 py-3 rounded-xl ${mode === 'speak' ? 'bg-white shadow-md' : ''}`}
                onPress={() => {
                  setMode('speak');
                  handleReset();
                }}
              >
                <View className="flex-row items-center justify-center">
                  <FontAwesome6 name="comment-dots" size={16} color={mode === 'speak' ? '#4f46e5' : '#9ca3af'} />
                  <Text className={`text-center font-semibold ml-2 ${mode === 'speak' ? 'text-indigo-700' : 'text-white/70'}`}>
                    对他说话
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* 输入区域 */}
            <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl mb-4">
              <Text className="text-gray-700 font-semibold mb-3">
                {mode === 'listen' ? '输入对方说的话：' : '输入你想说的话：'}
              </Text>
              <TextInput
                className="bg-gray-50 rounded-xl p-4 text-gray-800 min-h-[120px] text-lg"
                placeholder={mode === 'listen' ? '把对方的原话粘贴在这里...' : '写下你想表达的内容...'}
                placeholderTextColor="#9ca3af"
                value={inputText}
                onChangeText={setInputText}
                multiline
                textAlignVertical="top"
              />
              
              <View className="flex-row gap-3 mt-4">
                {inputText.length > 0 && (
                  <TouchableOpacity
                    className="flex-1 py-4 px-6 bg-gray-100 rounded-xl"
                    onPress={handleReset}
                  >
                    <Text className="text-gray-600 font-semibold text-center">清空</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  className={`${inputText.length > 0 ? 'flex-[2]' : 'flex-1'} py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg`}
                  onPress={handleTranslate}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <View className="flex-row items-center justify-center">
                      <FontAwesome6 name="wand-magic-sparkles" size={18} color="#ffffff" />
                      <Text className="text-white font-bold text-center ml-2">开始翻译</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* 流式输出中 */}
            {isLoading && streamingText.length > 0 && (
              <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl mb-4">
                <View className="flex-row items-center mb-3">
                  <ActivityIndicator size="small" color="#4f46e5" />
                  <Text className="text-indigo-700 font-semibold ml-2">正在生成翻译...</Text>
                </View>
                <View className="bg-gray-50 rounded-xl p-4">
                  <Text className="text-gray-800">{streamingText}</Text>
                </View>
              </View>
            )}

            {/* 翻译结果 */}
            {result && !isLoading && (
              <View className="bg-white/95 backdrop-blur-xl rounded-3xl p-6 shadow-2xl mb-4">
                <View className="flex-row items-center mb-4">
                  <FontAwesome6 name="circle-check" size={24} color="#059669" />
                  <Text className="text-green-700 font-semibold ml-2 text-lg">翻译完成</Text>
                </View>

                {/* 翻译文本 */}
                <View className="mb-4">
                  <Text className="text-gray-500 text-sm mb-2">翻译结果：</Text>
                  <View className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4">
                    <Text className="text-gray-800 text-lg leading-relaxed">
                      {result.translated_text}
                    </Text>
                  </View>
                </View>

                {/* 心理学策略 */}
                <View className="mb-4">
                  <View className="flex-row items-center mb-2">
                    <FontAwesome6 name="lightbulb" size={16} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-2">心理学策略：</Text>
                  </View>
                  <View className="bg-green-50 rounded-xl p-4">
                    <Text className="text-green-800 leading-relaxed">
                      {result.psychological_strategy}
                    </Text>
                  </View>
                </View>

                {/* 雷区预警 */}
                <View>
                  <View className="flex-row items-center mb-2">
                    <FontAwesome6 name="triangle-exclamation" size={16} color="#6b7280" />
                    <Text className="text-gray-500 text-sm ml-2">雷区预警：</Text>
                  </View>
                  <View className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <Text className="text-red-800 leading-relaxed">
                      {result.danger_zone}
                    </Text>
                  </View>
                </View>
              </View>
            )}
          </ScrollView>
        </View>
      </TouchableWithoutFeedback>
    </Screen>
  );
}
