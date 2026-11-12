#!/bin/bash
# ========================================================
# Ad Creative Validator 실행 스크립트
# ========================================================

set -e

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

echo "========================================================"
echo "🚀 광고 소재 검수 시스템 (Ad Creative Validator) 시작"
echo "========================================================"

# 1. Backend 확인 및 시작
echo ""
echo "[1/2] 백엔드(FastAPI) 설정 및 실행 중..."
cd "$DIR/backend"

if [ ! -d ".venv" ]; then
    echo "가상환경(.venv) 생성 중..."
    python3 -m venv .venv
    source .venv/bin/activate
    python -m pip install -r requirements.txt -q || pip install -r requirements.txt -q
else
    source .venv/bin/activate
fi

# 백엔드 백그라운드 실행
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!
echo "백엔드 실행 완료 (PID: $BACKEND_PID, http://localhost:8000)"

# 2. Frontend 확인 및 시작
echo ""
echo "[2/2] 프론트엔드(React + Vite) 설정 및 실행 중..."
cd "$DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "npm 패키지 설치 중..."
    npm install
fi

# 종료 시 백엔드도 함께 종료하도록 트랩 설정
cleanup() {
    echo ""
    echo "서버를 종료하는 중입니다..."
    kill $BACKEND_PID 2>/dev/null || true
    exit 0
}
trap cleanup SIGINT SIGTERM EXIT

echo "========================================================"
echo "✨ 시스템이 준비되었습니다!"
echo "👉 웹 브라우저에서 아래 주소로 접속하세요:"
echo "   http://localhost:5173"
echo "========================================================"

npm run dev
