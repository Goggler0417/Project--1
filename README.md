# Tagmark v2.3 — Supabase single-file sync

## 구조
- IndexedDB: 기기에서 즉시 읽기/쓰기
- Supabase: 사용자당 고정 레코드 1개 (`tagmark_main`)
- Realtime: 다른 기기의 변경을 수신
- 인증: Supabase Email/Password

## 설정
1. Supabase 프로젝트를 만든다.
2. SQL Editor에서 `supabase-tagmark.sql`을 실행한다.
3. Supabase Authentication에서 Email provider를 활성화한다.
4. `index.html`의 `SUPABASE_URL`과 `SUPABASE_PUBLISHABLE_KEY`를 프로젝트 값으로 교체한다.
5. GitHub Pages에 `index.html`을 올린다.

## 동작
- 북마크/태그/카테고리 변경 → IndexedDB에 즉시 반영 → 약 0.7초 후 고정 cloud record에 upsert.
- 다른 기기는 Realtime UPDATE를 받으면 로컬 IndexedDB를 클라우드 데이터로 교체한다.
- 인터넷이 끊겨 있으면 로컬 데이터는 계속 사용된다. 인터넷 복구 후 다음 변경 또는 수동 업로드로 클라우드에 반영된다.
- 첫 로그인 후 클라우드 파일이 있으면 현재 기기에 가져올지 확인한다.

## 주의
이 버전은 사용자가 요청한 “고정된 파일 하나” 모델이다. 데이터가 커질수록 한 번의 변경에 전체 JSON이 전송되므로, 수천~수만 개로 커지면 북마크/태그/카테고리를 별도 row로 나누는 방식이 더 효율적이다.

브라우저에 넣는 것은 Supabase Publishable Key뿐이어야 하며 `service_role`/secret key는 넣지 않는다.
