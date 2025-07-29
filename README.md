# 한스타 홈페이지

한스타 회사의 공식 홈페이지입니다. HTML, CSS, JavaScript, Python Flask를 사용하여 구축되었으며, 모든 데이터는 정적 데이터와 SQLite 데이터베이스로 관리됩니다.

## 주요 기능

- 반응형 웹 디자인
- 고정 헤더 네비게이션
- 정적 데이터 기반 메뉴 시스템
- 드롭다운 서브메뉴
- 모던한 UI/UX

## 프로젝트 구조

```
HANSTAR_Home/
├── app.py                 # Flask 애플리케이션
├── index.html            # 메인 HTML 파일
├── requirements.txt      # Python 패키지 의존성
├── README.md            # 프로젝트 설명서
├── json/
│   └── extensions.json     # 확장 설정 파일
└── static/
    ├── style.css         # CSS 스타일시트
    ├── script.js         # JavaScript 파일
    ├── hanstar_log.PNG   # 로고 이미지
    └── back_ground/      # 배경 이미지들
```

## 설치 및 실행

### 1. Python 패키지 설치

```bash
pip install -r requirements.txt
```

### 2. 데이터베이스 설정

SQLite 데이터베이스가 자동으로 생성됩니다. 별도의 설정이 필요하지 않습니다.

### 3. 정적 데이터 관리

모든 메뉴 데이터와 콘텐츠는 `app.py` 파일 내의 정적 데이터로 관리됩니다:
- 메뉴 데이터: `get_static_menu_data()` 함수
- 회사소개: `get_company_intro_from_sheets()` 함수
- 회사연혁: `get_company_history_from_sheets()` 함수
- 연락처: `get_contact_data_from_sheets()` 함수
- 프로그램 파일: `get_program_files_from_drive()` 함수

### 5. 애플리케이션 실행

```bash
python app.py
```

브라우저에서 `http://localhost:5000`으로 접속하세요.

## 현재 메뉴 구조

- **한스타소개**: 회사소개, 회사연혁
- **국제운송**: SCRAP해상운송, 차량및중장비해외배송, 우드펠릿해상운송, 괌주변군도부자재운송
- **국제무역**: 차량,중장비 및 부품 판매, CIS지역 차량정비, CIS지역 냉동기특장, 우드펠릿 국내판매, 폰페이섬 통선운영
- **CONTACT**: 연락처, 찾아오시는길
- **문의및답변**: 문의하기
- **자료배포**: 자료받기

## 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Python Flask
- **데이터베이스**: SQLite
- **스타일링**: CSS Grid, Flexbox, CSS Variables
- **폰트**: Google Fonts (Noto Sans KR)

## 브라우저 지원

- Chrome (최신 버전)
- Firefox (최신 버전)
- Safari (최신 버전)
- Edge (최신 버전)

## 라이선스

이 프로젝트는 한스타 회사의 내부 사용을 위한 것입니다.

## 문의

개발 관련 문의사항이 있으시면 개발팀에 연락해 주세요. 