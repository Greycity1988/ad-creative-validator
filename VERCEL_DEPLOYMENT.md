# 🚀 Vercel 프론트엔드 무료 배포 가이드 (월 비용 0원)

본 프로젝트는 Vercel의 무료 플랜(Hobby Tier)과 Render의 무료 백엔드 플랜을 연동하여 **월 유지비 0원(₩0)**으로 완벽한 실서비스 웹사이트를 운영할 수 있도록 구성되어 있습니다.

---

## 🌟 배포 구성 아키텍처

- **프론트엔드**: **Vercel** (글로벌 엣지 CDN, SSL 자동 발급, 무료 커스텀 도메인 지원, 100% 무료)
- **백엔드 (API)**: **Render.com** (Python FastAPI 무료 웹 서비스 티어, 월 750시간 무료)
- **총 유지비**: **0원**

---

## 📌 방법 1. Vercel 웹 대시보드 1클릭 배포 (가장 추천)

### 1단계: GitHub 저장소 만들기
1. [GitHub](https://github.com)에 로그인하고 새 저장소(New Repository)를 생성합니다. (예: `ad-creative-validator`)
2. 로컬 터미널에서 아래 명령어로 GitHub에 코드를 푸시합니다:
   ```bash
   cd ~/Downloads/ad-creative-validator
   git remote add origin https://github.com/<본인-깃허브-아이디>/ad-creative-validator.git
   git branch -M main
   git push -u origin main
   ```

### 2단계: Vercel에서 프로젝트 가져오기
1. [Vercel](https://vercel.com)에 접속하여 GitHub 계정으로 로그인합니다.
2. 우측 상단의 **[Add New...]** → **[Project]**를 클릭합니다.
3. 방금 푸시한 `ad-creative-validator` 저장소 옆의 **[Import]** 버튼을 클릭합니다.
4. 설정 화면에서:
   - **Framework Preset**: `Vite` (자동 감지됨)
   - **Root Directory**: `./frontend` (또는 기본값 `./`)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **[Deploy]** 버튼을 클릭하면 약 1분 만에 배포가 완료되며, `https://ad-creative-validator-xxx.vercel.app` 형태의 고유 URL이 발급됩니다!

---

## 📌 방법 2. 터미널 Vercel CLI로 즉시 배포하기

터미널에서 직접 배포하고 싶다면 아래 명령어를 실행하면 됩니다:

```bash
cd ~/Downloads/ad-creative-validator/frontend
npx vercel
```
1. Vercel 로그인 요청 시 이메일 또는 GitHub 인증 진행
2. `Set up and deploy?`: `y`
3. `Which scope?`: 본인 계정 선택
4. `Link to existing project?`: `n`
5. `Project name`: 엔터
6. `Directory`: 엔터
7. 배포 완료 후 즉시 접속 가능한 프로덕션 URL 출력!

---

## 🌐 무료 백엔드 API 서버 (Render.com) 연결

프론트엔드가 실제 광고 규격 검수 및 OCR 분석을 수행하려면 백엔드 API 주소가 필요합니다.

### 1단계: Render.com에서 백엔드 무료 배포
1. [Render.com](https://render.com)에 로그인합니다.
2. **[New +]** → **[Web Service]**를 클릭하고 동일한 GitHub 저장소를 연결합니다.
3. 설정값 입력:
   - **Name**: `ad-creative-validator-api`
   - **Region**: `Singapore (Southeast Asia)` (한국과 가장 가까워 빠름)
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r backend/requirements.txt`
   - **Start Command**: `cd backend && python -m uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Instance Type**: **Free (무료)** 선택
4. **[Create Web Service]**를 클릭하면 `https://ad-creative-validator-api.onrender.com` 주소가 생성됩니다.

### 2단계: Vercel 환경 변수에 백엔드 주소 등록
1. Vercel 대시보드 → 해당 프로젝트의 **[Settings]** → **[Environment Variables]** 이동
2. 환경 변수 추가:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://ad-creative-validator-api.onrender.com/api`
3. 저장 후 **[Deployments]** 탭에서 최신 버전을 **Redeploy**하면 프론트엔드와 백엔드가 완전히 연동됩니다!

---

## 💡 유용한 팁
- **커스텀 도메인 무료 연결**: 추후 `myadtool.com` 같은 개인 도메인을 구매하신 경우, Vercel 대시보드의 **[Settings] → [Domains]**에서 도메인을 추가하면 무료로 HTTPS 보안 인증서까지 자동 발급됩니다.
- **코드 수정 시 자동 배포**: GitHub에 코드를 `git push`할 때마다 Vercel이 변경 사항을 감지하여 자동으로 무중단 재배포를 수행합니다.
