# Vercel 배포 가이드

## Vercel 배포 방법

### 1. Vercel CLI 설치
```bash
npm i -g vercel
```

### 2. 프로젝트 배포
```bash
# 프로젝트 루트 디렉토리에서
vercel
```

### 3. 환경변수 설정 (선택사항)
Vercel 대시보드에서 환경변수를 설정할 수 있습니다:
- `DATABASE_PATH`: 데이터베이스 파일 경로 (기본값: `/tmp/inquiries.db`)

## 주요 특징

### ✅ Vercel의 장점
- **Flask 앱 직접 배포**: 서버리스 함수 변환 불필요
- **SQLite 사용 가능**: `/tmp` 디렉토리에 데이터 저장
- **자동 HTTPS**: SSL 인증서 자동 제공
- **글로벌 CDN**: 빠른 로딩 속도
- **무료 플랜**: 월 100GB 대역폭, 1000 함수 실행

### ⚠️ 주의사항
- **임시 데이터**: 서버리스 환경이므로 데이터가 영구 보존되지 않을 수 있음
- **동시 실행 제한**: 여러 사용자가 동시에 접속할 때 파일 충돌 가능성
- **용량 제한**: `/tmp` 디렉토리 용량 제한

## 데이터 지속성 해결방안

### 1. 정기 백업
```bash
# 백업 API 호출
curl -X POST https://your-app.vercel.app/api/backup-database
```

### 2. 외부 데이터베이스 사용 (권장)
대용량 트래픽이 예상되는 경우:
- **MongoDB Atlas**: 무료 클라우드 데이터베이스
- **Supabase**: PostgreSQL 기반 무료 서비스
- **PlanetScale**: MySQL 기반 무료 서비스

## 배포 후 확인사항

1. **메인 페이지**: `https://your-app.vercel.app`
2. **API 테스트**: `https://your-app.vercel.app/api/menu`
3. **문의 기능**: 문의하기 → 문의답변 전체 플로우 테스트

## 문제 해결

### 데이터베이스 오류
- Vercel 함수 로그 확인
- 데이터베이스 파일 권한 확인
- 환경변수 설정 확인

### API 오류
- CORS 설정 확인
- 요청/응답 형식 확인
- 함수 타임아웃 설정 확인 