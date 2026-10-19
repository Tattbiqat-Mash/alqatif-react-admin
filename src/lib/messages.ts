/** Arabic copy shared across features. Feature-specific copy stays in its component. */
export const messages = {
  actions: {
    add: "إضافة",
    save: "حفظ",
    cancel: "تراجع",
    edit: "تعديل",
    delete: "حذف",
    send: "إرسال",
    confirm: "تأكيد",
    retry: "إعادة المحاولة",
    backToList: "العودة للقائمة",
    clearFilters: "مسح الفلاتر",
    logout: "خروج",
  },
  states: {
    loading: "جاري التحميل…",
    saving: "جاري الحفظ…",
    emptyTitle: "لا توجد بيانات",
    emptyDescription: "لم يتم العثور على عناصر مطابقة.",
    errorTitle: "تعذر تحميل البيانات",
    forbiddenTitle: "ليس لديك صلاحية",
    forbiddenDescription: "لا تملك صلاحية الوصول إلى هذه الصفحة. تواصل مع المسؤول إذا كنت تحتاجها.",
    notFoundTitle: "العنصر غير موجود",
    notFoundDescription: "ربما تم حذفه أو أن الرابط غير صحيح.",
  },
  toasts: {
    saved: "تم الحفظ بنجاح",
    deleted: "تم الحذف بنجاح",
    statusChanged: "تم تغيير الحالة",
  },
  validation: {
    required: "هذا الحقل مطلوب",
    invalidEmail: "البريد الإلكتروني غير صحيح",
    invalidUrl: "الرابط غير صحيح",
  },
  confirm: {
    deleteTitle: "تأكيد الحذف",
    deleteDescription: (name: string) =>
      `هل تريد حذف «${name}»؟ لا يمكن التراجع عن هذا الإجراء.`,
    discardTitle: "تجاهل التغييرات؟",
    discardDescription: "لديك تغييرات غير محفوظة ستضيع إذا غادرت الصفحة.",
  },
  errors: {
    unexpected: "حدث خطأ غير متوقع. حاول مرة أخرى.",
    network: "تعذر الاتصال بالخادم. تحقق من اتصالك بالإنترنت.",
    timeout: "انتهت مهلة الاتصال بالخادم. حاول مرة أخرى.",
    unauthorized: "انتهت الجلسة، يرجى تسجيل الدخول مرة أخرى.",
    forbidden: "ليس لديك صلاحية لهذا الإجراء.",
    notFound: "العنصر غير موجود.",
    tooManyRequests: "محاولات كثيرة، حاول مرة أخرى بعد قليل.",
    server: "حدث خطأ في الخادم. حاول مرة أخرى لاحقاً.",
  },
} as const
