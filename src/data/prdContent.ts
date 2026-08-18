export interface PRDSection {
  id: string;
  number: number;
  title: string;
  category: string;
  summary: string;
  content: string;
}

export const PRD_SECTIONS: PRDSection[] = [
  {
    id: 'value-prop',
    number: 2,
    title: '앱의 핵심 가치 제안 (Value Proposition)',
    category: 'Product Strategy',
    summary: '기존 습관 앱의 한계를 극복하고 게임화가 실제 행동 변화로 이어지는 심리적/시스템적 설계',
    content: `
### 1. 해결하는 핵심 문제 (Core Problem)
* **자기계발의 피드백 지연(Feedback Delay) 문제**: 운동 1회, 책 30분 읽기는 현실에서 즉각적인 보상(근육 증가, 수입 상승)을 주지 않으므로 뇌의 도파민 회로를 자극하지 못해 90% 이상의 사용자가 2주 내 포기합니다.
* **기존 습관 앱의 무미건조함(Checkbox Fatigue)**: 단순 체크박스 완료나 잔디 채우기는 초기 며칠만 유효하며, 실패 시 연속 기록이 깨지면 극심한 '포기 효과(What-the-hell Effect)'를 유발합니다.

### 2. 왜 기존 습관 관리 앱 대신 이 앱인가? (Why Us?)
* **즉각적이고 정량화된 피드백 루프**: 3km를 달리는 순간 "지구력 +120 EXP", "심폐 레벨업!"이라는 명확한 즉각 보상을 지급하여 뇌에 도파민을 공급합니다.
* **현실 능력치 계층화(Character Sheet)**: 일회성 행동이 휘발되지 않고 나의 '캐릭터 상태창(Status Window)'에 영구적인 자산으로 누적됩니다.
* **손실 없는 성장 경험**: 실패해도 능력치가 깎이지 않고 경험치가 보존되며, 휴식/보호 아이템(Streak Freeze)으로 재도전 탄력성을 제공합니다.

### 3. 가장 강력한 차별화 포인트 (Unfair Advantage)
* **단순 레벨이 아닌 [6대 다차원 현실 스탯 & 서브스킬 트리]**: 체력(VIT), 지구력(END), 집중력(FOC), 지능(INT), 정신력(MEN), 금융(FIN)의 육각형 레이더 차트로 나의 삶의 균형을 시각화.
* **공인 인증(Verified) & 신뢰도 멀티플라이어**: 애플 건강/GPS/타이머 연동 시 +25% 추가 EXP를 부여해 기록의 진실성을 보장.
* **성인도 몰입하는 세련된 네오-사이버 앤틱 UI**: 유치한 픽셀 도트가 아닌, 세련된 RPG 상태창과 햅틱 레벨업 인터랙션.

### 4. 30일 이상 리텐션을 만드는 핵심 동기부여 루프
1. **일일 퀘스트 (Trigger & Action)**: 매일 아침 맞춤형 3가지 일일 퀘스트 발행 (난이도 하/중/상).
2. **동적 경험치 지급 (Variable Reward)**: 기본량 + 난이도 계수 + 스트릭 보너스(최대 +50%) + 데이터 인증 보너스(+25%).
3. **상태창 진화 (Investment)**: 레벨업 시 새로운 칭호, 랭크 티어(Bronze → Master), 스킬 퍽 해금.

---
> 💡 **앱의 핵심 가치 제안 (One-Sentence Value Prop)**:
> **"보이지 않던 나의 하루 노력을 RPG 캐릭터 스탯으로 가시화하여, 삶의 모든 순간을 가장 즐거운 성장 게임으로 바꾸는 현실 레벨업 시스템"**
`,
  },
  {
    id: 'categories',
    number: 3,
    title: '자기계발 카테고리 & 활동 측정 체계',
    category: 'System Architecture',
    summary: '6대 대분류, 20+ 중분류, 세부 활동, 측정 단위, 연결 능력치 및 EXP 지급 기준 정의',
    content: `
체계적인 EXP 인플레이션 방지와 현실 활동의 정밀 반영을 위해 대분류, 측정 기준, 연결 스탯을 표준화했습니다.

| 대분류 | 중분류 | 세부 활동 | 표준 측정 방법 | 주/보조 능력치 | 기본 EXP 지급 기준 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **신체 (Physical)** | 유산소 | 달리기(러닝) | 거리(km), 페이스, 심박수 | 지구력(END) / 활력(VIT) | 35 EXP / km (페이스 가중치 1.0~1.4x) |
| | | 걷기 / 만보 | 걸음 수(Steps) | 지구력(END) / 활력(VIT) | 0.012 EXP / 보 (8,000보 = 96 EXP) |
| | | 사이클 / 수영 | 거리(km) 또는 시간(분) | 지구력(END) / 활력(VIT) | 2.5 EXP / 분 |
| | 무산소 | 웨이트(가슴/등/하체) | 운동 시간(분), 세트 수 | 활력(VIT) / 지구력(END) | 2.0 EXP / 분 (고강도 RPE 8+ 시 1.25x) |
| | 신체 케어 | 스트레칭 / 요가 | 소요 시간(분) | 활력(VIT) / 정신력(MEN) | 1.8 EXP / 분 |
| **학습 (Learning)** | 독서 | 비즈니스/인문/원서 | 독서 시간(분) 또는 페이지 | 지능(INT) / 몰입(FOC) | 2.5 EXP / 분 (학술서 1.3x) |
| | 소프트웨어 | 프로그래밍/알고리즘 | 딥워크 코딩 시간(분) | 지능(INT) / 몰입(FOC) | 1.6 EXP / 분 (설계/버그픽스 1.35x) |
| | 어학 | 외국어 회화/단어 암기 | 학습 시간(분) | 지능(INT) / 몰입(FOC) | 2.2 EXP / 분 (스피킹 실전 1.2x) |
| | 자격/시험 | 시험 공부 / 강의 수강 | 강의 수강 및 풀이(분) | 지능(INT) / 몰입(FOC) | 1.8 EXP / 분 |
| **정신 (Mental)** | 마인드풀 | 호흡 명상 / 사색 | 타이머 시간(분) | 정신력(MEN) / 몰입(FOC) | 6.0 EXP / 분 (10분 = 60 EXP) |
| | 수면 최적화 | 골든 수면 (7~8.5h) | 수면 시간 및 규칙성 | 정신력(MEN) / 활력(VIT) | 12.0 EXP / 시간 (규칙적 기상 시 1.2x) |
| | 자기 성찰 | 감사 일기 / 회고록 | 작성 완료 건수 (1회) | 정신력(MEN) / 지능(INT) | 60 EXP / 건 (심층 회고 1.35x) |
| | 디톡스 | 스마트폰 스크린타임 절제 | 절제 목표 달성 시간 | 정신력(MEN) / 몰입(FOC) | 1.5 EXP / 절제 10분 |
| **커리어 (Career)** | 딥워크 | 포모도로 집중 세션 | 집중 블록(25분 세션) | 몰입(FOC) / 지능(INT) | 45 EXP / 1 세션 (25분) |
| | 실무 역량 | 프로젝트 배포/발표 | 목표 마일스톤 완료 | 몰입(FOC) / 관계(SOC) | 150~300 EXP / 주요 마일스톤 |
| **금융 (Finance)** | 자산 관리 | 가계부/소비 점검 | 일일 지출 입력 및 리뷰 | 금융(FIN) / 정신력(MEN) | 50 EXP / 일일 1회 (무지출 방어 시 +30) |
| | 재테크 공부 | 투자 분석 / 금융 서적 | 공부 시간(분) | 금융(FIN) / 지능(INT) | 2.0 EXP / 분 |
| **관계 (Social)** | 소통 | 스피치 / 네트워킹 / 경청 | 모임 참여 / 대화 실천 | 관계(SOC) / 정신력(MEN) | 80 EXP / 세션 |
`,
  },
  {
    id: 'stat-system',
    number: 4,
    title: '능력치 시스템 (Core & Sub-Skill Hierarchies)',
    category: 'Game Mechanics',
    summary: '복잡성을 줄인 6~7대 핵심 능력치(Core Stats)와 행동별 세부 스킬 트리(Sub-skills)의 2단계 계층 구조',
    content: `
능력치가 20개 이상 나열되면 사용자는 인지 과부하(Cognitive Overload)를 겪습니다. 따라서 **[6대 핵심 능력치]**와 활동 시 자동으로 연계 성장하는 **[전문 서브스킬 트리]**로 이원화합니다.

### A. 6대 핵심 능력치 (Core Hexagon Stats)
1. **VIT (Vitality / 근력 & 신체활력)**: 전신 파워, 웨이트 트레이닝, 피로 회복 속도, 에너지 레벨.
2. **END (Endurance / 지구력 & 심폐)**: 러닝, 걷기, 사이클, 장시간 지속 체력, 심폐 지구력.
3. **FOC (Focus / 몰입력 & 자기통제)**: 뽀모도로 몰입, 스마트폰 유혹 저항, 산만함 극복, 딥워크 지속력.
4. **INT (Intellect / 지능 & 학습력)**: 독서, 프로그래밍, 외국어, 자격증, 문제해결 및 추론 능력.
5. **MEN (Mental / 정신력 & 회복탄력)**: 명상, 양질의 수면, 감사 일기, 스트레스 내성, 감정 안정성.
6. **FIN (Finance / 금융지능 & 절제)**: 지출 통제, 가계부 분석, 시드머니 저축, 투자/경제 지식.
*(선택 확장: **SOC (Social / 소통 & 관계지능)** - 네트워킹, 발표, 대인 경청)*

### B. 전문 서브스킬 트리 (Hierarchical Sub-Skill Matrix)
* 각 활동을 하면 해당 **서브스킬(Sub-Skill)**에 100% EXP가 누적되고, 상위 **핵심 능력치(Core Stat)**에 70%, 보조 스탯에 30%가 배분됩니다.
* **구조 예시**:
  * \`신체 (Physical)\` ➔ \`지구력(END) Lv.16\` ➔ \`달리기(Running) Lv.8 (누적 94.5km)\`
  * \`신체 (Physical)\` ➔ \`근력(VIT) Lv.12\` ➔ \`웨이트 트레이닝 Lv.6 (누적 960분)\`
  * \`학습 (Learning)\` ➔ \`지능(INT) Lv.15\` ➔ \`코딩(Coding) Lv.11 (누적 40시간)\`
  * \`학습 (Learning)\` ➔ \`지능(INT) Lv.15\` ➔ \`독서(Reading) Lv.7 (누적 620분)\`
  * \`정신 (Mental)\` ➔ \`정신력(MEN) Lv.10\` ➔ \`명상(Meditation) Lv.5 (누적 180분)\`
`,
  },
  {
    id: 'level-math',
    number: 5,
    title: '레벨 시스템 및 EXP 수학 공식',
    category: 'Mathematical Balancing',
    summary: '레벨별 필요 경험치 공식, 단계별 성장 곡선, 무한 파밍 방지 Soft-Cap 및 보너스 계수',
    content: `
### 1. 레벨별 필요 EXP 공식 (Experience Curve)
단순 선형 증가는 후반부에 지루해지고, 지나친 지수 함수는 중반부 성장을 멈추게 합니다. **소프트 지수 + 선형 보정 하이브리드 공식**을 채택합니다.

$$\\text{Required\\_EXP}(L) = \\lfloor 100 \\times 1.18^{(L - 1)} + (L - 1) \\times 25 \\rfloor$$

* **Lv.1 ➔ Lv.2**: 100 EXP (첫 날 1개 활동으로 즉시 달성 ➔ 성공 경험 각인)
* **Lv.2 ➔ Lv.3**: 143 EXP
* **Lv.3 ➔ Lv.4**: 194 EXP
* **Lv.5 ➔ Lv.6**: 326 EXP
* **Lv.10 ➔ Lv.11**: 618 EXP (~주 3~4회 꾸준한 활동 3주 소요)
* **Lv.20 ➔ Lv.21**: 3,210 EXP (중급자 진입, 약 3~4개월 소요)
* **Lv.50**: 54,200 EXP (상위 1% 마스터, 1년 이상 성실 유저)
* **최대 레벨**: Lv.99 (명예의 전당 / 전직 시스템)

### 2. 활동별 실시간 EXP 계산 공식
$$\\text{Total\\_EXP} = \\left( \\text{BaseRate} \\times \\text{EffectiveAmount} \\times M_{\\text{diff}} \\times M_{\\text{streak}} \\times M_{\\text{verified}} \\right) + B_{\\text{first}} + B_{\\text{PB}}$$

* **기본 경험치 ($BaseRate \\times EffectiveAmount$)**: 활동별 단위당 기본 점수
* **난이도 계수 ($M_{\\text{diff}}$)**: 0.8x (가벼운 휴식/입문) ~ 1.45x (최고강도/인터벌/원서)
* **연속 기록 보너스 ($M_{\\text{streak}}$)**: $1.0 + \\min(0.50, \\text{StreakDays} \\times 0.03)$ (7일차 +21%, 17일차 이상 최대 +50%)
* **공인 인증 계수 ($M_{\\text{verified}}$)**: 1.25x (Apple Health, GPS 트래킹, 앱 내 스톱워치/포모도로 인증 시 +25%)
* **최초 도전 보너스 ($B_{\\text{first}}$)**: +50 EXP
* **개인 최고기록(Personal Best) 보너스 ($B_{\\text{PB}}$)**: +80 EXP

### 3. 무한 파밍 및 허위 기록 방지 (Soft-Cap Throttling)
* 일일 권장 최대 한도(예: 러닝 20km, 코딩 6시간)를 초과하는 수치에 대해:
  * 100% ~ 150% 구간: 초과분 EXP 40%만 인정
  * 150% ~ 250% 구간: 초과분 EXP 15%만 인정
  * 250% 초과: 경험치 0 지급 (건강/휴식 보호 알림 발송)
`,
  },
  {
    id: 'exp-examples',
    number: 6,
    title: '대표 활동별 EXP 실제 계산 예시 (10대 표준 사례)',
    category: 'Simulation',
    summary: '달리기 3km, 만보, 헬스 60분, 독서 30분, 코딩 90분 등의 정밀 계산 명세',
    content: `
| 번호 | 활동 내용 | 입력 파라미터 | 인증 상태 / 스트릭 | 계산 프로세스 | 최종 지급 EXP & 스탯 반영 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **1** | **달리기 3km** | 3km, 템포런(1.2x) | GPS 인증(1.25x), 8일 스트릭(1.24x) | $3 \\times 35 \\times 1.2 \\times 1.24 \\times 1.25$ | **+195 EXP** (지구력 END +136, 활력 VIT +59) |
| **2** | **걷기 8,000보** | 8,000 Steps, 일상(1.0x) | 건강앱 인증(1.25x), 8일 스트릭(1.24x) | $8,000 \\times 0.012 \\times 1.0 \\times 1.24 \\times 1.25$ | **+149 EXP** (지구력 END +104, 활력 VIT +45) |
| **3** | **헬스 60분** | 60분, 고강도(1.25x) | 타이머 인증(1.25x), 8일 스트릭(1.24x) | $60 \\times 2.0 \\times 1.25 \\times 1.24 \\times 1.25$ | **+232 EXP** (근력 VIT +162, 지구력 END +70) |
| **4** | **독서 30분** | 30분, 비즈니스서(1.0x) | 수기 입력(1.0x), 8일 스트릭(1.24x) | $30 \\times 2.5 \\times 1.0 \\times 1.24$ | **+93 EXP** (지능 INT +65, 몰입 FOC +28) |
| **5** | **영어 45분** | 45분, 스피킹(1.2x) | 수기 입력(1.0x), 8일 스트릭(1.24x) | $45 \\times 2.2 \\times 1.2 \\times 1.24$ | **+147 EXP** (지능 INT +103, 몰입 FOC +44) |
| **6** | **코딩 90분** | 90분, 실전개발(1.15x) | 타이머 인증(1.25x), 8일 스트릭(1.24x) | $90 \\times 1.6 \\times 1.15 \\times 1.24 \\times 1.25$ | **+257 EXP** (지능 INT +180, 몰입 FOC +77) |
| **7** | **명상 10분** | 10분, 침묵호흡(1.25x) | 앱내 오디오(1.25x), 8일 스트릭(1.24x) | $10 \\times 6.0 \\times 1.25 \\times 1.24 \\times 1.25$ | **+116 EXP** (정신력 MEN +81, 몰입 FOC +35) |
| **8** | **수면 8시간** | 8.0h, 골든수면(1.2x) | 수면트래커(1.25x), 8일 스트릭(1.24x) | $8.0 \\times 12.0 \\times 1.2 \\times 1.24 \\times 1.25$ | **+178 EXP** (정신력 MEN +125, 활력 VIT +53) |
| **9** | **가계부 기록** | 1회 점검, 예산분석(1.3x) | 수기 입력(1.0x), 8일 스트릭(1.24x) | $1 \\times 50 \\times 1.3 \\times 1.24$ | **+81 EXP** (금융 FIN +57, 정신력 MEN +24) |
| **10**| **감사 일기** | 1편, 심층회고(1.35x) | 앱내 작성(1.0x), 8일 스트릭(1.24x) | $1 \\times 60 \\times 1.35 \\times 1.24$ | **+100 EXP** (정신력 MEN +70, 지능 INT +30) |
`,
  },
  {
    id: 'levelup-ux',
    number: 7,
    title: '성인을 위한 프리미엄 레벨업 UX / 인터랙션 설계',
    category: 'UX / UI Design',
    summary: '유치함을 배제한 네오-사이버 앤틱 스타일, 햅틱 피드백, 백분위 랭크 및 다음 목표 제시',
    content: `
### 1. 레벨업 모달 UI 요소 구성
* **상단 헤더**: 골드/티타늄 그라디언트 뱃지와 함께 **"LEVEL UP!"** 타이틀
* **스탯 비포/애프터**: \`지구력 (Endurance) Lv.3 ➔ Lv.4\` (카운트업 애니메이션 및 반짝임)
* **획득 수치 요약**: \`+120 EXP\` 획득 및 서브스킬(\`달리기 Lv.8\`) 동반 승급 표시
* **사회적 증거 및 상대적 위치(Percentile)**: \`🔥 전체 유저 중 상위 28% 도달!\` / \`이번 달 +2 Level 성장 중\`
* **다음 레벨 프로그레스 바**: \`다음 레벨까지: 180 EXP 남음 (진척도 38%)\`
* **스마트 다음 목표 제안(Call to Action)**: "내일 3.5km 달리기 또는 가벼운 회복 스트레칭 15분을 완료하면 지구력 Lv.5에 도달합니다!"

### 2. 세련된 감성 연출 규칙 (Anti-Slop Guidelines)
1. **화려한 3D 폭죽 대신 고급스러운 파티클 & 사운드**: 은은한 금빛 라이트 빔과 미세 햅틱 진동(Impact Feedback).
2. **명확한 정보 위계**: 축하 문구보다 **나의 구체적인 누적 데이터(이번 주 총 9.4km 달성)**를 메인에 배치하여 실질적 자부심 고취.
`,
  },
  {
    id: 'player-tier',
    number: 8,
    title: '사용자 전체 레벨 & 티어 시스템',
    category: 'Ranking & Progression',
    summary: '종합 플레이어 레벨 계산 방식 및 6단계 마스터 티어(Bronze to Master) 구조',
    content: `
### 1. 종합 플레이어 레벨(Player Level) 산출 방식
개별 6대 스탯의 성장을 종합하여 전체 플레이어 레벨을 산출합니다.
$$\\text{Player Level} = f(\\text{Total Accumulated EXP})$$
* **Total EXP 기반 산출의 장점**: 한 분야(예: 헬스)만 집중한 유저든, 모든 분야를 골고루 한 유저든 공정하게 종합 레벨이 상승합니다.
* **육각형 밸런스 보너스**: 6대 스탯의 표준편차가 낮을수록(모든 영역이 골고루 성장할수록) **"전인적 성장 보너스 (+10% EXP 효율)"** 패시브 퍽을 부여합니다.

### 2. 6단계 랭크 티어 (Tier Hierarchy)
* **Bronze (Lv. 1 ~ 7)**: 입문자 / 현실 각성 단계 (하위 0~40%)
* **Silver (Lv. 8 ~ 14)**: 실행가 / 습관 정착 단계 (상위 60%)
* **Gold (Lv. 15 ~ 24)**: 숙련자 / 자기통제 확립 단계 (상위 30%)
* **Platinum (Lv. 25 ~ 34)**: 전문가 / 삶의 주도권 장악 (상위 15%)
* **Diamond (Lv. 35 ~ 49)**: 마스터 클래스 / 1년 이상 지속 성장 (상위 5%)
* **Master (Lv. 50 ~ 99)**: 레전드 / 현실의 초인 (상위 1% 미만)
`,
  },
  {
    id: 'profile-system',
    number: 9,
    title: '캐릭터 프로필 & 상태창(Status Window) 시각화',
    category: 'Profile & Visualization',
    summary: '6각 레이더 차트, 주간 성장 지표, 장착 칭호, 서브스킬 트리 뷰 설계',
    content: `
### 상태창 핵심 컴포넌트
1. **캐릭터 헤더**: 유저 닉네임 + 장착 칭호(예: \`[현실의 개척자]\`) + 랭크 뱃지(\`Silver II\`) + 스트릭 불꽃(\`🔥 8일 연속\`).
2. **플레이어 레벨 바**: \`Lv.14 (14,820 / 15,940 EXP, 93%)\` 및 이번 주 획득 경험치 \`▲ +1,840 EXP\`.
3. **6대 스탯 6각 레이더 차트 (Hexagon Radar)**: 나의 신체/학습/정신/커리어/금융/소통의 성장 밸런스를 직관적으로 조망.
4. **스탯 카드 리스트**: 클릭 시 하위 서브스킬(달리기, 웨이트, 독서 등)의 상세 레벨과 누적 수치가 펼쳐지는 아코디언 인터랙션.
5. **장착 칭호/배지 보관함**: 업적 달성으로 획득한 특수 칭호 선택 장착 (프로필 공유 카드 생성 기능 지원).
`,
  },
  {
    id: 'quest-system',
    number: 10,
    title: '퀘스트 시스템 (Daily, Weekly, Epic Challenges)',
    category: 'Engagement Engine',
    summary: '매일 갱신되는 일일 퀘스트, 주간 목표, 장기 30일/100km 챌린지 및 보상 체계',
    content: `
### 1. 일일 퀘스트 (Daily Quests - 매일 00:00 갱신)
* **[난이도 하]** 물 1.5L 마시기 또는 스트레칭 5분 (+40 EXP)
* **[난이도 중]** 독서 또는 코딩 30분 달성 (+100 EXP)
* **[난이도 상]** 20분 이상 심박수 상승 운동(달리기/헬스) (+120 EXP)
* **일일 올클리어 보너스**: 3개 퀘스트 모두 완료 시 **'보석 10개 + 스트릭 쉴드 조각'** 지급.

### 2. 주간 퀘스트 (Weekly Quests - 매주 월요일 갱신)
* **[유산소]** 주간 누적 15km 러닝 또는 걷기 (+300 EXP)
* **[지적 성장]** 주간 누적 5시간 딥워크/공부 달성 (+350 EXP)
* **[마인드]** 주간 4회 이상 일기/가계부 작성 (+250 EXP)

### 3. 에픽 챌린지 (Epic 30-Day Challenges)
* **'30일 독서 습관 챌린지'**: 30일 중 25일 이상 20분 독서 ➔ **한정 칭호 [지혜의 현자] + 1,000 EXP**
* **'100km 센추리 러너'**: 한 달 누적 100km 돌파 ➔ **한정 칭호 [바람의 질주자] + 1,500 EXP**
`,
  },
  {
    id: 'achievements',
    number: 11,
    title: '업적 & 칭호 시스템 (Achievements & Titles)',
    category: 'Gamification Rewards',
    summary: '누적 마일스톤, 특수 조건 히든 업적, 칭호 버프 및 프로필 데코레이션',
    content: `
| 업적명 | 달성 조건 | 보상 칭호 | 보상 EXP | 카테고리 |
| :--- | :--- | :--- | :--- | :--- |
| **첫 발자국 (First Step)** | 첫 활동 1회 기록 완료 | [현실의 각성자] | +100 EXP | 공통 |
| **꾸준함의 화신 (7-Day Streak)** | 7일 연속 기록 달성 | [불굴의 의지] | +300 EXP | 멘탈 |
| **습관의 완성 (30-Day Streak)** | 30일 연속 기록 달성 | [시간의 지배자] | +1,000 EXP | 멘탈 |
| **로드 러너 (Road Runner)** | 누적 러닝 50km 달성 | [러닝 매니아] | +250 EXP | 신체 |
| **센추리 러너 (Century Runner)** | 누적 러닝 100km 돌파 | [바람을 가르는 자] | +500 EXP | 신체 |
| **지식의 탐구자 (Book Worm)** | 누적 독서 500분 달성 | [독서가] | +200 EXP | 학습 |
| **코드 아키텍트 (Code Architect)** | 누적 코딩 100시간 달성 | [디지털 창조자] | +600 EXP | 학습 |
| **새벽의 기적 (Miracle Morning)** | 오전 6시 30분 이전 활동 10회 | [새벽형 인간] | +350 EXP | 라이프 |
| **황금의 절제 (Frugal Master)** | 가계부 30회 & 무지출 10일 | [자산의 수호자] | +400 EXP | 금융 |
| **레벨 50 도달 (Half Century)** | 플레이어 레벨 50 돌파 | [현실의 마스터] | +2,000 EXP | 랭크 |
`,
  },
  {
    id: 'behavioral-psychology',
    number: 12,
    title: '행동심리학 기반 지속가능 동기부여 설계',
    category: 'Behavioral Science',
    summary: '진보 원리, 목표 구배 효과, 스트릭 동결, 가변 보상, 자기결정성 이론의 체계적 적용',
    content: `
단순한 게임 요소 삽입은 '외적 보상으로 인한 내적 동기 저하(과정당화 효과)'를 유발할 수 있습니다. 행동심리학 7대 원칙을 철저히 반영합니다.

1. **진보 원칙 (Progress Principle)**: 테레사 아마빌 교수의 연구대로, 인간은 '작더라도 유의미한 진전'을 느낄 때 가장 몰입합니다. 10분의 산책도 +15 EXP로 즉시 시각화됩니다.
2. **목표 구배 효과 (Goal Gradient Effect)**: 다음 레벨이나 퀘스트 목표가 80% 이상 가까워졌을 때 "다음 레벨까지 단 40 EXP 남았습니다!" 알림을 제공하여 마지막 행동을 유도합니다.
3. **손실 회피와 스트릭 동결 (Loss Aversion & Streak Freeze)**: 스트릭이 깨지면 포기하는 심리를 방어하기 위해 주 1회 '스트릭 쉴드(결석 방어권)'를 무상 제공합니다.
4. **가변 보상 (Variable Reward)**: 활동 완료 시 10% 확률로 '크리티컬 EXP (1.5x 부스트)' 또는 '희귀 칭호 조각'이 등장하여 예측 불가능한 도파민을 자극합니다.
5. **자기결정성 이론 (Self-Determination Theory - SDT)**:
   * **유능성(Competence)**: 성장하는 6각 레이더 차트와 상세 스탯.
   * **자율성(Autonomy)**: 강제된 할 일이 아닌, 내가 좋아하는 활동을 직접 선택해 기록.
   * **관계성(Relatedness)**: 랭킹 경쟁 대신 "함께 달리는 크루원들의 오늘의 성장 합계" 협동 퀘스트.
`,
  },
  {
    id: 'trust-verification',
    number: 13,
    title: '기록 신뢰도 & 부정 방지 시스템 (Anti-Cheat & Verification)',
    category: 'Data Integrity',
    summary: 'Apple Health / Health Connect / GPS / 타이머 연동 및 Verified vs Self-Reported 2-Track 정책',
    content: `
### 1. 2-Track 기록 분류 체계
* **Verified (공인 인증 기록)**:
  * Apple Health / Google Health Connect 자동 동기화 데이터 (걸음수, 수면시간, 심박수).
  * GPS 위치 기반 실시간 러닝/라이딩 경로 트래킹.
  * 앱 내 타이머(뽀모도로, 명상 사운드 플레이어, 스톱워치) 실행 완료 데이터.
  * ➔ **혜택**: EXP +25% 공인 부스트 지급, 글로벌 랭킹 반영, 인증 배지 부여.
* **Self-Reported (수기 셀프 기록)**:
  * 독서 페이지, 가계부 작성, 오프라인 미팅 등 센서 측정이 불가능한 영역.
  * ➔ **규칙**: 기본 EXP 100% 정상 지급 (단, 일일 상한선 Soft-Cap 엄격 적용).

### 2. 이상 징후 감지 알고리즘 (Anomaly Detection)
* 하루에 50km 이상 러닝을 입력하거나, 24시간 동안 20시간 코딩을 입력한 경우 시스템이 자동 플래그를 생성하고 "인체 한계를 초과한 기록으로 경험치가 보정되었습니다" 알림을 표시합니다.
`,
  },
  {
    id: 'home-ux',
    number: 14,
    title: '홈 화면 UX 및 텍스트 와이어프레임',
    category: 'UX Architecture',
    summary: '상태창, 오늘 성장치, 일일 퀘스트, 빠른 기록 FAB의 최적 위계 배치',
    content: `
\`\`\`text
+-------------------------------------------------------+
| [🔥 8일 연속]  Alex (Lv.14 실버)          [🔔] [⚙️]   |
| [칭호: 현실의 개척자]  Total 14,820 EXP               |
+-------------------------------------------------------+
| 📊 오늘 획득: +480 EXP (이번 주 +1,840 EXP)           |
| [======================================------] 88%   |
| 다음 레벨(Lv.15 Gold)까지 140 EXP 남음                |
+-------------------------------------------------------+
| 🧭 6대 핵심 능력치 레이더 & 미니 요약                 |
|  - 근력 Lv.12  |  지구력 Lv.16  |  몰입 Lv.11         |
|  - 지능 Lv.15  |  정신력 Lv.10  |  금융 Lv.7          |
+-------------------------------------------------------+
| ⚔️ 오늘의 퀘스트 (Daily Quest 2/3)                     |
|  [V] 20분 유산소 운동 완료 (+80 EXP)        [수령완료] |
|  [ ] 독서 또는 코딩 30분 (15/30분)          [진행중]   |
|  [ ] 마음 챙김 명상 10분                    [시작하기] |
+-------------------------------------------------------+
| ⚡ 빠른 활동 기록 (Quick Actions)                     |
|  [ 🏃 러닝 ]  [ 🏋️ 헬스 ]  [ 📖 독서 ]  [ 💻 코딩 ]  |
+-------------------------------------------------------+
| 🏆 최근 달성 업적: [로드 러너 (50km 돌파)]             |
+-------------------------------------------------------+
| [ 🏠 홈 ]  [ 📊 상태창 ]  [ ➕ 기록 ]  [ 📜 퀘스트 ]  |
+-------------------------------------------------------+
\`\`\`
`,
  },
  {
    id: 'user-flow',
    number: 15,
    title: '전체 사용자 여정 (End-to-End User Flow)',
    category: 'Interaction Design',
    summary: '온보딩부터 활동 입력, 실시간 EXP 계산, 레벨업 팝업 및 다음 루프 제안까지의 8단계 흐름',
    content: `
1. **앱 진입 및 온보딩**: 3문항 라이프스타일 설문 ➔ 초기 6대 스탯 보정 ➔ 첫 번째 직업 칭호 부여.
2. **홈 화면 탐색**: 오늘의 추천 퀘스트 및 현재 레벨/진척도 확인.
3. **활동 시작/선택**: 빠른 기록 버튼 클릭 ➔ 카테고리(신체/학습/정신 등) 및 세부 행동 선택.
4. **측정 및 인증**: 타이머 구동 또는 GPS 트래킹 (또는 수기 입력).
5. **실시간 EXP 산출**: 난이도 + 스트릭 보너스 + 인증 가산점이 적용된 계산 내역 확인.
6. **레벨업 및 보상(Trigger)**: 필요 EXP 충족 시 전용 레벨업 모달 팝업 및 스탯 상승 연출.
7. **상태창 업데이트**: 6각 레이더 차트 갱신, 서브스킬 숙련도 증가.
8. **스마트 회고 및 다음 목표 제시**: "오늘 아주 훌륭했습니다! 내일 20분 독서를 완료하면 지능 Lv.16 달성이 가능합니다."
`,
  },
  {
    id: 'onboarding',
    number: 16,
    title: '온보딩 설계 & 초기 레벨 캘리브레이션',
    category: 'Onboarding UX',
    summary: '초기 레벨 설정 4대 방식 비교 및 3문항 설문 기반 스마트 초기화 추천',
    content: `
### 초기 레벨 설정 방식 비교 분석
1. **모두 Lv.1 시작**: 단순하지만 실제 10km를 뛰는 숙련자에게 박탈감을 주어 초반 이탈률 급증.
2. **간단한 체력/지식 테스트**: 진입 장벽이 너무 높아 70% 이상의 유저가 온보딩 중 이탈.
3. **첫 7일 활동 기반 사후 보정**: 온보딩은 쉬우나 즉각적인 상태창 확인 재미가 떨어짐.
4. **[최종 추천] 3문항 설문 기반 스마트 초기 캘리브레이션 (Survey-driven Baseline)**:
   * Q1. 평소 일주일에 운동을 얼마나 하시나요? (안함 / 주 1~2회 / 주 3~4회 / 매일 매니아)
   * Q2. 평소 독서나 업무 외 자기계발 시간은? (30분 미만 / 1시간 / 2시간 이상)
   * Q3. 현재 가장 키우고 싶은 나의 인생 핵심 스탯은? (신체 / 뇌지컬 / 멘탈 / 재테크)
   * ➔ **결과**: 관련 스탯을 Lv.3~Lv.6으로 맞춤형 부스팅하여 **"나만을 위한 실제 상태창"** 즉시 생성!
`,
  },
  {
    id: 'mvp-roadmap',
    number: 17,
    title: 'MVP vs V1.5 vs V2 단계별 제품 로드맵',
    category: 'Product Roadmap',
    summary: '스코프 크립을 방지하고 빠른 시장 검증을 위한 3단계 마일스톤',
    content: `
### 1. MVP (Phase 1 - 첫 출시 필수 핵심 기능)
* **목표**: 개인 성장 루프와 경험치 시스템의 재미 검증
* **포함 기능**:
  * 6대 핵심 스탯 & 상태창 레이더 차트
  * 10대 기본 활동 기록 및 실시간 EXP 계산기
  * 레벨업 인터랙션 & 일일/주간 퀘스트 시스템
  * 스트릭(연속 일수) 카운터 & 10개 핵심 업적
  * 로컬 데이터 저장 및 간단한 소셜 공유 카드

### 2. V1.5 (Phase 2 - 리텐션 및 데이터 신뢰도 고도화)
* **포함 기능**:
  * Apple Health / Google Health Connect 자동 연동 (걸음, 수면, 운동)
  * GPS 러닝 트래커 및 앱 내 뽀모도로/명상 타이머 내장
  * 클라우드 계정 동기화 (Supabase/Firebase) 및 유저 백업
  * 주간 성장 리포트 (AI 코치 피드백 한 줄)

### 3. V2 (Phase 3 - 커뮤니티 및 수익화 확장)
* **포함 기능**:
  * 길드 / 크루 시스템 (협동 보스 레이드: "이번 주 크루원 총 500km 달리기")
  * 프리미엄 구독 (AI 맞춤형 성장 플래너, 고급 데이터 분석)
  * 캐릭터 아바타 커스텀 및 시즌 패스 (배틀 패스)
`,
  },
  {
    id: 'data-schema',
    number: 18,
    title: '데이터 모델 및 관계형 스키마 설계 (ERD / Data Models)',
    category: 'Engineering Architecture',
    summary: 'User, Stat, Activity, SubSkill, Quest, Achievement 등 개발 표준 스키마',
    content: `
\`\`\`typescript
// 1. User Profile Model
interface User {
  id: string;
  email: string;
  nickname: string;
  equippedTitle: string;
  playerLevel: number;
  totalExp: number;
  rankTier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond' | 'Master';
  streakDays: number;
  maxStreak: number;
  streakShieldCount: number;
  createdAt: string;
  updatedAt: string;
}

// 2. Core Stat & Sub-Skill Progress
interface UserStat {
  userId: string;
  statKey: 'VIT' | 'END' | 'FOC' | 'INT' | 'MEN' | 'FIN' | 'SOC';
  level: number;
  currentExp: number;
  nextLevelExp: number;
}

interface UserSubSkill {
  id: string;
  userId: string;
  skillId: 'running' | 'weight' | 'reading' | 'coding' | 'meditation' | 'sleep' | 'finance';
  parentStatKey: string;
  level: number;
  totalAmount: number;
  unit: string;
}

// 3. Activity Log Record
interface ActivityLog {
  id: string;
  userId: string;
  activityId: string;
  category: 'physical' | 'learning' | 'mental' | 'career' | 'finance' | 'social';
  amount: number;
  unit: string;
  difficultyMultiplier: number;
  streakMultiplier: number;
  isVerified: boolean;
  earnedExp: number;
  primaryStat: string;
  secondaryStat: string;
  loggedAt: string;
  verificationSource?: 'apple_health' | 'gps' | 'timer' | 'manual';
}

// 4. Quest & Challenge
interface QuestInstance {
  id: string;
  userId: string;
  questDefId: string;
  type: 'daily' | 'weekly' | 'challenge';
  currentProgress: number;
  targetAmount: number;
  isCompleted: boolean;
  isClaimed: boolean;
  expiresAt: string;
}
\`\`\`
`,
  },
  {
    id: 'tech-stack',
    number: 19,
    title: '기술 스택 추천 및 비교 분석',
    category: 'Technology Strategy',
    summary: 'Flutter vs React Native, Supabase vs Firebase 비교 및 MVP 최적 조합 선정',
    content: `
### 1. 프론트엔드 비교 (React Native vs Flutter)
* **React Native (Expo)**: 빠른 생산성, 방대한 생태계, 웹/모바일 코드 공유 용이.
* **Flutter**: 렌더링 성능 최상, 정교한 애니메이션/캔버스 차트 구현에 탁월.
* ➔ **선정**: **React Native (Expo + TypeScript + Tailwind/NativeWind)**
  * 이유: 빠른 MVP 출시, 웹 브라우저 시뮬레이터 즉각 지원, 건강 센서(HealthKit) 플러그인 성숙도 우수.

### 2. 백엔드 & DB 비교 (Supabase vs Firebase)
* **Firebase**: 실시간 동기화 우수하나 복잡한 통계/랭킹 쿼리 및 집계 비용이 높음.
* **Supabase (PostgreSQL)**: 관계형 데이터(유저-스탯-활동로그-퀘스트)와 집계 쿼리(주간 랭킹, 백분위 계산)에 압도적 강점.
* ➔ **선정**: **Supabase (PostgreSQL) + Edge Functions (Deno/Node.js)**

### 3. MVP 최종 권장 기술 스택 요약
* **Frontend**: React Native (Expo) + TypeScript + Reanimated 3 (레벨업 애니메이션)
* **Backend / Database**: Supabase (PostgreSQL, Auth, Realtime)
* **State Management**: Zustand (가볍고 빠른 상태창 반응성)
`,
  },
  {
    id: 'monetization',
    number: 20,
    title: '수익화 모델 (Freemium & Subscription)',
    category: 'Business Model',
    summary: '동기부여를 해치지 않는 프리미엄 구독 (월 6,900원 / 연 59,000원) 및 시즌 패스',
    content: `
### 1. 기본 무료(Free Tier) 모델
* 모든 기본 6대 스탯 및 20+ 활동 기록 무제한
* 일일/주간 기본 퀘스트 및 7일 연속 기록 기능
* 핵심 레이더 차트 및 기본 레벨업 경험 제공 (기본 성장에 제약 없음)

### 2. 프리미엄 구독 모델 (LifeRPG Pro - 월 6,900원 / 연 59,000원)
* **AI 퍼스널 성장 코치**: 주간 활동 패턴 분석 및 취약 스탯 맞춤 개선 제안.
* **고급 통계 및 데이터 분석**: 월간/연간 성장 그래프, 시간대별 몰입도 분석, CSV 데이터 추출.
* **무제한 스트릭 보호권 (Streak Freeze Pro)**: 월 3회 자동 결석 방어.
* **프리미엄 상태창 테마**: 다크 사이버펑크, 골든 앤틱, 미니멀 오프화이트 등 UI 스킨.
* **커스텀 서브스킬 무제한 생성**: 나만의 특수 취미/전문 분야 스탯 커스텀 등록.

### 3. 왜 전면 광고(Interstitial Ads)를 배제하는가?
* 자기계발 몰입 상태에서 갑자기 30초 동영상 광고가 나오면 사용자는 즉시 앱을 삭제합니다. 신뢰와 몰입을 유지하기 위해 배너/전면 광고를 전면 배제하고 순수 구독/시즌패스로 운영합니다.
`,
  },
  {
    id: 'competitor-analysis',
    number: 21,
    title: '경쟁 서비스 비교 및 3대 핵심 차별화 요소',
    category: 'Market Positioning',
    summary: 'Habitica, Forest, Todoist, Strava와의 장단점 비교 및 결정적 필승 차별점',
    content: `
| 서비스 | 주요 특징 | 한계점 | LifeRPG만의 차별점 |
| :--- | :--- | :--- | :--- |
| **Habitica** | 8비트 레트로 픽셀 RPG, 판타지 몬스터 토벌 | 너무 유치해서 20~30대 성인 유저 지속률 낮음, 현실 스탯 연계 부족 | **성인을 위한 세련된 네오-사이버 상태창 & 실제 삶의 영역(금융/체력/커리어) 정밀 매핑** |
| **Forest** | 집중 시간 동안 나무 키우기 | 집중 타이머 단일 기능에 한정되어 신체/금융 등 포괄 성장 불가 | **신체, 지적, 멘탈, 금융을 망라하는 6대 다차원 통합 성장 시스템** |
| **Strava / Nike Run** | 러닝/사이클 특화 소셜 앱 | 운동 외 학습이나 독서 등 전인적 자기계발과 무관 | **운동 데이터(Apple Health)를 자동으로 수집해 전체 캐릭터 레벨로 승화** |
| **투두이스트 / 루틴 앱** | 심플한 체크리스트 | 단순 할 일 체크에 그쳐 성장의 시각적 피드백 부재 | **경험치, 레벨업, 칭호, 랭크 티어로 즉각적 도파민 피드백 제공** |

### 반드시 가져야 할 3대 필승 차별화 기능
1. **[All-in-One 현실 상태창]**: 운동, 공부, 독서, 수면, 재테크가 한 곳에 모여 나를 정의하는 유일한 플랫폼.
2. **[Verified 데이터 신뢰성]**: 건강 센서 및 GPS와 결합하여 자작극 없는 진정한 성장 증명.
3. **[성인 타깃의 정교한 게임 수학]**: 유치한 판타지가 아닌, 실제 역량 지표로서의 스탯과 세련된 인터랙션.
`,
  },
  {
    id: 'naming',
    number: 22,
    title: '서비스 브랜드 네이밍 후보 20선',
    category: 'Branding & Identity',
    summary: '현실 성장, Level Up, RPG, 능력치, Life EXP 키워드 기반 영문/국문 네이밍',
    content: `
### A. 글로벌 영문 네이밍 (10선)
1. **LifeRPG**: 가장 직관적이고 설명이 필요 없는 글로벌 표준 명칭.
2. **StatusWindow (상태창)**: 웹소설/게임의 '나 혼자만 보이는 상태창' 클리셰를 현실화한 강력한 네이밍.
3. **LevelUpMe**: 나 자신을 지속적으로 레벨업한다는 명확한 액션 지향 네이밍.
4. **LifeEXP**: 삶의 모든 경험을 경험치 포인트로 환산한다는 의미.
5. **RealStatus**: 가상이 아닌 현실(Real)의 진짜 능력치를 보여주는 앱.
6. **SelfQuest**: 내 인생을 흥미진진한 퀘스트의 연속으로 재해석.
7. **StatUp**: 매일 나의 역량 스탯을 올린다(Stat + Up)는 직관적 단어.
8. **OriginRPG**: 현실의 나(Origin)를 주인공으로 삼는 게임.
9. **AscendLife**: 삶의 차원을 한 단계씩 승급(Ascend)시킨다는 고급스러운 뉘앙스.
10. **AcroStat**: 인생의 정점(Acro)을 향해 능력치를 쌓아가는 서비스.

### B. 감각적인 국문/혼합 네이밍 (10선)
11. **상태창 (Status)**: 2030 세대에게 직관적으로 와닿는 현실 판타지 상태창.
12. **레벨업라이프 (LevelUp Life)**: 대중적이고 친근한 자기계발 브랜딩.
13. **현실레벨업 (RealLevel)**: 직관적인 검색 키워드 선점용 네이밍.
14. **스탯로그 (StatLog)**: 일상 기록이 곧 나의 스탯이 된다는 컨셉.
15. **인생각성 (Awaken)**: 잠들어 있던 현실의 잠재력을 깨우는 서비스.
16. **퀘스트데이 (QuestDay)**: 하루하루를 즐거운 퀘스트로 채우는 일상.
17. **마이오리진 (My Origin)**: 가장 소중한 나 자신이라는 캐릭터 육성.
18. **스탯빌더 (StatBuilder)**: 몸과 뇌, 자산을 빌드업하는 플랫폼.
19. **성장일지 RPG**: 정통 성장 일기 형식을 빌린 게임화 앱.
20. **넥스트레벨 (NextLevel)**: 어제보다 한 단계 더 높은 차원의 나.
`,
  },
  {
    id: 'executive-summary',
    number: 23,
    title: '종합 마스터 요약 & 리스크 검증 프레임워크',
    category: 'Executive Summary',
    summary: '15대 핵심 요약, 5대 서비스 리스크 해결책, 출시 전 검증 가설',
    content: `
### 1. 종합 핵심 마스터 요약
1. **앱 정의**: 보이지 않는 일상의 자기계발 활동을 RPG 스탯과 경험치로 환산하여 시각화하는 현실 레벨업 시스템.
2. **타깃 유저**: 20~30대 직장인/취준생/러너/개발자 중 자기계발 의지는 높으나 작심삼일 피로를 겪는 얼리어답터.
3. **핵심 문제**: 행동과 보상 사이의 시간 지연(Feedback Delay) 및 체크리스트 습관 앱의 동기부여 소진.
4. **핵심 가치 제안**: "오늘 3km 러닝은 지구력 Lv.4 승급과 120 EXP로 즉각 자산화된다."
5. **TOP 5 핵심 기능**: 6대 스탯 레이더 상태창, 실시간 EXP 계산기, 레벨업 팝업 모달, 일일/주간 퀘스트, 데이터 공인 인증(Apple Health/GPS).
6. **능력치 구조**: 6대 핵심 스탯(VIT, END, FOC, INT, MEN, FIN) + 세부 전문 서브스킬 트리(달리기, 코딩, 독서 등).
7. **EXP 공식**: $EXP = (\\text{Base} \\times \\text{Amount} \\times M_{\\text{diff}} \\times M_{\\text{streak}} \\times M_{\\text{verified}}) + \\text{Bonuses}$.
8. **대표 플로우**: 목표 선택 ➔ 활동 시작/기록 ➔ EXP 계산 ➔ 레벨업 모달 & 칭호 획득 ➔ 다음 목표 피드백.
9. **MVP 스코프**: 6대 스탯 상태창 + 10개 핵심 활동 기록기 + 레벨업 연출 + 일일 퀘스트 + 로컬/기본 클라우드.
10. **추천 기술 스택**: React Native (Expo) + TypeScript + Supabase (PostgreSQL) + Zustand.
11. **수익 모델**: 순수 Freemium 구독 (LifeRPG Pro 월 6,900원 / 연 59,000원 - AI 코칭, 무제한 스트릭 보호, 고급 통계).
12. **경쟁사 대비 차별점**: 성인을 위한 세련된 상태창 디자인, Apple Health 실시간 연동, 다차원 통합 성장.

---

### 2. 가장 큰 5대 서비스 리스크 및 해결책
1. **[리스크 1: 허위 입력으로 인한 EXP 인플레이션]**
   * *해결책*: Apple Health/GPS 공인 데이터에 +25% 가산점을 부여하고, 일일 상한선(Soft-Cap) 및 비정상 수치 감지 알고리즘 적용.
2. **[리스크 2: 연속 기록(Streak) 파괴 시 유저 이탈 (What-the-hell Effect)]**
   * *해결책*: 주 1회 '스트릭 쉴드' 기본 제공 및 스트릭이 깨져도 누적 EXP와 능력치 레벨은 영구 보존.
3. **[리스크 3: 20~30대 성인 타깃에겐 유치해 보일 위험]**
   * *해결책*: 8비트 도트 캐릭터 대신 세련된 다크/앤틱 네오-미니멀리즘 상태창과 정교한 데이터 인포그래픽 적용.
4. **[리스크 4: 초기 1~2주 이후 레벨업 둔화에 따른 지루함]**
   * *해결책*: 서브스킬(세부 활동)은 자주 레벨업되도록 다중 레벨 구조를 설계하고, 주간 퀘스트와 시즌 배지 순환.
5. **[리스크 5: 일기/가계부/코딩 등 복합 활동 입력의 번거로움]**
   * *해결책*: 홈 화면 원터치 퀵 액션 위젯 및 스마트워치 원클릭 기록 컴패니언 제공.

---

### 3. 출시 전 반드시 검증해야 할 5대 핵심 가설
* **가설 1**: "활동 직후의 즉각적인 EXP 지급 애니메이션이 단순 체크박스 완료보다 다음 날 재방문율(D-1 Retention)을 30% 이상 높일 것이다."
* **가설 2**: "Apple Health 공인 인증 배지가 부여될 때 유저의 기록 신뢰도와 자기효능감이 크게 상승할 것이다."
* **가설 3**: "3문항 온보딩 캘리브레이션을 거친 유저의 D-7 잔존율이 일괄 Lv.1 시작 유저 대비 2배 이상 높을 것이다."
* **가설 4**: "성인 유저들은 판타지 몬스터 사냥보다 6각 레이더 차트의 균형적 성장에 더 큰 만족을 느낄 것이다."
* **가설 5**: "주 1회 스트릭 쉴드 제공이 연쇄 이탈률을 40% 이상 감소시킬 것이다."
`,
  },
];
