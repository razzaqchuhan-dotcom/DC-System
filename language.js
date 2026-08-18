// ========================================
// DC SYSTEM - GLOBAL LANGUAGE SYSTEM
// ENGLISH + ARABIC
// ========================================


// ----------------------------------------
// DATA-I18N KEYS
// Existing data-i18n code bhi support hoga
// ----------------------------------------

const translations = {

    en: {
        dashboard: "Dashboard",
        allProjects: "All Projects",
        logout: "Logout",

        dashboardTitle: "Document Controller Dashboard",
        overallSummary: "Overall Summary",
        projects: "Projects",
        loggedInAs: "Logged in as",

        totalProjects: "Total Projects",
        totalDocuments: "Total Documents",
        inProgress: "In Progress",
        closed: "Closed",
        todayIssued: "Today Issued",
        todayResponses: "Today Responses",

        lastActivity: "Last Activity",
        openProject: "Open Project",

        createManageProjects: "Create and manage projects",
        createProject: "+ Create Project",

        outgoingSubmittals: "Outgoing Submittals",
        newSubmittal: "New Outgoing Submittal",
        saveSubmittal: "Save Submittal"
    },

    ar: {
        dashboard: "لوحة التحكم",
        allProjects: "جميع المشاريع",
        logout: "تسجيل الخروج",

        dashboardTitle: "لوحة تحكم مراقب المستندات",
        overallSummary: "الملخص العام",
        projects: "المشاريع",
        loggedInAs: "تم تسجيل الدخول باسم",

        totalProjects: "إجمالي المشاريع",
        totalDocuments: "إجمالي المستندات",
        inProgress: "قيد التنفيذ",
        closed: "مغلق",
        todayIssued: "الصادر اليوم",
        todayResponses: "ردود اليوم",

        lastActivity: "آخر نشاط",
        openProject: "فتح المشروع",

        createManageProjects: "إنشاء وإدارة المشاريع",
        createProject: "+ إنشاء مشروع",

        outgoingSubmittals: "التقديمات الصادرة",
        newSubmittal: "تقديم صادر جديد",
        saveSubmittal: "حفظ التقديم"
    }

};


// ========================================
// AUTO TEXT TRANSLATIONS
// Exact system text only
// User-entered data will NOT be translated
// ========================================

const uiTranslations = {

    "Dashboard": "لوحة التحكم",
    "All Projects": "جميع المشاريع",
    "Logout": "تسجيل الخروج",

    "Document Controller Dashboard":
        "لوحة تحكم مراقب المستندات",

    "Overall Summary":
        "الملخص العام",

    "Projects":
        "المشاريع",

    "Logged in as":
        "تم تسجيل الدخول باسم",

    "Total Projects":
        "إجمالي المشاريع",

    "Total Documents":
        "إجمالي المستندات",

    "In Progress":
        "قيد التنفيذ",

    "Closed":
        "مغلق",

    "Today Issued":
        "الصادر اليوم",

    "Today Responses":
        "ردود اليوم",

    "Last Activity":
        "آخر نشاط",

    "Last Activity:":
        "آخر نشاط:",

    "Open Project":
        "فتح المشروع",

    "Create and manage projects":
        "إنشاء وإدارة المشاريع",

    "+ Create Project":
        "+ إنشاء مشروع",

    "Project":
        "المشروع",

    "Project No:":
        "رقم المشروع:",

    "Project Code:":
        "رمز المشروع:",

    "Project No:":
    "رقم المشروع:",

    "Project Code:":
        "رمز المشروع:",

    "Open":
        "فتح",

    "Edit":
        "تعديل",

    "Delete":
        "حذف",

    "* Close":
        "* إغلاق",

    "Add New Project":
        "إضافة مشروع جديد",

    "Project Name":
        "اسم المشروع",

    "Project Code / Initial":
        "رمز المشروع / الاختصار",

    "Project No.":
        "رقم المشروع",

    "Generate":
        "إنشاء",

    "Save Project":
        "حفظ المشروع",

    "Back to Projects":
        "العودة إلى المشاريع",

    "← Back to Projects":
        "← العودة إلى المشاريع",

    "Report Date:":
        "تاريخ التقرير:",

    "Download PDF":
        "تحميل PDF",

    "Approved":
        "معتمد",

    "Revise & Resubmit":
        "تعديل وإعادة تقديم",

    "Today Issued Submittals":
        "تقديمات اليوم الصادرة",

    "No submittals issued today.":
        "لا توجد تقديمات صادرة اليوم.",

    "Today Received Responses":
        "الردود المستلمة اليوم",

    "No responses received today.":
        "لا توجد ردود مستلمة اليوم.",

    "Open / In Progress Submittals":
        "التقديمات المفتوحة / قيد التنفيذ",

    "All Types":
        "جميع الأنواع",

    "S.No":
        "م",

    "Submittal Requested By":
        "طلب التقديم بواسطة",

    "Open PDF":
        "فتح PDF",

    "Closed Submittals":
        "التقديمات المغلقة",

    "No closed submittals.":
        "لا توجد تقديمات مغلقة.",    


    // ------------------------------------
    // OUTGOING SUBMITTALS
    // ------------------------------------

    "Outgoing Submittals":
        "التقديمات الصادرة",

    "OUTGOING SUBMITTALS":
        "التقديمات الصادرة",

    "New Outgoing Submittal":
        "تقديم صادر جديد",

    "Discipline":
        "التخصص",

    "Select Discipline":
        "اختر التخصص",

    "Document Type":
        "نوع المستند",

    "Select Document Type":
        "اختر نوع المستند",

    "Official / Manual Ref No.":
        "الرقم المرجعي الرسمي / اليدوي",

    "Subject":
        "الموضوع",

    "Issue Date":
        "تاريخ الإصدار",

    "Description / Remarks":
        "الوصف / الملاحظات",

    "Issued Information":
        "معلومات الإصدار",

    "Issued By":
        "صدر بواسطة",

    "Select Issuer":
        "اختر المُصدر",

    "+ Add":
        "+ إضافة",

    "Submission Method":
        "طريقة التقديم",

    "Select Method":
        "اختر الطريقة",

    "By Hand":
        "باليد",

    "By Email":
        "بالبريد الإلكتروني",

    "By Hand + Email":
        "باليد + البريد الإلكتروني",

    "Portal":
        "البوابة الإلكترونية",

    "Receiver Name":
        "اسم المستلم",

    "Select Receiver":
        "اختر المستلم",

    "Received Date":
        "تاريخ الاستلام",

    "Submittal Request Information":
        "معلومات طلب التقديم",

    "Submittal Requested By":
        "طلب التقديم بواسطة",

    "Select Requested By":
        "اختر مقدم الطلب",

    "Request Attachment":
        "مرفق الطلب",

    "WhatsApp screenshot, image or PDF":
        "لقطة واتساب أو صورة أو ملف PDF",

    "Attach Submittal PDF":
        "إرفاق ملف التقديم PDF",

    "Cancel":
        "إلغاء",

    "Save Submittal":
        "حفظ التقديم",

    "Update Submittal":
        "تحديث التقديم",


    // ------------------------------------
    // REGISTER
    // ------------------------------------

    "OUTGOING SUBMITTAL REGISTER":
        "سجل التقديمات الصادرة",

    "All Disciplines":
        "جميع التخصصات",

    "All Document Types":
        "جميع أنواع المستندات",

    "Edit Selected":
        "تعديل المحدد",

    "Delete Selected":
        "حذف المحدد",

    "+ New Submittal":
        "+ تقديم جديد",

    "Download Excel":
        "تحميل Excel",

    "Color Guide:":
        "دليل الألوان:",

    "Green = Within Time":
        "الأخضر = ضمن الوقت",

    "Orange = Due Soon":
        "البرتقالي = الاستحقاق قريب",

    "Red = Overdue":
        "الأحمر = متأخر",


    // ------------------------------------
    // TABLE HEADINGS
    // ------------------------------------

    "S.No.":
        "م",

    "Sequence ID":
        "رقم التسلسل",

    "Ref No.":
        "الرقم المرجعي",

    "Type":
        "النوع",

    "Status":
        "الحالة",

    "Action By":
        "الإجراء بواسطة",

    "Action Date":
        "تاريخ الإجراء",

    "PDF":
        "PDF",

    "Method":
        "الطريقة",

    "Receiver":
        "المستلم",


    // ------------------------------------
    // RESPONSE / ACTIONS
    // ------------------------------------

    "Action 1 By":
        "الإجراء 1 بواسطة",

    "Action 1 Date":
        "تاريخ الإجراء 1",

    "Action 1 Comment":
        "ملاحظة الإجراء 1",

    "Action 2 By":
        "الإجراء 2 بواسطة",

    "Action 2 Date":
        "تاريخ الإجراء 2",

    "Action 2 Comment":
        "ملاحظة الإجراء 2",

    "Action 3 By":
        "الإجراء 3 بواسطة",

    "Action 3 Date":
        "تاريخ الإجراء 3",

    "Action 3 Comment":
        "ملاحظة الإجراء 3",

    "Status / Closing":
        "الحالة / الإغلاق",

    "Response Status":
        "حالة الرد",

    "Select Status":
        "اختر الحالة",

    "Closing Status":
        "حالة الإغلاق",

    "Open":
        "مفتوح",

    "Closing Date":
        "تاريخ الإغلاق",

    "Save Response":
        "حفظ الرد",


    // ------------------------------------
    // COMMON STATUSES
    // ------------------------------------

    "Approved":
        "معتمد",

    "Approved as Noted":
        "معتمد مع ملاحظات",

    "Conditional Approved":
        "معتمد بشروط",

    "Under Review":
        "قيد المراجعة",

    "Revise & Resubmit":
        "تعديل وإعادة تقديم",

    "Rejected":
        "مرفوض",

    "Not Approved":
        "غير معتمد"
};


// ========================================
// PLACEHOLDER TRANSLATIONS
// ========================================

const placeholderTranslations = {

    "Search submittals...":
        "البحث في التقديمات...",

    "Enter Ref No.":
        "أدخل الرقم المرجعي",

    "Enter Subject":
        "أدخل الموضوع",

    "Enter Description / Remarks":
        "أدخل الوصف / الملاحظات",

    "Enter Receiver Name":
        "أدخل اسم المستلم"
};


// ========================================
// REVERSE ARABIC → ENGLISH MAP
// ========================================

const reverseTranslations = {};

Object.keys(uiTranslations).forEach(function (englishText) {

    const arabicText =
        uiTranslations[englishText];

    reverseTranslations[arabicText] =
        englishText;

});


const reversePlaceholders = {};

Object.keys(placeholderTranslations).forEach(
    function (englishText) {

        const arabicText =
            placeholderTranslations[englishText];

        reversePlaceholders[arabicText] =
            englishText;

    }
);


// ========================================
// CREATE LANGUAGE BUTTONS
// ========================================

function createLanguageSwitcher() {

    if (
        document.getElementById("englishBtn") ||
        document.getElementById("arabicBtn")
    ) {
        return;
    }

    const languageSwitcher =
        document.createElement("div");

    languageSwitcher.className =
        "language-switcher";

    languageSwitcher.innerHTML = `
        <button type="button" id="englishBtn">EN</button>
        <button type="button" id="arabicBtn">AR</button>
    `;

    document.body.appendChild(
        languageSwitcher
    );
}


// ========================================
// TRANSLATE ONE TEXT NODE
// ========================================

function translateTextNode(
    textNode,
    language
) {

    const originalText =
        textNode.nodeValue;

    const cleanText =
        originalText.trim();

    if (!cleanText) {
        return;
    }


    let translatedText = null;


    if (language === "ar") {

        if (uiTranslations[cleanText]) {

            translatedText =
                uiTranslations[cleanText];

        }

    } else {

        if (reverseTranslations[cleanText]) {

            translatedText =
                reverseTranslations[cleanText];

        }

    }


    if (translatedText === null) {
        return;
    }


    const startSpaces =
        originalText.match(/^\s*/)[0];

    const endSpaces =
        originalText.match(/\s*$/)[0];


    textNode.nodeValue =
        startSpaces +
        translatedText +
        endSpaces;
}


// ========================================
// TRANSLATE ELEMENT
// ========================================

function translateElement(
    element,
    language
) {

    if (!element) {
        return;
    }


    // ------------------------------------
    // DATA-I18N
    // ------------------------------------

    if (
        element.nodeType === 1 &&
        element.hasAttribute("data-i18n")
    ) {

        const key =
            element.getAttribute("data-i18n");

        if (
            translations[language] &&
            translations[language][key]
        ) {

            element.textContent =
                translations[language][key];

        }

    }


    // ------------------------------------
    // PLACEHOLDERS
    // ------------------------------------

    if (
        element.nodeType === 1 &&
        element.hasAttribute("placeholder")
    ) {

        const placeholder =
            element.getAttribute("placeholder");

        if (language === "ar") {

            if (
                placeholderTranslations[
                    placeholder
                ]
            ) {

                element.setAttribute(
                    "placeholder",
                    placeholderTranslations[
                        placeholder
                    ]
                );

            }

        } else {

            if (
                reversePlaceholders[
                    placeholder
                ]
            ) {

                element.setAttribute(
                    "placeholder",
                    reversePlaceholders[
                        placeholder
                    ]
                );

            }

        }

    }


    // ------------------------------------
    // TEXT NODES
    // ------------------------------------

    const childNodes =
        Array.from(element.childNodes || []);

    childNodes.forEach(
        function (node) {

            if (node.nodeType === 3) {

                translateTextNode(
                    node,
                    language
                );

            } else if (
                node.nodeType === 1
            ) {

                translateElement(
                    node,
                    language
                );

            }

        }
    );
}


// ========================================
// APPLY LANGUAGE
// ========================================

function changeLanguage(language) {

    localStorage.setItem(
        "selectedLanguage",
        language
    );


    if (language === "ar") {

        document.documentElement.lang =
            "ar";

        document.documentElement.dir =
            "rtl";

    } else {

        document.documentElement.lang =
            "en";

        document.documentElement.dir =
            "ltr";

    }


    translateElement(
        document.body,
        language
    );


    // Optional page title translation

    const currentTitle =
        document.title.trim();

    if (
        language === "ar" &&
        uiTranslations[currentTitle]
    ) {

        document.title =
            uiTranslations[currentTitle];

    }

    if (
        language === "en" &&
        reverseTranslations[currentTitle]
    ) {

        document.title =
            reverseTranslations[currentTitle];

    }

}


// ========================================
// START SYSTEM
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        createLanguageSwitcher();


        const englishBtn =
            document.getElementById(
                "englishBtn"
            );

        const arabicBtn =
            document.getElementById(
                "arabicBtn"
            );


        englishBtn.addEventListener(
            "click",
            function () {

                changeLanguage("en");

            }
        );


        arabicBtn.addEventListener(
            "click",
            function () {

                changeLanguage("ar");

            }
        );


        const savedLanguage =
            localStorage.getItem(
                "selectedLanguage"
            ) || "en";


        changeLanguage(
            savedLanguage
        );


        // =================================
        // WATCH DYNAMIC CONTENT
        // =================================

        const observer =
            new MutationObserver(
                function (mutations) {

                    const currentLanguage =
                        localStorage.getItem(
                            "selectedLanguage"
                        ) || "en";


                    mutations.forEach(
                        function (mutation) {

                            mutation.addedNodes
                                .forEach(
                                    function (node) {

                                        if (
                                            node.nodeType === 1
                                        ) {

                                            translateElement(
                                                node,
                                                currentLanguage
                                            );

                                        } else if (
                                            node.nodeType === 3
                                        ) {

                                            translateTextNode(
                                                node,
                                                currentLanguage
                                            );

                                        }

                                    }
                                );

                        }
                    );

                }
            );


        observer.observe(
            document.body,
            {
                childList: true,
                subtree: true
            }
        );

    }
);