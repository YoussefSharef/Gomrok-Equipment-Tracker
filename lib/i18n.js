import { cookies } from 'next/headers';

// Arabic note: phrasing avoids "number + counted noun" constructions (which change form
// with the number in Arabic) by using "label: value" patterns instead.
const en = {
  appName: 'Equipment Maintenance',
  company: 'Gomrok',
  switchLang: 'العربية',
  signIn: 'Sign in', signInTo: 'Sign in to continue', name: 'Name', selectName: 'Select your name',
  pin: 'PIN', pinHint: '4 digits', confirmPin: 'Confirm PIN', signOut: 'Sign out',
  firstRun: 'First-time setup: choose your 4-digit PIN. The other administrator’s PIN is then set in People & access.',
  firstRunBtn: 'Set PIN and sign in',
  errWrongPin: 'Wrong PIN. Attempts left before this account is locked: {n}',
  errLocked: 'Too many wrong attempts. This account is locked until {time}. An administrator can unlock it.',
  errNoPin: 'No PIN has been set for this account yet. Ask an administrator to set one.',
  errPinFormat: 'PIN must be exactly 4 digits.', errPinMismatch: 'The two PINs don’t match.',
  errSelectName: 'Choose your name from the list.',
  errNoDb: 'The database isn’t connected yet. In Vercel, open Storage, choose the Neon database, and connect it to this project.',
  errGeneric: 'Not saved: connection lost. Try again.',
  noAccess: 'Not available for your role', noAccessBody: 'Ask an administrator if you need access to this page.',
  hello: 'Hello, {name}',

  nav_equipment: 'Equipment', nav_add: 'Add equipment', nav_people: 'People & access', nav_settings: 'Settings',
  soonTitle: 'More screens are on the way',
  soonBody: 'Dashboard, maintenance logging, faults and work orders, schedule, maintenance companies and reports arrive in the next stages.',

  type_FL: 'Electric forklift', type_RT: 'Reach truck', type_TP: 'Trans pallet', type_RS: 'Radio shuttle',
  type_RC: 'Shuttle remote', type_BT: 'Battery', type_CH: 'Charger',
  role_admin: 'Administrator', role_ops: 'Operations', role_engineer: 'Maintenance engineer', role_operator: 'Operator',
  st_reported: 'Pending review', st_operational: 'Operational', st_maintenance: 'Under maintenance',
  st_vendor: 'At vendor', st_parts: 'Awaiting parts', st_out: 'Out of service',
  sv_ok: 'OK', sv_due: 'Due soon', sv_overdue: 'Overdue', sv_out: 'Out of service', sv_noplan: 'No plan',

  kpi_total: 'Total units', kpi_operational: 'Operational', kpi_due: 'Due soon', kpi_overdue: 'Overdue',
  kpi_out: 'Out of service', kpi_pending: 'Pending review', kpi_all: 'in the register', kpi_filter: 'Show these',
  apply: 'Apply', search: 'Search ID, serial, brand, model or zone', searchBtn: 'Search',
  allZones: 'All zones', allTypes: 'All types', anyStatus: 'Any status',
  col_id: 'ID', col_type: 'Type', col_brand: 'Brand & model', col_serial: 'Serial', col_zone: 'Zone', col_meter: 'Meter (h)',
  col_status: 'Status', col_service: 'Service', col_next: 'Next due', col_cost: 'Cost to date',
  emptyTitle: 'No equipment yet', emptyBody: 'Add your first unit to start tracking its maintenance.',
  noMatchTitle: 'No equipment matches', noMatchBody: 'Try a different search, or clear the filters.', clearFilters: 'Clear filters',
  shown: 'Units shown: {n}',

  f_type: 'Type', f_id: 'Asset ID', f_zone: 'Zone', f_brand: 'Brand', f_model: 'Model', f_year: 'Year of production',
  f_serial: 'Serial number', f_purchased: 'Purchase date', f_warranty: 'Warranty end', f_hours: 'Current meter (hours)',
  f_lastMeter: 'Meter at last service (hours)', f_planH: 'Service interval (hours)', f_planM: 'Service interval (months)',
  f_lastService: 'Last service', f_nextService: 'Next service due', f_partner: 'Service partner', f_status: 'Operational status',
  h_id: 'Suggested from the type. Letters, numbers and hyphens only.',
  h_plan: 'Leave blank to use the type default — hours: {h}, months: {m}',
  h_next: 'Leave blank to calculate it from the last service and the plan.',
  h_brandSerial: 'Enter a brand or a serial number (at least one).',
  sec_identity: 'Identity', sec_record: 'Purchase & warranty', sec_plan: 'Service plan',
  saveAsset: 'Save equipment', saveAnother: 'Save & add another', saveChanges: 'Save changes', cancel: 'Cancel',
  editTitle: 'Edit {id}',
  errBrandSerial: 'Enter a brand or a serial number.', errIdRequired: 'Enter an asset ID.',
  errIdFormat: 'The asset ID can only use Latin letters, numbers and hyphens.', errIdTaken: 'Asset ID {id} is already in use.',
  errNumber: '{field} must be a number.',
  tSaved: '{id} saved', tDeleted: '{id} deleted',

  specs: 'Specifications', planTitle: 'Service plan', history: 'Service history', record: 'Asset record',
  noHistory: 'No service has been recorded for this unit yet.',
  k_costToDate: 'Cost to date', k_costYear: 'Cost this year', k_faults: 'Faults', k_mtbf: 'Average days between faults',
  p_hours: 'Hours since last service: {used} of {h}', p_interval: 'Interval — hours: {h}, months: {m}',
  p_next: 'Next service due', p_last: 'Last service', none: '—',
  editDetails: 'Edit details', del: 'Delete', delTitle: 'Delete {id}?',
  delBody: 'This permanently removes {id}, its service history, faults and work orders. It can’t be undone.',
  delConfirm: 'Delete equipment', back: 'Back to equipment', createdBy: 'Added by {name}', updatedBy: 'Last edited by {name}',
  h_date: 'Date', h_kind: 'Type of work', h_what: 'What was done', h_by: 'Carried out by', h_cost: 'Cost',

  peopleIntro: 'Everyone who appears in the app: people who sign in, and operators named on fault reports.',
  addPerson: 'Add person', p_name: 'Full name', p_role: 'Role', p_title: 'Job title', p_pin: 'PIN',
  setPin: 'Set PIN', changePin: 'Change PIN', currentPin: 'Current PIN', newPin: 'New PIN',
  remove: 'Remove', removeTitle: 'Remove {name}?',
  removeBody: '{name} will no longer be able to sign in. Their name stays on past records.', removeConfirm: 'Remove person',
  unlock: 'Unlock', locked: 'Locked', noPinYet: 'No PIN yet', you: 'You',
  errNameRequired: 'Enter a full name.', errNameTaken: 'Someone named {name} already exists.',
  errWrongCurrent: 'The current PIN is wrong.', errSelf: 'You can’t remove your own account.',
  tPersonAdded: '{name} added', tPinChanged: 'PIN updated for {name}', tRemoved: '{name} removed', tUnlocked: '{name} unlocked',
  c_name: 'Name', c_role: 'Role', c_title: 'Job title', c_access: 'Sign-in',

  s_company: 'Company details', s_companyHelp: 'Printed on maintenance reports.', s_cname: 'Company name', s_address: 'Address',
  s_phone: 'Phone', s_email: 'Email', s_display: 'Display', s_currency: 'Currency', s_currencyHelp: 'Changes how amounts are shown. Amounts are not converted.',
  s_dateFormat: 'Date format', df_long: '29 Sep 2026', df_dmy: '29/09/2026', df_iso: '2026-09-29',
  s_dueSoon: '“Due soon” threshold (days)', s_hourPct: 'Hour meter “due soon” at (% of interval)',
  s_intervals: 'Service intervals by type', s_intervalsHelp: 'Used when a unit has no interval of its own. Use 0 for none.',
  s_hours: 'Hours', s_months: 'Months',
  s_lists: 'Lists', s_zones: 'Zones', s_zonesHelp: 'One zone per line.', s_cats: 'Fault categories', s_catsHelp: 'One category per line.',
  s_parts: 'Parts catalogue', s_partsHelp: 'One part per line: name | type code | unit cost. Example: Hydraulic filter | RT | 450',
  s_save: 'Save settings', tSettings: 'Settings saved',
};

const ar = {
  appName: 'صيانة المعدات',
  company: 'Gomrok',
  switchLang: 'English',
  signIn: 'تسجيل الدخول', signInTo: 'سجّل الدخول للمتابعة', name: 'الاسم', selectName: 'اختر اسمك',
  pin: 'الرمز السري', pinHint: 'أربعة أرقام', confirmPin: 'تأكيد الرمز السري', signOut: 'تسجيل الخروج',
  firstRun: 'الإعداد لأول مرة: اختر رمزك السري المكوّن من أربعة أرقام، ثم عيّن رمز المسؤول الآخر من صفحة «الأفراد والصلاحيات».',
  firstRunBtn: 'تعيين الرمز وتسجيل الدخول',
  errWrongPin: 'الرمز السري غير صحيح. عدد المحاولات المتبقية قبل قفل الحساب: {n}',
  errLocked: 'تجاوزت عدد المحاولات المسموح به. الحساب مقفل حتى {time}، ويمكن لمسؤول النظام فتحه.',
  errNoPin: 'لم يُعيَّن رمز سري لهذا الحساب بعد. اطلب من مسؤول النظام تعيينه.',
  errPinFormat: 'يجب أن يتكوّن الرمز السري من أربعة أرقام بالضبط.', errPinMismatch: 'الرمزان غير متطابقين.',
  errSelectName: 'اختر اسمك من القائمة.',
  errNoDb: 'قاعدة البيانات غير متصلة بعد. افتح Storage في Vercel، واختر قاعدة بيانات Neon، ثم اربطها بهذا المشروع.',
  errGeneric: 'لم يتم الحفظ بسبب انقطاع الاتصال. حاول مرة أخرى.',
  noAccess: 'هذه الصفحة غير متاحة لدورك', noAccessBody: 'تواصل مع مسؤول النظام إذا كنت تحتاج إلى الوصول إلى هذه الصفحة.',
  hello: 'مرحبًا، {name}',

  nav_equipment: 'المعدات', nav_add: 'إضافة معدة', nav_people: 'الأفراد والصلاحيات', nav_settings: 'الإعدادات',
  soonTitle: 'المزيد من الشاشات قريبًا',
  soonBody: 'ستُضاف في المراحل التالية: لوحة المتابعة، وتسجيل الصيانة، والأعطال وأوامر العمل، وجدول الصيانة، وشركات الصيانة، والتقارير.',

  type_FL: 'رافعة شوكية كهربائية', type_RT: 'رافعة ريتش', type_TP: 'عربة نقل منصات', type_RS: 'راديو شاتل',
  type_RC: 'جهاز تحكم الشاتل', type_BT: 'بطارية', type_CH: 'شاحن',
  role_admin: 'مسؤول النظام', role_ops: 'العمليات', role_engineer: 'مهندس الصيانة', role_operator: 'مشغّل',
  st_reported: 'بانتظار المراجعة', st_operational: 'تعمل', st_maintenance: 'قيد الصيانة',
  st_vendor: 'لدى شركة الصيانة', st_parts: 'بانتظار قطع الغيار', st_out: 'خارج الخدمة',
  sv_ok: 'سليمة', sv_due: 'تستحق قريبًا', sv_overdue: 'متأخرة', sv_out: 'خارج الخدمة', sv_noplan: 'بلا خطة',

  kpi_total: 'إجمالي المعدات', kpi_operational: 'تعمل', kpi_due: 'تستحق قريبًا', kpi_overdue: 'متأخرة الصيانة',
  kpi_out: 'خارج الخدمة', kpi_pending: 'بانتظار المراجعة', kpi_all: 'في السجل', kpi_filter: 'عرض هذه المعدات',
  apply: 'تطبيق', search: 'ابحث بالرقم أو الطراز أو المنطقة', searchBtn: 'بحث',
  allZones: 'كل المناطق', allTypes: 'كل الأنواع', anyStatus: 'أي حالة',
  col_id: 'الرقم', col_type: 'النوع', col_brand: 'العلامة التجارية والطراز', col_serial: 'الرقم التسلسلي', col_zone: 'المنطقة',
  col_meter: 'العداد (ساعات)', col_status: 'الحالة', col_service: 'الصيانة', col_next: 'الصيانة القادمة', col_cost: 'التكلفة حتى الآن',
  emptyTitle: 'لا توجد معدات بعد', emptyBody: 'أضف أول معدة لبدء متابعة صيانتها.',
  noMatchTitle: 'لا توجد معدات مطابقة', noMatchBody: 'جرّب بحثًا آخر، أو امسح عوامل التصفية.', clearFilters: 'مسح عوامل التصفية',
  shown: 'عدد المعدات المعروضة: {n}',

  f_type: 'النوع', f_id: 'رقم المعدة', f_zone: 'المنطقة', f_brand: 'العلامة التجارية', f_model: 'الطراز', f_year: 'سنة الصنع',
  f_serial: 'الرقم التسلسلي', f_purchased: 'تاريخ الشراء', f_warranty: 'تاريخ انتهاء الضمان', f_hours: 'قراءة العداد الحالية (ساعات)',
  f_lastMeter: 'قراءة العداد عند آخر صيانة (ساعات)', f_planH: 'الفاصل بين الصيانات (بالساعات)', f_planM: 'الفاصل بين الصيانات (بالأشهر)',
  f_lastService: 'تاريخ آخر صيانة', f_nextService: 'موعد الصيانة القادمة', f_partner: 'شركة الصيانة المعتمدة', f_status: 'الحالة التشغيلية',
  h_id: 'مقترح حسب النوع. حروف لاتينية وأرقام وشرطات فقط.',
  h_plan: 'اتركه فارغًا لاستخدام القيمة الافتراضية للنوع — بالساعات: {h}، بالأشهر: {m}',
  h_next: 'اتركه فارغًا ليُحسب تلقائيًا من تاريخ آخر صيانة وخطة الصيانة.',
  h_brandSerial: 'أدخل العلامة التجارية أو الرقم التسلسلي (أحدهما على الأقل).',
  sec_identity: 'بيانات التعريف', sec_record: 'الشراء والضمان', sec_plan: 'خطة الصيانة',
  saveAsset: 'حفظ المعدة', saveAnother: 'حفظ وإضافة معدة أخرى', saveChanges: 'حفظ التغييرات', cancel: 'إلغاء',
  editTitle: 'تعديل {id}',
  errBrandSerial: 'أدخل العلامة التجارية أو الرقم التسلسلي.', errIdRequired: 'أدخل رقم المعدة.',
  errIdFormat: 'يمكن أن يحتوي رقم المعدة على حروف لاتينية وأرقام وشرطات فقط.', errIdTaken: 'رقم المعدة {id} مستخدم بالفعل.',
  errNumber: 'يجب أن تكون قيمة «{field}» رقمًا.',
  tSaved: 'تم حفظ {id}', tDeleted: 'تم حذف {id}',

  specs: 'المواصفات', planTitle: 'خطة الصيانة', history: 'سجل الصيانة', record: 'سجل المعدة',
  noHistory: 'لم تُسجَّل أي صيانة لهذه المعدة بعد.',
  k_costToDate: 'التكلفة حتى الآن', k_costYear: 'تكلفة هذا العام', k_faults: 'الأعطال', k_mtbf: 'متوسط الأيام بين الأعطال',
  p_hours: 'ساعات التشغيل منذ آخر صيانة: {used} من {h}', p_interval: 'الفاصل — بالساعات: {h}، بالأشهر: {m}',
  p_next: 'موعد الصيانة القادمة', p_last: 'آخر صيانة', none: '—',
  editDetails: 'تعديل البيانات', del: 'حذف', delTitle: 'حذف {id}؟',
  delBody: 'سيؤدي ذلك إلى حذف {id} نهائيًا مع سجل صيانتها وأعطالها وأوامر العمل الخاصة بها، ولا يمكن التراجع عن ذلك.',
  delConfirm: 'حذف المعدة', back: 'العودة إلى المعدات', createdBy: 'أضافها {name}', updatedBy: 'آخر تعديل بواسطة {name}',
  h_date: 'التاريخ', h_kind: 'نوع العمل', h_what: 'ما تم تنفيذه', h_by: 'نفّذه', h_cost: 'التكلفة',

  peopleIntro: 'كل من يظهر في التطبيق: من يسجّلون الدخول، والمشغّلون الذين تُذكر أسماؤهم في بلاغات الأعطال.',
  addPerson: 'إضافة شخص', p_name: 'الاسم الكامل', p_role: 'الدور', p_title: 'المسمى الوظيفي', p_pin: 'الرمز السري',
  setPin: 'تعيين الرمز السري', changePin: 'تغيير الرمز السري', currentPin: 'الرمز السري الحالي', newPin: 'الرمز السري الجديد',
  remove: 'إزالة', removeTitle: 'إزالة {name}؟',
  removeBody: 'لن يتمكن {name} من تسجيل الدخول بعد الآن، وسيبقى اسمه في السجلات السابقة.', removeConfirm: 'إزالة الشخص',
  unlock: 'فتح القفل', locked: 'مقفل', noPinYet: 'لم يُعيَّن رمز', you: 'أنت',
  errNameRequired: 'أدخل الاسم الكامل.', errNameTaken: 'يوجد بالفعل شخص باسم {name}.',
  errWrongCurrent: 'الرمز السري الحالي غير صحيح.', errSelf: 'لا يمكنك إزالة حسابك.',
  tPersonAdded: 'تمت إضافة {name}', tPinChanged: 'تم تحديث الرمز السري لـ{name}', tRemoved: 'تمت إزالة {name}', tUnlocked: 'تم فتح قفل حساب {name}',
  c_name: 'الاسم', c_role: 'الدور', c_title: 'المسمى الوظيفي', c_access: 'تسجيل الدخول',

  s_company: 'بيانات الشركة', s_companyHelp: 'تظهر في تقارير الصيانة المطبوعة.', s_cname: 'اسم الشركة', s_address: 'العنوان',
  s_phone: 'الهاتف', s_email: 'البريد الإلكتروني', s_display: 'طريقة العرض', s_currency: 'العملة', s_currencyHelp: 'تغيّر طريقة عرض المبالغ فقط، دون تحويلها.',
  s_dateFormat: 'صيغة التاريخ', df_long: '29 سبتمبر 2026', df_dmy: '29/09/2026', df_iso: '2026-09-29',
  s_dueSoon: 'حد «تستحق قريبًا» (بالأيام)', s_hourPct: 'اعتبار الصيانة مستحقة قريبًا عند بلوغ العداد (٪ من الفاصل)',
  s_intervals: 'فواصل الصيانة حسب النوع', s_intervalsHelp: 'تُستخدم عندما لا يكون للمعدة فاصل خاص بها. أدخل 0 إذا لم يوجد فاصل.',
  s_hours: 'بالساعات', s_months: 'بالأشهر',
  s_lists: 'القوائم', s_zones: 'المناطق', s_zonesHelp: 'منطقة واحدة في كل سطر.', s_cats: 'فئات الأعطال', s_catsHelp: 'فئة واحدة في كل سطر.',
  s_parts: 'دليل قطع الغيار', s_partsHelp: 'قطعة واحدة في كل سطر: الاسم | رمز النوع | سعر الوحدة. مثال: Hydraulic filter | RT | 450',
  s_save: 'حفظ الإعدادات', tSettings: 'تم حفظ الإعدادات',
};

const DICTS = { en, ar };

export async function getLang() {
  const v = (await cookies()).get('lang')?.value;
  return v === 'ar' ? 'ar' : 'en';
}

export function makeT(lang) {
  const d = DICTS[lang] || en;
  return (key, vars) => {
    let s = d[key] ?? en[key] ?? key;
    if (vars) for (const [k, v] of Object.entries(vars)) s = s.split('{' + k + '}').join(String(v));
    return s;
  };
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: makeT(lang) };
}

export function fmtDate(iso, lang, format = 'long') {
  if (!iso) return '—';
  if (format === 'iso') return iso;
  const [y, m, d] = iso.split('-');
  if (format === 'dmy') return `${d}/${m}/${y}`;
  const loc = lang === 'ar' ? 'ar-EG-u-nu-latn' : 'en-GB';
  return new Intl.DateTimeFormat(loc, { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' })
    .format(new Date(Date.UTC(+y, +m - 1, +d)));
}

export function fmtMoney(n, currency = 'EGP') {
  return `${Math.round(n || 0).toLocaleString('en-US')} ${currency}`;
}

export function fmtNum(n) {
  return n == null || n === '' ? '—' : Number(n).toLocaleString('en-US', { maximumFractionDigits: 1 });
}
