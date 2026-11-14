# Vercel 배포

ACV 는 정적 사이트입니다. 이미지 검수는 방문자의 브라우저에서만 이뤄지고 서버나 별도 API 가 없습니다.

- Vercel 프로젝트의 Root Directory: `frontend`
- Build Command: `npm run build` / Output Directory: `dist` (`frontend/vercel.json`)
- 보안 헤더(CSP 등)와 SPA 라우팅도 `frontend/vercel.json` 에서 관리합니다. 저장소 루트에는 Vercel 설정 파일을 두지 않습니다.
- 환경 변수(선택): `VITE_OTT_URL`(OTT 이동 주소), `VITE_SHOW_OTT=true`(OTT 버튼 표시)
- `main` 브랜치에 푸시하면 자동 배포됩니다.
