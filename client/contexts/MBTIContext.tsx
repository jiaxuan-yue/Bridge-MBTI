import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type MBTIType = 
  | 'INTJ' | 'INTP' | 'ENTJ' | 'ENTP'
  | 'INFJ' | 'INFP' | 'ENFJ' | 'ENFP'
  | 'ISTJ' | 'ISFJ' | 'ESTJ' | 'ESFJ'
  | 'ISTP' | 'ISFP' | 'ESTP' | 'ESFP';

interface MBTIContextType {
  myType: MBTIType | null;
  targetType: MBTIType | null;
  setMyType: (type: MBTIType | null) => void;
  setTargetType: (type: MBTIType | null) => void;
  isConfigured: boolean;
}

const MBTIContext = createContext<MBTIContextType | undefined>(undefined);

const STORAGE_KEYS = {
  MY_TYPE: 'mbti_my_type',
  TARGET_TYPE: 'mbti_target_type',
};

export const MBTIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [myType, setMyTypeState] = useState<MBTIType | null>(null);
  const [targetType, setTargetTypeState] = useState<MBTIType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从存储加载
  useEffect(() => {
    const loadFromStorage = async () => {
      try {
        const [savedMyType, savedTargetType] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.MY_TYPE),
          AsyncStorage.getItem(STORAGE_KEYS.TARGET_TYPE),
        ]);

        if (savedMyType) setMyTypeState(savedMyType as MBTIType);
        if (savedTargetType) setTargetTypeState(savedTargetType as MBTIType);
      } catch (error) {
        console.error('加载 MBTI 配置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadFromStorage();
  }, []);

  // 更新并保存我的类型
  const setMyType = async (type: MBTIType | null) => {
    setMyTypeState(type);
    if (type) {
      await AsyncStorage.setItem(STORAGE_KEYS.MY_TYPE, type);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.MY_TYPE);
    }
  };

  // 更新并保存对方类型
  const setTargetType = async (type: MBTIType | null) => {
    setTargetTypeState(type);
    if (type) {
      await AsyncStorage.setItem(STORAGE_KEYS.TARGET_TYPE, type);
    } else {
      await AsyncStorage.removeItem(STORAGE_KEYS.TARGET_TYPE);
    }
  };

  const isConfigured = myType !== null && targetType !== null;

  if (isLoading) {
    return null; // 或者显示加载界面
  }

  return (
    <MBTIContext.Provider
      value={{
        myType,
        targetType,
        setMyType,
        setTargetType,
        isConfigured,
      }}
    >
      {children}
    </MBTIContext.Provider>
  );
};

export const useMBTI = () => {
  const context = useContext(MBTIContext);
  if (context === undefined) {
    throw new Error('useMBTI 必须在 MBTIProvider 内部使用');
  }
  return context;
};
