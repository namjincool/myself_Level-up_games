import { Quest } from '../types';
import { getLocalDayKey } from '../utils/activityMetrics';

export const WEEKDAY_LABELS: Record<number, string> = {
  1: '월요일',
  2: '화요일',
  3: '수요일',
  4: '목요일',
  5: '금요일',
  6: '토요일',
  0: '일요일',
};

type DailyQuestTemplate = Omit<Quest, 'currentAmount' | 'isCompleted' | 'isClaimed' | 'dateKey' | 'dayOfWeek'> & {
  weekday: number;
};

/** One deliberately different, verifiable behaviour for each weekday. */
export const DAILY_QUEST_TEMPLATES: DailyQuestTemplate[] = [
  {
    id: 'dq-mon',
    weekday: 1,
    title: '월요일: 20분 근력 운동',
    description: '한 주를 몸의 활력으로 시작합니다. 웨이트 트레이닝을 실제로 수행한 시간만 기록하세요.',
    type: 'daily',
    category: 'physical',
    activityIds: ['weight'],
    targetAmount: 20,
    unit: '분',
    expReward: 80,
    statReward: 'VIT',
    icon: 'Dumbbell',
  },
  {
    id: 'dq-tue',
    weekday: 2,
    title: '화요일: 30분 독서',
    description: '방해를 줄이고 한 가지 책 또는 학습 자료에 30분 집중합니다.',
    type: 'daily',
    category: 'learning',
    activityIds: ['reading'],
    targetAmount: 30,
    unit: '분',
    expReward: 100,
    statReward: 'INT',
    icon: 'BookOpen',
  },
  {
    id: 'dq-wed',
    weekday: 3,
    title: '수요일: 10분 마음 챙김',
    description: '호흡이나 침묵 명상으로 10분간 현재에 주의를 돌립니다.',
    type: 'daily',
    category: 'mental',
    activityIds: ['meditation'],
    targetAmount: 10,
    unit: '분',
    expReward: 60,
    statReward: 'MEN',
    icon: 'Brain',
  },
  {
    id: 'dq-thu',
    weekday: 4,
    title: '목요일: 핵심 업무 1개 완료',
    description: '오늘의 결과를 바꾸는 중요한 업무 하나를 끝까지 완료합니다.',
    type: 'daily',
    category: 'career',
    activityIds: ['task_complete'],
    targetAmount: 1,
    unit: 'tasks',
    expReward: 90,
    statReward: 'FOC',
    icon: 'Target',
  },
  {
    id: 'dq-fri',
    weekday: 5,
    title: '금요일: 의미 있는 소통 1회',
    description: '상대의 말을 끝까지 듣거나 진심을 담아 대화한 세션을 기록합니다.',
    type: 'daily',
    category: 'social',
    activityIds: ['meaningful_conversation'],
    targetAmount: 1,
    unit: 'sessions',
    expReward: 80,
    statReward: 'SOC',
    icon: 'Users',
  },
];

export const getDailyQuestsForDate = (date = new Date()): Quest[] => {
  const weekday = date.getDay();
  const template = DAILY_QUEST_TEMPLATES.find((quest) => quest.weekday === weekday);
  if (!template) return [];

  return [
    {
      ...template,
      dateKey: getLocalDayKey(date),
      dayOfWeek: weekday,
      currentAmount: 0,
      isCompleted: false,
      isClaimed: false,
    },
  ];
};

export const getWeekdayLabel = (weekday?: number): string =>
  weekday === undefined ? '오늘' : WEEKDAY_LABELS[weekday] || '오늘';
