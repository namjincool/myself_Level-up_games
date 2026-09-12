# LifeRPG 모바일 앱 전환 메모

## 현재 구조

- 기존 앱: Vite + React 19 + TypeScript
- 데이터: 서버/API 없이 React 상태로 동작하던 구조
- 저장: `localStorage` 기반으로 프로필, 퀘스트, 업적, 활동 기록을 보존
- 모바일 셸: Capacitor
- 앱 ID: `com.namjin.liferpg`

## 개발 명령

```bash
npm install
npm run dev
npm run lint
npm run build
npm run mobile:build
npm run mobile:open:android
npm run mobile:open:ios
```

`mobile:build`는 웹 번들을 만든 뒤 Android/iOS 프로젝트에 자산을 동기화합니다.

## 적용한 모바일 UX 기준

- Safe Area와 `viewport-fit=cover` 적용
- 모바일 화면 기준의 축소된 상단 헤더와 고정 하단 액션 영역
- 최소 44px 터치 영역과 터치 피드백
- 키보드가 필요한 숫자 입력에 `inputMode` 적용
- 활동 기록, 온보딩, 칭호, 레벨업 화면을 모바일 바텀시트 형태로 표시
- `dvh` 기반 높이와 `prefers-reduced-motion` 대응
- PWA fallback용 manifest와 기본 아이콘 추가

## 반영된 운영 기능

- 활동 입력값 검증과 최근 중복 기록 차단
- 활동 기록 수정·삭제 및 관련 통계 재계산
- 빈 기록 화면, 입력 오류, 저장/복원 결과 알림
- JSON 백업 다운로드·복원·전체 초기화
- 알림 권한, 리마인더 설정, 햅틱 피드백, 분석 동의 설정
- 로컬 게스트 모드와 클라우드 동기화 준비 상태 표시
- `몰입/업무`: 딥워크 시간, 핵심 업무 완료, 프로젝트 산출물 기록
- `소통/관계`: 의미 있는 대화, 안부 연락, 협업·도움 주기 기록

## 첫 사용자 워크플로우

1. 앱 최초 실행: 예시 프로필, 예시 활동 기록, 완료된 퀘스트 없이 시작합니다.
2. 최소 온보딩: 닉네임과 성장 방향만 입력합니다.
3. 초기 상태 저장: 모든 사용자는 `Lv.1 / EXP 0 / 활동 기록 0 / 스탯 Lv.1`에서 시작합니다.
4. 첫 활동 기록: 홈의 `첫 활동 기록하기`를 눌러 실제로 한 행동, 수치, 난이도, 메모를 입력합니다.
5. 저장 및 계산: 입력한 활동을 기록하고 활동 EXP, 핵심 스탯, 세부 스킬, 퀘스트 진행률을 갱신합니다.
6. 성장 확인: 레벨 진행률, 스탯 진행률, 기록 → 성장 그래프, 활동 기록 피드에서 변화를 확인합니다.
7. 반복 성장: 다음 활동을 기록할 때마다 동일한 흐름을 반복합니다. 잘못 입력한 기록은 수정·삭제할 수 있고 관련 통계를 다시 계산합니다.

핵심 원칙은 `실제 행동 기록 → EXP 계산 → 능력치·퀘스트·업적 갱신 → 성장 시각화 → 기록/회고`입니다. 초기 데이터는 사용자의 행동으로 생성되며, 예시 레벨이나 예시 활동을 사용자 상태로 사용하지 않습니다. 계정·서버 동기화·실제 푸시 알림·Health/GPS 연동은 외부 백엔드와 플랫폼 권한을 확정한 뒤 연결해야 합니다.

## 저장 및 관리자 데이터 원칙

- 온보딩 완료 후 프로필, 활동 기록, 메모, 레벨, 퀘스트 진행 상황을 같은 기기의 `localStorage`에 자동 저장합니다.
- 앱을 다시 열면 저장된 사용자 상태를 복원합니다. 브라우저 데이터 삭제, 앱 삭제, 기기 변경에 대비해 설정에서 JSON 백업을 제공합니다.
- 현재는 로그인·서버·관리자 원문 열람 기능이 없으므로 관리자도 사용자의 로컬 활동 데이터를 볼 수 없습니다.
- 초기 운영은 관리자에게 원문 활동·메모를 수집하지 않는 로컬 우선 방식으로 유지하는 것을 권장합니다. 이후 동기화가 필요할 때만 계정, 동의, 사용자별 접근 제어, 내보내기·삭제, 관리자 접근 기록을 함께 설계합니다.

## 모바일 설치 테스트 환경(Windows)

현재 프로젝트에는 Capacitor 기반 `android/`와 `ios/` 프로젝트가 포함되어 있습니다. Windows에서는 Android 실기기 또는 에뮬레이터 테스트를 진행할 수 있습니다.

1. Android Studio를 설치하고 초기 설정에서 Android SDK, Android SDK Platform 36, Android SDK Build-Tools, Android SDK Platform-Tools, Android Emulator를 설치합니다.
2. Android Studio에서 `android/` 폴더를 열고 Gradle 동기화가 완료될 때까지 기다립니다.
3. 에뮬레이터를 사용한다면 Device Manager에서 Pixel 계열 기기와 API 35 이상 이미지를 생성합니다. 실기기는 개발자 옵션과 USB 디버깅을 켭니다.
4. 프로젝트 루트에서 아래 명령을 실행합니다.

```bash
npm run mobile:android:apk
npm run mobile:android:install
```

`mobile:android:apk`는 `android/app/build/outputs/apk/debug/app-debug.apk`를 만들고, `mobile:android:install`은 연결된 기기 또는 실행 중인 에뮬레이터에 `com.namjin.liferpg` 앱을 설치합니다.

Android Studio 없이 명령줄만 사용하려면 `JAVA_HOME`, `ANDROID_HOME` 또는 `ANDROID_SDK_ROOT`, 그리고 `platform-tools`를 PATH에 등록해야 합니다. 현재 PC 점검에서는 Java, Android SDK, ADB가 아직 발견되지 않았습니다.

Windows에서는 iOS 앱을 빌드하거나 설치할 수 없습니다. iOS 테스트는 macOS에서 Xcode와 Apple 개발자 서명 설정을 완료한 뒤 `ios/` 프로젝트를 열어 진행해야 합니다.

## 다음 배포 단계

1. Android Studio에서 `android/`를 열고 앱 아이콘, 서명 키, 패키지 정보를 검토합니다.
2. macOS의 Xcode에서 `ios/App/`를 열고 Team, Bundle Identifier, 아이콘, 권한, 서명을 설정합니다.
3. 실제 iOS/Android 기기에서 온보딩 → 활동 기록 → 레벨업 → 앱 재실행 복구 흐름을 시험합니다.
4. 현재는 로컬 저장만 사용하므로 기기 간 동기화, 로그인, 서버 백업이 필요하면 그 범위를 별도 설계합니다.

스토어용 최종 빌드·서명은 각 플랫폼 SDK와 개발자 계정이 필요합니다. 특히 iOS 아카이브·서명은 macOS/Xcode 환경에서 수행해야 합니다.
