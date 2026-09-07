"use strict";

/* ---------------- constants ---------------- */

const STORAGE_KEY = "timebridge_state_v1";

const COLOR_PRESETS = [
  "oklch(56% 0.13 250)",
  "oklch(64% 0.13 70)",
  "oklch(60% 0.13 150)",
  "oklch(60% 0.12 190)",
  "oklch(58% 0.16 340)",
  "oklch(55% 0.02 260)",
  // Pastel variants (lighter, softer versions of the colors above)
  "oklch(82% 0.07 250)",
  "oklch(85% 0.08 70)",
  "oklch(82% 0.08 150)",
  "oklch(82% 0.06 190)",
  "oklch(84% 0.08 340)",
  "oklch(80% 0.01 260)",
];

// Swatches lighter than this read poorly with a white checkmark; use a dark one instead.
function contrastStroke(oklchColor) {
  const m = oklchColor.match(/oklch\((\d+)%/);
  const lightness = m ? parseInt(m[1], 10) : 50;
  return lightness >= 70 ? "oklch(25% 0.02 260)" : "white";
}

const BASE_CURRENCY = "GTQ";
const CURRENCY_PRESETS = [
  { code: "GTQ", symbol: "Q", name: "과테말라 케찰" },
  { code: "KRW", symbol: "₩", name: "대한민국 원" },
  { code: "USD", symbol: "$", name: "미국 달러" },
  { code: "EUR", symbol: "€", name: "유로" },
];
const EXPENSE_CATS = ["식비", "교통", "생활용품", "통신비", "주거", "의료", "여가", "경조사", "기타"];
const INCOME_CATS = ["급여", "사업", "용돈", "송금", "기타"];
const ACCOUNT_TYPES = ["은행", "카드", "현금", "기타"];

const TZ_PRESETS = [
  // 북중미
  { tz: "America/Guatemala", label: "과테말라 · 과테말라시티", flag: "🇬🇹" },
  { tz: "America/Mexico_City", label: "멕시코 · 멕시코시티", flag: "🇲🇽" },
  { tz: "America/New_York", label: "미국 · 뉴욕", flag: "🇺🇸" },
  { tz: "America/Chicago", label: "미국 · 시카고", flag: "🇺🇸" },
  { tz: "America/Denver", label: "미국 · 덴버", flag: "🇺🇸" },
  { tz: "America/Los_Angeles", label: "미국 · LA", flag: "🇺🇸" },
  { tz: "America/Toronto", label: "캐나다 · 토론토", flag: "🇨🇦" },
  { tz: "America/Vancouver", label: "캐나다 · 밴쿠버", flag: "🇨🇦" },
  { tz: "America/Havana", label: "쿠바 · 아바나", flag: "🇨🇺" },
  { tz: "America/Jamaica", label: "자메이카", flag: "🇯🇲" },
  { tz: "America/Santo_Domingo", label: "도미니카공화국", flag: "🇩🇴" },
  { tz: "America/Tegucigalpa", label: "온두라스", flag: "🇭🇳" },
  { tz: "America/El_Salvador", label: "엘살바도르", flag: "🇸🇻" },
  { tz: "America/Managua", label: "니카라과", flag: "🇳🇮" },
  { tz: "America/Costa_Rica", label: "코스타리카", flag: "🇨🇷" },
  { tz: "America/Panama", label: "파나마", flag: "🇵🇦" },
  { tz: "America/Belize", label: "벨리즈", flag: "🇧🇿" },
  // 남미
  { tz: "America/Bogota", label: "콜롬비아 · 보고타", flag: "🇨🇴" },
  { tz: "America/Caracas", label: "베네수엘라 · 카라카스", flag: "🇻🇪" },
  { tz: "America/Guayaquil", label: "에콰도르", flag: "🇪🇨" },
  { tz: "America/Lima", label: "페루 · 리마", flag: "🇵🇪" },
  { tz: "America/La_Paz", label: "볼리비아", flag: "🇧🇴" },
  { tz: "America/Santiago", label: "칠레 · 산티아고", flag: "🇨🇱" },
  { tz: "America/Argentina/Buenos_Aires", label: "아르헨티나 · 부에노스아이레스", flag: "🇦🇷" },
  { tz: "America/Montevideo", label: "우루과이", flag: "🇺🇾" },
  { tz: "America/Asuncion", label: "파라과이", flag: "🇵🇾" },
  { tz: "America/Sao_Paulo", label: "브라질 · 상파울루", flag: "🇧🇷" },
  { tz: "America/Manaus", label: "브라질 · 마나우스", flag: "🇧🇷" },
  { tz: "America/Guyana", label: "가이아나", flag: "🇬🇾" },
  // 유럽
  { tz: "Europe/London", label: "영국 · 런던", flag: "🇬🇧" },
  { tz: "Europe/Dublin", label: "아일랜드 · 더블린", flag: "🇮🇪" },
  { tz: "Europe/Lisbon", label: "포르투갈 · 리스본", flag: "🇵🇹" },
  { tz: "Europe/Madrid", label: "스페인 · 마드리드", flag: "🇪🇸" },
  { tz: "Europe/Paris", label: "프랑스 · 파리", flag: "🇫🇷" },
  { tz: "Europe/Berlin", label: "독일 · 베를린", flag: "🇩🇪" },
  { tz: "Europe/Amsterdam", label: "네덜란드 · 암스테르담", flag: "🇳🇱" },
  { tz: "Europe/Brussels", label: "벨기에 · 브뤼셀", flag: "🇧🇪" },
  { tz: "Europe/Zurich", label: "스위스 · 취리히", flag: "🇨🇭" },
  { tz: "Europe/Rome", label: "이탈리아 · 로마", flag: "🇮🇹" },
  { tz: "Europe/Vienna", label: "오스트리아 · 빈", flag: "🇦🇹" },
  { tz: "Europe/Warsaw", label: "폴란드 · 바르샤바", flag: "🇵🇱" },
  { tz: "Europe/Prague", label: "체코 · 프라하", flag: "🇨🇿" },
  { tz: "Europe/Budapest", label: "헝가리 · 부다페스트", flag: "🇭🇺" },
  { tz: "Europe/Stockholm", label: "스웨덴 · 스톡홀름", flag: "🇸🇪" },
  { tz: "Europe/Oslo", label: "노르웨이 · 오슬로", flag: "🇳🇴" },
  { tz: "Europe/Copenhagen", label: "덴마크 · 코펜하겐", flag: "🇩🇰" },
  { tz: "Europe/Helsinki", label: "핀란드 · 헬싱키", flag: "🇫🇮" },
  { tz: "Europe/Athens", label: "그리스 · 아테네", flag: "🇬🇷" },
  { tz: "Europe/Bucharest", label: "루마니아 · 부쿠레슈티", flag: "🇷🇴" },
  { tz: "Europe/Kyiv", label: "우크라이나 · 키이우", flag: "🇺🇦" },
  { tz: "Europe/Moscow", label: "러시아 · 모스크바", flag: "🇷🇺" },
  { tz: "Europe/Istanbul", label: "튀르키예 · 이스탄불", flag: "🇹🇷" },
  // 중동 · 아프리카
  { tz: "Africa/Cairo", label: "이집트 · 카이로", flag: "🇪🇬" },
  { tz: "Asia/Jerusalem", label: "이스라엘 · 예루살렘", flag: "🇮🇱" },
  { tz: "Asia/Riyadh", label: "사우디아라비아 · 리야드", flag: "🇸🇦" },
  { tz: "Asia/Dubai", label: "아랍에미리트 · 두바이", flag: "🇦🇪" },
  { tz: "Asia/Amman", label: "요르단 · 암만", flag: "🇯🇴" },
  { tz: "Africa/Johannesburg", label: "남아프리카공화국", flag: "🇿🇦" },
  { tz: "Africa/Lagos", label: "나이지리아 · 라고스", flag: "🇳🇬" },
  { tz: "Africa/Nairobi", label: "케냐 · 나이로비", flag: "🇰🇪" },
  { tz: "Africa/Casablanca", label: "모로코 · 카사블랑카", flag: "🇲🇦" },
  { tz: "Africa/Addis_Ababa", label: "에티오피아 · 아디스아바바", flag: "🇪🇹" },
  // 아시아
  { tz: "Asia/Seoul", label: "한국 · 서울", flag: "🇰🇷" },
  { tz: "Asia/Tokyo", label: "일본 · 도쿄", flag: "🇯🇵" },
  { tz: "Asia/Shanghai", label: "중국 · 베이징", flag: "🇨🇳" },
  { tz: "Asia/Taipei", label: "대만 · 타이베이", flag: "🇹🇼" },
  { tz: "Asia/Hong_Kong", label: "홍콩", flag: "🇭🇰" },
  { tz: "Asia/Ulaanbaatar", label: "몽골 · 울란바토르", flag: "🇲🇳" },
  { tz: "Asia/Manila", label: "필리핀 · 마닐라", flag: "🇵🇭" },
  { tz: "Asia/Ho_Chi_Minh", label: "베트남 · 호치민", flag: "🇻🇳" },
  { tz: "Asia/Bangkok", label: "태국 · 방콕", flag: "🇹🇭" },
  { tz: "Asia/Phnom_Penh", label: "캄보디아 · 프놈펜", flag: "🇰🇭" },
  { tz: "Asia/Vientiane", label: "라오스 · 비엔티안", flag: "🇱🇦" },
  { tz: "Asia/Yangon", label: "미얀마 · 양곤", flag: "🇲🇲" },
  { tz: "Asia/Kuala_Lumpur", label: "말레이시아 · 쿠알라룸푸르", flag: "🇲🇾" },
  { tz: "Asia/Singapore", label: "싱가포르", flag: "🇸🇬" },
  { tz: "Asia/Jakarta", label: "인도네시아 · 자카르타", flag: "🇮🇩" },
  { tz: "Asia/Kolkata", label: "인도 · 뉴델리", flag: "🇮🇳" },
  { tz: "Asia/Karachi", label: "파키스탄 · 카라치", flag: "🇵🇰" },
  { tz: "Asia/Dhaka", label: "방글라데시 · 다카", flag: "🇧🇩" },
  { tz: "Asia/Kathmandu", label: "네팔 · 카트만두", flag: "🇳🇵" },
  { tz: "Asia/Colombo", label: "스리랑카 · 콜롬보", flag: "🇱🇰" },
  { tz: "Asia/Almaty", label: "카자흐스탄 · 알마티", flag: "🇰🇿" },
  { tz: "Asia/Tashkent", label: "우즈베키스탄 · 타슈켄트", flag: "🇺🇿" },
  // 오세아니아
  { tz: "Australia/Sydney", label: "호주 · 시드니", flag: "🇦🇺" },
  { tz: "Australia/Perth", label: "호주 · 퍼스", flag: "🇦🇺" },
  { tz: "Pacific/Auckland", label: "뉴질랜드 · 오클랜드", flag: "🇳🇿" },
  { tz: "Pacific/Fiji", label: "피지", flag: "🇫🇯" },
];

const LANG_LOCALE = { ko: "ko-KR", en: "en-US", es: "es-GT" };

// UI chrome only - task titles, category names, memos, and other user-entered
// content stay exactly as typed, in whatever language the user wrote them.
const I18N = {
  ko: {
    nav_home: "홈", nav_calendar: "캘린더", nav_more: "더보기", nav_settings: "설정",
    brand: "TIMEBRIDGE",
    home_empty: "아직 등록된 업무가 없어요. + 버튼으로 첫 업무를 추가해보세요.",
    hidden_note: "다른 카테고리 {n}건이 숨겨져 있어요 · {name}만 보는 중",
    section_overdue: "지난", section_today: "오늘", section_week: "이번 주", section_later: "다음", section_done: "완료됨",
    chip_all: "전체", delta_hours: "{sign}{n}시간",
    today_badge: "오늘",
    cal_empty: "이 날짜엔 등록된 업무가 없어요.",
    cal_month: "월", cal_week: "주",
    hub_title: "더보기",
    hub_report_name: "보고현황", hub_report_manage: "지파·부서 관리", hub_report_stat: "{done}/{total} 완료",
    hub_money_name: "가계부", hub_money_stat: "이번 달 {amt}",
    hub_diary_name: "기록", hub_diary_recent: "최근 · {date}", hub_diary_none: "기록 없음",
    hub_goals_name: "목표", hub_goals_stat: "{done}/{total} 달성", hub_goals_manage: "목표 설정하기",
    goals_title: "목표", goal_new: "새 목표", goal_edit: "목표 수정",
    field_target_date: "목표일", ph_goal_title: "예: 스페인어 자격증 취득, 신학교 졸업",
    goals_empty: "아직 등록된 목표가 없어요. + 버튼으로 첫 목표를 적어보세요.",
    goal_achieved_badge: "달성!",
    toast_goal_added: "목표를 추가했어요", toast_goal_updated: "목표를 수정했어요", toast_goal_deleted: "목표를 삭제했어요",
    report_title: "지파·부서 보고 현황",
    report_month_collect: "이번 달 보고 취합", report_done_of: "{done} / {total} 완료",
    report_days_left: "마감까지 {n}일 남음 · ", report_pending_count: "미제출 {n}건",
    group_pending: "미제출 · 확인 필요", group_review: "검토중", group_done: "제출완료",
    report_empty: "등록된 지파·부서가 없어요. 오른쪽 위 + 버튼으로 추가해보세요.",
    report_share_btn: "미제출 지파에 알림 보내기",
    dept_add_aria: "부서 추가",
    status_미제출: "미제출", status_검토중: "검토중", status_제출완료: "제출완료",
    submitted_on: "제출됨",
    money_title: "가계부", money_income: "수입", money_expense: "지출", money_balance: "잔액",
    money_convert_note: "다른 통화 계좌는 {base} 기준으로 환산해서 합산했어요.",
    money_rates: "환율", money_rate_hint: "{base} 기준 환율이에요. 실제 환율에 맞게 직접 입력해서 업데이트해주세요.",
    money_txn_history: "거래 내역", money_empty: "이 달엔 기록된 거래가 없어요.",
    diary_title: "기록", diary_empty: "아직 기록이 없어요. + 버튼으로 새 기록을 남겨보세요.",
    settings_title: "설정",
    settings_cat_group: "카테고리 관리", settings_cat_val: "할 일 · 용어정리 ›", settings_add_cat: "새 카테고리 추가",
    settings_reccat_group: "기록 카테고리", settings_add_reccat: "새 기록 카테고리 추가",
    settings_dept_group: "지파·부서 관리", settings_add_dept: "지파·부서 추가",
    settings_notif_group: "알림", settings_notif_label: "마감 임박 알림",
    notif_granted: "허용됨", notif_denied: "차단됨", notif_default: "요청 전", notif_unsupported: "지원 안 함",
    settings_notif_note: "이 앱은 서버 없이 이 기기 안에서만 동작해요. 알림은 앱을 열어둘 때 마감이 가까운 업무를 알려주는 수준이고, 앱이 완전히 꺼져 있을 때 울리는 푸시 알림은 지원하지 않아요.",
    settings_tz_group: "기준 시간대", settings_tz_home: "홈 시간대", settings_tz_secondary: "보조 시간대",
    settings_tz_note: "업무에 시간을 넣을 때 \"이 시간 기준\" 선택지에 쓰이는 두 나라예요. 지내는 나라가 바뀌면 여기서 바꿔주세요.",
    tz_pick_title: "시간대 선택", tz_search_ph: "국가 또는 도시 검색",
    settings_design_group: "디자인", settings_theme_label: "테마",
    theme_light: "라이트", theme_dark: "다크", theme_system: "시스템",
    settings_accent_label: "강조색",
    settings_lang_group: "언어",
    settings_data_group: "데이터", settings_export: "내보내기 (백업 파일 저장)", settings_import: "가져오기 (백업 파일 불러오기)",
    task_new: "새 업무 추가", task_edit: "업무 수정",
    field_title: "제목", ph_title: "예: 2분기 헌금 보고서 취합",
    field_dept: "지파 / 부서 (선택)", ph_dept: "예: 전체지파, 1지파, 시설관리팀",
    field_due: "마감일", field_date: "날짜", field_priority: "우선순위",
    prio_high: "상", prio_med: "중", prio_low: "하",
    field_recur: "반복", recur_none: "안 함", recur_daily: "매일", recur_weekly: "매주", recur_custom: "요일 선택",
    recur_hint: "설정한 날짜까지 반복 업무가 한 번에 모두 생성돼요.",
    recur_weekday_label: "반복할 요일", field_recur_until: "종료일 (선택)",
    recur_until_hint: "비워두면 6개월간 반복돼요.",
    field_start_time: "시작 시간 (선택)", field_end_time: "종료 시간 (선택)", field_tz_origin: "이 시간 기준",
    tz_origin_hint: "다른 시간대 기준으로 통보받은 시간을 그대로 입력하면, 홈 시간대로 자동 변환해서 저장해요.",
    task_time_dual: "{gt} · {label} {kr}",
    recur_daily_label: "매일 반복", recur_weekly_label: "매주 반복", recur_custom_label: "{days} 반복", streak_suffix: " · {n}일째",
    field_notes: "메모", ph_notes: "참고할 내용을 적어두세요",
    field_photo: "사진 첨부", photo_add: "사진 추가", photo_change: "바꾸기", photo_remove: "제거",
    notif_task_hint: "알림은 앱을 열어둘 때 마감 임박 업무를 보여줘요. 설정에서 켤 수 있어요.",
    btn_save: "저장", btn_delete: "삭제", btn_add: "추가하기", mark_done_aria: "완료 표시",
    toast_task_added: "업무를 추가했어요", toast_task_updated: "업무를 수정했어요", toast_task_deleted: "업무를 삭제했어요",
    cat_new: "새 카테고리 추가", field_name: "이름", ph_cat_name: "예: 교육부, 찬양팀, 봉사, 그 외 …",
    field_color: "색상", toast_cat_added: "카테고리를 추가했어요", toast_cat_deleted: "카테고리를 삭제했어요",
    cat_tab_tasks: "할 일 {n}", cat_tab_glossary: "용어 정리",
    glossary_empty: "이 카테고리엔 아직 업무가 없어요.",
    ph_term: "용어", ph_def: "설명", btn_add_term: "용어 추가", btn_delete_term: "삭제",
    btn_delete_category: "이 카테고리 삭제",
    dept_new: "지파·부서 추가", dept_edit: "지파·부서 수정",
    field_contact: "담당자 (선택)", ph_contact: "예: 김OO 전도사", field_status: "상태",
    clock_add_title: "도시 추가", clock_empty: "추가할 수 있는 도시를 모두 등록했어요.",
    txn_new: "새 거래 추가", txn_edit: "거래 수정",
    seg_expense: "지출", seg_income: "수입",
    field_amount: "금액", field_category: "카테고리", field_account: "계좌",
    field_memo_opt: "메모 (선택)", ph_txn_memo: "예: 시장, 버스비 …",
    toast_txn_added: "거래를 추가했어요", toast_txn_updated: "거래를 수정했어요", toast_txn_deleted: "거래를 삭제했어요",
    account_new: "계좌 추가", account_edit: "계좌 수정",
    ph_account_name: "예: 카카오뱅크, 신한카드", field_acct_type: "종류", field_start_balance: "시작 잔액",
    acct_hint: "계좌를 추가한 시점의 잔액이에요. 이후 거래 내역이 여기에 더해지고 빠져요.",
    field_currency: "통화", field_rate: "환율 (1 {code} = ? {base})", rate_hint: "가계부 화면에서 언제든 다시 수정할 수 있어요.",
    toast_min_account: "최소 1개의 계좌는 있어야 해요", toast_account_deleted: "계좌를 삭제했어요",
    diary_new: "새 기록 추가", diary_edit: "기록 수정",
    field_content: "내용", ph_diary: "오늘 있었던 일, 생각, 감사한 것 …",
    rec_tab_all: "전체", rec_empty_cat: "아직 '{name}' 기록이 없어요.",
    rec_cat_new: "새 기록 카테고리", rec_cat_edit: "기록 카테고리 수정", ph_rec_cat_name: "예: 새벽기도, 심방, 훈련일지 …",
    field_record_cat: "구분", field_verse: "말씀 구절 (선택)", ph_verse: "예: 요한복음 3:16",
    field_place: "파견지", ph_place: "예: OO지역 심방, OO행사 지원",
    field_meditation_text: "느낀 점", ph_meditation: "말씀을 통해 느낀 점을 적어보세요",
    ph_dispatch: "파견 중 있었던 일과 결과를 적어보세요",
    toast_diary_saved: "기록을 저장했어요", toast_diary_deleted: "기록을 삭제했어요",
    toast_saved: "저장했어요", toast_copied: "클립보드에 복사했어요",
    toast_share_limited: "이 브라우저는 알림을 지원하지 않아요", toast_notif_limited: "이 브라우저는 알림을 지원하지 않아요",
    toast_share_fail: "복사에 실패했어요", toast_storage_full: "저장 공간이 부족해요. 첨부 사진을 정리해보세요.",
    toast_data_loaded: "데이터를 불러왔어요", toast_data_read_fail: "파일을 읽을 수 없어요",
    share_pending_header: "[보고 현황] 미제출 {n}건", share_all_done: "[보고 현황] 모든 지파·부서가 제출을 완료했어요.",
    share_due: "마감", notif_due_soon_body: "마감 임박 업무 {n}건이 있어요.",
  },
  en: {
    nav_home: "Home", nav_calendar: "Calendar", nav_more: "More", nav_settings: "Settings",
    brand: "TIMEBRIDGE",
    home_empty: "No tasks yet. Tap + to add your first one.",
    hidden_note: "{n} items from other categories are hidden · Showing {name} only",
    section_overdue: "Overdue", section_today: "Today", section_week: "This week", section_later: "Later", section_done: "Done",
    chip_all: "All", delta_hours: "{sign}{n}h",
    today_badge: "Today",
    cal_empty: "No tasks on this date.",
    cal_month: "Month", cal_week: "Week",
    hub_title: "More",
    hub_report_name: "Reports", hub_report_manage: "Manage tribes/depts", hub_report_stat: "{done}/{total} done",
    hub_money_name: "Money", hub_money_stat: "This month {amt}",
    hub_diary_name: "Records", hub_diary_recent: "Last · {date}", hub_diary_none: "No entries",
    hub_goals_name: "Goals", hub_goals_stat: "{done}/{total} achieved", hub_goals_manage: "Set a goal",
    goals_title: "Goals", goal_new: "New Goal", goal_edit: "Edit Goal",
    field_target_date: "Target date", ph_goal_title: "e.g., Pass the Spanish exam, Graduate seminary",
    goals_empty: "No goals yet. Tap + to write down your first one.",
    goal_achieved_badge: "Done!",
    toast_goal_added: "Goal added", toast_goal_updated: "Goal updated", toast_goal_deleted: "Goal deleted",
    report_title: "Tribe & Department Reports",
    report_month_collect: "This month's collection", report_done_of: "{done} / {total} done",
    report_days_left: "{n} days left · ", report_pending_count: "{n} not submitted",
    group_pending: "Not submitted · needs follow-up", group_review: "In review", group_done: "Submitted",
    report_empty: "No tribes or departments yet. Tap + at top right to add one.",
    report_share_btn: "Send reminder to those pending",
    dept_add_aria: "Add department",
    status_미제출: "Not submitted", status_검토중: "In review", status_제출완료: "Submitted",
    submitted_on: "Submitted",
    money_title: "Money", money_income: "Income", money_expense: "Expense", money_balance: "Balance",
    money_convert_note: "Accounts in other currencies are converted to {base} and combined.",
    money_rates: "Exchange rates", money_rate_hint: "Rates are against {base}. Update them yourself to match the real rate.",
    money_txn_history: "Transactions", money_empty: "No transactions this month.",
    diary_title: "Records", diary_empty: "No records yet. Tap + to add one.",
    settings_title: "Settings",
    settings_cat_group: "Categories", settings_cat_val: "Tasks · Glossary ›", settings_add_cat: "Add category",
    settings_reccat_group: "Record categories", settings_add_reccat: "Add record category",
    settings_dept_group: "Tribes & departments", settings_add_dept: "Add tribe/department",
    settings_notif_group: "Notifications", settings_notif_label: "Due-soon alerts",
    notif_granted: "Allowed", notif_denied: "Blocked", notif_default: "Not asked", notif_unsupported: "Unsupported",
    settings_notif_note: "This app runs only on this device, with no server. Notifications only surface tasks due soon while the app is open - it can't send push notifications while fully closed.",
    settings_tz_group: "Reference timezones", settings_tz_home: "Home timezone", settings_tz_secondary: "Secondary timezone",
    settings_tz_note: "These are the two options used by \"This time is in\" when adding a time to a task. Change them here if the countries you're dealing with change.",
    tz_pick_title: "Choose a timezone", tz_search_ph: "Search country or city",
    settings_design_group: "Appearance", settings_theme_label: "Theme",
    theme_light: "Light", theme_dark: "Dark", theme_system: "System",
    settings_accent_label: "Accent color",
    settings_lang_group: "Language",
    settings_data_group: "Data", settings_export: "Export (save backup file)", settings_import: "Import (load backup file)",
    task_new: "Add New Task", task_edit: "Edit Task",
    field_title: "Title", ph_title: "e.g., Q2 tithe report collection",
    field_dept: "Tribe / Department (optional)", ph_dept: "e.g., All tribes, Tribe 1, Facilities",
    field_due: "Due date", field_date: "Date", field_priority: "Priority",
    prio_high: "High", prio_med: "Med", prio_low: "Low",
    field_recur: "Repeat", recur_none: "None", recur_daily: "Daily", recur_weekly: "Weekly", recur_custom: "Custom days",
    recur_hint: "All occurrences up to the end date are created at once.",
    recur_weekday_label: "Repeat on", field_recur_until: "End date (optional)",
    recur_until_hint: "If left blank, it repeats for 6 months.",
    field_start_time: "Start time (optional)", field_end_time: "End time (optional)", field_tz_origin: "This time is in",
    tz_origin_hint: "Enter the time exactly as told to you in the other timezone — it's auto-converted and saved in your home timezone.",
    task_time_dual: "{gt} · {label} {kr}",
    recur_daily_label: "Daily", recur_weekly_label: "Weekly", recur_custom_label: "{days}", streak_suffix: " · Day {n}",
    field_notes: "Notes", ph_notes: "Add anything worth remembering",
    field_photo: "Photo", photo_add: "Add photo", photo_change: "Change", photo_remove: "Remove",
    notif_task_hint: "Notifications surface tasks due soon while the app is open. Turn them on in Settings.",
    btn_save: "Save", btn_delete: "Delete", btn_add: "Add", mark_done_aria: "Mark complete",
    toast_task_added: "Task added", toast_task_updated: "Task updated", toast_task_deleted: "Task deleted",
    cat_new: "Add New Category", field_name: "Name", ph_cat_name: "e.g., Education, Worship, Volunteer, Other …",
    field_color: "Color", toast_cat_added: "Category added", toast_cat_deleted: "Category deleted",
    cat_tab_tasks: "Tasks {n}", cat_tab_glossary: "Glossary",
    glossary_empty: "No tasks in this category yet.",
    ph_term: "Term", ph_def: "Definition", btn_add_term: "Add term", btn_delete_term: "Delete",
    btn_delete_category: "Delete this category",
    dept_new: "Add Tribe/Department", dept_edit: "Edit Tribe/Department",
    field_contact: "Contact (optional)", ph_contact: "e.g., Evangelist Kim", field_status: "Status",
    clock_add_title: "Add City", clock_empty: "You've added every available city.",
    txn_new: "Add New Transaction", txn_edit: "Edit Transaction",
    seg_expense: "Expense", seg_income: "Income",
    field_amount: "Amount", field_category: "Category", field_account: "Account",
    field_memo_opt: "Memo (optional)", ph_txn_memo: "e.g., groceries, bus fare …",
    toast_txn_added: "Transaction added", toast_txn_updated: "Transaction updated", toast_txn_deleted: "Transaction deleted",
    account_new: "Add Account", account_edit: "Edit Account",
    ph_account_name: "e.g., Chase Checking, Visa card", field_acct_type: "Type", field_start_balance: "Starting balance",
    acct_hint: "The balance when you added this account. Transactions add to and subtract from it after that.",
    field_currency: "Currency", field_rate: "Rate (1 {code} = ? {base})", rate_hint: "You can update this again anytime from the Money screen.",
    toast_min_account: "You need at least one account", toast_account_deleted: "Account deleted",
    diary_new: "New Record", diary_edit: "Edit Record",
    field_content: "Content", ph_diary: "What happened today, what you're thinking, what you're grateful for …",
    rec_tab_all: "All", rec_empty_cat: "No {name} entries yet.",
    rec_cat_new: "New Record Category", rec_cat_edit: "Edit Record Category", ph_rec_cat_name: "e.g., Dawn prayer, Visitation, Training log …",
    field_record_cat: "Category", field_verse: "Verse (optional)", ph_verse: "e.g., John 3:16",
    field_place: "Place", ph_place: "e.g., visit to the OO area, support for the OO event",
    field_meditation_text: "Reflection", ph_meditation: "Write what this passage means to you",
    ph_dispatch: "What happened during the dispatch, and the results",
    toast_diary_saved: "Record saved", toast_diary_deleted: "Record deleted",
    toast_saved: "Saved", toast_copied: "Copied to clipboard",
    toast_share_limited: "This browser doesn't support notifications", toast_notif_limited: "This browser doesn't support notifications",
    toast_share_fail: "Couldn't copy", toast_storage_full: "Storage is almost full. Try clearing some attached photos.",
    toast_data_loaded: "Data loaded", toast_data_read_fail: "Couldn't read that file",
    share_pending_header: "[Report status] {n} not submitted", share_all_done: "[Report status] Every tribe/department has submitted.",
    share_due: "Due", notif_due_soon_body: "{n} tasks are due soon.",
  },
  es: {
    nav_home: "Inicio", nav_calendar: "Calendario", nav_more: "Más", nav_settings: "Ajustes",
    brand: "TIMEBRIDGE",
    home_empty: "Aún no hay tareas. Toca + para agregar la primera.",
    hidden_note: "{n} elementos de otras categorías están ocultos · Mostrando solo {name}",
    section_overdue: "Atrasadas", section_today: "Hoy", section_week: "Esta semana", section_later: "Más adelante", section_done: "Completadas",
    chip_all: "Todo", delta_hours: "{sign}{n} h",
    today_badge: "Hoy",
    cal_empty: "No hay tareas en esta fecha.",
    cal_month: "Mes", cal_week: "Semana",
    hub_title: "Más",
    hub_report_name: "Informes", hub_report_manage: "Gestionar tribus/deptos.", hub_report_stat: "{done}/{total} completado",
    hub_money_name: "Finanzas", hub_money_stat: "Este mes {amt}",
    hub_diary_name: "Registros", hub_diary_recent: "Última · {date}", hub_diary_none: "Sin registros",
    hub_goals_name: "Metas", hub_goals_stat: "{done}/{total} logradas", hub_goals_manage: "Definir una meta",
    goals_title: "Metas", goal_new: "Nueva Meta", goal_edit: "Editar Meta",
    field_target_date: "Fecha meta", ph_goal_title: "Ej., Aprobar el examen de español, Graduarme del seminario",
    goals_empty: "Aún no hay metas. Toca + para escribir la primera.",
    goal_achieved_badge: "¡Lograda!",
    toast_goal_added: "Meta añadida", toast_goal_updated: "Meta actualizada", toast_goal_deleted: "Meta eliminada",
    report_title: "Informes por Tribu y Departamento",
    report_month_collect: "Recopilación de este mes", report_done_of: "{done} / {total} completado",
    report_days_left: "Quedan {n} días · ", report_pending_count: "{n} sin enviar",
    group_pending: "Sin enviar · requiere seguimiento", group_review: "En revisión", group_done: "Enviado",
    report_empty: "Aún no hay tribus ni departamentos. Toca + arriba a la derecha para agregar uno.",
    report_share_btn: "Enviar recordatorio a los pendientes",
    dept_add_aria: "Agregar departamento",
    status_미제출: "Sin enviar", status_검토중: "En revisión", status_제출완료: "Enviado",
    submitted_on: "Enviado",
    money_title: "Finanzas", money_income: "Ingresos", money_expense: "Gastos", money_balance: "Saldo",
    money_convert_note: "Las cuentas en otras monedas se convirtieron a {base} y se sumaron.",
    money_rates: "Tipo de cambio", money_rate_hint: "Tasas respecto a {base}. Actualízalas tú mismo según el tipo de cambio real.",
    money_txn_history: "Transacciones", money_empty: "No hay transacciones este mes.",
    diary_title: "Registros", diary_empty: "Aún no hay registros. Toca + para añadir uno.",
    settings_title: "Ajustes",
    settings_cat_group: "Categorías", settings_cat_val: "Tareas · Glosario ›", settings_add_cat: "Añadir categoría",
    settings_reccat_group: "Categorías de registro", settings_add_reccat: "Añadir categoría de registro",
    settings_dept_group: "Tribus y departamentos", settings_add_dept: "Añadir tribu/departamento",
    settings_notif_group: "Notificaciones", settings_notif_label: "Avisos de vencimiento",
    notif_granted: "Permitido", notif_denied: "Bloqueado", notif_default: "No solicitado", notif_unsupported: "No compatible",
    settings_notif_note: "Esta app funciona solo en este dispositivo, sin servidor. Las notificaciones solo muestran tareas próximas a vencer mientras la app está abierta; no puede enviar notificaciones push si está completamente cerrada.",
    settings_tz_group: "Husos horarios de referencia", settings_tz_home: "Huso horario base", settings_tz_secondary: "Huso horario secundario",
    settings_tz_note: "Son las dos opciones que aparecen en \"Esta hora es de\" al añadir una hora a una tarea. Cámbialas aquí si cambian los países con los que trabajas.",
    tz_pick_title: "Elegir huso horario", tz_search_ph: "Buscar país o ciudad",
    settings_design_group: "Apariencia", settings_theme_label: "Tema",
    theme_light: "Claro", theme_dark: "Oscuro", theme_system: "Sistema",
    settings_accent_label: "Color de acento",
    settings_lang_group: "Idioma",
    settings_data_group: "Datos", settings_export: "Exportar (guardar copia de seguridad)", settings_import: "Importar (cargar copia de seguridad)",
    task_new: "Añadir Nueva Tarea", task_edit: "Editar Tarea",
    field_title: "Título", ph_title: "Ej., Recopilación de diezmos del 2º trimestre",
    field_dept: "Tribu / Departamento (opcional)", ph_dept: "Ej., Todas las tribus, Tribu 1, Instalaciones",
    field_due: "Fecha límite", field_date: "Fecha", field_priority: "Prioridad",
    prio_high: "Alta", prio_med: "Media", prio_low: "Baja",
    field_recur: "Repetir", recur_none: "No", recur_daily: "Diario", recur_weekly: "Semanal", recur_custom: "Días específicos",
    recur_hint: "Se crean de una vez todas las repeticiones hasta la fecha de fin.",
    recur_weekday_label: "Se repite en", field_recur_until: "Fecha de fin (opcional)",
    recur_until_hint: "Si se deja vacío, se repite durante 6 meses.",
    field_start_time: "Hora de inicio (opcional)", field_end_time: "Hora de fin (opcional)", field_tz_origin: "Esta hora es de",
    tz_origin_hint: "Escribe la hora tal como te la dijeron en el otro huso horario — se convierte y guarda automáticamente en tu huso horario base.",
    task_time_dual: "{gt} · {label} {kr}",
    recur_daily_label: "Diario", recur_weekly_label: "Semanal", recur_custom_label: "{days}", streak_suffix: " · Día {n}",
    field_notes: "Notas", ph_notes: "Anota algo que quieras recordar",
    field_photo: "Foto", photo_add: "Agregar foto", photo_change: "Cambiar", photo_remove: "Quitar",
    notif_task_hint: "Las notificaciones muestran tareas próximas a vencer mientras la app está abierta. Actívalas en Ajustes.",
    btn_save: "Guardar", btn_delete: "Eliminar", btn_add: "Añadir", mark_done_aria: "Marcar como completada",
    toast_task_added: "Tarea añadida", toast_task_updated: "Tarea actualizada", toast_task_deleted: "Tarea eliminada",
    cat_new: "Añadir Nueva Categoría", field_name: "Nombre", ph_cat_name: "Ej., Educación, Alabanza, Voluntariado, Otro …",
    field_color: "Color", toast_cat_added: "Categoría añadida", toast_cat_deleted: "Categoría eliminada",
    cat_tab_tasks: "Tareas {n}", cat_tab_glossary: "Glosario",
    glossary_empty: "Todavía no hay tareas en esta categoría.",
    ph_term: "Término", ph_def: "Definición", btn_add_term: "Añadir término", btn_delete_term: "Eliminar",
    btn_delete_category: "Eliminar esta categoría",
    dept_new: "Añadir Tribu/Departamento", dept_edit: "Editar Tribu/Departamento",
    field_contact: "Responsable (opcional)", ph_contact: "Ej., Evangelista Kim", field_status: "Estado",
    clock_add_title: "Añadir Ciudad", clock_empty: "Ya añadiste todas las ciudades disponibles.",
    txn_new: "Añadir Nueva Transacción", txn_edit: "Editar Transacción",
    seg_expense: "Gasto", seg_income: "Ingreso",
    field_amount: "Monto", field_category: "Categoría", field_account: "Cuenta",
    field_memo_opt: "Nota (opcional)", ph_txn_memo: "Ej., mercado, pasaje de bus …",
    toast_txn_added: "Transacción añadida", toast_txn_updated: "Transacción actualizada", toast_txn_deleted: "Transacción eliminada",
    account_new: "Añadir Cuenta", account_edit: "Editar Cuenta",
    ph_account_name: "Ej., Banco Industrial, Tarjeta Visa", field_acct_type: "Tipo", field_start_balance: "Saldo inicial",
    acct_hint: "El saldo al momento de añadir esta cuenta. Las transacciones se suman y restan a partir de aquí.",
    field_currency: "Moneda", field_rate: "Tipo de cambio (1 {code} = ? {base})", rate_hint: "Puedes actualizarlo de nuevo cuando quieras desde la pantalla de Finanzas.",
    toast_min_account: "Debe haber al menos una cuenta", toast_account_deleted: "Cuenta eliminada",
    diary_new: "Nuevo Registro", diary_edit: "Editar Registro",
    field_content: "Contenido", ph_diary: "Qué pasó hoy, en qué piensas, por qué estás agradecido …",
    rec_tab_all: "Todos", rec_empty_cat: "Aún no hay registros de '{name}'.",
    rec_cat_new: "Nueva Categoría de Registro", rec_cat_edit: "Editar Categoría de Registro", ph_rec_cat_name: "Ej., Oración matutina, Visitación, Bitácora de formación …",
    field_record_cat: "Categoría", field_verse: "Versículo (opcional)", ph_verse: "Ej., Juan 3:16",
    field_place: "Lugar", ph_place: "Ej., visita a la zona OO, apoyo en el evento OO",
    field_meditation_text: "Reflexión", ph_meditation: "Escribe lo que este pasaje significa para ti",
    ph_dispatch: "Qué ocurrió durante la salida y los resultados",
    toast_diary_saved: "Registro guardado", toast_diary_deleted: "Registro eliminado",
    toast_saved: "Guardado", toast_copied: "Copiado al portapapeles",
    toast_share_limited: "Este navegador no admite notificaciones", toast_notif_limited: "Este navegador no admite notificaciones",
    toast_share_fail: "No se pudo copiar", toast_storage_full: "Queda poco espacio. Intenta eliminar algunas fotos adjuntas.",
    toast_data_loaded: "Datos cargados", toast_data_read_fail: "No se pudo leer el archivo",
    share_pending_header: "[Estado de informes] {n} sin enviar", share_all_done: "[Estado de informes] Todas las tribus/departamentos enviaron.",
    share_due: "Vence", notif_due_soon_body: "Tienes {n} tareas por vencer.",
  },
};

function t(key, params) {
  const lang = state.settings.lang || "ko";
  let str = (I18N[lang] && I18N[lang][key]) ?? I18N.ko[key] ?? key;
  if (params) {
    Object.keys(params).forEach((k) => { str = str.replace(`{${k}}`, params[k]); });
  }
  return str;
}

function defaultState() {
  return {
    categories: [
      { id: "admin", name: "행정서무", color: COLOR_PRESETS[0] },
      { id: "personal", name: "개인업무", color: COLOR_PRESETS[1] },
    ],
    filter: ["admin", "personal"],
    tasks: [],
    departments: [],
    glossary: {
      admin: [
        { id: uid(), term: "지파", def: "교회 내 편성된 소그룹 단위. 각 지파마다 담당 전도사가 있고, 정기 활동·헌금 보고를 행정서무 쪽으로 취합해서 올려요." },
      ],
    },
    worldClocks: [
      { id: uid(), tz: "America/Guatemala", label: "과테말라시티" },
      { id: uid(), tz: "Asia/Seoul", label: "한국 · 서울" },
    ],
    accounts: [
      { id: "cash", name: "현금", type: "현금", startBalance: 0, currency: BASE_CURRENCY },
      { id: "bank", name: "은행 계좌", type: "은행", startBalance: 0, currency: BASE_CURRENCY },
    ],
    transactions: [],
    diary: [],
    goals: [],
    recordCategories: [
      { id: "diary", name: "일기", color: COLOR_PRESETS[2] },
      { id: "meditation", name: "묵상", color: COLOR_PRESETS[3] },
      { id: "dispatch", name: "파견일지", color: COLOR_PRESETS[4] },
    ],
    settings: {
      notifAsked: false, calendarMode: "month", theme: "system", accent: COLOR_PRESETS[0], exchangeRates: {}, lang: "ko",
      homeTz: { tz: "America/Guatemala", label: "과테말라시티", flag: "🇬🇹" },
      secondaryTz: { tz: "Asia/Seoul", label: "한국 · 서울", flag: "🇰🇷" },
      wkAxisMode: "both",
    },
  };
}

/* ---------------- state ---------------- */

let state = loadState();
let currentView = "home";
let calendarCursor = todayISO().slice(0, 7); // "YYYY-MM"
let weekCursor = mondayOf(todayISO()); // ISO date of the Monday for the viewed week
let moneyCursor = todayISO().slice(0, 7); // "YYYY-MM", month viewed in 가계부
let selectedDate = todayISO();
let pendingAttachment = null; // dataURL staged while a task modal is open
let recordsTab = "all"; // "all" | "diary" | "meditation" | "dispatch" - filter for the records screen
let wkHalf = null; // "first" (Mon-Wed) | "second" (Thu-Sun) | null (auto-pick the half containing today)

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    const base = defaultState();
    return { ...base, ...parsed, settings: { ...base.settings, ...(parsed.settings || {}) } };
  } catch (e) {
    return defaultState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    showToast(t("toast_storage_full"));
  }
}

function resolveTheme() {
  const pref = state.settings.theme || "system";
  if (pref === "system") return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  return pref;
}

function applyTheme() {
  const resolved = resolveTheme();
  document.documentElement.dataset.theme = resolved;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", resolved === "dark" ? "#141519" : "#1E2129");
}

function applyAccent() {
  document.documentElement.style.setProperty("--accent", state.settings.accent || COLOR_PRESETS[0]);
}

if (window.matchMedia) {
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
    if ((state.settings.theme || "system") === "system") applyTheme();
  });
}

/* ---------------- utils ---------------- */

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function pad2(n) { return String(n).padStart(2, "0"); }

function todayISO() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function addDaysISO(iso, days) {
  const d = new Date(iso + "T00:00:00");
  d.setDate(d.getDate() + days);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function diffDays(iso) {
  const a = new Date(iso + "T00:00:00");
  const b = new Date(todayISO() + "T00:00:00");
  return Math.round((a - b) / 86400000);
}

function formatDday(iso) {
  const d = diffDays(iso);
  if (d === 0) return { text: t("today_badge"), cls: "soon" };
  if (d < 0) return { text: `D+${-d}`, cls: "urgent" };
  if (d === 1) return { text: "D-1", cls: "urgent" };
  if (d <= 3) return { text: `D-${d}`, cls: "soon" };
  return { text: `D-${d}`, cls: "" };
}

function locale() { return LANG_LOCALE[state.settings.lang || "ko"]; }

// dow: 0=Sun..6=Sat. 2023-01-01 was a Sunday - a stable reference date, any year works.
function weekdayLabel(dow) {
  return new Intl.DateTimeFormat(locale(), { weekday: "narrow" }).format(new Date(2023, 0, 1 + dow));
}

function formatMonthTitle(ym) {
  const [y, m] = ym.split("-").map(Number);
  return new Intl.DateTimeFormat(locale(), { year: "numeric", month: "long" }).format(new Date(y, m - 1, 1));
}

function formatDateTitle(iso) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(locale(), { month: "long", day: "numeric", weekday: "long" }).format(d);
}

// Month + day, no weekday - used where a weekday would be redundant (e.g. next to a "Today" badge).
function formatDateShort(iso) {
  const d = new Date(iso + "T00:00:00");
  return new Intl.DateTimeFormat(locale(), { month: "long", day: "numeric" }).format(d);
}

// Monday-start week, so a work/study week reads left-to-right the way it's lived.
function mondayOf(iso) {
  const d = new Date(iso + "T00:00:00");
  const dow = d.getDay(); // 0=Sun..6=Sat
  const back = dow === 0 ? 6 : dow - 1;
  return addDaysISO(iso, -back);
}

function formatWeekTitle(mondayIso) {
  const sunday = addDaysISO(mondayIso, 6);
  const a = new Date(mondayIso + "T00:00:00");
  const b = new Date(sunday + "T00:00:00");
  const fmt = new Intl.DateTimeFormat(locale(), { month: "short", day: "numeric" });
  return `${fmt.format(a)} - ${fmt.format(b)}`;
}

function escapeHtml(s) {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function catById(id) { return state.categories.find((c) => c.id === id); }
function deptById(id) { return state.departments.find((d) => d.id === id); }
function taskById(id) { return state.tasks.find((t) => t.id === id); }
function accountById(id) { return state.accounts.find((a) => a.id === id); }
function txnById(id) { return state.transactions.find((t) => t.id === id); }
function diaryById(id) { return state.diary.find((d) => d.id === id); }

function currencySymbol(code) {
  return CURRENCY_PRESETS.find((c) => c.code === code)?.symbol || code || BASE_CURRENCY;
}

// Rate is stored as "1 unit of `code` = N units of the base currency".
function toBaseAmount(amount, code) {
  if (!code || code === BASE_CURRENCY) return amount;
  const rate = state.settings.exchangeRates[code];
  return rate ? amount * rate : 0;
}

function formatMoney(n, code) {
  const v = Math.round(Number(n) || 0);
  return `${currencySymbol(code || BASE_CURRENCY)} ${v.toLocaleString("en-US")}`;
}

function formatMoneySigned(n, code) {
  const v = Math.round(Number(n) || 0);
  const sign = v > 0 ? "+" : v < 0 ? "-" : "";
  return `${currencySymbol(code || BASE_CURRENCY)} ${sign}${Math.abs(v).toLocaleString("en-US")}`;
}

function accountBalance(accountId) {
  const acc = accountById(accountId);
  if (!acc) return 0;
  const net = state.transactions
    .filter((t) => t.accountId === accountId)
    .reduce((sum, t) => sum + (t.type === "income" ? t.amount : -t.amount), 0);
  return acc.startBalance + net;
}

// Totals are converted into the base currency, since a month can span accounts
// held in different currencies.
function monthTotals(ym) {
  const txns = state.transactions.filter((t) => t.date.slice(0, 7) === ym);
  let income = 0, expense = 0;
  txns.forEach((t) => {
    const code = accountById(t.accountId)?.currency || BASE_CURRENCY;
    const base = toBaseAmount(t.amount, code);
    if (t.type === "income") income += base; else expense += base;
  });
  return { income, expense, net: income - expense, txns };
}

function usedForeignCurrencies() {
  return [...new Set(state.accounts.map((a) => a.currency).filter((c) => c && c !== BASE_CURRENCY))];
}

function chipTintStyle(color) {
  return `--chip-tint: color-mix(in oklch, ${color} 14%, var(--card)); --chip-color: ${color};`;
}

// IANA offset in minutes at a given instant, DST-aware, via Intl (no network needed).
function utcOffsetMinutes(tz, date) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, timeZoneName: "shortOffset" }).formatToParts(date);
  const part = parts.find((p) => p.type === "timeZoneName")?.value || "GMT+0";
  const m = part.match(/GMT([+-]\d+)(?::(\d+))?/);
  if (!m) return 0;
  const h = parseInt(m[1], 10);
  const min = m[2] ? parseInt(m[2], 10) : 0;
  return h * 60 + (h < 0 ? -min : min);
}

function isDaytime(tz, date) {
  const hour = parseInt(new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(date), 10);
  return hour >= 6 && hour < 19;
}

// Converts a wall-clock date+time in `fromTz` to the equivalent wall-clock date+time in `toTz`.
function convertWallTime(dateISO, timeHHMM, fromTz, toTz) {
  const asIfUtc = new Date(`${dateISO}T${timeHHMM}:00Z`);
  const fromOffset = utcOffsetMinutes(fromTz, asIfUtc);
  const trueUtcMs = asIfUtc.getTime() - fromOffset * 60000;
  const toOffset = utcOffsetMinutes(toTz, new Date(trueUtcMs));
  const shifted = new Date(trueUtcMs + toOffset * 60000);
  return {
    date: `${shifted.getUTCFullYear()}-${pad2(shifted.getUTCMonth() + 1)}-${pad2(shifted.getUTCDate())}`,
    time: `${pad2(shifted.getUTCHours())}:${pad2(shifted.getUTCMinutes())}`,
  };
}

function resizeImageFile(file, maxDim, quality) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxDim) { height = Math.round((height * maxDim) / width); width = maxDim; }
        else if (height > maxDim) { width = Math.round((width * maxDim) / height); height = maxDim; }
        const canvas = document.createElement("canvas");
        canvas.width = width; canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

function showToast(msg) {
  const root = document.getElementById("toast-root");
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  root.innerHTML = "";
  root.appendChild(el);
  setTimeout(() => { if (el.parentNode) el.remove(); }, 2200);
}

/* ---------------- task helpers ---------------- */

function activeCategoryIds() { return state.filter; }

function visibleTasks() {
  const active = new Set(activeCategoryIds());
  return state.tasks.filter((t) => active.has(t.categoryId));
}

function groupTasksByDate(tasks) {
  const groups = { overdue: [], today: [], week: [], later: [] };
  tasks.forEach((t) => {
    if (t.done) { groups.later.push(t); return; }
    const d = diffDays(t.dueDate);
    if (d < 0) groups.overdue.push(t);
    else if (d === 0) groups.today.push(t);
    else if (d <= 7) groups.week.push(t);
    else groups.later.push(t);
  });
  const doneTasks = tasks.filter((t) => t.done);
  groups.later = groups.later.filter((t) => !t.done);
  const sortByDate = (a, b) => a.dueDate.localeCompare(b.dueDate) || (a.startTime || "").localeCompare(b.startTime || "");
  groups.overdue.sort(sortByDate); groups.today.sort(sortByDate); groups.week.sort(sortByDate); groups.later.sort(sortByDate);
  return { ...groups, done: doneTasks.sort((a, b) => b.dueDate.localeCompare(a.dueDate)) };
}

function groupTasksByDept(tasks) {
  const map = new Map();
  tasks.forEach((t) => {
    const key = t.dept && t.dept.trim() ? t.dept.trim() : "기타";
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(t);
  });
  return map;
}

function shouldGroupByDept() {
  if (activeCategoryIds().length !== 1) return false;
  const catId = activeCategoryIds()[0];
  return state.tasks.some((t) => t.categoryId === catId && t.dept && t.dept.trim());
}

function recurringLabel(task) {
  if (!task.recurring) return "";
  if (task.recurring.freq === "daily") return t("recur_daily_label");
  if (task.recurring.freq === "custom") {
    const days = (task.recurring.weekdays || []).slice().sort().map(weekdayLabel).join(",");
    return t("recur_custom_label", { days });
  }
  return t("recur_weekly_label");
}

// Streak = consecutive completed instances of a recurring series, walking
// back one interval at a time from this instance (inclusive if it's done).
function computeStreak(t) {
  if (!t.recurring || !t.seriesId) return 0;
  const series = state.tasks
    .filter((x) => x.seriesId === t.seriesId)
    .sort((a, b) => (a.dueDate < b.dueDate ? -1 : a.dueDate > b.dueDate ? 1 : 0));
  const idx = series.findIndex((x) => x.id === t.id);
  if (idx === -1) return 0;
  let streak = 0;
  for (let i = t.done ? idx : idx - 1; i >= 0; i--) {
    if (!series[i].done) break;
    streak++;
  }
  return streak;
}

/* ---------------- rendering: shell ---------------- */

const HUB_VIEWS = ["hub", "report", "money", "diary", "goals"];
function setActiveNav() {
  const group = HUB_VIEWS.includes(currentView) ? "hub" : currentView;
  document.querySelectorAll(".nav-btn").forEach((b) => {
    b.dataset.active = String(b.dataset.view === group);
  });
}

function scrollWeekGridToNow() {
  const scroller = document.getElementById("wk-grid-scroll");
  if (!scroller) return;
  const anchor = document.getElementById("wk-anchor-hour");
  if (anchor) anchor.scrollIntoView({ block: "start", inline: "nearest" });
}

function render() {
  setActiveNav();
  const root = document.getElementById("view-root");
  if (currentView === "home") root.innerHTML = renderHome();
  else if (currentView === "calendar") {
    root.innerHTML = renderCalendar();
    scrollWeekGridToNow();
  }
  else if (currentView === "hub") root.innerHTML = renderHub();
  else if (currentView === "report") root.innerHTML = renderReport();
  else if (currentView === "money") root.innerHTML = renderMoney();
  else if (currentView === "diary") root.innerHTML = renderDiary();
  else if (currentView === "goals") root.innerHTML = renderGoals();
  else if (currentView === "settings") root.innerHTML = renderSettings();
}

function switchView(v) {
  currentView = v;
  render();
}

const NAV_LABEL_KEYS = { home: "nav_home", calendar: "nav_calendar", hub: "nav_more", settings: "nav_settings" };
function applyNavLabels() {
  document.querySelectorAll(".nav-btn").forEach((b) => {
    const span = b.querySelector("span");
    const key = NAV_LABEL_KEYS[b.dataset.view];
    if (span && key) span.textContent = t(key);
  });
  const fab = document.getElementById("btn-add-task");
  if (fab) fab.setAttribute("aria-label", t("task_new"));
}

/* ---------------- rendering: world clock ---------------- */

function renderClockRow() {
  const now = new Date();
  const cards = state.worldClocks.map((c, i) => {
    const day = isDaytime(c.tz, now);
    const time = new Intl.DateTimeFormat("ko-KR", { timeZone: c.tz, hour: "2-digit", minute: "2-digit", hour12: false }).format(now);
    const month = new Intl.DateTimeFormat("en-US", { timeZone: c.tz, month: "numeric" }).format(now);
    const day2 = new Intl.DateTimeFormat("en-US", { timeZone: c.tz, day: "numeric" }).format(now);
    let delta = "";
    if (i > 0) {
      const base = state.worldClocks[0];
      const diffH = Math.round((utcOffsetMinutes(c.tz, now) - utcOffsetMinutes(base.tz, now)) / 60);
      delta = `<div class="delta">${t("delta_hours", { sign: diffH > 0 ? "+" : "", n: diffH })}</div>`;
    }
    const removeBtn = state.worldClocks.length > 1
      ? `<button class="remove-clock" data-action="remove-clock" data-id="${c.id}" aria-label="${t("btn_delete")}">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 6l12 12M18 6L6 18"/></svg>
         </button>` : "";
    return `<div class="clock-card ${day ? "day" : "night"}">
      ${removeBtn}
      <div class="city">${escapeHtml(c.label)} ${day
        ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v3M12 20v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M1 12h3M20 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" stroke-linecap="round"/></svg>`
        : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>`}
      </div>
      <div class="time">${time}</div>
      <div class="date">${month}/${day2}${delta}</div>
    </div>`;
  }).join("");
  return `<div class="clock-row">${cards}<button class="clock-add" data-action="add-clock" aria-label="${t("clock_add_title")}">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  </button></div>`;
}

/* ---------------- rendering: chips ---------------- */

function renderChipRow() {
  const allActive = activeCategoryIds().length === state.categories.length;
  const chips = state.categories.map((c) => {
    const active = activeCategoryIds().includes(c.id);
    return `<button class="chip" data-cat="true" data-active="${active}" data-action="toggle-cat" data-id="${c.id}" style="${chipTintStyle(c.color)}">
      <span class="dot"></span>${escapeHtml(c.name)}
    </button>`;
  }).join("");
  return `<div class="chip-row">
    <button class="chip" data-active="${allActive}" data-action="select-all-cat">${t("chip_all")}</button>
    ${chips}
    <button class="chip-add" data-action="open-add-category">+</button>
  </div>`;
}

/* ---------------- rendering: task card ---------------- */

function shortTzLabel(label) { return label.split(" · ")[0]; }

function taskTimeLabel(task) {
  if (!task.startTime) return null;
  const homeTz = state.settings.homeTz.tz;
  const secTz = state.settings.secondaryTz.tz;
  const gtRange = task.endTime ? `${task.startTime}–${task.endTime}` : task.startTime;
  const secStart = convertWallTime(task.dueDate, task.startTime, homeTz, secTz).time;
  const secRange = task.endTime ? `${secStart}–${convertWallTime(task.dueDate, task.endTime, homeTz, secTz).time}` : secStart;
  return t("task_time_dual", { gt: gtRange, label: state.settings.secondaryTz.flag || shortTzLabel(state.settings.secondaryTz.label), kr: secRange });
}

function renderTaskCard(task) {
  const cat = catById(task.categoryId);
  const dd = formatDday(task.dueDate);
  const timeLabel = taskTimeLabel(task);
  const tags = [`<span class="tag cat" style="color:${cat ? cat.color : "inherit"}; background: color-mix(in oklch, ${cat ? cat.color : "gray"} 14%, var(--card));">${escapeHtml(cat ? cat.name : "")}</span>`];
  if (timeLabel) tags.push(`<span class="tag time-tag">${timeLabel}</span>`);
  if (task.dept) tags.push(`<span class="tag">${escapeHtml(task.dept)}</span>`);
  if (task.recurring) {
    const streak = computeStreak(task);
    tags.push(`<span class="tag streak">
      ${streak >= 2 ? `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2c2 3-1 4-1 7a3 3 0 1 0 6 0c1.5 1.5 2 3.5 2 5a7 7 0 1 1-14 0c0-3 1.5-5 3-7 1-1.3 1.5-2.8 1-5 1 .5 2 1.5 3 3z"/></svg>` : ""}
      ${recurringLabel(task)}${streak >= 2 ? t("streak_suffix", { n: streak }) : ""}
    </span>`);
  }
  return `<button class="task-card ${task.done ? "done" : ""}" data-action="open-task" data-id="${task.id}">
    <span class="task-check" data-action="toggle-done" data-id="${task.id}" role="button" aria-label="${t("mark_done_aria")}">
      <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
    </span>
    <span class="task-body">
      <span class="task-title">${escapeHtml(task.title)}</span>
      <span class="task-tags">${tags.join("")}</span>
    </span>
    <span class="task-side">
      <span class="dday ${dd.cls}">${dd.text}</span>
      ${task.attachment ? `<svg class="clip" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21.4 11.5l-8.9 8.9a5 5 0 0 1-7.1-7.1l8.9-8.9a3.5 3.5 0 0 1 5 5l-8.9 8.9a2 2 0 0 1-2.8-2.8l8.2-8.2"/></svg>` : ""}
    </span>
  </button>`;
}

function emptyState(msg) {
  return `<div class="empty-state">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>
    <div>${escapeHtml(msg)}</div>
  </div>`;
}

/* ---------------- rendering: home ---------------- */

function renderHome() {
  const tasks = visibleTasks();
  const hiddenCount = state.tasks.length - tasks.length;
  const total = state.categories.length;
  const oneActive = activeCategoryIds().length === 1 ? catById(activeCategoryIds()[0]) : null;

  let listHtml = "";
  if (tasks.length === 0) {
    listHtml = emptyState(t("home_empty"));
  } else if (shouldGroupByDept()) {
    const groups = groupTasksByDept(tasks.filter((t) => !t.done));
    listHtml = [...groups.entries()].map(([dept, list]) => `
      <div class="group-head">${escapeHtml(dept)}</div>
      ${list.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(renderTaskCard).join("")}
    `).join("");
    const doneList = tasks.filter((t) => t.done);
    if (doneList.length) listHtml += `<div class="group-head">${t("section_done")}</div>${doneList.map(renderTaskCard).join("")}`;
  } else {
    const g = groupTasksByDate(tasks);
    const blocks = [
      [t("section_overdue"), g.overdue], [t("section_today"), g.today], [t("section_week"), g.week], [t("section_later"), g.later], [t("section_done"), g.done],
    ];
    listHtml = blocks.filter(([, list]) => list.length).map(([label, list]) => `
      <div class="section-head"><h3>${label}</h3><span class="count">${list.length}</span></div>
      ${list.map(renderTaskCard).join("")}
    `).join("");
  }

  return `
    <div class="header">
      <div class="header-row">
        <div class="brand">${t("brand")}</div>
        <button class="icon-btn" data-action="goto-settings" aria-label="${t("settings_title")}">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09a1.65 1.65 0 0 0-1.08-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09a1.65 1.65 0 0 0 1.51-1.08 1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9c.14.62.62 1.11 1.51 1.51H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
        </button>
      </div>
      <div class="date-title">${formatDateTitle(todayISO())}</div>
    </div>
    ${renderClockRow()}
    ${renderChipRow()}
    ${hiddenCount > 0 && oneActive ? `<div class="hidden-note">${t("hidden_note", { n: hiddenCount, name: escapeHtml(oneActive.name) })}</div>` : ""}
    <div class="section">${listHtml}</div>
  `;
}

/* ---------------- rendering: calendar ---------------- */

function renderCalendar() {
  const mode = state.settings.calendarMode || "month";
  const modeToggle = `
    <div class="mode-toggle-wrap">
      <div class="tabs">
        <button class="tab-btn" data-active="${mode === "month"}" data-action="set-cal-mode" data-mode="month">${t("cal_month")}</button>
        <button class="tab-btn" data-active="${mode === "week"}" data-action="set-cal-mode" data-mode="week">${t("cal_week")}</button>
      </div>
    </div>
  `;
  return modeToggle + (mode === "week" ? renderWeekView() : renderMonthView());
}

const WK_HOUR_H = 40; // px per hour row in the week grid

function hourLabelHM(h, m) {
  const opts = m === 0
    ? { hour: "numeric", hourCycle: "h23" }
    : { hour: "numeric", minute: "2-digit", hourCycle: "h23" };
  return new Intl.DateTimeFormat(locale(), opts).format(new Date(2023, 0, 1, h, m));
}

function hourLabel(h) { return hourLabelHM(h, 0); }

function renderWeekView() {
  const active = new Set(activeCategoryIds());
  const today = todayISO();
  const days = [];
  for (let i = 0; i < 7; i++) days.push(addDaysISO(weekCursor, i));

  const dayNames = [1, 2, 3, 4, 5, 6, 0].map(weekdayLabel);
  const todayIdxInWeek = days.indexOf(today);
  const autoHalf = (todayIdxInWeek >= 0 && todayIdxInWeek <= 2) ? "first" : "second";
  const half = wkHalf || autoHalf;
  const halfDayIdxs = half === "first" ? [0, 1, 2] : [3, 4, 5, 6];

  const axisMode = state.settings.wkAxisMode || "both";
  const homeTz = state.settings.homeTz.tz;
  const secTz = state.settings.secondaryTz.tz;
  const showHomeAxis = axisMode === "home" || axisMode === "both";
  const showSecAxis = axisMode === "secondary" || axisMode === "both";
  const axisCount = (showHomeAxis ? 1 : 0) + (showSecAxis ? 1 : 0);

  const tasksByDay = days.map((iso) => state.tasks.filter((t) => t.dueDate === iso && active.has(t.categoryId)));
  const allDayByDay = tasksByDay.map((list) => list.filter((t) => !t.startTime));
  const timedByDay = tasksByDay.map((list) => list.filter((t) => t.startTime).sort((a, b) => a.startTime.localeCompare(b.startTime)));

  const headCells = halfDayIdxs.map((i) => {
    const iso = days[i];
    const d = new Date(iso + "T00:00:00");
    const isToday = iso === today;
    return `<div class="wk-daycol-head ${isToday ? "today" : ""}">
      <span class="wk-dow">${dayNames[i]}</span>
      <span class="wk-dnum">${d.getDate()}</span>
    </div>`;
  }).join("");

  const allDayCells = halfDayIdxs.map((i) => `
    <div class="wk-daycol-allday">
      ${allDayByDay[i].map((task) => `<button class="wk-allday-chip ${task.done ? "done" : ""}" data-action="open-task" data-id="${task.id}" style="background:color-mix(in oklch, ${catById(task.categoryId)?.color || "gray"} 22%, var(--card));">${escapeHtml(task.title)}</button>`).join("")}
    </div>`).join("");

  const now = new Date();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const bodyCells = halfDayIdxs.map((i) => {
    const isToday = days[i] === today;
    const blocks = timedByDay[i].map((task) => {
      const [sh, sm] = task.startTime.split(":").map(Number);
      const startMin = sh * 60 + sm;
      let durMin = 45;
      if (task.endTime) {
        const [eh, em] = task.endTime.split(":").map(Number);
        durMin = Math.max(20, (eh * 60 + em) - startMin);
      }
      const cat = catById(task.categoryId);
      return `<button class="wk-block ${task.done ? "done" : ""}" data-action="open-task" data-id="${task.id}"
        style="top:${startMin / 60 * WK_HOUR_H}px;height:${Math.max(22, durMin / 60 * WK_HOUR_H)}px;background:color-mix(in oklch, ${cat ? cat.color : "gray"} 28%, var(--card));border-left:3px solid ${cat ? cat.color : "gray"};">
        <span class="wk-block-time">${task.startTime}${task.endTime ? "–" + task.endTime : ""}</span>
        <span class="wk-block-title">${escapeHtml(task.title)}</span>
      </button>`;
    }).join("");
    const nowLine = isToday ? `<div class="wk-now-line" style="top:${nowMin / 60 * WK_HOUR_H}px;"></div>` : "";
    return `<div class="wk-daycol-body" style="height:${24 * WK_HOUR_H}px;">${blocks}${nowLine}</div>`;
  }).join("");

  const homeAxisCells = Array.from({ length: 24 }, (_, h) => `<div class="wk-hour-cell" id="${h === 7 && showHomeAxis ? "wk-anchor-hour" : ""}" style="height:${WK_HOUR_H}px;">${hourLabel(h)}</div>`).join("");
  const secAxisCells = Array.from({ length: 24 }, (_, h) => {
    const conv = convertWallTime(weekCursor, `${pad2(h)}:00`, homeTz, secTz);
    const [sh, sm] = conv.time.split(":").map(Number);
    return `<div class="wk-hour-cell wk-hour-cell-sec" id="${h === 7 && !showHomeAxis ? "wk-anchor-hour" : ""}" style="height:${WK_HOUR_H}px;">${hourLabelHM(sh, sm)}</div>`;
  }).join("");

  const halfSeg = (val, label) => `<button type="button" class="seg-btn small" data-active="${half === val}" data-action="pick-wk-half" data-val="${val}">${label}</button>`;
  const axisSeg = (val, label) => `<button type="button" class="seg-btn small" data-active="${axisMode === val}" data-action="pick-wk-axis" data-val="${val}">${label}</button>`;
  const axisColsCss = `${showHomeAxis ? "44px " : ""}${showSecAxis ? "44px " : ""}repeat(${halfDayIdxs.length}, 1fr)`;

  return `
    <div class="cal-header">
      <button class="cal-nav" data-action="week-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <h2>${formatWeekTitle(weekCursor)}</h2>
      <button class="cal-nav" data-action="week-next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
    </div>
    ${renderChipRow()}
    <div class="wk-controls">
      <div class="seg" id="wk-half-seg">${halfSeg("first", `${dayNames[0]}-${dayNames[2]}`)}${halfSeg("second", `${dayNames[3]}-${dayNames[6]}`)}</div>
      <div class="seg" id="wk-axis-seg">${axisSeg("home", state.settings.homeTz.flag || shortTzLabel(state.settings.homeTz.label))}${axisSeg("secondary", state.settings.secondaryTz.flag || shortTzLabel(state.settings.secondaryTz.label))}${axisSeg("both", `${state.settings.homeTz.flag || ""}${state.settings.secondaryTz.flag || ""}`)}</div>
    </div>
    <div class="wk-grid-scroll" id="wk-grid-scroll">
      <div class="wk-grid" style="grid-template-columns:${axisColsCss};">
        <div class="wk-corner" style="grid-column:span ${axisCount || 1};"></div>
        ${headCells}
        <div class="wk-corner-allday" style="grid-column:span ${axisCount || 1};"></div>
        ${allDayCells}
        ${showHomeAxis ? `<div class="wk-axis">${homeAxisCells}</div>` : ""}
        ${showSecAxis ? `<div class="wk-axis wk-axis-sec" style="left:${showHomeAxis ? 44 : 0}px;">${secAxisCells}</div>` : ""}
        ${bodyCells}
      </div>
    </div>
  `;
}

function renderMonthView() {
  const [y, m] = calendarCursor.split("-").map(Number);
  const first = new Date(y, m - 1, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(y, m, 0).getDate();
  const daysInPrevMonth = new Date(y, m - 1, 0).getDate();

  const active = new Set(activeCategoryIds());
  const tasksByDate = new Map();
  state.tasks.forEach((t) => {
    if (!active.has(t.categoryId)) return;
    if (!tasksByDate.has(t.dueDate)) tasksByDate.set(t.dueDate, []);
    tasksByDate.get(t.dueDate).push(t);
  });

  const cells = [];
  for (let i = 0; i < startDow; i++) {
    const dnum = daysInPrevMonth - startDow + 1 + i;
    cells.push({ label: dnum, other: true, iso: null });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ label: d, other: false, iso: `${y}-${pad2(m)}-${pad2(d)}` });
  }
  while (cells.length % 7 !== 0) {
    const dnum = cells.length - (startDow + daysInMonth) + 1;
    cells.push({ label: dnum, other: true, iso: null });
  }

  const today = todayISO();
  const cellsHtml = cells.map((c) => {
    if (c.other) return `<div class="cal-cell other-month"><div class="num">${c.label}</div></div>`;
    const dayTasks = tasksByDate.get(c.iso) || [];
    const cats = [...new Set(dayTasks.map((t) => t.categoryId))].slice(0, 3);
    const dots = cats.map((cid) => `<span style="background:${catById(cid)?.color || "gray"}"></span>`).join("");
    const isToday = c.iso === today;
    const isSel = c.iso === selectedDate;
    return `<button class="cal-cell ${isToday ? "today" : ""} ${isSel ? "selected" : ""}" data-action="select-date" data-date="${c.iso}">
      <div class="num">${c.label}</div>
      <div class="cal-dots">${dots}</div>
    </button>`;
  }).join("");

  const selTasks = (tasksByDate.get(selectedDate) || []).sort((a, b) => (a.done !== b.done ? (a.done ? 1 : -1) : (a.startTime || "").localeCompare(b.startTime || "")));
  const selLabel = selectedDate === today ? `${formatDateShort(selectedDate)} (${t("today_badge")})` : formatDateShort(selectedDate);

  return `
    <div class="cal-header">
      <button class="cal-nav" data-action="cal-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <h2>${formatMonthTitle(calendarCursor)}</h2>
      <button class="cal-nav" data-action="cal-next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
    </div>
    ${renderChipRow()}
    <div class="cal-grid-head">${[0, 1, 2, 3, 4, 5, 6].map((d) => `<div>${weekdayLabel(d)}</div>`).join("")}</div>
    <div class="cal-grid">${cellsHtml}</div>
    <div class="section">
      <div class="section-head"><h3>${selLabel}</h3><span class="count">${selTasks.length || ""}</span></div>
      ${selTasks.length ? selTasks.map(renderTaskCard).join("") : emptyState(t("cal_empty"))}
    </div>
  `;
}

/* ---------------- rendering: hub ---------------- */

function subHeader(title, rightHtml) {
  return `<div class="header">
    <div class="header-row" style="gap:10px;">
      <button class="icon-btn" data-action="goto-hub" aria-label="${t("nav_more")}">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <div class="date-title" style="font-size:18px;flex:1;">${escapeHtml(title)}</div>
      ${rightHtml || ""}
    </div>
  </div>`;
}

function renderHub() {
  const done = state.departments.filter((d) => d.status === "제출완료").length;
  const total = state.departments.length;
  const thisMonth = monthTotals(todayISO().slice(0, 7));
  const lastDiary = [...state.diary].sort((a, b) => b.date.localeCompare(a.date))[0];

  const tile = (view, label, stat, icon) => `
    <button class="hub-tile" data-action="goto-${view}">
      <div class="hub-tile-icon">${icon}</div>
      <div class="hub-tile-name">${escapeHtml(label)}</div>
      <div class="hub-tile-stat">${escapeHtml(stat)}</div>
    </button>`;

  return `
    <div class="header"><div class="date-title" style="font-size:18px;">${t("hub_title")}</div></div>
    <div class="hub-grid">
      ${tile("report", t("hub_report_name"), total ? t("hub_report_stat", { done, total }) : t("hub_report_manage"),
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V10M12 19V4M20 19v-7"/></svg>`)}
      ${tile("money", t("hub_money_name"), t("hub_money_stat", { amt: formatMoneySigned(thisMonth.net) }),
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/></svg>`)}
      ${tile("diary", t("hub_diary_name"), lastDiary ? t("hub_diary_recent", { date: lastDiary.date.slice(5).replace("-", "/") }) : t("hub_diary_none"),
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h13a2 2 0 0 1 2 2v13a1 1 0 0 1-1.55.83L14 17H6a2 2 0 0 1-2-2V4z"/><path d="M8 9h8M8 13h5"/></svg>`)}
      ${tile("goals", t("hub_goals_name"), state.goals.length ? t("hub_goals_stat", { done: state.goals.filter((g) => g.done).length, total: state.goals.length }) : t("hub_goals_manage"),
        `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3v18"/><path d="M5 4c2-1 3 1 6 1s4-2 6-1v9c-2-1-3 1-6 1s-4-2-6-1z"/></svg>`)}
    </div>
  `;
}

/* ---------------- rendering: report ---------------- */

function statusLabel(status) {
  return t("status_" + status);
}

function renderReport() {
  const depts = state.departments;
  const done = depts.filter((d) => d.status === "제출완료").length;
  const total = depts.length || 1;
  const pct = Math.round((done / total) * 100);
  const pending = depts.filter((d) => d.status === "미제출");
  const review = depts.filter((d) => d.status === "검토중");
  const submitted = depts.filter((d) => d.status === "제출완료");

  const nearest = pending.concat(review).sort((a, b) => a.dueDate.localeCompare(b.dueDate))[0];
  const daysLeft = nearest ? diffDays(nearest.dueDate) : null;

  const deptCard = (d, big) => {
    const initials = d.name.slice(0, 2);
    const cls = d.status === "미제출" ? "pending" : d.status === "검토중" ? "review" : "done";
    const badgeBg = d.status === "미제출" ? "var(--danger-bg)" : d.status === "검토중" ? "var(--warn-bg)" : "var(--good-bg)";
    const badgeColor = d.status === "미제출" ? "var(--danger)" : d.status === "검토중" ? "var(--warn)" : "var(--good)";
    if (!big) {
      return `<button class="dept-card" data-action="open-dept" data-id="${d.id}">
        <div class="dept-badge" style="background:${badgeBg};color:${badgeColor};">${escapeHtml(initials)}</div>
        <div class="name" style="flex:1;font-size:13px;font-weight:700;">${escapeHtml(d.name)}</div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="${badgeColor}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
      </button>`;
    }
    return `<button class="dept-card ${cls === "pending" ? "pending" : ""}" data-action="open-dept" data-id="${d.id}">
      <div class="dept-badge" style="background:${badgeBg};color:${badgeColor};">${escapeHtml(initials)}</div>
      <div class="dept-info">
        <div class="name">${escapeHtml(d.name)}</div>
        <div class="sub">${d.contact ? escapeHtml(d.contact) : (d.status === "제출완료" ? t("submitted_on") : `${t("share_due")} ${d.dueDate.slice(5).replace("-", "/")}`)}</div>
      </div>
      <span class="status-pill ${d.status}">${d.status === "미제출" ? formatDday(d.dueDate).text : statusLabel(d.status)}</span>
    </button>`;
  };

  return `
    ${subHeader(t("report_title"), `<button class="icon-btn" data-action="open-add-dept" aria-label="${t("dept_add_aria")}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </button>`)}
    <div class="progress-card" style="margin-top:14px;">
      <div class="row"><span>${t("report_month_collect")}</span><span>${t("report_done_of", { done, total })}</span></div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
      <div class="sub">${daysLeft !== null ? t("report_days_left", { n: daysLeft }) : ""}${t("report_pending_count", { n: pending.length })}</div>
    </div>
    <div class="section">
      ${pending.length ? `<div class="dept-group-title pending">${t("group_pending")}</div>${pending.map((d) => deptCard(d, true)).join("")}` : ""}
      ${review.length ? `<div class="dept-group-title review">${t("group_review")}</div>${review.map((d) => deptCard(d, true)).join("")}` : ""}
      ${submitted.length ? `<div class="dept-group-title done">${t("group_done")}</div>${submitted.map((d) => deptCard(d, false)).join("")}` : ""}
      ${depts.length === 0 ? emptyState(t("report_empty")) : ""}
    </div>
    ${depts.length ? `<button class="share-btn" data-action="share-report">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12v7a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-7M16 6l-4-4-4 4M12 2v13"/></svg>
      ${t("report_share_btn")}
    </button>` : ""}
  `;
}

/* ---------------- rendering: money ---------------- */

function renderMoney() {
  const totals = monthTotals(moneyCursor);
  const txns = [...totals.txns].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt - a.createdAt);

  const acctCards = state.accounts.map((a) => `
    <button class="acct-card" data-action="open-account" data-id="${a.id}">
      <div class="acct-name">${escapeHtml(a.name)}</div>
      <div class="acct-balance">${formatMoney(accountBalance(a.id), a.currency)}</div>
      <div class="acct-type">${escapeHtml(a.type)}</div>
    </button>`).join("");

  const txnRow = (txn) => {
    const acc = accountById(txn.accountId);
    const isIncome = txn.type === "income";
    return `<button class="txn-row" data-action="open-txn" data-id="${txn.id}">
      <div class="txn-cat ${isIncome ? "income" : "expense"}">${escapeHtml(txn.category.slice(0, 2))}</div>
      <div class="txn-info">
        <div class="txn-title">${escapeHtml(txn.category)}${txn.memo ? ` · ${escapeHtml(txn.memo)}` : ""}</div>
        <div class="txn-sub">${acc ? escapeHtml(acc.name) : ""} · ${txn.date.slice(5).replace("-", "/")}</div>
      </div>
      <div class="txn-amt ${isIncome ? "income" : "expense"}">${isIncome ? "+" : "-"}${formatMoney(txn.amount, acc?.currency)}</div>
    </button>`;
  };

  const foreignCurrencies = usedForeignCurrencies();
  const rateRows = foreignCurrencies.map((code) => `
    <div class="rate-row">
      <span>1 ${escapeHtml(code)} =</span>
      <input type="number" inputmode="decimal" step="0.01" min="0" data-action="set-rate" data-code="${code}" value="${state.settings.exchangeRates[code] ?? ""}" placeholder="0.00">
      <span>${BASE_CURRENCY}</span>
    </div>`).join("");

  return `
    ${subHeader(t("money_title"), `<button class="icon-btn" data-action="open-add-account" aria-label="${t("field_account")}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </button>`)}
    <div class="cal-header" style="padding-top:14px;">
      <button class="cal-nav" data-action="money-prev"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg></button>
      <h2>${formatMonthTitle(moneyCursor)}</h2>
      <button class="cal-nav" data-action="money-next"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"/></svg></button>
    </div>
    <div class="progress-card" style="margin-top:14px;">
      <div class="row"><span>${t("money_income")}</span><span style="color:oklch(75% 0.14 150);">${formatMoney(totals.income)}</span></div>
      <div class="row"><span>${t("money_expense")}</span><span style="color:oklch(78% 0.09 30);">${formatMoney(totals.expense)}</span></div>
      <div class="row" style="border-top:1px solid oklch(38% 0.02 260);padding-top:8px;margin-top:2px;"><span>${t("money_balance")}</span><span>${formatMoneySigned(totals.net)}</span></div>
      ${foreignCurrencies.length ? `<div class="sub">${t("money_convert_note", { base: BASE_CURRENCY })}</div>` : ""}
    </div>
    <div class="acct-row">${acctCards}</div>
    ${foreignCurrencies.length ? `
    <div class="section" style="padding-top:8px;padding-bottom:0;">
      <div class="section-head"><h3>${t("money_rates")}</h3></div>
      ${rateRows}
      <div class="hint">${t("money_rate_hint", { base: BASE_CURRENCY })}</div>
    </div>` : ""}
    <div class="section">
      <div class="section-head"><h3>${t("money_txn_history")}</h3><span class="count">${txns.length || ""}</span></div>
      ${txns.length ? txns.map(txnRow).join("") : emptyState(t("money_empty"))}
    </div>
  `;
}

/* ---------------- rendering: diary ---------------- */

function recordCategoryById(id) { return state.recordCategories.find((c) => c.id === id); }
function defaultRecordCatId() { return state.recordCategories[0]?.id || "diary"; }

function renderDiary() {
  const entries = [...state.diary]
    .filter((e) => recordsTab === "all" || (e.category || defaultRecordCatId()) === recordsTab)
    .sort((a, b) => b.date.localeCompare(a.date));
  const row = (e) => {
    const cat = e.category || defaultRecordCatId();
    const catObj = recordCategoryById(cat);
    const subtitle = cat === "meditation" && e.verse ? e.verse : cat === "dispatch" && e.place ? e.place : "";
    return `
    <button class="diary-card" data-action="open-diary" data-id="${e.id}">
      <div class="diary-date"><span class="tag" style="${catObj ? `color:${catObj.color};background:color-mix(in oklch, ${catObj.color} 14%, var(--card));` : ""}">${escapeHtml(catObj ? catObj.name : cat)}</span>${formatDateTitle(e.date)}</div>
      ${subtitle ? `<div class="diary-sub">${escapeHtml(subtitle)}</div>` : ""}
      <div class="diary-preview">${escapeHtml(e.text.slice(0, 60))}${e.text.length > 60 ? "…" : ""}</div>
    </button>`;
  };
  const emptyMsg = recordsTab === "all" ? t("diary_empty") : t("rec_empty_cat", { name: recordCategoryById(recordsTab)?.name || "" });
  const chips = state.recordCategories.map((c) => `
    <button class="chip" data-cat="true" data-active="${recordsTab === c.id}" data-action="set-records-tab" data-tab="${c.id}" style="${chipTintStyle(c.color)}">
      <span class="dot"></span>${escapeHtml(c.name)}
    </button>`).join("");
  return `
    ${subHeader(t("diary_title"), `<button class="icon-btn" data-action="open-add-diary" aria-label="${t("diary_new")}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </button>`)}
    <div class="chip-row">
      <button class="chip" data-active="${recordsTab === "all"}" data-action="set-records-tab" data-tab="all">${t("rec_tab_all")}</button>
      ${chips}
      <button class="chip-add" data-action="open-add-record-category">+</button>
    </div>
    <div class="section" style="padding-top:14px;">
      ${entries.length ? entries.map(row).join("") : emptyState(emptyMsg)}
    </div>
  `;
}

/* ---------------- rendering: goals ---------------- */

function renderGoals() {
  const goals = [...state.goals].sort((a, b) => (a.done !== b.done ? (a.done ? 1 : -1) : a.targetDate.localeCompare(b.targetDate)));
  const row = (g) => {
    const dd = formatDday(g.targetDate);
    return `<button class="task-card ${g.done ? "done" : ""}" data-action="open-goal" data-id="${g.id}">
      <span class="task-check" data-action="toggle-goal-done" data-id="${g.id}" role="button" aria-label="${t("mark_done_aria")}">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12l5 5L20 7"/></svg>
      </span>
      <span class="task-body">
        <span class="task-title">${escapeHtml(g.title)}</span>
        <span class="task-tags"><span class="tag">${formatDateShort(g.targetDate)}</span></span>
      </span>
      <span class="task-side">
        <span class="dday ${g.done ? "" : dd.cls}">${g.done ? t("goal_achieved_badge") : dd.text}</span>
      </span>
    </button>`;
  };
  return `
    ${subHeader(t("goals_title"), `<button class="icon-btn" data-action="open-add-goal" aria-label="${t("goal_new")}">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
    </button>`)}
    <div class="section" style="padding-top:14px;">
      ${goals.length ? goals.map(row).join("") : emptyState(t("goals_empty"))}
    </div>
  `;
}

/* ---------------- rendering: settings ---------------- */

function renderSettings() {
  const notifStatus = ("Notification" in window) ? Notification.permission : "unsupported";
  const notifLabel = { granted: t("notif_granted"), denied: t("notif_denied"), default: t("notif_default"), unsupported: t("notif_unsupported") }[notifStatus];
  const curLang = state.settings.lang || "ko";
  return `
    <div class="header"><div class="date-title" style="font-size:18px;">${t("settings_title")}</div></div>
    <div class="settings-group-title">${t("settings_cat_group")}</div>
    <div class="settings-list">
      ${state.categories.map((c) => `
        <button class="settings-row" data-action="open-category-detail" data-id="${c.id}">
          <span class="dot" style="width:10px;height:10px;border-radius:999px;background:${c.color};"></span>
          <span class="label">${escapeHtml(c.name)}</span>
          <span class="val">${t("settings_cat_val")}</span>
        </button>`).join("")}
      <button class="dashed-row" data-action="open-add-category">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        ${t("settings_add_cat")}
      </button>
    </div>
    <div class="settings-group-title">${t("settings_reccat_group")}</div>
    <div class="settings-list">
      ${state.recordCategories.map((c) => `
        <button class="settings-row" data-action="open-record-category" data-id="${c.id}">
          <span class="dot" style="width:10px;height:10px;border-radius:999px;background:${c.color};"></span>
          <span class="label">${escapeHtml(c.name)}</span>
          <span class="val">›</span>
        </button>`).join("")}
      <button class="dashed-row" data-action="open-add-record-category">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        ${t("settings_add_reccat")}
      </button>
    </div>
    <div class="settings-group-title">${t("settings_dept_group")}</div>
    <div class="settings-list">
      ${state.departments.map((d) => `
        <button class="settings-row" data-action="open-dept" data-id="${d.id}">
          <span class="label">${escapeHtml(d.name)}</span>
          <span class="status-pill ${d.status}">${statusLabel(d.status)}</span>
        </button>`).join("")}
      <button class="dashed-row" data-action="open-add-dept">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
        ${t("settings_add_dept")}
      </button>
    </div>
    <div class="settings-group-title">${t("settings_notif_group")}</div>
    <div class="settings-list">
      <button class="settings-row" data-action="request-notif">
        <span class="label">${t("settings_notif_label")}</span>
        <span class="val">${notifLabel}</span>
      </button>
    </div>
    <div class="settings-note">${t("settings_notif_note")}</div>
    <div class="settings-group-title">${t("settings_tz_group")}</div>
    <div class="settings-list">
      <button class="settings-row" data-action="open-pick-tz" data-which="home">
        <span class="label">${t("settings_tz_home")}</span>
        <span class="val">${state.settings.homeTz.flag || ""} ${escapeHtml(state.settings.homeTz.label)} ›</span>
      </button>
      <button class="settings-row" data-action="open-pick-tz" data-which="secondary">
        <span class="label">${t("settings_tz_secondary")}</span>
        <span class="val">${state.settings.secondaryTz.flag || ""} ${escapeHtml(state.settings.secondaryTz.label)} ›</span>
      </button>
    </div>
    <div class="settings-note">${t("settings_tz_note")}</div>
    <div class="settings-group-title">${t("settings_design_group")}</div>
    <div class="settings-list">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;">
      <div class="field">
        <label>${t("settings_theme_label")}</label>
        <div class="seg" id="theme-seg">
          ${[["light", t("theme_light")], ["dark", t("theme_dark")], ["system", t("theme_system")]].map(([val, label]) => `
            <button type="button" class="seg-btn small" data-active="${(state.settings.theme || "system") === val}" data-action="pick-theme" data-val="${val}">${label}</button>
          `).join("")}
        </div>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("settings_accent_label")}</label>
        <div class="color-row">
          ${COLOR_PRESETS.map((col) => `<button type="button" class="color-swatch" data-action="pick-accent" data-color="${col}" data-active="${(state.settings.accent || COLOR_PRESETS[0]) === col}" style="background:${col};color:${col};">
            <svg viewBox="0 0 24 24" fill="none" stroke="${contrastStroke(col)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="${(state.settings.accent || COLOR_PRESETS[0]) === col ? "" : "display:none;"}"><path d="M5 12l5 5L20 7"/></svg>
          </button>`).join("")}
        </div>
      </div>
      </div>
    </div>
    <div class="settings-group-title">${t("settings_lang_group")}</div>
    <div class="settings-list">
      <div style="background:var(--card);border:1px solid var(--border);border-radius:var(--radius-md);padding:14px;">
      <div class="seg" id="lang-seg">
        ${[["ko", "한국어"], ["en", "English"], ["es", "Español"]].map(([val, label]) => `
          <button type="button" class="seg-btn small" data-active="${curLang === val}" data-action="pick-lang" data-val="${val}">${label}</button>
        `).join("")}
      </div>
      </div>
    </div>
    <div class="settings-group-title">${t("settings_data_group")}</div>
    <div class="settings-list">
      <button class="settings-row" data-action="export-data">
        <span class="label">${t("settings_export")}</span>
      </button>
      <button class="settings-row" data-action="import-data">
        <span class="label">${t("settings_import")}</span>
      </button>
    </div>
  `;
}

/* ---------------- modal: sheet helpers ---------------- */

function openSheet(html) {
  const root = document.getElementById("modal-root");
  root.innerHTML = `<div class="sheet-backdrop">
    <div class="sheet" data-stop="true">${html}</div>
  </div>`;
}

function closeSheet() {
  document.getElementById("modal-root").innerHTML = "";
  pendingAttachment = null;
}

/* ---------------- modal: task ---------------- */

function openTaskModal(taskId) {
  const editing = taskId ? taskById(taskId) : null;
  pendingAttachment = editing ? editing.attachment || null : null;

  const catSeg = state.categories.map((c) => `
    <button type="button" class="seg-btn" data-active="${(editing ? editing.categoryId : state.categories[0].id) === c.id}" data-action="pick-cat" data-id="${c.id}"
      style="${(editing ? editing.categoryId : state.categories[0].id) === c.id ? `background:${c.color};border-color:${c.color};color:var(--on-ink);` : ""}">${escapeHtml(c.name)}</button>
  `).join("");

  const prio = editing?.priority || "med";
  const prioSeg = (val, label) => `<button type="button" class="seg-btn small" data-active="${prio === val}" data-action="pick-prio" data-val="${val}">${label}</button>`;

  const recur = editing?.recurring?.freq || "none";
  const recurSeg = (val, label) => `<button type="button" class="seg-btn small" data-active="${recur === val}" data-action="pick-recur" data-val="${val}">${label}</button>`;
  const recurWeekdays = editing?.recurring?.weekdays || [];
  const weekdayBtn = (dow) => `<button type="button" class="seg-btn small" data-active="${recurWeekdays.includes(dow)}" data-action="toggle-weekday" data-dow="${dow}">${weekdayLabel(dow)}</button>`;
  const recurUntil = editing?.recurring?.until || "";

  const tzOrigin = "HOME";
  const tzOriginSeg = (val, label) => `<button type="button" class="seg-btn small" data-active="${tzOrigin === val}" data-action="pick-tz-origin" data-val="${val}">${label}</button>`;

  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("task_edit") : t("task_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="task-form" data-task-id="${editing ? editing.id : ""}">
      <div class="seg" id="cat-seg">${catSeg}</div>
      <div class="field" style="margin-top:18px;">
        <label>${t("field_title")}</label>
        <input type="text" name="title" required value="${escapeHtml(editing?.title || "")}" placeholder="${t("ph_title")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_dept")}</label>
        <input type="text" name="dept" value="${escapeHtml(editing?.dept || "")}" placeholder="${t("ph_dept")}">
      </div>
      <div class="two-col" style="margin-top:14px;">
        <div class="field">
          <label>${t("field_due")}</label>
          <input type="date" name="dueDate" required value="${editing?.dueDate || todayISO()}">
        </div>
        <div class="field">
          <label>${t("field_priority")}</label>
          <div class="seg" id="prio-seg">${prioSeg("high", t("prio_high"))}${prioSeg("med", t("prio_med"))}${prioSeg("low", t("prio_low"))}</div>
        </div>
      </div>
      <div class="two-col" style="margin-top:14px;">
        <div class="field">
          <label>${t("field_start_time")}</label>
          <input type="time" name="startTime" value="${editing?.startTime || ""}">
        </div>
        <div class="field">
          <label>${t("field_end_time")}</label>
          <input type="time" name="endTime" value="${editing?.endTime || ""}">
        </div>
      </div>
      <div class="field" style="margin-top:10px;">
        <label>${t("field_tz_origin")}</label>
        <div class="seg" id="tz-origin-seg">${tzOriginSeg("HOME", `${state.settings.homeTz.flag || ""} ${shortTzLabel(state.settings.homeTz.label)}`)}${tzOriginSeg("SECONDARY", `${state.settings.secondaryTz.flag || ""} ${shortTzLabel(state.settings.secondaryTz.label)}`)}</div>
        <div class="hint">${t("tz_origin_hint")}</div>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_recur")}</label>
        <div class="seg" id="recur-seg">${recurSeg("none", t("recur_none"))}${recurSeg("daily", t("recur_daily"))}${recurSeg("weekly", t("recur_weekly"))}${recurSeg("custom", t("recur_custom"))}</div>
        <div class="hint">${t("recur_hint")}</div>
        <div id="recur-weekday-row" style="margin-top:8px;display:${recur === "custom" ? "block" : "none"};">
          <label>${t("recur_weekday_label")}</label>
          <div class="seg" id="weekday-seg">${[0,1,2,3,4,5,6].map(weekdayBtn).join("")}</div>
        </div>
        <div id="recur-until-row" style="margin-top:10px;display:${recur !== "none" ? "block" : "none"};">
          <label>${t("field_recur_until")}</label>
          <input type="date" name="recurUntil" value="${recurUntil}">
          <div class="hint">${t("recur_until_hint")}</div>
        </div>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_notes")}</label>
        <textarea name="notes" placeholder="${t("ph_notes")}">${escapeHtml(editing?.notes || "")}</textarea>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_photo")}</label>
        <div id="attach-area">${renderAttachArea()}</div>
        <input type="file" id="attach-input" accept="image/*" style="display:none;">
      </div>
      <div class="info-row" style="margin-top:16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0"/></svg>
        <span>${t("notif_task_hint")}</span>
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_save")}</button>
      ${editing ? `<button type="button" class="danger-btn" style="margin-top:10px;" data-action="delete-task" data-id="${editing.id}">${t("btn_delete")}</button>` : ""}
    </form>
  `);

  document.getElementById("task-form").dataset.categoryId = editing?.categoryId || state.categories[0].id;
  document.getElementById("task-form").dataset.recur = recur;
  document.getElementById("task-form").dataset.weekdays = recurWeekdays.join(",");
  document.getElementById("task-form").dataset.seriesId = editing?.seriesId || "";
  document.getElementById("task-form").dataset.tzOrigin = tzOrigin;
  document.getElementById("attach-input").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pendingAttachment = await resizeImageFile(file, 480, 0.6);
    document.getElementById("attach-area").innerHTML = renderAttachArea();
  });
  document.getElementById("task-form").addEventListener("submit", onSubmitTask);
}

function renderAttachArea() {
  if (pendingAttachment) {
    return `<div class="attach-preview">
      <img src="${pendingAttachment}" alt="${t("field_photo")}">
      <div class="attach-actions">
        <button type="button" class="pill-btn" data-action="pick-photo">${t("photo_change")}</button>
        <button type="button" class="pill-btn" data-action="remove-photo">${t("photo_remove")}</button>
      </div>
    </div>`;
  }
  return `<button type="button" class="pill-btn" data-action="pick-photo">${t("photo_add")}</button>`;
}

function onSubmitTask(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const id = form.dataset.taskId;
  const categoryId = form.dataset.categoryId;
  const priority = form.querySelector('#prio-seg [data-active="true"]')?.dataset.val || "med";

  const recurFreq = form.dataset.recur || "none";
  const recurWeekdays = recurFreq === "custom"
    ? (form.dataset.weekdays || "").split(",").filter(Boolean).map(Number)
    : null;
  const recurUntil = fd.get("recurUntil") || null;
  const recurring = recurFreq === "none" ? null : { freq: recurFreq, weekdays: recurWeekdays, until: recurUntil };
  const seriesId = recurring ? (form.dataset.seriesId || uid()) : null;

  let dueDate = fd.get("dueDate");
  let startTime = fd.get("startTime") || null;
  let endTime = fd.get("endTime") || null;
  if (startTime && form.dataset.tzOrigin === "SECONDARY") {
    const homeTz = state.settings.homeTz.tz;
    const secTz = state.settings.secondaryTz.tz;
    const convStart = convertWallTime(dueDate, startTime, secTz, homeTz);
    if (endTime) endTime = convertWallTime(dueDate, endTime, secTz, homeTz).time;
    dueDate = convStart.date;
    startTime = convStart.time;
  }

  const payload = {
    title: fd.get("title").trim(),
    dept: fd.get("dept").trim(),
    dueDate,
    startTime,
    endTime,
    priority,
    categoryId,
    recurring,
    seriesId,
    notes: fd.get("notes").trim(),
    attachment: pendingAttachment,
  };
  if (!payload.title) return;

  const willMaterialize = recurring && (recurFreq !== "custom" || recurWeekdays.length);

  if (id) {
    const t = taskById(id);
    const hadSiblingsBefore = t.seriesId && state.tasks.some((x) => x.id !== t.id && x.seriesId === t.seriesId);
    Object.assign(t, payload);
    // Repeat was just turned on (or changed) on a task that isn't already part of a
    // materialized series: generate the rest of the occurrences alongside it.
    if (willMaterialize && !hadSiblingsBefore) {
      for (const occDate of expandRecurringDates(dueDate, recurring)) {
        if (occDate === dueDate) continue;
        state.tasks.push({ ...payload, id: uid(), done: false, attachment: null, createdAt: Date.now(), dueDate: occDate });
      }
    }
  } else if (willMaterialize) {
    for (const occDate of expandRecurringDates(dueDate, recurring)) {
      state.tasks.push({ id: uid(), done: false, createdAt: Date.now(), ...payload, dueDate: occDate });
    }
  } else {
    state.tasks.push({ id: uid(), done: false, createdAt: Date.now(), ...payload });
  }
  saveState();
  closeSheet();
  render();
  showToast(id ? t("toast_task_updated") : t("toast_task_added"));
}

// Materializes every occurrence date (inclusive of startDate) for a recurring rule,
// capped at an explicit "until" or a default 180-day window (hard-capped at 366 days)
// so a series can never grow unbounded.
function expandRecurringDates(startDate, recurring) {
  const startDow = new Date(startDate + "T00:00:00").getDay();
  const hardCap = addDaysISO(startDate, 366);
  let until = recurring.until || addDaysISO(startDate, 180);
  if (until > hardCap) until = hardCap;

  const dates = [];
  let cursor = startDate;
  while (cursor <= until) {
    const dow = new Date(cursor + "T00:00:00").getDay();
    const matches =
      recurring.freq === "daily" ? true :
      recurring.freq === "weekly" ? dow === startDow :
      recurring.freq === "custom" ? recurring.weekdays.includes(dow) :
      false;
    if (matches) dates.push(cursor);
    cursor = addDaysISO(cursor, 1);
  }
  return dates;
}

function toggleTaskDone(id) {
  const t = taskById(id);
  if (!t) return;
  t.done = !t.done;
  // Legacy series created before recurring tasks were fully materialized up front:
  // they have no "weekdays"/"until" keys, so keep spawning the next instance lazily.
  const isLegacySeries = t.recurring && t.recurring.weekdays === undefined && t.recurring.until === undefined;
  if (t.done && isLegacySeries) {
    const step = t.recurring.freq === "daily" ? 1 : 7;
    state.tasks.push({
      ...t, id: uid(), done: false, attachment: null,
      dueDate: addDaysISO(t.dueDate, step), createdAt: Date.now(),
    });
  }
  saveState();
  render();
}

function deleteTask(id) {
  state.tasks = state.tasks.filter((t) => t.id !== id);
  saveState();
  closeSheet();
  render();
  showToast(t("toast_task_deleted"));
}

/* ---------------- modal: add category ---------------- */

function openAddCategoryModal() {
  const usedColors = new Set(state.categories.map((c) => c.color));
  const firstFree = COLOR_PRESETS.find((c) => !usedColors.has(c)) || COLOR_PRESETS[0];
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${t("cat_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="cat-form" data-color="${firstFree}">
      <div class="field">
        <label>${t("field_name")}</label>
        <input type="text" name="name" required placeholder="${t("ph_cat_name")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_color")}</label>
        <div class="color-row" id="color-row">
          ${COLOR_PRESETS.map((col) => `<button type="button" class="color-swatch" data-action="pick-color" data-color="${col}" data-active="${col === firstFree}" style="background:${col};color:${col};">
            <svg viewBox="0 0 24 24" fill="none" stroke="${contrastStroke(col)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="${col === firstFree ? "" : "display:none;"}"><path d="M5 12l5 5L20 7"/></svg>
          </button>`).join("")}
        </div>
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_add")}</button>
    </form>
  `);
  document.getElementById("cat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    if (!name) return;
    const color = e.target.dataset.color;
    const id = uid();
    state.categories.push({ id, name, color });
    state.filter.push(id);
    saveState();
    closeSheet();
    render();
    showToast(t("toast_cat_added"));
  });
}

/* ---------------- modal: category detail (tasks / glossary) ---------------- */

let categoryDetailTab = "tasks";

function openCategoryDetail(catId) {
  categoryDetailTab = "tasks";
  renderCategoryDetailModal(catId);
}

function renderCategoryDetailModal(catId) {
  const cat = catById(catId);
  if (!cat) return closeSheet();
  const tasks = state.tasks.filter((t) => t.categoryId === catId);
  const terms = state.glossary[catId] || [];

  const body = categoryDetailTab === "tasks"
    ? (tasks.length ? tasks.sort((a, b) => a.dueDate.localeCompare(b.dueDate)).map(renderTaskCard).join("") : emptyState(t("glossary_empty")))
    : `
      ${terms.map((g) => `<div class="glossary-card">
        <div class="term">${escapeHtml(g.term)}<button class="del" data-action="delete-term" data-cat="${catId}" data-id="${g.id}">${t("btn_delete_term")}</button></div>
        <div class="def">${escapeHtml(g.def)}</div>
      </div>`).join("")}
      <form id="term-form" data-cat="${catId}" style="display:flex;flex-direction:column;gap:10px;border:1.5px dashed var(--border);border-radius:14px;padding:14px;">
        <input type="text" name="term" placeholder="${t("ph_term")}" style="border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;">
        <textarea name="def" placeholder="${t("ph_def")}" style="border:1px solid var(--border);border-radius:10px;padding:10px 12px;font-size:13px;min-height:50px;"></textarea>
        <button type="submit" class="pill-btn" style="align-self:flex-start;">${t("btn_add_term")}</button>
      </form>
    `;

  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2 style="display:flex;align-items:center;gap:8px;"><span class="dot" style="width:9px;height:9px;border-radius:999px;background:${cat.color};display:inline-block;"></span>${escapeHtml(cat.name)}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="field">
      <label>${t("field_name")}</label>
      <input type="text" value="${escapeHtml(cat.name)}" data-action="rename-category" data-id="${catId}">
    </div>
    <div class="field" style="margin-top:14px;">
      <label>${t("field_color")}</label>
      <div class="color-row">
        ${COLOR_PRESETS.map((col) => `<button type="button" class="color-swatch" data-action="pick-detail-color" data-color="${col}" data-id="${catId}" data-active="${col === cat.color}" style="background:${col};color:${col};">
          <svg viewBox="0 0 24 24" fill="none" stroke="${contrastStroke(col)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="${col === cat.color ? "" : "display:none;"}"><path d="M5 12l5 5L20 7"/></svg>
        </button>`).join("")}
      </div>
    </div>
    <div class="tabs" style="margin-top:14px;">
      <button class="tab-btn" data-active="${categoryDetailTab === "tasks"}" data-action="cat-detail-tab" data-tab="tasks" data-id="${catId}">${t("cat_tab_tasks", { n: tasks.length })}</button>
      <button class="tab-btn" data-active="${categoryDetailTab === "glossary"}" data-action="cat-detail-tab" data-tab="glossary" data-id="${catId}">${t("cat_tab_glossary")}</button>
    </div>
    <div style="display:flex;flex-direction:column;gap:10px;">${body}</div>
    ${state.categories.length > 1 ? `<button class="danger-btn" data-action="delete-category" data-id="${catId}">${t("btn_delete_category")}</button>` : ""}
  `);

  if (categoryDetailTab === "glossary") {
    document.getElementById("term-form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const fd = new FormData(e.target);
      const term = fd.get("term").trim();
      const def = fd.get("def").trim();
      if (!term) return;
      if (!state.glossary[catId]) state.glossary[catId] = [];
      state.glossary[catId].push({ id: uid(), term, def });
      saveState();
      renderCategoryDetailModal(catId);
    });
  }
}

/* ---------------- modal: department ---------------- */

function openDeptModal(deptId) {
  const editing = deptId ? deptById(deptId) : null;
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("dept_edit") : t("dept_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="dept-form" data-id="${editing ? editing.id : ""}">
      <div class="field">
        <label>${t("field_name")}</label>
        <input type="text" name="name" required value="${escapeHtml(editing?.name || "")}" placeholder="${t("ph_dept")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_contact")}</label>
        <input type="text" name="contact" value="${escapeHtml(editing?.contact || "")}" placeholder="${t("ph_contact")}">
      </div>
      <div class="two-col" style="margin-top:14px;">
        <div class="field">
          <label>${t("field_due")}</label>
          <input type="date" name="dueDate" value="${editing?.dueDate || todayISO()}">
        </div>
        <div class="field">
          <label>${t("field_status")}</label>
          <select name="status">
            <option value="미제출" ${editing?.status === "미제출" ? "selected" : ""}>${t("status_미제출")}</option>
            <option value="검토중" ${editing?.status === "검토중" ? "selected" : ""}>${t("status_검토중")}</option>
            <option value="제출완료" ${editing?.status === "제출완료" ? "selected" : ""}>${t("status_제출완료")}</option>
          </select>
        </div>
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_save")}</button>
      ${editing ? `<button type="button" class="danger-btn" style="margin-top:10px;" data-action="delete-dept" data-id="${editing.id}">${t("btn_delete")}</button>` : ""}
    </form>
  `);
  document.getElementById("dept-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = e.target.dataset.id;
    const payload = { name: fd.get("name").trim(), contact: fd.get("contact").trim(), dueDate: fd.get("dueDate") || todayISO(), status: fd.get("status") };
    if (!payload.name) return;
    if (id) Object.assign(deptById(id), payload);
    else state.departments.push({ id: uid(), ...payload });
    saveState();
    closeSheet();
    render();
    showToast(t("toast_saved"));
  });
}

/* ---------------- modal: transaction ---------------- */

function openTxnModal(txnId) {
  const editing = txnId ? txnById(txnId) : null;
  const type = editing?.type || "expense";
  const cats = type === "income" ? INCOME_CATS : EXPENSE_CATS;
  const cat = editing?.category || cats[0];

  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("txn_edit") : t("txn_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="txn-form" data-txn-id="${editing ? editing.id : ""}" data-type="${type}">
      <div class="seg">
        <button type="button" class="seg-btn" data-active="${type === "expense"}" data-action="pick-txn-type" data-val="expense">${t("seg_expense")}</button>
        <button type="button" class="seg-btn" data-active="${type === "income"}" data-action="pick-txn-type" data-val="income">${t("seg_income")}</button>
      </div>
      <div class="field" style="margin-top:18px;">
        <label>${t("field_amount")}</label>
        <input type="number" name="amount" inputmode="numeric" min="0" required value="${editing?.amount ?? ""}" placeholder="0">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_category")}</label>
        <div class="chip-row" id="txn-cat-row" style="padding:0;">
          ${cats.map((c) => `<button type="button" class="chip" data-active="${cat === c}" data-action="pick-txn-cat" data-val="${c}">${escapeHtml(c)}</button>`).join("")}
        </div>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_account")}</label>
        <select name="accountId">
          ${state.accounts.map((a) => `<option value="${a.id}" ${(editing?.accountId || state.accounts[0].id) === a.id ? "selected" : ""}>${escapeHtml(a.name)}</option>`).join("")}
        </select>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_date")}</label>
        <input type="date" name="date" required value="${editing?.date || todayISO()}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_memo_opt")}</label>
        <input type="text" name="memo" value="${escapeHtml(editing?.memo || "")}" placeholder="${t("ph_txn_memo")}">
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_save")}</button>
      ${editing ? `<button type="button" class="danger-btn" style="margin-top:10px;" data-action="delete-txn" data-id="${editing.id}">${t("btn_delete")}</button>` : ""}
    </form>
  `);
  document.getElementById("txn-form").addEventListener("submit", onSubmitTxn);
}

function onSubmitTxn(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const id = form.dataset.txnId;
  const activeCat = form.querySelector('#txn-cat-row [data-active="true"]');
  const payload = {
    type: form.dataset.type,
    amount: Math.abs(Number(fd.get("amount")) || 0),
    category: activeCat ? activeCat.dataset.val : (form.dataset.type === "income" ? INCOME_CATS[0] : EXPENSE_CATS[0]),
    accountId: fd.get("accountId"),
    date: fd.get("date"),
    memo: fd.get("memo").trim(),
  };
  if (!payload.amount || !payload.accountId) return;

  if (id) Object.assign(txnById(id), payload);
  else state.transactions.push({ id: uid(), createdAt: Date.now(), ...payload });
  saveState();
  closeSheet();
  render();
  showToast(id ? t("toast_txn_updated") : t("toast_txn_added"));
}

function deleteTxn(id) {
  state.transactions = state.transactions.filter((t) => t.id !== id);
  saveState(); closeSheet(); render(); showToast(t("toast_txn_deleted"));
}

/* ---------------- modal: account ---------------- */

function openAccountModal(accountId) {
  const editing = accountId ? accountById(accountId) : null;
  const type = editing?.type || ACCOUNT_TYPES[0];
  const currency = editing?.currency || BASE_CURRENCY;
  const isForeign = currency !== BASE_CURRENCY;
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("account_edit") : t("account_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="account-form" data-id="${editing ? editing.id : ""}" data-type="${type}">
      <div class="field">
        <label>${t("field_name")}</label>
        <input type="text" name="name" required value="${escapeHtml(editing?.name || "")}" placeholder="${t("ph_account_name")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_acct_type")}</label>
        <div class="seg" id="acct-type-seg">
          ${ACCOUNT_TYPES.map((at) => `<button type="button" class="seg-btn small" data-active="${type === at}" data-action="pick-acct-type" data-val="${at}">${at}</button>`).join("")}
        </div>
      </div>
      <div class="two-col" style="margin-top:14px;">
        <div class="field">
          <label>${t("field_currency")}</label>
          <select name="currency" id="acct-currency-select">
            ${CURRENCY_PRESETS.map((c) => `<option value="${c.code}" ${currency === c.code ? "selected" : ""}>${c.symbol} ${c.name}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>${t("field_start_balance")}</label>
          <input type="number" name="startBalance" inputmode="numeric" value="${editing?.startBalance ?? 0}">
        </div>
      </div>
      <div class="hint">${t("acct_hint")}</div>
      <div class="field" id="acct-rate-field" style="margin-top:14px; ${isForeign ? "" : "display:none;"}">
        <label id="acct-rate-label">${t("field_rate", { code: currency, base: BASE_CURRENCY })}</label>
        <input type="number" name="rate" inputmode="decimal" step="0.01" min="0" value="${state.settings.exchangeRates[currency] ?? ""}" placeholder="0.00">
        <div class="hint">${t("rate_hint")}</div>
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_save")}</button>
      ${editing ? `<button type="button" class="danger-btn" style="margin-top:10px;" data-action="delete-account" data-id="${editing.id}">${t("btn_delete")}</button>` : ""}
    </form>
  `);
  document.getElementById("acct-currency-select").addEventListener("change", (e) => {
    const code = e.target.value;
    const field = document.getElementById("acct-rate-field");
    field.style.display = code === BASE_CURRENCY ? "none" : "";
    document.getElementById("acct-rate-label").textContent = t("field_rate", { code, base: BASE_CURRENCY });
    field.querySelector("input").value = state.settings.exchangeRates[code] ?? "";
  });
  document.getElementById("account-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = e.target.dataset.id;
    const currency = fd.get("currency") || BASE_CURRENCY;
    const payload = { name: fd.get("name").trim(), type: e.target.dataset.type, startBalance: Number(fd.get("startBalance")) || 0, currency };
    if (!payload.name) return;
    if (currency !== BASE_CURRENCY) {
      const rate = Number(fd.get("rate"));
      if (rate > 0) state.settings.exchangeRates[currency] = rate;
    }
    if (id) Object.assign(accountById(id), payload);
    else state.accounts.push({ id: uid(), ...payload });
    saveState(); closeSheet(); render(); showToast(t("toast_saved"));
  });
}

function deleteAccount(id) {
  if (state.accounts.length <= 1) { showToast(t("toast_min_account")); return; }
  state.accounts = state.accounts.filter((a) => a.id !== id);
  state.transactions = state.transactions.filter((t) => t.accountId !== id);
  saveState(); closeSheet(); render(); showToast(t("toast_account_deleted"));
}

/* ---------------- modal: diary ---------------- */

function recordTextLabel(cat) { return cat === "meditation" ? t("field_meditation_text") : t("field_content"); }
function recordTextPlaceholder(cat) { return cat === "meditation" ? t("ph_meditation") : cat === "dispatch" ? t("ph_dispatch") : t("ph_diary"); }

function openDiaryModal(diaryId) {
  const editing = diaryId ? diaryById(diaryId) : null;
  const category = editing?.category || (recordsTab !== "all" ? recordsTab : defaultRecordCatId());
  const catSeg = state.recordCategories.map((c) => `<button type="button" class="seg-btn small" data-active="${category === c.id}" data-action="pick-record-cat" data-val="${c.id}">${escapeHtml(c.name)}</button>`).join("");
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("diary_edit") : t("diary_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="diary-form" data-id="${editing ? editing.id : ""}" data-category="${category}">
      <div class="field">
        <label>${t("field_record_cat")}</label>
        <div class="seg" id="record-cat-seg" style="flex-wrap:wrap;">${catSeg}</div>
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_date")}</label>
        <input type="date" name="date" required value="${editing?.date || todayISO()}">
      </div>
      <div class="field" id="record-verse-field" style="margin-top:14px; ${category === "meditation" ? "" : "display:none;"}">
        <label>${t("field_verse")}</label>
        <input type="text" name="verse" value="${escapeHtml(editing?.verse || "")}" placeholder="${t("ph_verse")}">
      </div>
      <div class="field" id="record-place-field" style="margin-top:14px; ${category === "dispatch" ? "" : "display:none;"}">
        <label>${t("field_place")}</label>
        <input type="text" name="place" ${category === "dispatch" ? "required" : ""} value="${escapeHtml(editing?.place || "")}" placeholder="${t("ph_place")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label id="record-text-label">${recordTextLabel(category)}</label>
        <textarea name="text" id="record-text-input" required placeholder="${recordTextPlaceholder(category)}" style="min-height:160px;">${escapeHtml(editing?.text || "")}</textarea>
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_save")}</button>
      ${editing ? `<button type="button" class="danger-btn" style="margin-top:10px;" data-action="delete-diary" data-id="${editing.id}">${t("btn_delete")}</button>` : ""}
    </form>
  `);
  document.getElementById("diary-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = e.target.dataset.id;
    const cat = e.target.dataset.category;
    const text = fd.get("text").trim();
    const place = fd.get("place").trim();
    if (!text) return;
    if (cat === "dispatch" && !place) return;
    const payload = {
      category: cat,
      date: fd.get("date"),
      text,
      verse: cat === "meditation" ? fd.get("verse").trim() : "",
      place: cat === "dispatch" ? place : "",
    };
    if (id) Object.assign(diaryById(id), payload);
    else state.diary.push({ id: uid(), createdAt: Date.now(), ...payload });
    saveState(); closeSheet(); render(); showToast(t("toast_diary_saved"));
  });
}

function deleteDiary(id) {
  state.diary = state.diary.filter((d) => d.id !== id);
  saveState(); closeSheet(); render(); showToast(t("toast_diary_deleted"));
}

/* ---------------- modal: goal ---------------- */

function openGoalModal(goalId) {
  const editing = goalId ? state.goals.find((g) => g.id === goalId) : null;
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("goal_edit") : t("goal_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="goal-form" data-id="${editing ? editing.id : ""}">
      <div class="field">
        <label>${t("field_title")}</label>
        <input type="text" name="title" required value="${escapeHtml(editing?.title || "")}" placeholder="${t("ph_goal_title")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_target_date")}</label>
        <input type="date" name="targetDate" required value="${editing?.targetDate || todayISO()}">
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${t("btn_save")}</button>
      ${editing ? `<button type="button" class="danger-btn" style="margin-top:10px;" data-action="delete-goal" data-id="${editing.id}">${t("btn_delete")}</button>` : ""}
    </form>
  `);
  document.getElementById("goal-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const id = e.target.dataset.id;
    const payload = { title: fd.get("title").trim(), targetDate: fd.get("targetDate") };
    if (!payload.title || !payload.targetDate) return;
    if (id) Object.assign(state.goals.find((g) => g.id === id), payload);
    else state.goals.push({ id: uid(), done: false, createdAt: Date.now(), ...payload });
    saveState();
    closeSheet();
    render();
    showToast(id ? t("toast_goal_updated") : t("toast_goal_added"));
  });
}

function toggleGoalDone(id) {
  const g = state.goals.find((x) => x.id === id);
  if (!g) return;
  g.done = !g.done;
  saveState();
  render();
}

function deleteGoal(id) {
  state.goals = state.goals.filter((g) => g.id !== id);
  saveState(); closeSheet(); render(); showToast(t("toast_goal_deleted"));
}

/* ---------------- modal: add record category ---------------- */

function openRecordCategoryModal(catId) {
  const editing = catId ? recordCategoryById(catId) : null;
  const usedColors = new Set(state.recordCategories.map((c) => c.color));
  const firstFree = editing?.color || COLOR_PRESETS.find((c) => !usedColors.has(c)) || COLOR_PRESETS[0];
  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${editing ? t("rec_cat_edit") : t("rec_cat_new")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <form id="cat-form" data-id="${editing ? editing.id : ""}" data-color="${firstFree}">
      <div class="field">
        <label>${t("field_name")}</label>
        <input type="text" name="name" required value="${escapeHtml(editing?.name || "")}" placeholder="${t("ph_rec_cat_name")}">
      </div>
      <div class="field" style="margin-top:14px;">
        <label>${t("field_color")}</label>
        <div class="color-row" id="color-row">
          ${COLOR_PRESETS.map((col) => `<button type="button" class="color-swatch" data-action="pick-color" data-color="${col}" data-active="${col === firstFree}" style="background:${col};color:${col};">
            <svg viewBox="0 0 24 24" fill="none" stroke="${contrastStroke(col)}" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="${col === firstFree ? "" : "display:none;"}"><path d="M5 12l5 5L20 7"/></svg>
          </button>`).join("")}
        </div>
      </div>
      <button type="submit" class="primary-btn" style="margin-top:18px;">${editing ? t("btn_save") : t("btn_add")}</button>
    </form>
  `);
  document.getElementById("cat-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = fd.get("name").trim();
    if (!name) return;
    const color = e.target.dataset.color;
    if (editing) {
      Object.assign(editing, { name, color });
      saveState();
      closeSheet();
      render();
      showToast(t("toast_saved"));
    } else {
      const id = uid();
      state.recordCategories.push({ id, name, color });
      recordsTab = id;
      saveState();
      closeSheet();
      render();
      showToast(t("toast_cat_added"));
    }
  });
}

/* ---------------- modal: add clock ---------------- */

function filterTzOptions(list, query) {
  const q = query.trim().toLowerCase();
  if (!q) return list;
  return list.filter((o) => o.label.toLowerCase().includes(q) || o.tz.toLowerCase().includes(q));
}

function openAddClockModal() {
  const used = new Set(state.worldClocks.map((c) => c.tz));
  const allOptions = TZ_PRESETS.filter((p) => !used.has(p.tz));
  const renderList = (options) => options.length
    ? options.map((o) => `<button class="settings-row" data-action="pick-clock" data-tz="${o.tz}" data-label="${escapeHtml(o.label)}"><span class="label">${o.flag} ${escapeHtml(o.label)}</span></button>`).join("")
    : emptyState(t("clock_empty"));

  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${t("clock_add_title")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="field" style="margin-bottom:12px;">
      <input type="text" id="tz-search" placeholder="${t("tz_search_ph")}" autocomplete="off">
    </div>
    <div id="tz-list" style="display:flex;flex-direction:column;gap:8px;">${renderList(allOptions)}</div>
  `);

  document.getElementById("tz-search").addEventListener("input", (e) => {
    document.getElementById("tz-list").innerHTML = renderList(filterTzOptions(allOptions, e.target.value));
  });
}

/* ---------------- modal: pick reference timezone ---------------- */

function openTzPickerModal(which) {
  const renderList = (options) => options.length
    ? options.map((o) => `<button class="settings-row" data-action="pick-ref-tz" data-which="${which}" data-tz="${o.tz}" data-label="${escapeHtml(o.label)}" data-flag="${o.flag}"><span class="label">${o.flag} ${escapeHtml(o.label)}</span></button>`).join("")
    : emptyState(t("clock_empty"));

  openSheet(`
    <div class="sheet-handle"></div>
    <div class="sheet-title-row">
      <h2>${t("tz_pick_title")}</h2>
      <button class="sheet-close" data-action="close-sheet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 6l12 12M18 6L6 18"/></svg></button>
    </div>
    <div class="field" style="margin-bottom:12px;">
      <input type="text" id="tz-search" placeholder="${t("tz_search_ph")}" autocomplete="off">
    </div>
    <div id="tz-list" style="display:flex;flex-direction:column;gap:8px;">${renderList(TZ_PRESETS)}</div>
  `);

  document.getElementById("tz-search").addEventListener("input", (e) => {
    document.getElementById("tz-list").innerHTML = renderList(filterTzOptions(TZ_PRESETS, e.target.value));
  });
}

/* ---------------- import / export ---------------- */

function exportData() {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `timebridge-backup-${todayISO()}.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

function importData() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json";
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(reader.result);
        state = { ...defaultState(), ...parsed };
        saveState();
        render();
        showToast(t("toast_data_loaded"));
      } catch (e) {
        showToast(t("toast_data_read_fail"));
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/* ---------------- notifications ---------------- */

function checkDueSoonNotify() {
  if (!("Notification" in window) || Notification.permission !== "granted") return;
  const dueSoon = state.tasks.filter((t) => !t.done && diffDays(t.dueDate) <= 1 && diffDays(t.dueDate) >= 0);
  if (dueSoon.length === 0) return;
  const key = "timebridge_last_notif_" + todayISO();
  if (sessionStorage.getItem(key)) return;
  sessionStorage.setItem(key, "1");
  new Notification(t("brand"), { body: t("notif_due_soon_body", { n: dueSoon.length }), icon: "icons/icon-192.png" });
}

function shareReportStatus() {
  const pending = state.departments.filter((d) => d.status !== "제출완료");
  const lines = pending.length
    ? [t("share_pending_header", { n: pending.length }), ...pending.map((d) => `- ${d.name}${d.contact ? " (" + d.contact + ")" : ""} · ${t("share_due")} ${d.dueDate}`)]
    : [t("share_all_done")];
  const text = lines.join("\n");
  if (navigator.share) {
    navigator.share({ text }).catch(() => {});
  } else if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => showToast(t("toast_copied")))
      .catch(() => showToast(t("toast_share_fail")));
  } else {
    showToast(text);
  }
}

/* ---------------- event delegation ---------------- */

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-action]");
  if (!el) return;
  const action = el.dataset.action;

  switch (action) {
    case "goto-settings": switchView("settings"); break;
    case "toggle-cat": {
      const id = el.dataset.id;
      const idx = state.filter.indexOf(id);
      if (idx >= 0) { if (state.filter.length > 1) state.filter.splice(idx, 1); }
      else state.filter.push(id);
      saveState(); render(); break;
    }
    case "select-all-cat": state.filter = state.categories.map((c) => c.id); saveState(); render(); break;
    case "open-add-category": openAddCategoryModal(); break;
    case "open-add-record-category": openRecordCategoryModal(null); break;
    case "open-record-category": openRecordCategoryModal(el.dataset.id); break;
    case "pick-color": {
      const form = document.getElementById("cat-form");
      form.dataset.color = el.dataset.color;
      document.querySelectorAll("#color-row .color-swatch").forEach((b) => {
        const active = b === el;
        b.dataset.active = String(active);
        b.querySelector("svg").style.display = active ? "" : "none";
      });
      break;
    }
    case "pick-detail-color": {
      const cat = catById(el.dataset.id);
      cat.color = el.dataset.color;
      saveState();
      renderCategoryDetailModal(el.dataset.id);
      render();
      break;
    }
    case "open-category-detail": openCategoryDetail(el.dataset.id); break;
    case "cat-detail-tab": categoryDetailTab = el.dataset.tab; renderCategoryDetailModal(el.dataset.id); break;
    case "delete-term": {
      const catId = el.dataset.cat;
      state.glossary[catId] = (state.glossary[catId] || []).filter((g) => g.id !== el.dataset.id);
      saveState(); renderCategoryDetailModal(catId); break;
    }
    case "delete-category": {
      if (state.categories.length <= 1) break;
      const id = el.dataset.id;
      state.categories = state.categories.filter((c) => c.id !== id);
      state.filter = state.filter.filter((f) => f !== id);
      if (state.filter.length === 0) state.filter = [state.categories[0].id];
      state.tasks = state.tasks.filter((t) => t.categoryId !== id);
      delete state.glossary[id];
      saveState(); closeSheet(); render(); showToast(t("toast_cat_deleted")); break;
    }
    case "add-clock": openAddClockModal(); break;
    case "pick-clock": {
      state.worldClocks.push({ id: uid(), tz: el.dataset.tz, label: el.dataset.label });
      saveState(); closeSheet(); render(); break;
    }
    case "open-pick-tz": openTzPickerModal(el.dataset.which); break;
    case "pick-ref-tz": {
      const key = el.dataset.which === "home" ? "homeTz" : "secondaryTz";
      state.settings[key] = { tz: el.dataset.tz, label: el.dataset.label, flag: el.dataset.flag };
      saveState(); closeSheet(); render(); break;
    }
    case "remove-clock": {
      if (state.worldClocks.length <= 1) break;
      state.worldClocks = state.worldClocks.filter((c) => c.id !== el.dataset.id);
      saveState(); render(); break;
    }
    case "open-task": openTaskModal(el.dataset.id); break;
    case "toggle-done": { e.stopPropagation(); toggleTaskDone(el.dataset.id); break; }
    case "delete-task": deleteTask(el.dataset.id); break;
    case "pick-cat": {
      const form = document.getElementById("task-form");
      form.dataset.categoryId = el.dataset.id;
      document.querySelectorAll("#cat-seg .seg-btn").forEach((b) => {
        const active = b === el;
        b.dataset.active = String(active);
        const c = catById(b.dataset.id);
        b.style.cssText = active ? `background:${c.color};border-color:${c.color};color:var(--on-ink);` : "";
      });
      break;
    }
    case "pick-prio": {
      document.querySelectorAll("#prio-seg .seg-btn").forEach((b) => b.dataset.active = String(b === el));
      break;
    }
    case "pick-recur": {
      const val = el.dataset.val;
      document.getElementById("task-form").dataset.recur = val;
      document.querySelectorAll("#recur-seg .seg-btn").forEach((b) => b.dataset.active = String(b === el));
      const weekdayRow = document.getElementById("recur-weekday-row");
      if (weekdayRow) weekdayRow.style.display = val === "custom" ? "block" : "none";
      const untilRow = document.getElementById("recur-until-row");
      if (untilRow) untilRow.style.display = val !== "none" ? "block" : "none";
      break;
    }
    case "toggle-weekday": {
      const form = document.getElementById("task-form");
      const dow = el.dataset.dow;
      const cur = new Set((form.dataset.weekdays || "").split(",").filter(Boolean));
      if (cur.has(dow)) cur.delete(dow); else cur.add(dow);
      form.dataset.weekdays = Array.from(cur).join(",");
      el.dataset.active = String(cur.has(dow));
      break;
    }
    case "pick-tz-origin": {
      document.getElementById("task-form").dataset.tzOrigin = el.dataset.val;
      document.querySelectorAll("#tz-origin-seg .seg-btn").forEach((b) => b.dataset.active = String(b === el));
      break;
    }
    case "pick-photo": document.getElementById("attach-input").click(); break;
    case "remove-photo": pendingAttachment = null; document.getElementById("attach-area").innerHTML = renderAttachArea(); break;
    case "select-date": selectedDate = el.dataset.date; render(); break;
    case "cal-prev": case "cal-next": {
      const [y, m] = calendarCursor.split("-").map(Number);
      const d = new Date(y, m - 1 + (action === "cal-next" ? 1 : -1), 1);
      calendarCursor = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      render(); break;
    }
    case "week-prev": weekCursor = addDaysISO(weekCursor, -7); render(); break;
    case "week-next": weekCursor = addDaysISO(weekCursor, 7); render(); break;
    case "pick-wk-half": wkHalf = el.dataset.val; render(); break;
    case "pick-wk-axis": state.settings.wkAxisMode = el.dataset.val; saveState(); render(); break;
    case "set-cal-mode": {
      state.settings.calendarMode = el.dataset.mode;
      if (el.dataset.mode === "week") weekCursor = mondayOf(selectedDate);
      else calendarCursor = selectedDate.slice(0, 7);
      saveState(); render(); break;
    }
    case "open-dept": openDeptModal(el.dataset.id); break;
    case "open-add-dept": openDeptModal(null); break;
    case "delete-dept": {
      state.departments = state.departments.filter((d) => d.id !== el.dataset.id);
      saveState(); closeSheet(); render(); break;
    }
    case "share-report": shareReportStatus(); break;
    case "request-notif": {
      if (!("Notification" in window)) { showToast(t("toast_notif_limited")); break; }
      Notification.requestPermission().then(() => { state.settings.notifAsked = true; saveState(); render(); checkDueSoonNotify(); });
      break;
    }
    case "pick-theme": {
      state.settings.theme = el.dataset.val;
      saveState(); applyTheme(); render(); break;
    }
    case "pick-accent": {
      state.settings.accent = el.dataset.color;
      saveState(); applyAccent(); render(); break;
    }
    case "pick-lang": {
      state.settings.lang = el.dataset.val;
      saveState(); applyNavLabels(); render(); break;
    }
    case "export-data": exportData(); break;
    case "import-data": importData(); break;
    case "close-sheet": closeSheet(); break;

    case "goto-hub": switchView("hub"); break;
    case "goto-report": switchView("report"); break;
    case "goto-money": switchView("money"); break;
    case "goto-diary": recordsTab = "all"; switchView("diary"); break;
    case "goto-goals": switchView("goals"); break;
    case "open-add-goal": openGoalModal(null); break;
    case "open-goal": openGoalModal(el.dataset.id); break;
    case "toggle-goal-done": { e.stopPropagation(); toggleGoalDone(el.dataset.id); break; }
    case "delete-goal": deleteGoal(el.dataset.id); break;
    case "set-records-tab": recordsTab = el.dataset.tab; render(); break;
    case "pick-record-cat": {
      const form = document.getElementById("diary-form");
      form.dataset.category = el.dataset.val;
      document.querySelectorAll("#record-cat-seg .seg-btn").forEach((b) => b.dataset.active = String(b === el));
      document.getElementById("record-verse-field").style.display = el.dataset.val === "meditation" ? "" : "none";
      const placeField = document.getElementById("record-place-field");
      placeField.style.display = el.dataset.val === "dispatch" ? "" : "none";
      placeField.querySelector("input").required = el.dataset.val === "dispatch";
      document.getElementById("record-text-label").textContent = recordTextLabel(el.dataset.val);
      document.getElementById("record-text-input").placeholder = recordTextPlaceholder(el.dataset.val);
      break;
    }

    case "money-prev": case "money-next": {
      const [y, m] = moneyCursor.split("-").map(Number);
      const d = new Date(y, m - 1 + (action === "money-next" ? 1 : -1), 1);
      moneyCursor = `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`;
      render(); break;
    }
    case "open-txn": openTxnModal(el.dataset.id); break;
    case "delete-txn": deleteTxn(el.dataset.id); break;
    case "pick-txn-type": {
      const form = document.getElementById("txn-form");
      form.dataset.type = el.dataset.val;
      document.querySelectorAll('#txn-form > .seg:first-of-type .seg-btn').forEach((b) => b.dataset.active = String(b === el));
      const cats = el.dataset.val === "income" ? INCOME_CATS : EXPENSE_CATS;
      document.getElementById("txn-cat-row").innerHTML = cats.map((c, i) => `<button type="button" class="chip" data-active="${i === 0}" data-action="pick-txn-cat" data-val="${c}">${escapeHtml(c)}</button>`).join("");
      break;
    }
    case "pick-txn-cat": {
      document.querySelectorAll("#txn-cat-row .chip").forEach((b) => b.dataset.active = String(b === el));
      break;
    }
    case "open-add-account": openAccountModal(null); break;
    case "open-account": openAccountModal(el.dataset.id); break;
    case "delete-account": deleteAccount(el.dataset.id); break;
    case "pick-acct-type": {
      document.getElementById("account-form").dataset.type = el.dataset.val;
      document.querySelectorAll("#acct-type-seg .seg-btn").forEach((b) => b.dataset.active = String(b === el));
      break;
    }
    case "open-add-diary": openDiaryModal(null); break;
    case "open-diary": openDiaryModal(el.dataset.id); break;
    case "delete-diary": deleteDiary(el.dataset.id); break;
  }
});

document.addEventListener("click", (e) => {
  if (e.target.id === "modal-root" || e.target.classList.contains("sheet-backdrop")) closeSheet();
});

document.addEventListener("change", (e) => {
  if (e.target.dataset.action === "set-rate") {
    const rate = Number(e.target.value);
    if (rate > 0) state.settings.exchangeRates[e.target.dataset.code] = rate;
    else delete state.settings.exchangeRates[e.target.dataset.code];
    saveState();
    render();
  } else if (e.target.dataset.action === "rename-category") {
    const cat = catById(e.target.dataset.id);
    const name = e.target.value.trim();
    if (name) cat.name = name; else e.target.value = cat.name;
    saveState();
    render();
  }
});

document.querySelectorAll(".nav-btn").forEach((b) => b.addEventListener("click", () => switchView(b.dataset.view)));
document.getElementById("btn-add-task").addEventListener("click", () => {
  if (currentView === "money") openTxnModal(null);
  else if (currentView === "diary") openDiaryModal(null);
  else if (currentView === "goals") openGoalModal(null);
  else openTaskModal(null);
});

/* ---------------- init ---------------- */

function tickClocks() {
  if (currentView === "home") {
    const row = document.querySelector(".clock-row");
    if (row) row.outerHTML = renderClockRow();
  }
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

applyTheme();
applyAccent();
applyNavLabels();
render();
checkDueSoonNotify();
setInterval(tickClocks, 30000);
setInterval(checkDueSoonNotify, 5 * 60000);
