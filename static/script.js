// 구글 시트에서 메뉴 데이터를 가져와서 네비게이션 메뉴를 동적으로 생성
class MenuManager {
    constructor() {
        this.menuData = [];
        this.init();
        this.initMobileMenu();
    }

    initMobileMenu() {
        // 모바일 메뉴 토글 버튼 이벤트
        const mobileMenuToggle = document.getElementById('mobileMenuToggle');
        const navMenu = document.getElementById('navMenu');
        
        if (mobileMenuToggle && navMenu) {
            mobileMenuToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                // 햄버거 메뉴 아이콘 변경
                mobileMenuToggle.textContent = navMenu.classList.contains('active') ? '✕' : '☰';
            });
            
            // 메뉴 외부 클릭 시 메뉴 닫기
            document.addEventListener('click', (e) => {
                if (!navMenu.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileMenuToggle.textContent = '☰';
                }
            });
            
            // 서브메뉴 토글 기능 (모바일용)
            navMenu.addEventListener('click', (e) => {
                if (e.target.tagName === 'A' && e.target.parentElement.querySelector('.submenu')) {
                    e.preventDefault();
                    const parentLi = e.target.parentElement;
                    parentLi.classList.toggle('active');
                }
            });
        }
    }

    async init() {
        try {
            await this.loadMenuData();
            this.renderMenu();
        } catch (error) {
            console.error('메뉴 데이터 로딩 실패:', error);
            this.loadDefaultMenu();
        }
    }

    async loadMenuData() {
        try {
            console.log('메뉴 데이터 로딩 시작...');
            // Python Flask API에서 메뉴 데이터를 가져옴
            const response = await fetch('/api/menu');
            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status}`);
            }
            const data = await response.json();
            this.menuData = data.menu || data; // API 응답 구조에 맞게 수정
            console.log('구글 시트에서 가져온 메뉴 데이터:', this.menuData);
        } catch (error) {
            console.error('API 호출 실패:', error);
            throw error;
        }
    }

    loadDefaultMenu() {
        // 기본 메뉴 데이터 (API 실패 시 사용)
        this.menuData = [
            {
                main: 'HOME',
                sub: []
            },
            {
                main: 'ABOUT',
                sub: ['회사소개', '연혁', '조직도']
            },
            {
                main: 'SERVICES',
                sub: ['서비스1', '서비스2', '서비스3']
            },
            {
                main: 'CONTACT',
                sub: ['연락처', '찾아오시는길']
            },
            {
                main: '문의및답변',
                sub: ['문의하기', '문의답변']
            },
            {
                main: '자료배포',
                sub: ['무역자료', '운송자료', '법규자료']
            }
        ];
    }

    renderMenu() {
        const navMenu = document.getElementById('navMenu');
        if (!navMenu) {
            console.error('navMenu 요소를 찾을 수 없습니다.');
            return;
        }

        console.log('메뉴 렌더링 시작...');
        navMenu.innerHTML = '';

        this.menuData.forEach(menuItem => {
            console.log(`메뉴 아이템 렌더링: ${menuItem.main} (서브메뉴: ${menuItem.sub.length}개)`);
            const li = document.createElement('li');
            
            // 메인 메뉴 링크 생성
            const mainLink = document.createElement('a');
            mainLink.href = '#';
            mainLink.textContent = menuItem.main;
            mainLink.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleMenuClick(menuItem.main);
            });

            li.appendChild(mainLink);

            // 서브메뉴가 있는 경우 생성
            if (menuItem.sub && menuItem.sub.length > 0) {
                const submenu = document.createElement('ul');
                submenu.className = 'submenu';

                menuItem.sub.forEach(subItem => {
                    const subLi = document.createElement('li');
                    const subLink = document.createElement('a');
                    subLink.href = '#';
                    subLink.textContent = subItem;
                    subLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        this.handleSubMenuClick(menuItem.main, subItem);
                    });

                    subLi.appendChild(subLink);
                    submenu.appendChild(subLi);
                });

                li.appendChild(submenu);
            }

            navMenu.appendChild(li);
        });
    }

    handleMenuClick(menuName) {
        console.log('메인 메뉴 클릭:', menuName);
        // 여기에 메뉴 클릭 시 처리 로직 추가
        // 예: 페이지 이동, 모달 표시 등
    }

                handleSubMenuClick(mainMenu, subMenu) {
        console.log('서브 메뉴 클릭:', mainMenu, '>', subMenu);
        
        // 한스타소개 > 회사소개 클릭 시 회사소개 모달 표시
        if (mainMenu === '한스타소개' && subMenu === '회사소개') {
            this.showCompanyIntroModal();
        }
        // 한스타소개 > 회사연혁 클릭 시 회사연혁 모달 표시
        else if (mainMenu === '한스타소개' && subMenu === '회사연혁') {
            this.showCompanyHistoryModal();
        }
        // CONTACT > 연락처 클릭 시 모달 표시
        else if (mainMenu === 'CONTACT' && subMenu === '연락처') {
            this.showContactModal();
        }
        // CONTACT > 찾아오시는길 클릭 시 지도 모달 표시
        else if (mainMenu === 'CONTACT' && subMenu === '찾아오시는길') {
            this.showDirectionsModal();
        }
        // 문의및답변 > 문의하기 클릭 시 문의 폼 모달 표시
        else if (mainMenu === '문의및답변' && subMenu === '문의하기') {
            this.showInquiryModal();
        }
        // 문의및답변 > 문의답변 클릭 시 문의 목록 모달 표시
        else if (mainMenu === '문의및답변' && subMenu === '문의답변') {
            this.showInquiryListModal();
        }
        // 문의및답변 > 답변등록 클릭 시 관리자 모달 표시
        else if (mainMenu === '문의및답변' && subMenu === '답변등록') {
            this.showAdminInquiryModal();
        }
        // 자료배포 > 자료받기 클릭 시 자료 목록 모달 표시
        else if (mainMenu === '자료배포' && subMenu === '자료받기') {
            this.showMaterialsModal();
        }
        // 자료배포 > 자료등록 클릭 시 관리자 자료 등록 모달 표시
        else if (mainMenu === '자료배포' && subMenu === '자료등록') {
            this.showAdminMaterialsModal();
        }
        // 여기에 다른 서브메뉴 클릭 시 처리 로직 추가
    }

    async showCompanyIntroModal() {
        try {
            console.log('회사소개 모달 표시 시작...');
            const response = await fetch('/api/company-intro');
            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status}`);
            }
            const data = await response.json();
            console.log('회사소개 데이터:', data);
            
            this.createCompanyIntroModal(data.company_intro);
        } catch (error) {
            console.error('회사소개 데이터 로딩 실패:', error);
            // 기본 회사소개 데이터로 모달 표시
            const defaultIntro = `
                한스타 주식회사는 국제운송과 무역의 전문기업입니다.
                
                우리는 1995년 설립 이후 30년간 국제물류 분야에서 축적된 노하우와 
                글로벌 네트워크를 바탕으로 고객의 비즈니스 성공을 위한 
                최적의 솔루션을 제공하고 있습니다.
                
                주요 사업영역:
                • 해상운송: 전 세계 주요 항구 연결
                • 항공운송: 긴급 화물 및 고가치 상품 운송
                • 육상운송: 국내외 육상 물류 서비스
                • 무역중개: 수출입 대행 및 무역상담
                
                한스타는 고객의 신뢰를 최우선으로 하며, 
                지속적인 혁신과 서비스 개선을 통해 
                글로벌 물류 파트너로서의 역할을 다하고 있습니다.
            `;
            this.createCompanyIntroModal(defaultIntro);
        }
    }

    async showCompanyHistoryModal() {
        try {
            console.log('회사연혁 모달 표시 시작...');
            const response = await fetch('/api/company-history');
            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status}`);
            }
            const data = await response.json();
            console.log('회사연혁 데이터:', data);
            
            this.createCompanyHistoryModal(data.company_history);
        } catch (error) {
            console.error('회사연혁 데이터 로딩 실패:', error);
            // 기본 회사연혁 데이터로 모달 표시
            const defaultHistory = [
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
            ];
            this.createCompanyHistoryModal(defaultHistory);
        }
    }

    async showContactModal() {
        try {
            console.log('연락처 모달 표시 시작...');
            const response = await fetch('/api/contact');
            if (!response.ok) {
                throw new Error(`API 응답 오류: ${response.status}`);
            }
            const data = await response.json();
            console.log('연락처 데이터:', data);
            
            this.createContactModal(data.contact);
        } catch (error) {
            console.error('연락처 데이터 로딩 실패:', error);
            // 기본 연락처 데이터로 모달 표시
            const defaultContact = [
                '한스타 주식회사',
                '대표이사: 홍길동',
                '사업자등록번호: 123-45-67890',
                '주소: 서울특별시 강남구 테헤란로 123',
                '전화: 02-1234-5678',
                '팩스: 02-1234-5679',
                '이메일: info@hanstar.co.kr',
                '홈페이지: www.hanstar.co.kr'
            ];
            this.createContactModal(defaultContact);
        }
    }

            createContactModal(contactData) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('contactModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'contactModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>연락처 정보</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="contact-info">
                            ${contactData.map(item => `<p class="contact-item">${item}</p>`).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        createCompanyIntroModal(introData) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('companyIntroModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'companyIntroModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>회사소개</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="company-intro-content">
                            ${introData.split('\n').map(line => 
                                line.trim() ? `<p class="intro-line">${line}</p>` : '<br>'
                            ).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        createCompanyHistoryModal(historyData) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('companyHistoryModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'companyHistoryModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>회사연혁</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="company-history-content">
                            ${historyData.map(item => `<p class="history-item">${item}</p>`).join('')}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        showDirectionsModal() {
            const address = "인천광역시계양구경명대로1127 (계산동, 제5층제502호)";
            const encodedAddress = encodeURIComponent(address);
            
            // Google Maps URL
            const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodedAddress}`;
            // Naver Maps URL
            const naverMapsUrl = `https://map.naver.com/p/search/${encodedAddress}`;
            
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('directionsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'directionsModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>찾아오시는 길</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="directions-info">
                            <p class="address-info">${address}</p>
                            <div class="map-buttons">
                                <a href="${googleMapsUrl}" target="_blank" class="map-btn google-maps">
                                    <span class="map-icon">🗺️</span>
                                    <span class="map-text">Google Maps</span>
                                </a>
                                <a href="${naverMapsUrl}" target="_blank" class="map-btn naver-maps">
                                    <span class="map-icon">📍</span>
                                    <span class="map-text">Naver Maps</span>
                                </a>
                            </div>
                            
                            <div class="transportation-info">
                                <h3 class="transportation-title">교통편 안내</h3>
                                
                                <div class="transport-item">
                                    <div class="transport-icon">🚇</div>
                                    <div class="transport-content">
                                        <h4>지하철</h4>
                                        <p>인천 1호선 계산역 6번 출구에서 도보 5분</p>
                                    </div>
                                </div>
                                
                                <div class="transport-item">
                                    <div class="transport-icon">🚌</div>
                                    <div class="transport-content">
                                        <h4>버스</h4>
                                        <p>계산역 정류장 하차</p>
                                        <p>• 간선버스: 2, 15, 23, 45, 88</p>
                                        <p>• 지선버스: 515, 520, 522, 525</p>
                                        <p>• 마을버스: 계양01, 계양02</p>
                                    </div>
                                </div>
                                
                                <div class="transport-item">
                                    <div class="transport-icon">🚗</div>
                                    <div class="transport-content">
                                        <h4>승용차</h4>
                                        <p>경명대로를 따라 계산역 방향으로 진입</p>
                                        <p>계산역 사거리에서 우회전 후 100m 직진</p>
                                        <p>건물 내 지하주차장 이용 가능 (2시간 무료)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        showInquiryModal() {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('inquiryModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'inquiryModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>문의하기</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <form id="inquiryForm" class="inquiry-form">
                            <div class="form-group">
                                <label for="name">이름 *</label>
                                <input type="text" id="name" name="name" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="phone">전화번호 *</label>
                                <input type="tel" id="phone" name="phone" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="email">이메일 *</label>
                                <input type="email" id="email" name="email" required>
                            </div>
                            
                            <div class="form-group">
                                <label for="message">문의내용 *</label>
                                <textarea id="message" name="message" rows="5" required></textarea>
                            </div>
                            
                            <div class="form-group">
                                <label for="password">비밀번호 *</label>
                                <input type="password" id="password" name="password" required>
                                <small>문의 답변 확인 시 사용됩니다.</small>
                            </div>
                            
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">문의하기</button>
                                <button type="button" class="btn btn-secondary" onclick="this.closest('.contact-modal').remove()">취소</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 폼 제출 이벤트 처리
            const form = document.getElementById('inquiryForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleInquirySubmit(form);
            });
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async handleInquirySubmit(form) {
            const formData = new FormData(form);
            const inquiryData = {
                name: formData.get('name'),
                phone: formData.get('phone'),
                email: formData.get('email'),
                message: formData.get('message'),
                password: formData.get('password')
            };

            try {
                const response = await fetch('/api/inquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(inquiryData)
                });

                if (!response.ok) {
                    throw new Error(`API 응답 오류: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    alert('문의가 성공적으로 등록되었습니다.');
                    document.getElementById('inquiryModal').remove();
                } else {
                    alert('문의 등록에 실패했습니다: ' + result.error);
                }
            } catch (error) {
                console.error('문의 제출 실패:', error);
                alert('문의 제출 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }

        async showInquiryListModal(page = 1) {
            try {
                console.log('문의 목록 모달 표시 시작...');
                const response = await fetch(`/api/inquiry-list?page=${page}`);
                if (!response.ok) {
                    throw new Error(`API 응답 오류: ${response.status}`);
                }
                const data = await response.json();
                console.log('문의 목록 데이터:', data);
                
                this.createInquiryListModal(data.inquiries || [], data.pagination || {});
            } catch (error) {
                console.error('문의 목록 로딩 실패:', error);
                alert('문의 목록을 불러오는데 실패했습니다.');
            }
        }

        createInquiryListModal(inquiries, pagination) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('inquiryListModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'inquiryListModal';
            modal.className = 'contact-modal';
            
            const inquiryListHtml = inquiries.length > 0 
                ? inquiries.map(inquiry => {
                    // 이름 마스킹: 첫 글자만 보이고 나머지는 *
                    const maskedName = inquiry.name.length > 0 ? inquiry.name.charAt(0) + '*'.repeat(inquiry.name.length - 1) : '';
                    
                    // 전화번호 마스킹: 마지막 4자리를 *로 처리
                    const maskedPhone = inquiry.phone.length > 4 ? inquiry.phone.substring(0, inquiry.phone.length - 4) + '****' : inquiry.phone;
                    
                                         return `
                         <div class="inquiry-item" data-row-id="${inquiry.row_id}">
                             <div class="inquiry-header">
                                 <span class="inquiry-date">${inquiry.date}</span>
                                 <span class="inquiry-serial">${inquiry.serial}</span>
                                 <span class="inquiry-name">${maskedName}</span>
                                 <span class="inquiry-phone">${maskedPhone}</span>
                                 <button class="btn btn-primary btn-sm" onclick="this.closest('.inquiry-item').querySelector('.password-form').style.display='block'">
                                     답변보기
                                 </button>
                             </div>
                             <div class="password-form" style="display: none;">
                                 <input type="password" placeholder="비밀번호를 입력하세요" class="password-input">
                                 <button class="btn btn-secondary btn-sm" onclick="this.closest('.inquiry-item').querySelector('.password-form').style.display='none'">
                                     취소
                                 </button>
                                 <button class="btn btn-primary btn-sm" onclick="window.menuManager.verifyInquiryPassword(${inquiry.row_id}, this.previousElementSibling.previousElementSibling.value)">
                                     확인
                                 </button>
                             </div>
                         </div>
                     `;
                }).join('')
                : '<p class="no-inquiries">등록된 문의가 없습니다.</p>';

            // 페이지네이션 HTML 생성
            let paginationHtml = '';
            if (pagination.total_pages > 1) {
                const currentPage = pagination.current_page;
                const totalPages = pagination.total_pages;
                
                let paginationButtons = '';
                
                // 이전 페이지 버튼
                if (currentPage > 1) {
                    paginationButtons += `<button class="pagination-btn" onclick="window.menuManager.showInquiryListModal(${currentPage - 1})">이전</button>`;
                }
                
                // 페이지 번호 버튼들
                const startPage = Math.max(1, currentPage - 2);
                const endPage = Math.min(totalPages, currentPage + 2);
                
                for (let i = startPage; i <= endPage; i++) {
                    if (i === currentPage) {
                        paginationButtons += `<button class="pagination-btn active">${i}</button>`;
                    } else {
                        paginationButtons += `<button class="pagination-btn" onclick="window.menuManager.showInquiryListModal(${i})">${i}</button>`;
                    }
                }
                
                // 다음 페이지 버튼
                if (currentPage < totalPages) {
                    paginationButtons += `<button class="pagination-btn" onclick="window.menuManager.showInquiryListModal(${currentPage + 1})">다음</button>`;
                }
                
                paginationHtml = `
                    <div class="pagination-info">
                        <span>총 ${pagination.total_items}개 문의 중 ${((currentPage - 1) * pagination.per_page) + 1}-${Math.min(currentPage * pagination.per_page, pagination.total_items)}번째</span>
                    </div>
                    <div class="pagination-controls">
                        ${paginationButtons}
                    </div>
                `;
            }

            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>문의 및 답변 목록</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="inquiry-list">
                            ${inquiryListHtml}
                        </div>
                        ${paginationHtml}
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async verifyInquiryPassword(rowId, password) {
            if (!password) {
                alert('비밀번호를 입력해주세요.');
                return;
            }

            try {
                const response = await fetch('/api/verify-inquiry', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        row_id: rowId,
                        password: password
                    })
                });

                if (!response.ok) {
                    throw new Error(`API 응답 오류: ${response.status}`);
                }

                const result = await response.json();
                
                if (result.success) {
                    this.showInquiryDetailModal(result.inquiry);
                } else {
                    alert('비밀번호가 일치하지 않습니다.');
                }
            } catch (error) {
                console.error('문의 확인 실패:', error);
                alert('문의 확인 중 오류가 발생했습니다. 다시 시도해주세요.');
            }
        }

        showInquiryDetailModal(inquiry) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('inquiryDetailModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'inquiryDetailModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>문의 및 답변 상세</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="inquiry-detail">
                            <div class="inquiry-info">
                                <h3>문의 정보</h3>
                                <p><strong>접수일:</strong> ${inquiry.date}</p>
                                <p><strong>접수번호:</strong> ${inquiry.serial}</p>
                                <p><strong>이름:</strong> ${inquiry.name}</p>
                                <p><strong>전화번호:</strong> ${inquiry.phone}</p>
                                <p><strong>이메일:</strong> ${inquiry.email}</p>
                                <p><strong>문의내용:</strong></p>
                                <div class="question-content">${inquiry.question}</div>
                            </div>
                            
                            <div class="answer-info">
                                <h3>답변 정보</h3>
                                <p><strong>답변일:</strong> ${inquiry.answer_date || '아직 답변되지 않음'}</p>
                                <p><strong>상태:</strong> <span class="status-${inquiry.answer_status === '답변완료' ? 'completed' : 'pending'}">${inquiry.answer_status}</span></p>
                                <p><strong>답변내용:</strong></p>
                                <div class="answer-content">${inquiry.answer_content}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async showProgramFilesModal() {
            try {
                console.log('프로그램 파일 목록 모달 표시 시작...');
                const response = await fetch('/api/program-files');
                if (!response.ok) {
                    throw new Error(`API 응답 오류: ${response.status}`);
                }
                const data = await response.json();
                console.log('프로그램 파일 목록 데이터:', data);
                
                this.createProgramFilesModal(data.files || []);
            } catch (error) {
                console.error('프로그램 파일 목록 로딩 실패:', error);
                alert('프로그램 파일 목록을 불러오는데 실패했습니다.');
            }
        }

        createProgramFilesModal(files) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('programFilesModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'programFilesModal';
            modal.className = 'contact-modal';
            
            const filesListHtml = files.length > 0 
                ? files.map(file => `
                    <div class="file-item">
                        <div class="file-info">
                            <div class="file-name">${file.name}</div>
                            <div class="file-details">
                                <span class="file-size">${file.size}</span>
                                <span class="file-date">${file.modifiedTime}</span>
                            </div>
                        </div>
                        <a href="${file.downloadUrl}" target="_blank" class="btn btn-primary btn-sm">
                            다운로드
                        </a>
                    </div>
                `).join('')
                : '<p class="no-files">등록된 파일이 없습니다.</p>';

            modal.innerHTML = `
                <div class="contact-modal-content">
                    <div class="contact-modal-header">
                        <h2>프로그램 자료 다운로드</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="files-list">
                            ${filesListHtml}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async showAdminInquiryModal() {
            try {
                console.log('관리자 문의 모달 표시 시작...');
                this.createAdminInquiryModal();
            } catch (error) {
                console.error('관리자 모달 생성 실패:', error);
                alert('관리자 모달을 생성하는데 실패했습니다.');
            }
        }

        createAdminInquiryModal() {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('adminInquiryModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'adminInquiryModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content" style="max-width: 1000px; max-height: 80vh;">
                    <div class="contact-modal-header">
                        <h2>관리자 - 문의 답변 등록</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="admin-login-section">
                            <div class="form-group">
                                <label for="adminPassword">관리자 비밀번호</label>
                                <input type="password" id="adminPassword" placeholder="관리자 비밀번호를 입력하세요" required>
                            </div>
                            <button class="btn btn-primary" onclick="window.menuManager.loadAdminInquiryList()">문의 목록 불러오기</button>
                        </div>
                        <div id="adminInquiryList" style="display: none;">
                            <div class="admin-inquiry-list">
                                <!-- 문의 목록이 여기에 동적으로 로드됩니다 -->
                            </div>
                            <div class="pagination-controls" id="adminPaginationControls">
                                <!-- 페이지네이션 컨트롤이 여기에 동적으로 로드됩니다 -->
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async loadAdminInquiryList(page = 1) {
            try {
                const adminPassword = document.getElementById('adminPassword').value;
                if (!adminPassword) {
                    alert('관리자 비밀번호를 입력해주세요.');
                    return;
                }

                console.log('관리자 문의 목록 로딩 시작...');
                const response = await fetch('/api/admin/inquiry-list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin_password: adminPassword,
                        page: page
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '관리자 인증에 실패했습니다.');
                }

                const data = await response.json();
                console.log('관리자 문의 목록 데이터:', data);
                
                this.displayAdminInquiryList(data.inquiries, data.pagination);
            } catch (error) {
                console.error('관리자 문의 목록 로딩 실패:', error);
                alert(error.message || '문의 목록을 불러오는데 실패했습니다.');
            }
        }

        displayAdminInquiryList(inquiries, pagination) {
            const adminInquiryList = document.getElementById('adminInquiryList');
            const inquiryListContainer = adminInquiryList.querySelector('.admin-inquiry-list');
            const paginationControls = document.getElementById('adminPaginationControls');

            // 문의 목록 표시
            if (inquiries.length === 0) {
                inquiryListContainer.innerHTML = '<p class="no-inquiries">등록된 문의가 없습니다.</p>';
            } else {
                const inquiryListHtml = inquiries.map(inquiry => `
                    <div class="inquiry-item admin-inquiry-item">
                        <div class="inquiry-header">
                            <div class="inquiry-date">${inquiry.date}</div>
                            <div class="inquiry-serial">${inquiry.serial}</div>
                            <div class="inquiry-name">${inquiry.name}</div>
                            <div class="inquiry-phone">${inquiry.phone}</div>
                            <div class="status-badge ${inquiry.status === '답변완료' ? 'status-completed' : 'status-pending'}">
                                ${inquiry.status}
                            </div>
                        </div>
                        <div class="inquiry-preview">
                            <strong>문의내용:</strong> ${inquiry.question.substring(0, 100)}${inquiry.question.length > 100 ? '...' : ''}
                        </div>
                        ${inquiry.answer ? `
                            <div class="answer-preview">
                                <strong>답변:</strong> ${inquiry.answer.substring(0, 100)}${inquiry.answer.length > 100 ? '...' : ''}
                                <div class="answer-date">답변일: ${inquiry.answer_date}</div>
                            </div>
                        ` : ''}
                        <div class="admin-actions">
                            <button class="btn btn-primary btn-sm" onclick="window.menuManager.showAnswerForm(${inquiry.id})">
                                ${inquiry.answer ? '답변 수정' : '답변 등록'}
                            </button>
                        </div>
                    </div>
                `).join('');
                
                inquiryListContainer.innerHTML = inquiryListHtml;
            }

            // 페이지네이션 컨트롤 표시
            if (pagination.total_pages > 1) {
                const paginationHtml = `
                    <div class="pagination-info">
                        총 ${pagination.total_items}개의 문의 (${pagination.current_page}/${pagination.total_pages} 페이지)
                    </div>
                    <div class="pagination-controls">
                        <button class="pagination-btn" onclick="window.menuManager.loadAdminInquiryList(1)" ${pagination.current_page === 1 ? 'disabled' : ''}>
                            처음
                        </button>
                        <button class="pagination-btn" onclick="window.menuManager.loadAdminInquiryList(${pagination.current_page - 1})" ${pagination.current_page === 1 ? 'disabled' : ''}>
                            이전
                        </button>
                        <span class="pagination-btn active">${pagination.current_page}</span>
                        <button class="pagination-btn" onclick="window.menuManager.loadAdminInquiryList(${pagination.current_page + 1})" ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}>
                            다음
                        </button>
                        <button class="pagination-btn" onclick="window.menuManager.loadAdminInquiryList(${pagination.total_pages})" ${pagination.current_page === pagination.total_pages ? 'disabled' : ''}>
                            마지막
                        </button>
                    </div>
                `;
                paginationControls.innerHTML = paginationHtml;
            } else {
                paginationControls.innerHTML = `
                    <div class="pagination-info">
                        총 ${pagination.total_items}개의 문의
                    </div>
                `;
            }

            adminInquiryList.style.display = 'block';
        }

        showAnswerForm(inquiryId) {
            // 기존 답변 폼이 있다면 제거
            const existingForm = document.getElementById('answerFormModal');
            if (existingForm) {
                existingForm.remove();
            }

            // 답변 폼 모달 생성
            const modal = document.createElement('div');
            modal.id = 'answerFormModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content" style="max-width: 600px;">
                    <div class="contact-modal-header">
                        <h2>답변 등록</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <form id="answerForm" class="inquiry-form">
                            <input type="hidden" id="inquiryId" value="${inquiryId}">
                            <div class="form-group">
                                <label for="answerContent">답변 내용</label>
                                <textarea id="answerContent" rows="8" placeholder="답변 내용을 입력하세요" required></textarea>
                            </div>
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">답변 저장</button>
                                <button type="button" class="btn btn-secondary" onclick="this.closest('.contact-modal').remove()">취소</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 폼 제출 이벤트
            const form = document.getElementById('answerForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitAnswer();
            });

            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async submitAnswer() {
            try {
                const inquiryId = document.getElementById('inquiryId').value;
                const answerContent = document.getElementById('answerContent').value;
                const adminPassword = document.getElementById('adminPassword').value;

                if (!answerContent.trim()) {
                    alert('답변 내용을 입력해주세요.');
                    return;
                }

                console.log('답변 등록 시작...');
                const response = await fetch('/api/admin/add-answer', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin_password: adminPassword,
                        inquiry_id: inquiryId,
                        answer_content: answerContent
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '답변 등록에 실패했습니다.');
                }

                const data = await response.json();
                console.log('답변 등록 성공:', data);
                
                alert('답변이 성공적으로 등록되었습니다.');
                
                // 답변 폼 모달 닫기
                const answerFormModal = document.getElementById('answerFormModal');
                if (answerFormModal) {
                    answerFormModal.remove();
                }
                
                // 문의 목록 새로고침
                this.loadAdminInquiryList(1);
                
            } catch (error) {
                console.error('답변 등록 실패:', error);
                alert(error.message || '답변 등록에 실패했습니다.');
            }
        }

        async showMaterialsModal() {
            try {
                console.log('자료 목록 모달 표시 시작...');
                const response = await fetch('/api/materials');
                if (!response.ok) {
                    throw new Error(`API 응답 오류: ${response.status}`);
                }
                const data = await response.json();
                console.log('자료 목록 데이터:', data);
                
                this.createMaterialsModal(data.materials || []);
            } catch (error) {
                console.error('자료 목록 로딩 실패:', error);
                alert('자료 목록을 불러오는데 실패했습니다.');
            }
        }

        createMaterialsModal(materials) {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('materialsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'materialsModal';
            modal.className = 'contact-modal';
            
            const materialsListHtml = materials.length > 0 
                ? materials.map(material => `
                    <div class="material-item">
                        <div class="material-info">
                            <div class="material-title">${material.title}</div>
                            <div class="material-description">${material.description || '설명 없음'}</div>
                            <div class="material-details">
                                <span class="material-category">${material.category}</span>
                                <span class="material-size">${material.file_size || '크기 정보 없음'}</span>
                                <span class="material-date">${material.created_at}</span>
                                <span class="material-downloads">다운로드: ${material.download_count}</span>
                            </div>
                        </div>
                        <button class="btn btn-primary btn-sm" onclick="window.menuManager.downloadMaterial(${material.id})">
                            다운로드
                        </button>
                    </div>
                `).join('')
                : '<p class="no-materials">등록된 자료가 없습니다.</p>';

            modal.innerHTML = `
                <div class="contact-modal-content" style="max-width: 800px; max-height: 80vh;">
                    <div class="contact-modal-header">
                        <h2>자료 다운로드</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="materials-list">
                            ${materialsListHtml}
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async downloadMaterial(materialId) {
            try {
                console.log('자료 다운로드 시작...');
                const response = await fetch(`/api/materials/${materialId}/download`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '다운로드에 실패했습니다.');
                }

                const data = await response.json();
                console.log('다운로드 정보:', data);
                
                // 실제 다운로드 링크 생성 (예시)
                if (data.download_url) {
                    const link = document.createElement('a');
                    link.href = data.download_url;
                    link.download = data.file_name;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                }
                
                alert('다운로드가 시작되었습니다.');
                
            } catch (error) {
                console.error('자료 다운로드 실패:', error);
                alert(error.message || '다운로드에 실패했습니다.');
            }
        }

        async showAdminMaterialsModal() {
            try {
                console.log('관리자 자료 모달 표시 시작...');
                this.createAdminMaterialsModal();
            } catch (error) {
                console.error('관리자 자료 모달 생성 실패:', error);
                alert('관리자 자료 모달을 생성하는데 실패했습니다.');
            }
        }

        createAdminMaterialsModal() {
            // 기존 모달이 있다면 제거
            const existingModal = document.getElementById('adminMaterialsModal');
            if (existingModal) {
                existingModal.remove();
            }

            // 모달 생성
            const modal = document.createElement('div');
            modal.id = 'adminMaterialsModal';
            modal.className = 'contact-modal';
            
            modal.innerHTML = `
                <div class="contact-modal-content" style="max-width: 1000px; max-height: 80vh;">
                    <div class="contact-modal-header">
                        <h2>관리자 - 자료 관리</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <div class="admin-login-section">
                            <div class="form-group">
                                <label for="adminMaterialsPassword">관리자 비밀번호</label>
                                <input type="password" id="adminMaterialsPassword" placeholder="관리자 비밀번호를 입력하세요" required>
                            </div>
                            <button class="btn btn-primary" onclick="window.menuManager.loadAdminMaterialsList()">자료 목록 불러오기</button>
                            <button class="btn btn-secondary" onclick="window.menuManager.showMaterialForm()">새 자료 등록</button>
                        </div>
                        <div id="adminMaterialsList" style="display: none;">
                            <div class="admin-materials-list">
                                <!-- 자료 목록이 여기에 동적으로 로드됩니다 -->
                            </div>
                        </div>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });
        }

        async loadAdminMaterialsList() {
            try {
                const adminPassword = document.getElementById('adminMaterialsPassword').value;
                if (!adminPassword) {
                    alert('관리자 비밀번호를 입력해주세요.');
                    return;
                }

                console.log('관리자 자료 목록 로딩 시작...');
                const response = await fetch('/api/admin/materials', {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    }
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '관리자 인증에 실패했습니다.');
                }

                const data = await response.json();
                console.log('관리자 자료 목록 데이터:', data);
                
                this.displayAdminMaterialsList(data.materials);
            } catch (error) {
                console.error('관리자 자료 목록 로딩 실패:', error);
                alert(error.message || '자료 목록을 불러오는데 실패했습니다.');
            }
        }

        displayAdminMaterialsList(materials) {
            const adminMaterialsList = document.getElementById('adminMaterialsList');
            const materialsListContainer = adminMaterialsList.querySelector('.admin-materials-list');

            // 자료 목록 표시
            if (materials.length === 0) {
                materialsListContainer.innerHTML = '<p class="no-materials">등록된 자료가 없습니다.</p>';
            } else {
                const materialsListHtml = materials.map(material => `
                    <div class="material-item admin-material-item">
                        <div class="material-info">
                            <div class="material-title">${material.title}</div>
                            <div class="material-description">${material.description || '설명 없음'}</div>
                            <div class="material-details">
                                <span class="material-category">${material.category}</span>
                                <span class="material-size">${material.file_size || '크기 정보 없음'}</span>
                                <span class="material-date">${material.created_at}</span>
                                <span class="material-downloads">다운로드: ${material.download_count}</span>
                                <span class="status-badge ${material.is_active ? 'status-completed' : 'status-pending'}">
                                    ${material.is_active ? '활성' : '비활성'}
                                </span>
                            </div>
                        </div>
                        <div class="admin-actions">
                            <button class="btn btn-primary btn-sm" onclick="window.menuManager.editMaterial(${material.id})">
                                수정
                            </button>
                            <button class="btn btn-secondary btn-sm" onclick="window.menuManager.toggleMaterialStatus(${material.id}, ${!material.is_active})">
                                ${material.is_active ? '비활성화' : '활성화'}
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="window.menuManager.deleteMaterial(${material.id})">
                                삭제
                            </button>
                        </div>
                    </div>
                `).join('');
                
                materialsListContainer.innerHTML = materialsListHtml;
            }

            adminMaterialsList.style.display = 'block';
        }

        showMaterialForm(materialId = null) {
            // 기존 폼이 있다면 제거
            const existingForm = document.getElementById('materialFormModal');
            if (existingForm) {
                existingForm.remove();
            }

            // 자료 등록/수정 폼 모달 생성
            const modal = document.createElement('div');
            modal.id = 'materialFormModal';
            modal.className = 'contact-modal';
            
            const isEdit = materialId !== null;
            
            modal.innerHTML = `
                <div class="contact-modal-content" style="max-width: 600px;">
                    <div class="contact-modal-header">
                        <h2>${isEdit ? '자료 수정' : '새 자료 등록'}</h2>
                        <button class="contact-modal-close" onclick="this.closest('.contact-modal').remove()">&times;</button>
                    </div>
                    <div class="contact-modal-body">
                        <form id="materialForm" class="inquiry-form" enctype="multipart/form-data">
                            ${isEdit ? `<input type="hidden" id="materialId" value="${materialId}">` : ''}
                            <div class="form-group">
                                <label for="materialTitle">제목 *</label>
                                <input type="text" id="materialTitle" placeholder="자료 제목을 입력하세요" required>
                            </div>
                            <div class="form-group">
                                <label for="materialDescription">설명</label>
                                <textarea id="materialDescription" rows="3" placeholder="자료 설명을 입력하세요"></textarea>
                            </div>
                            <div class="form-group">
                                <label for="materialCategory">카테고리</label>
                                <select id="materialCategory">
                                    <option value="무역자료">무역자료</option>
                                    <option value="운송자료">운송자료</option>
                                    <option value="법규자료">법규자료</option>
                                    <option value="기타">기타</option>
                                </select>
                            </div>
                            ${!isEdit ? `
                            <div class="form-group">
                                <label for="materialFile">파일 선택 *</label>
                                <div class="file-upload-area" id="fileUploadArea">
                                    <div class="file-upload-icon">📁</div>
                                    <div class="file-upload-text">파일을 클릭하거나 드래그하여 선택하세요</div>
                                    <div class="file-upload-hint">지원 형식: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ZIP, RAR, JPG, PNG, GIF (최대 16MB)</div>
                                    <input type="file" id="materialFile" accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif" required style="display: none;">
                                </div>
                                <div id="fileInfo" style="display: none; margin-top: 1rem; padding: 0.5rem; background: #e8f5e8; border-radius: 4px; border-left: 4px solid #4caf50;">
                                    <strong>선택된 파일:</strong> <span id="selectedFileName"></span>
                                </div>
                            </div>
                            ` : ''}
                            <div class="form-actions">
                                <button type="submit" class="btn btn-primary">${isEdit ? '수정' : '등록'}</button>
                                <button type="button" class="btn btn-secondary" onclick="this.closest('.contact-modal').remove()">취소</button>
                            </div>
                        </form>
                    </div>
                </div>
            `;

            document.body.appendChild(modal);
            
            // 폼 제출 이벤트
            const form = document.getElementById('materialForm');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitMaterial(isEdit);
            });

            // 모달 배경 클릭 시 닫기
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.remove();
                }
            });

            // ESC 키로 모달 닫기
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.parentNode) {
                    modal.remove();
                }
            });

            // 파일 업로드 드래그 앤 드롭 기능 추가
            if (!isEdit) {
                const fileUploadArea = document.getElementById('fileUploadArea');
                const fileInput = document.getElementById('materialFile');
                const fileInfo = document.getElementById('fileInfo');
                const selectedFileName = document.getElementById('selectedFileName');

                // 클릭으로 파일 선택
                fileUploadArea.addEventListener('click', () => {
                    fileInput.click();
                });

                // 파일 선택 시 정보 표시
                fileInput.addEventListener('change', (e) => {
                    if (e.target.files[0]) {
                        const file = e.target.files[0];
                        selectedFileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                        fileInfo.style.display = 'block';
                        fileUploadArea.style.borderColor = '#4caf50';
                        fileUploadArea.style.background = '#f0f9f0';
                    }
                });

                // 드래그 앤 드롭 이벤트
                fileUploadArea.addEventListener('dragover', (e) => {
                    e.preventDefault();
                    fileUploadArea.classList.add('dragover');
                });

                fileUploadArea.addEventListener('dragleave', (e) => {
                    e.preventDefault();
                    fileUploadArea.classList.remove('dragover');
                });

                fileUploadArea.addEventListener('drop', (e) => {
                    e.preventDefault();
                    fileUploadArea.classList.remove('dragover');
                    
                    const files = e.dataTransfer.files;
                    if (files.length > 0) {
                        fileInput.files = files;
                        const file = files[0];
                        selectedFileName.textContent = `${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                        fileInfo.style.display = 'block';
                        fileUploadArea.style.borderColor = '#4caf50';
                        fileUploadArea.style.background = '#f0f9f0';
                    }
                });
            }
        }

        async submitMaterial(isEdit = false) {
            try {
                const adminPassword = document.getElementById('adminMaterialsPassword').value;
                const title = document.getElementById('materialTitle').value;
                const description = document.getElementById('materialDescription').value;
                const category = document.getElementById('materialCategory').value;

                if (!title) {
                    alert('제목은 필수입니다.');
                    return;
                }

                if (!isEdit) {
                    // 새 자료 등록 (파일 업로드)
                    const fileInput = document.getElementById('materialFile');
                    if (!fileInput.files[0]) {
                        alert('파일을 선택해주세요.');
                        return;
                    }

                    const formData = new FormData();
                    formData.append('admin_password', adminPassword);
                    formData.append('title', title);
                    formData.append('description', description);
                    formData.append('category', category);
                    formData.append('file', fileInput.files[0]);

                    console.log('자료 등록 시작...');
                    const response = await fetch('/api/admin/materials', {
                        method: 'POST',
                        body: formData
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        alert(result.message);
                        document.getElementById('materialFormModal').remove();
                        this.loadAdminMaterialsList(); // 목록 새로고침
                    } else {
                        alert(result.error || '자료 등록에 실패했습니다.');
                    }
                } else {
                    // 자료 수정 (파일 없이 메타데이터만)
                    const materialId = document.getElementById('materialId').value;
                    
                    const materialData = {
                        admin_password: adminPassword,
                        title: title,
                        description: description,
                        category: category
                    };

                    console.log('자료 수정 시작...');
                    const response = await fetch(`/api/admin/materials/${materialId}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(materialData)
                    });

                    const result = await response.json();
                    
                    if (result.success) {
                        alert(result.message);
                        document.getElementById('materialFormModal').remove();
                        this.loadAdminMaterialsList(); // 목록 새로고침
                    } else {
                        alert(result.error || '자료 수정에 실패했습니다.');
                    }
                }
            } catch (error) {
                console.error('자료 등록/수정 오류:', error);
                alert('자료 등록/수정 중 오류가 발생했습니다.');
            }
        }

        editMaterial(materialId) {
            // 자료 수정 폼 표시 (현재는 간단한 구현)
            this.showMaterialForm(materialId);
        }

        async toggleMaterialStatus(materialId, isActive) {
            try {
                const adminPassword = document.getElementById('adminMaterialsPassword').value;
                
                const response = await fetch(`/api/admin/materials/${materialId}`, {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin_password: adminPassword,
                        is_active: isActive
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '상태 변경에 실패했습니다.');
                }

                const data = await response.json();
                alert(data.message || '상태가 변경되었습니다.');
                
                // 자료 목록 새로고침
                this.loadAdminMaterialsList();
                
            } catch (error) {
                console.error('상태 변경 실패:', error);
                alert(error.message || '상태 변경에 실패했습니다.');
            }
        }

        async deleteMaterial(materialId) {
            if (!confirm('정말로 이 자료를 삭제하시겠습니까?')) {
                return;
            }

            try {
                const adminPassword = document.getElementById('adminMaterialsPassword').value;
                
                const response = await fetch(`/api/admin/materials/${materialId}`, {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        admin_password: adminPassword
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || '자료 삭제에 실패했습니다.');
                }

                const data = await response.json();
                alert(data.message || '자료가 삭제되었습니다.');
                
                // 자료 목록 새로고침
                this.loadAdminMaterialsList();
                
            } catch (error) {
                console.error('자료 삭제 실패:', error);
                alert(error.message || '자료 삭제에 실패했습니다.');
            }
        }
}

// 페이지 로드 시 메뉴 매니저 초기화
document.addEventListener('DOMContentLoaded', () => {
    window.menuManager = new MenuManager();
});

// 헤더 스크롤 효과
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 50) {
        header.style.background = 'rgba(255, 255, 255, 0.98)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
    } else {
        header.style.background = 'rgba(255, 255, 255, 0.95)';
        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
    }
}); 