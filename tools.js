/* 칼퇴용 뚝딱 사무도구 — 도구 목록. 도구를 더하거나 빼려면 여기만 고친다.
   id 주소 · t 이름 · d 한 줄 · p 파일 · m 한 번에 아끼는 시간 어림(분, 개인 경험으로 정한 값) · k 찾기 낱말 */
window.KT_CATS = [
  { id: 'xl', icon: '📊', name: '엑셀', cry: '엑셀이 말을 안 들어요', c: '#1D7A46', tools: [
    { id: 'xlmerge', t: '엑셀 합치기·나누기', d: '부서마다 따로 온 파일을 하나로, 한 표를 부서별로', p: 'office/tools/xlmerge.html', m: 25, k: '취합 병합 시트 분리' },
    { id: 'xlclean', t: '표 청소기', d: '합친 칸·합계 줄·제각각 날짜를 정렬되는 표로', p: 'office/tools/xlclean.html', m: 20, k: '정리 필터 정렬 병합 해제 빈칸' },
    { id: 'xlsum', t: '피벗 없이 집계표', d: '부서별·월별 합계를 고르기만 해서', p: 'office/tools/xlsum.html', m: 20, k: '피벗 합계 통계' },
    { id: 'xlchart', t: '엑셀 숫자 → PPT 차트', d: '숫자 표를 발표용 차트로', p: 'office/tools/xlchart.html', m: 15, k: '그래프 파워포인트' },
    { id: 'excel', t: '엑셀 함수 도우미', d: '하고 싶은 일로 찾아 수식을 만들어 복사', p: 'excel/index.html', m: 10, k: 'vlookup sumif 수식 오류 #N/A' },
    { id: 'list-compare', t: '명단 대조기', d: '두 명단에서 들어온 사람, 빠진 사람 찾기', p: 'list-compare/index.html', m: 15, k: '비교 중복' },
    { id: 'survey-tally', t: '설문 결과 집계판', d: '응답을 세어 표·그래프·글로', p: 'survey-tally/index.html', m: 20, k: '만족도 설문지 통계' } ] },
  { id: 'doc', icon: '📝', name: '한글·문서', cry: '한글 표가 또 깨졌어요', c: '#1F5FBF', tools: [
    { id: 'xl2hwp', t: '엑셀 표 → 한글 표', d: '테두리·칸 너비 그대로 한글 표로', p: 'office/tools/xl2hwp.html', m: 15, k: 'hwpx 붙여넣기' },
    { id: 'wizard', t: '문서 변신 마법사', d: '흩어진 명단을 모아 내 양식에 채우기', p: 'wizard/index.html', m: 40, k: '메일머지 양식 채우기 비상연락망 자동' },
    { id: 'hwp2hwpx', t: 'HWP → HWPX 바꾸기', d: '옛 hwp 수십 개를 한꺼번에', p: 'office/tools/hwp2hwpx.html', m: 10, k: '변환 한글' },
    { id: 'form-overlay', t: '양식 덧쓰기', d: '받은 양식 그림 위에 글자만 얹어 인쇄', p: 'form-overlay/index.html', m: 15, k: '스캔 서식 빈칸' },
    { id: 'doc-check', t: '공문·기안 점검', d: '항목 기호·날짜·「끝.」 표시가 맞는지', p: 'easy-notice/index.html', m: 10, k: '맞춤법 띄어쓰기 붙임 결재 반려' },
    { id: 'aitext', t: 'AI에 붙일 글 꺼내기', d: '한글·PDF·엑셀에서 글을 꺼내고 번호는 가리고', p: 'office/tools/aitext.html', m: 10, k: '추출 텍스트' },
    { id: 'mask-privacy', t: '개인정보 가리기', d: '전화·주민번호·계좌를 찾아 가린 글과 표로', p: 'mask-privacy/index.html', m: 15, k: '마스킹 모자이크 비식별' } ] },
  { id: 'pic', icon: '🗜️', name: 'PPT·PDF·사진', cry: '파일이 너무 커서 안 보내져요', c: '#C2491D', tools: [
    { id: 'album', t: '사진 앨범 PPT', d: '행사 사진 폴더를 결과 보고 PPT로', p: 'office/tools/album.html', m: 30, k: '파워포인트 사진대지' },
    { id: 'pptslim', t: 'PPT 용량 줄이기', d: '메일에 안 붙는 PPT를 가볍게', p: 'office/tools/pptslim.html', m: 10, k: '압축 파워포인트' },
    { id: 'file-tools', t: 'PDF·사진 나누기·합치기', d: '쪽마다 나누고, 합치고, 줄이고', p: 'file-tools/index.html', m: 15, k: 'pdf 병합 분할 압축' },
    { id: 'photo', t: '사진 손질방', d: '배경 지우기·증명사진·도장 투명·용량 줄이기', p: 'photo/index.html', m: 15, k: '누끼 배경 제거 증명사진 도장 영수증 로고' },
    { id: 'face-mask', t: '얼굴 가리기', d: '사진 속 얼굴을 찾아 한 번에 가리기', p: 'face-mask/index.html', m: 15, k: '모자이크 초상권' } ] },
  { id: 'ev', icon: '🎪', name: '행사·교육·홍보', cry: '행사가 내일이에요', c: '#8A3FBF', tools: [
    { id: 'attendance', t: '출석부·출석 집계', d: '서명용 출석부 인쇄와 출석 세기', p: 'attendance/index.html', m: 15, k: '참석 서명 교육' },
    { id: 'cert-print', t: '수료증·이름표 인쇄', d: '명단만 붙이면 한꺼번에', p: 'cert-print/index.html', m: 25, k: '상장 표창장 명찰' },
    { id: 'group-maker', t: '조 편성', d: '같은 부서가 몰리지 않게 섞기', p: 'group-maker/index.html', m: 10, k: '팀 나누기' },
    { id: 'random-pick', t: '무작위 추첨', d: '경품·순서 뽑기', p: 'random-pick/index.html', m: 5, k: '제비뽑기 당첨' },
    { id: 'show-vote', t: '한 화면 투표', d: '회의 자리에서 바로 세고 결과 복사', p: 'show-vote/index.html', m: 5, k: '표결 거수' },
    { id: 'greeting', t: '인사장·초대장 만들기', d: '명절·행사 인사장을 이름별로', p: 'greeting/index.html', m: 25, k: '카드 연하장 초청' },
    { id: 'newsletter', t: '소식지·카드뉴스', d: '사진과 글만 넣으면 사보 모양으로', p: 'newsletter/index.html', m: 40, k: '사보 뉴스레터 홍보' },
    { id: 'map', t: '약도 그리기', d: '오시는 길 약도와 안내 글', p: 'map/index.html', m: 20, k: '지도 길찾기 위치' },
    { id: 'qr', t: 'QR코드 만들기', d: '주소·연락처 QR과 A4 게시물', p: 'qr/index.html', m: 5, k: '큐알 링크' },
    { id: 'labels', t: '우편 주소 라벨', d: '주소록을 라벨지에 맞춰 인쇄', p: 'labels/index.html', m: 20, k: '봉투 우편번호 발송' } ] },
  { id: 'day', icon: '⏰', name: '하루 챙기기', cry: '회의가 안 끝나요', c: '#B7791F', tools: [
    { id: 'meeting-timer', t: '회의 타이머', d: '안건마다 시간을 정해 회의실 화면에', p: 'meeting-timer/index.html', m: 10, k: '안건 시간' },
    { id: 'repeat-checklist', t: '할 일 체크리스트', d: '날마다·달마다 돌아오는 일', p: 'repeat-checklist/index.html', m: 5, k: '투두 반복 업무' },
    { id: 'work-board', t: '업무 정리판', d: '한 번 적어 인수인계서·업무분장표로', p: 'work-board/index.html', m: 40, k: '인수인계 매뉴얼' },
    { id: 'leave-tracker', t: '휴가 관리기', d: '연차 계산과 남은 휴가', p: 'leave-tracker/index.html', m: 10, k: '연차 반차' },
    { id: 'date-calc', t: '날짜·기간·만 나이', d: '며칠 남았나, 만 몇 살인가', p: 'date-calc/index.html', m: 5, k: '디데이 근무일 공휴일' },
    { id: 'focus-timer', t: '집중 타이머', d: '25분 집중, 5분 쉼', p: 'focus-timer/index.html', m: 5, k: '뽀모도로' },
    { id: 'break-timer', t: '쉬는 시간 타이머', d: '교육·회의 쉬는 시간을 큰 화면에', p: 'break-timer/index.html', m: 2, k: '휴식' },
    { id: 'break-reminder', t: '휴식 알림', d: '앉아만 있지 않게 알려 주기', p: 'break-reminder/index.html', m: 2, k: '스트레칭' },
    { id: 'shortcuts', t: '단축키 안내', d: '한글·엑셀·PPT·윈도우 단축키', p: 'shortcuts/index.html', m: 3, k: '키보드' } ] },
  { id: 'ai', icon: '🤖', name: 'AI 주문서', cry: '초안은 AI한테 시킬래요', c: '#0E7C86', tools: [
    { id: 'prompt-minutes', t: '회의록 주문서', d: '메모를 붙이면 회의록 부탁 글이 완성', p: 'prompt-minutes/index.html', m: 25, k: '챗GPT 제미나이 회의' },
    { id: 'prompt-notice', t: '공문·안내문 주문서', d: '요지만 적으면 초안 부탁 글로', p: 'prompt-notice/index.html', m: 20, k: '챗GPT 제미나이' },
    { id: 'prompt-survey', t: '설문 보고서 주문서', d: '집계 결과를 보고서 초안으로', p: 'prompt-survey/index.html', m: 25, k: '챗GPT 제미나이' } ] }
];
