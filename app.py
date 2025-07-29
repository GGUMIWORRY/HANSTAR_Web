from flask import Flask, jsonify, request, send_from_directory
from datetime import datetime
import os
import sqlite3
import json
from werkzeug.utils import secure_filename

app = Flask(__name__, static_folder='static', static_url_path='/static')

# 파일 업로드 설정
UPLOAD_FOLDER = os.environ.get('UPLOAD_PATH', '/tmp/uploads')
ALLOWED_EXTENSIONS = {'txt', 'pdf', 'png', 'jpg', 'jpeg', 'gif', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar'}

# 업로드 폴더가 없으면 생성
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER, exist_ok=True)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB 최대 파일 크기

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# CORS 설정 (Vercel 배포를 위해)
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

# SQLite 데이터베이스 파일 경로 (환경변수 또는 기본값)
# Vercel에서는 /tmp 디렉토리만 쓰기 가능
DATABASE_FILE = os.environ.get('DATABASE_PATH', '/tmp/inquiries.db')

def init_database():
    """SQLite 데이터베이스를 초기화합니다."""
    try:
        # Vercel에서는 /tmp 디렉토리가 존재하는지 확인
        db_dir = os.path.dirname(DATABASE_FILE)
        if not os.path.exists(db_dir):
            os.makedirs(db_dir, exist_ok=True)
            
        conn = sqlite3.connect(DATABASE_FILE)
        cursor = conn.cursor()
        
        # 문의 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS inquiries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                serial TEXT NOT NULL,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL,
                password TEXT NOT NULL,
                answer TEXT,
                answer_date TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # 자료 테이블 생성
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS materials (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                description TEXT,
                file_name TEXT NOT NULL,
                file_path TEXT NOT NULL,
                file_size TEXT,
                file_type TEXT,
                category TEXT NOT NULL,
                download_count INTEGER DEFAULT 0,
                is_active BOOLEAN DEFAULT 1,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        print('SQLite 데이터베이스 초기화 완료')
        
    except Exception as e:
        print(f'데이터베이스 초기화 실패: {e}')

# 데이터베이스 연결 함수 (매번 초기화)
def get_db_connection():
    """데이터베이스 연결을 반환합니다."""
    init_database()  # 매번 테이블 존재 확인
    return sqlite3.connect(DATABASE_FILE)

def backup_database():
    """데이터베이스를 백업합니다."""
    try:
        import shutil
        from datetime import datetime
        
        backup_dir = 'backups'
        if not os.path.exists(backup_dir):
            os.makedirs(backup_dir)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_file = f'{backup_dir}/inquiries_backup_{timestamp}.db'
        
        shutil.copy2(DATABASE_FILE, backup_file)
        print(f'데이터베이스 백업 완료: {backup_file}')
        return True
        
    except Exception as e:
        print(f'데이터베이스 백업 실패: {e}')
        return False

@app.route('/api/backup-database', methods=['POST'])
def api_backup_database():
    """데이터베이스 백업 API"""
    try:
        success = backup_database()
        if success:
            return jsonify({'success': True, 'message': '데이터베이스 백업이 완료되었습니다.'})
        else:
            return jsonify({'success': False, 'error': '데이터베이스 백업에 실패했습니다.'}), 500
            
    except Exception as e:
        print(f'백업 API 오류: {e}')
        return jsonify({'success': False, 'error': '백업 처리 중 오류가 발생했습니다.'}), 500

# 구글 API 관련 함수들은 더 이상 사용하지 않음 (정적 데이터로 대체됨)

def get_company_intro_from_sheets():
    """정적 회사소개 데이터를 반환합니다 (구글시트에서 가져온 데이터 기반)."""
    print('정적 회사소개 데이터 사용 (구글시트 연결 없음)')
    return """㈜한스타는 1994년 8월 열정 가득한 젊은이들이 모여'
해상운송 및 국제무역 시장을 선도하는 기업'
'혁신과 자유경쟁을 통한 복합 해양 서비스' 라는
목표로 창립하였습니다.
창립 후 20년이 넘는 기간 동안 꾸준히
극동아시아 및 칠레, 베네수엘라 등 남미 지역으로의
해운 및 무역에 대한 다양한 비즈니스를 실행해 왔습니다.
현재 현대기아그룹과 자원순환 공동 사업자로서
기아 수출용 차량 판매, 수출용 부품 판매 권한 획득
우즈베키스탄 현지에 ㈜한스타 지사 설립 및 
기아자동차 보증수리 자격 획득하고 현지에서서
특장차량 조립 판매 사업 진행 중입니다"""

def get_company_history_from_sheets():
    """정적 회사연혁 데이터를 반환합니다 (구글시트에서 가져온 데이터 기반)."""
    print('정적 회사연혁 데이터 사용 (구글시트 연결 없음)')
    return [
        "1995년07월 : 무역협회(KITA) 가입",
        "1997년10월 : 외항해운대리점면허취득및대리점협회(KOSMA)가입",
        "2007년02월 : '㈜한스타'로상호변경",
        "2008년06월 : 경영혁신형중소기업선정",
        "2013년01월 : 마이크로네시아 폰페이항입출항및통관선박서비스시작",
        "2015년06월 : KP&I 보험가입해난사고선박처리업무시작",
        "2021년08월 : 현대기아자원순환사업시작",
        "2023년08월 : 우즈베키스탄지사설립",
        "2023년02월 : 우즈베키스탄기아조립공장판매차량보증수리계약",
        "2023년08월 : 우즈베키스탄조립차량의특장차사업계약( 예정 )"
    ]

def get_static_menu_data():
    """정적 메뉴 데이터를 반환합니다 (구글시트에서 가져온 데이터 기반)."""
    print('정적 메뉴 데이터 사용')
    return [
        {
            'main': '한스타소개',
            'sub': ['회사소개', '회사연혁']
        },
        {
            'main': '국제운송',
            'sub': ['SCRAP해상운송', '차량및중장비해외배송', '우드펠릿해상운송', '괌주변군도부자재운송']
        },
        {
            'main': '국제무역',
            'sub': ['차량,중장비 및 부품 판매', 'CIS지역 차량정비', 'CIS지역 냉동기특장', '우드펠릿 국내판매', '폰페이섬 통선운영']
        },
        {
            'main': 'CONTACT',
            'sub': ['연락처', '찾아오시는길']
        },
        {
            'main': '문의및답변',
            'sub': ['문의하기', '문의답변', '답변등록']
        },
        {
            'main': '자료배포',
            'sub': ['자료받기', '자료등록']
        }
    ]

def get_menu_data_from_sheets():
    """정적 메뉴 데이터를 반환합니다 (구글시트 연결 없음)."""
    print('정적 메뉴 데이터 사용 (구글시트 연결 없음)')
    return get_static_menu_data()

def get_contact_data_from_sheets():
    """정적 연락처 데이터를 반환합니다 (구글시트에서 가져온 데이터 기반)."""
    print('정적 연락처 데이터 사용 (구글시트 연결 없음)')
    return [
        "회사명           :   ㈜한스타   /    대표이사       :   정용봉",
        "설립일          :  1994년8월",
        "사업분야       :   해운/ 무역/ 원양어업서비스공급/부품재제조",
        "본사              :   인천광역시계양구경명대로1127 (계산동, 제5층제502호)",
        "대표번호       :   +82-32-555-2751   / FACIMILE    :   +82-32-555-2750",
        "E-MAIL       :     hanstarship@daum.net  /    hanstar@hanstar.co",
        "영업대표       :  윤정성(010-2923-8163)"
    ]

def get_program_files_from_drive():
    """정적 프로그램 파일 목록을 반환합니다 (구글 드라이브 연결 없음)."""
    print('정적 프로그램 파일 목록 사용 (구글 드라이브 연결 없음)')
    return [
        {
            'id': 'sample_file_1',
            'name': '무역자료_2024.pdf',
            'mimeType': 'application/pdf',
            'size': '2.5 MB',
            'modifiedTime': '2024-01-15 14:30',
            'downloadUrl': '#'
        },
        {
            'id': 'sample_file_2',
            'name': '운송자료_2024.xlsx',
            'mimeType': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'size': '1.8 MB',
            'modifiedTime': '2024-01-10 09:15',
            'downloadUrl': '#'
        },
        {
            'id': 'sample_file_3',
            'name': '법규자료_2024.docx',
            'mimeType': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'size': '3.2 MB',
            'modifiedTime': '2024-01-05 16:45',
            'downloadUrl': '#'
        }
    ]

@app.route('/')
def index():
    """메인 페이지를 반환합니다."""
    return send_from_directory('static', 'index.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    """정적 파일을 제공합니다."""
    return send_from_directory('static', filename)

@app.route('/api/menu')
def get_menu():
    """메뉴 데이터를 JSON으로 반환합니다."""
    try:
        menu_data = get_menu_data_from_sheets()
        return jsonify({'menu': menu_data})
        
    except Exception as e:
        print(f'메뉴 API 오류: {e}')
        # 오류 발생 시에도 정적 데이터 사용
        menu_data = get_static_menu_data()
        return jsonify({'menu': menu_data})

@app.route('/api/contact')
def get_contact():
    """연락처 데이터를 JSON으로 반환합니다."""
    try:
        contact_data = get_contact_data_from_sheets()
        return jsonify({'contact': contact_data})
        
    except Exception as e:
        print(f'연락처 API 오류: {e}')
        return jsonify({'error': '연락처 데이터를 가져올 수 없습니다.'}), 500

@app.route('/api/company-intro')
def get_company_intro():
    """회사소개 데이터를 JSON으로 반환합니다."""
    try:
        company_intro = get_company_intro_from_sheets()
        return jsonify({'company_intro': company_intro})
        
    except Exception as e:
        print(f'회사소개 API 오류: {e}')
        return jsonify({'error': '회사소개 데이터를 가져올 수 없습니다.'}), 500

@app.route('/api/company-history')
def get_company_history():
    """회사연혁 데이터를 JSON으로 반환합니다."""
    try:
        company_history = get_company_history_from_sheets()
        return jsonify({'company_history': company_history})
        
    except Exception as e:
        print(f'회사연혁 API 오류: {e}')
        return jsonify({'error': '회사연혁 데이터를 가져올 수 없습니다.'}), 500

def save_inquiry_to_database(inquiry_data):
    """문의 데이터를 SQLite 데이터베이스에 저장합니다."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 현재 날짜
        current_date = datetime.now().strftime('%Y-%m-%d')
        
        # 오늘 날짜의 마지막 일련번호 찾기
        cursor.execute('''
            SELECT MAX(CAST(serial AS INTEGER)) 
            FROM inquiries 
            WHERE date = ?
        ''', (current_date,))
        
        result = cursor.fetchone()
        today_serial = 1 if result[0] is None else result[0] + 1
        
        # 일련번호를 2자리로 포맷팅
        serial_number = f"{today_serial:02d}"
        
        # 데이터베이스에 저장
        cursor.execute('''
            INSERT INTO inquiries (date, serial, name, phone, email, message, password)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            current_date,
            serial_number,
            inquiry_data['name'],
            inquiry_data['phone'],
            inquiry_data['email'],
            inquiry_data['message'],
            inquiry_data['password']
        ))
        
        conn.commit()
        conn.close()
        
        print(f'문의 데이터 저장 성공: {serial_number}')
        return True, '문의가 성공적으로 등록되었습니다.'
        
    except Exception as e:
        print(f'문의 데이터 저장 실패: {e}')
        return False, f'문의 데이터 저장 실패: {str(e)}'

@app.route('/api/inquiry', methods=['POST'])
def submit_inquiry():
    """문의 데이터를 받아서 SQLite 데이터베이스에 저장합니다."""
    try:
        data = request.get_json()
        
        # 필수 필드 검증
        required_fields = ['name', 'phone', 'email', 'message', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'success': False, 'error': f'{field} 필드가 필요합니다.'}), 400
        
        # 데이터 저장
        success, message = save_inquiry_to_database(data)
        
        if success:
            return jsonify({'success': True, 'message': message})
        else:
            return jsonify({'success': False, 'error': message}), 500
            
    except Exception as e:
        print(f'문의 제출 처리 실패: {e}')
        return jsonify({'success': False, 'error': '문의 제출 처리 중 오류가 발생했습니다.'}), 500

@app.route('/api/inquiry-list')
def get_inquiry_list():
    """문의 목록을 가져옵니다 (페이지네이션 지원)."""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 페이지 파라미터 가져오기
        page = request.args.get('page', 1, type=int)
        per_page = 15  # 페이지당 15개 항목
        
        # 전체 문의 수 가져오기
        cursor.execute('SELECT COUNT(*) FROM inquiries')
        total_items = cursor.fetchone()[0]
        
        if total_items == 0:
            conn.close()
            return jsonify({
                'inquiries': [],
                'pagination': {
                    'current_page': 1,
                    'total_pages': 0,
                    'total_items': 0,
                    'per_page': per_page
                }
            })
        
        # 페이지네이션 계산
        total_pages = (total_items + per_page - 1) // per_page  # 올림 나눗셈
        
        # 페이지 범위 검증
        if page < 1:
            page = 1
        elif page > total_pages and total_pages > 0:
            page = total_pages
        
        # 현재 페이지 데이터 가져오기
        offset = (page - 1) * per_page
        cursor.execute('''
            SELECT id, date, serial, name, phone, email, message, password, answer, answer_date
            FROM inquiries 
            ORDER BY date DESC, serial DESC
            LIMIT ? OFFSET ?
        ''', (per_page, offset))
        
        rows = cursor.fetchall()
        conn.close()
        
        # 데이터 포맷팅
        inquiry_data = []
        for row in rows:
            inquiry_data.append({
                'row_id': row[0],  # id
                'date': row[1],
                'serial': row[2],
                'name': row[3],
                'phone': row[4],
                'email': row[5],
                'question': row[6],
                'password': row[7],
                'answer': row[8] if row[8] else '',
                'answer_date': row[9] if row[9] else ''
            })
        
        return jsonify({
            'inquiries': inquiry_data,
            'pagination': {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items,
                'per_page': per_page
            }
        })
        
    except Exception as e:
        print(f'문의 목록 가져오기 실패: {e}')
        return jsonify({'error': '문의 목록을 가져올 수 없습니다.'}), 500

@app.route('/api/verify-inquiry', methods=['POST'])
def verify_inquiry():
    """문의 비밀번호를 확인하고 답변을 반환합니다."""
    try:
        data = request.get_json()
        inquiry_id = data.get('row_id')
        password = data.get('password')
        
        if not inquiry_id or not password:
            return jsonify({'success': False, 'error': '문의 ID와 비밀번호가 필요합니다.'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 해당 문의 데이터 가져오기
        cursor.execute('''
            SELECT id, date, serial, name, phone, email, message, password, answer, answer_date
            FROM inquiries 
            WHERE id = ?
        ''', (inquiry_id,))
        
        row = cursor.fetchone()
        conn.close()
        
        if not row:
            return jsonify({'success': False, 'error': '해당 문의를 찾을 수 없습니다.'}), 404
        
        # 비밀번호 확인
        if row[7] != password:
            return jsonify({'success': False, 'error': '비밀번호가 일치하지 않습니다.'}), 401
        
        inquiry_info = {
            'date': row[1],
            'serial': row[2],
            'name': row[3],
            'phone': row[4],
            'email': row[5],
            'question': row[6],
            'answer_content': row[8] if row[8] else '아직 답변이 등록되지 않았습니다.',
            'answer_status': '답변완료' if row[8] else '대기중'
        }
        
        return jsonify({'success': True, 'inquiry': inquiry_info})
        
    except Exception as e:
        print(f'문의 확인 실패: {e}')
        return jsonify({'success': False, 'error': '문의 확인 중 오류가 발생했습니다.'}), 500

@app.route('/api/program-files')
def get_program_files():
    """구글 드라이브의 Program 폴더에서 파일 목록을 가져옵니다."""
    try:
        files = get_program_files_from_drive()
        
        if files is None:
            return jsonify({'error': '파일 목록을 가져올 수 없습니다.'}), 500
        
        return jsonify({'files': files})
        
    except Exception as e:
        print(f'Program 파일 목록 API 오류: {e}')
        return jsonify({'error': '파일 목록을 가져오는 중 오류가 발생했습니다.'}), 500

# 관리자 인증 함수
def verify_admin_password(password):
    """관리자 비밀번호를 확인합니다."""
    return password == "hanstar"

@app.route('/api/admin/inquiry-list', methods=['POST'])
def admin_get_inquiry_list():
    """관리자용 문의 목록을 가져옵니다 (15개씩 페이지네이션)."""
    try:
        data = request.get_json()
        admin_password = data.get('admin_password')
        page = int(data.get('page', 1))
        per_page = 15
        
        if not verify_admin_password(admin_password):
            return jsonify({'success': False, 'error': '관리자 인증에 실패했습니다.'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 전체 문의 수 계산
        cursor.execute('SELECT COUNT(*) FROM inquiries')
        total_items = cursor.fetchone()[0]
        total_pages = (total_items + per_page - 1) // per_page
        
        # 페이지네이션된 문의 목록 가져오기
        offset = (page - 1) * per_page
        cursor.execute('''
            SELECT id, date, serial, name, phone, email, message, answer, answer_date
            FROM inquiries 
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ''', (per_page, offset))
        
        rows = cursor.fetchall()
        conn.close()
        
        # 데이터 포맷팅
        inquiry_data = []
        for row in rows:
            inquiry_data.append({
                'id': row[0],
                'date': row[1],
                'serial': row[2],
                'name': row[3],
                'phone': row[4],
                'email': row[5],
                'question': row[6],
                'answer': row[7] if row[7] else '',
                'answer_date': row[8] if row[8] else '',
                'status': '답변완료' if row[7] else '대기중'
            })
        
        return jsonify({
            'success': True,
            'inquiries': inquiry_data,
            'pagination': {
                'current_page': page,
                'total_pages': total_pages,
                'total_items': total_items,
                'per_page': per_page
            }
        })
        
    except Exception as e:
        print(f'관리자 문의 목록 가져오기 실패: {e}')
        return jsonify({'success': False, 'error': '문의 목록을 가져올 수 없습니다.'}), 500

@app.route('/api/admin/add-answer', methods=['POST'])
def admin_add_answer():
    """관리자가 문의에 답변을 등록합니다."""
    try:
        data = request.get_json()
        admin_password = data.get('admin_password')
        inquiry_id = data.get('inquiry_id')
        answer_content = data.get('answer_content')
        
        if not verify_admin_password(admin_password):
            return jsonify({'success': False, 'error': '관리자 인증에 실패했습니다.'}), 401
        
        if not inquiry_id or not answer_content:
            return jsonify({'success': False, 'error': '문의 ID와 답변 내용이 필요합니다.'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 답변 업데이트
        answer_date = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        cursor.execute('''
            UPDATE inquiries 
            SET answer = ?, answer_date = ?
            WHERE id = ?
        ''', (answer_content, answer_date, inquiry_id))
        
        if cursor.rowcount == 0:
            conn.close()
            return jsonify({'success': False, 'error': '해당 문의를 찾을 수 없습니다.'}), 404
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True, 
            'message': '답변이 성공적으로 등록되었습니다.',
            'answer_date': answer_date
        })
        
    except Exception as e:
        print(f'답변 등록 실패: {e}')
        return jsonify({'success': False, 'error': '답변 등록 중 오류가 발생했습니다.'}), 500

# 자료 관리 API
@app.route('/api/admin/materials', methods=['GET', 'POST'])
def admin_materials():
    """관리자용 자료 목록 조회 및 등록"""
    try:
        if request.method == 'GET':
            # 자료 목록 조회
            conn = get_db_connection()
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, title, description, file_name, file_size, file_type, category, 
                       download_count, is_active, created_at
                FROM materials 
                ORDER BY created_at DESC
            ''')
            
            rows = cursor.fetchall()
            conn.close()
            
            materials = []
            for row in rows:
                materials.append({
                    'id': row[0],
                    'title': row[1],
                    'description': row[2],
                    'file_name': row[3],
                    'file_size': row[4],
                    'file_type': row[5],
                    'category': row[6],
                    'download_count': row[7],
                    'is_active': bool(row[8]),
                    'created_at': row[9]
                })
            
            return jsonify({'success': True, 'materials': materials})
            
        elif request.method == 'POST':
            # 새 자료 등록 (파일 업로드 포함)
            try:
                admin_password = request.form.get('admin_password')
                
                if not verify_admin_password(admin_password):
                    return jsonify({'success': False, 'error': '관리자 인증에 실패했습니다.'}), 401
                
                title = request.form.get('title')
                description = request.form.get('description', '')
                category = request.form.get('category', '기타')
                
                if not title:
                    return jsonify({'success': False, 'error': '제목은 필수입니다.'}), 400
                
                # 파일 업로드 처리
                if 'file' not in request.files:
                    return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다.'}), 400
                
                file = request.files['file']
                if file.filename == '':
                    return jsonify({'success': False, 'error': '파일이 선택되지 않았습니다.'}), 400
                
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    
                    # 파일명 중복 방지
                    base_name = filename.rsplit('.', 1)[0]
                    extension = filename.rsplit('.', 1)[1]
                    counter = 1
                    original_filename = filename
                    
                    while os.path.exists(os.path.join(app.config['UPLOAD_FOLDER'], filename)):
                        filename = f"{base_name}_{counter}.{extension}"
                        counter += 1
                    
                    # 파일 저장
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                    file.save(file_path)
                    
                    # 파일 정보 추출
                    file_size = os.path.getsize(file_path)
                    file_size_str = f"{file_size / (1024*1024):.1f} MB" if file_size > 1024*1024 else f"{file_size / 1024:.1f} KB"
                    file_type = file.content_type or 'application/octet-stream'
                    
                    # 데이터베이스에 저장
                    conn = get_db_connection()
                    cursor = conn.cursor()
                    
                    cursor.execute('''
                        INSERT INTO materials (title, description, file_name, file_path, file_size, file_type, category)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    ''', (title, description, original_filename, f'/tmp/uploads/{filename}', file_size_str, file_type, category))
                    
                    conn.commit()
                    conn.close()
                    
                    return jsonify({
                        'success': True, 
                        'message': '자료가 성공적으로 등록되었습니다.',
                        'file_info': {
                            'original_name': original_filename,
                            'saved_name': filename,
                            'size': file_size_str,
                            'type': file_type
                        }
                    })
                else:
                    return jsonify({'success': False, 'error': '허용되지 않는 파일 형식입니다.'}), 400
                    
            except Exception as e:
                print(f'파일 업로드 오류: {e}')
                return jsonify({'success': False, 'error': '파일 업로드 중 오류가 발생했습니다.'}), 500
            
    except Exception as e:
        print(f'자료 관리 API 오류: {e}')
        return jsonify({'success': False, 'error': '자료 관리 중 오류가 발생했습니다.'}), 500

@app.route('/api/materials', methods=['GET'])
def get_materials():
    """사용자용 자료 목록 조회"""
    try:
        category = request.args.get('category', '')
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if category:
            cursor.execute('''
                SELECT id, title, description, file_name, file_size, file_type, category, download_count, created_at
                FROM materials 
                WHERE category = ? AND is_active = 1
                ORDER BY created_at DESC
            ''', (category,))
        else:
            cursor.execute('''
                SELECT id, title, description, file_name, file_size, file_type, category, download_count, created_at
                FROM materials 
                WHERE is_active = 1
                ORDER BY created_at DESC
            ''')
        
        rows = cursor.fetchall()
        conn.close()
        
        materials = []
        for row in rows:
            materials.append({
                'id': row[0],
                'title': row[1],
                'description': row[2],
                'file_name': row[3],
                'file_size': row[4],
                'file_type': row[5],
                'category': row[6],
                'download_count': row[7],
                'created_at': row[8]
            })
        
        return jsonify({'success': True, 'materials': materials})
        
    except Exception as e:
        print(f'자료 목록 조회 오류: {e}')
        return jsonify({'success': False, 'error': '자료 목록을 가져올 수 없습니다.'}), 500

@app.route('/api/materials/<int:material_id>/download', methods=['GET', 'POST'])
def download_material(material_id):
    """자료 다운로드 (다운로드 카운트 증가)"""
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        
        # 자료 정보 가져오기
        cursor.execute('''
            SELECT file_path, file_name
            FROM materials 
            WHERE id = ? AND is_active = 1
        ''', (material_id,))
        
        row = cursor.fetchone()
        
        if not row:
            conn.close()
            return jsonify({'success': False, 'error': '자료를 찾을 수 없습니다.'}), 404
        
        file_path = row[0]
        file_name = row[1]
        
        # POST 요청일 때만 다운로드 카운트 증가
        if request.method == 'POST':
            cursor.execute('''
                UPDATE materials 
                SET download_count = download_count + 1
                WHERE id = ?
            ''', (material_id,))
            conn.commit()
        
        conn.close()
        
        # 실제 파일 경로로 변환
        if file_path.startswith('/static/uploads/'):
            actual_path = file_path.replace('/static/uploads/', '')
            return send_from_directory(app.config['UPLOAD_FOLDER'], actual_path, as_attachment=True, download_name=file_name)
        elif file_path.startswith('/tmp/uploads/'):
            actual_path = file_path.replace('/tmp/uploads/', '')
            return send_from_directory(app.config['UPLOAD_FOLDER'], actual_path, as_attachment=True, download_name=file_name)
        else:
            return jsonify({'success': False, 'error': '파일 경로가 올바르지 않습니다.'}), 404
        
    except Exception as e:
        print(f'자료 다운로드 오류: {e}')
        return jsonify({'success': False, 'error': '다운로드 처리 중 오류가 발생했습니다.'}), 500

@app.route('/api/admin/materials/<int:material_id>', methods=['PUT', 'DELETE'])
def admin_material_management(material_id):
    """관리자용 자료 수정 및 삭제"""
    try:
        data = request.get_json()
        admin_password = data.get('admin_password')
        
        if not verify_admin_password(admin_password):
            return jsonify({'success': False, 'error': '관리자 인증에 실패했습니다.'}), 401
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        if request.method == 'PUT':
            # 자료 수정
            title = data.get('title')
            description = data.get('description', '')
            category = data.get('category', '기타')
            is_active = data.get('is_active', True)
            
            if not title:
                return jsonify({'success': False, 'error': '제목은 필수입니다.'}), 400
            
            cursor.execute('''
                UPDATE materials 
                SET title = ?, description = ?, category = ?, is_active = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            ''', (title, description, category, is_active, material_id))
            
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({'success': False, 'error': '자료를 찾을 수 없습니다.'}), 404
            
            message = '자료가 성공적으로 수정되었습니다.'
            
        elif request.method == 'DELETE':
            # 자료 삭제
            cursor.execute('DELETE FROM materials WHERE id = ?', (material_id,))
            
            if cursor.rowcount == 0:
                conn.close()
                return jsonify({'success': False, 'error': '자료를 찾을 수 없습니다.'}), 404
            
            message = '자료가 성공적으로 삭제되었습니다.'
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': message})
        
    except Exception as e:
        print(f'자료 관리 오류: {e}')
        return jsonify({'success': False, 'error': '자료 관리 중 오류가 발생했습니다.'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

# Vercel 배포를 위한 app 객체 export
app.debug = False 