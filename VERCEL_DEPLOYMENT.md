# Vercel 배포

ACV 는 정적 사이트입니다. 이미지 검수는 방문자의 브라우저에서만 이뤄집니다. 서버 기능은 규격 제보를 GitHub 이슈로 옮기는 `frontend/api/spec-report.ts` 하나뿐이고, 소재 파일은 받지 않습니다.

- Vercel 프로젝트의 Root Directory: `frontend`
- Build Command: `npm run build` / Output Directory: `dist` (`frontend/vercel.json`)
- 보안 헤더(CSP 등)와 SPA 라우팅도 `frontend/vercel.json` 에서 관리합니다. 저장소 루트에는 Vercel 설정 파일을 두지 않습니다.
- 환경 변수(선택): `VITE_OTT_URL` 등 스위트 앱 주소(`frontend/src/constants/links.ts`)
- 환경 변수 `GITHUB_REPORT_TOKEN`: 규격 제보를 이슈로 올릴 때 씁니다. 없으면 제보 양식이 "GitHub에서 직접 제보" 링크로 대신합니다.
  1. GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
  2. Repository access: `ad-creative-validator`만, Permissions: **Issues: Read and write**만
  3. Vercel 프로젝트 → Settings → Environment Variables에 `GITHUB_REPORT_TOKEN`으로 넣고(Production) 다시 배포
- 자동 점검이 PR을 열려면 GitHub 저장소 Settings → Actions → General → Workflow permissions에서 **"Allow GitHub Actions to create and approve pull requests"**를 켭니다.
- `main` 브랜치에 푸시하면 자동 배포됩니다.
