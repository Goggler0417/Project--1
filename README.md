# Tagmark — multi-device version

## 포함 기능
- 이메일 로그인/가입용 Supabase Auth 연동 코드
- Supabase PostgreSQL DB
- 기기별 IndexedDB 로컬 캐시
- 로그인 후 클라우드 pull/push
- 태그 AND / OR 검색
- URL 중복 감지 및 DB unique index
- PWA
- 오프라인에서 로컬 목록 열람

## 설치
1. Supabase 프로젝트 생성
2. SQL Editor에서 `supabase.sql` 실행
3. Supabase Project URL과 anon key를 `config.js`에 입력
4. 정적 호스팅에 전체 파일 업로드
5. `https://app.도메인.com`으로 연결
6. iPhone/iPad/Mac Safari에서 홈 화면에 추가

## 중요한 점
현재 코드는 동기화의 기본 골격을 제공하는 프로토타입입니다. 실사용 배포 전에는 자동 새로고침/실시간 subscription, 삭제 tombstone, 충돌 해결(last-write-wins), 이메일 인증/비밀번호 재설정 UI, URL 정규화 정책 등을 추가하는 것이 좋습니다.

수천~수만 개까지 고려한다면 서버에서 전체 목록을 매번 가져오지 않고 cursor/pagination + 클라이언트 검색 인덱스(예: MiniSearch/FlexSearch)를 사용하는 방향이 좋습니다.
