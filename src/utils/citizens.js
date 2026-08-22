const fs = require('fs');
const path = require('path');

// =====================================================
// الإعدادات
// =====================================================

const MAX_CHARACTERS = 3;


// =====================================================
// قاعدة البيانات
// =====================================================

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'citizens.json');

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}', 'utf8');
}


// =====================================================
// قراءة البيانات
// =====================================================

function loadCitizens() {

    try {

        const data = fs.readFileSync(
            DATA_FILE,
            'utf8'
        );

        if (!data.trim()) {
            return {};
        }

        return JSON.parse(data);

    } catch (error) {

        console.error(
            '❌ خطأ في قراءة citizens.json:',
            error
        );

        return {};
    }
}


// =====================================================
// حفظ البيانات
// =====================================================

function saveCitizens(data) {

    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 4),
            'utf8'
        );

    } catch (error) {

        console.error(
            '❌ خطأ في حفظ citizens.json:',
            error
        );

        throw error;
    }
}


// =====================================================
// حساب Discord
//
// شكل البيانات:
//
// {
//     "DISCORD_ID": {
//         discordId,
//         activeCharacterId,
//         characters: []
//     }
// }
// =====================================================

function getUser(userId) {

    const data = loadCitizens();

    return data[String(userId)] || null;
}


function createUser(userId) {

    const data = loadCitizens();

    userId = String(userId);

    if (!data[userId]) {

        data[userId] = {

            discordId: userId,

            activeCharacterId: null,

            characters: []

        };

        saveCitizens(data);
    }

    return data[userId];
}


// =====================================================
// الحصول على شخصيات المستخدم
// =====================================================

function getCharacters(userId) {

    const user = getUser(userId);

    if (!user) {
        return [];
    }

    if (!Array.isArray(user.characters)) {
        return [];
    }

    return user.characters;
}


// =====================================================
// التحقق من إمكانية إنشاء كركتر
// =====================================================

function canCreateCharacter(userId) {

    const characters =
        getCharacters(userId);

    return characters.length < MAX_CHARACTERS;
}


// =====================================================
// العثور على شخصية بالهوية
// =====================================================

function findCharacter(citizenId) {

    const data = loadCitizens();

    citizenId = String(citizenId);

    for (const userId of Object.keys(data)) {

        const user = data[userId];

        if (
            !user ||
            !Array.isArray(user.characters)
        ) {
            continue;
        }

        const character =
            user.characters.find(
                item =>
                    String(item.citizenId) ===
                    citizenId
            );

        if (character) {

            return {

                user,

                character,

                userId

            };
        }
    }

    return null;
}


// =====================================================
// الحصول على كركتر معين للمستخدم
// =====================================================

function getCharacter(
    userId,
    citizenId
) {

    const characters =
        getCharacters(userId);

    return characters.find(
        character =>
            String(character.citizenId) ===
            String(citizenId)
    ) || null;
}


// =====================================================
// الكركتر الحالي
// =====================================================

function getActiveCharacter(userId) {

    const user = getUser(userId);

    if (!user) {
        return null;
    }

    if (!user.activeCharacterId) {
        return null;
    }

    return getCharacter(
        userId,
        user.activeCharacterId
    );
}


// =====================================================
// تسجيل الدخول بكركتر
// =====================================================

function setActiveCharacter(
    userId,
    citizenId
) {

    const data = loadCitizens();

    userId = String(userId);
    citizenId = String(citizenId);

    const user = data[userId];

    if (!user) {
        return null;
    }

    if (!Array.isArray(user.characters)) {
        return null;
    }

    const character =
        user.characters.find(
            item =>
                String(item.citizenId) ===
                citizenId
        );

    if (!character) {
        return null;
    }


    // =================================================
    // إلغاء تسجيل الدخول من جميع الكركترات
    // =================================================

    user.characters.forEach(
        item => {

            item.active =
                String(item.citizenId) ===
                citizenId;

        }
    );


    // =================================================
    // تسجيل الدخول بالكركتر المحدد
    // =================================================

    user.activeCharacterId =
        citizenId;


    saveCitizens(data);

    return character;
}


// =====================================================
// تسجيل الخروج من الكركتر
// =====================================================

function logoutCharacter(userId) {

    const data = loadCitizens();

    userId = String(userId);

    const user = data[userId];

    if (!user) {
        return false;
    }


    // =================================================
    // إلغاء الكركتر الحالي
    // =================================================

    user.activeCharacterId = null;


    // =================================================
    // إلغاء Active من جميع الكركترات
    // =================================================

    if (Array.isArray(user.characters)) {

        user.characters.forEach(
            character => {

                character.active = false;

            }
        );
    }


    saveCitizens(data);

    return true;
}


// =====================================================
// توليد رقم هوية فريد من 5 أرقام
// =====================================================

function generateCitizenId() {

    let citizenId;

    do {

        citizenId = String(
            Math.floor(
                10000 +
                Math.random() * 90000
            )
        );

    } while (
        findCharacter(citizenId)
    );

    return citizenId;
}


// =====================================================
// إنشاء كركتر
//
// البيانات:
//
// userId
// name
// psn
// dateOfBirth
// birthPlace
// gender
// =====================================================

function createCharacter(
    userId,
    name,
    psn,
    dateOfBirth,
    birthPlace,
    gender
) {

    const data = loadCitizens();

    userId = String(userId);


    // =================================================
    // إنشاء حساب المستخدم إذا غير موجود
    // =================================================

    if (!data[userId]) {

        data[userId] = {

            discordId: userId,

            activeCharacterId: null,

            characters: []

        };
    }


    const user =
        data[userId];


    if (!Array.isArray(user.characters)) {
        user.characters = [];
    }


    // =================================================
    // الحد الأقصى للكركترات
    // =================================================

    if (
        user.characters.length >=
        MAX_CHARACTERS
    ) {

        return null;
    }


    // =================================================
    // توليد رقم الهوية
    // =================================================

    const citizenId =
        generateCitizenId();


    // =================================================
    // إنشاء الكركتر
    // =================================================

    const character = {

        // ==========================
        // الهوية
        // ==========================

        citizenId,

        userId,

        name:
            String(name || '').trim(),

        psn:
            String(psn || '').trim(),

        dateOfBirth:
            String(dateOfBirth || '').trim(),

        birthPlace:
            String(birthPlace || '').trim(),

        gender:
            String(gender || '').trim(),


        // ==========================
        // الحالة
        // ==========================

        // إنشاء الكركتر لا يعني تسجيل الدخول
        active: false,


        // ==========================
        // الأموال
        // ==========================

        cash: 5000,

        bank: 0,


        // ==========================
        // الوظيفة
        // ==========================

        job: null,

        rank: null,

        salary: 0,

        points: 0,


        // ==========================
        // الخدمات
        // ==========================

        servicesSuspended: false,

        suspensionReason: null,


        // ==========================
        // المخالفات
        // ==========================

        fines: [],


        // ==========================
        // السجل
        // ==========================

        history: [],


        // ==========================
        // العمليات المالية
        // ==========================

        transactions: [],


        // ==========================
        // تاريخ الإنشاء
        // ==========================

        createdAt:
            new Date().toISOString()

    };


    // =================================================
    // إضافة الكركتر
    //
    // ملاحظة:
    // لا يتم تسجيل الدخول تلقائياً
    // =================================================

    user.characters.push(
        character
    );


    // =================================================
    // حفظ
    // =================================================

    saveCitizens(data);


    return character;
}


// =====================================================
// حذف كركتر
// =====================================================

function deleteCharacter(
    userId,
    citizenId
) {

    const data = loadCitizens();

    userId = String(userId);
    citizenId = String(citizenId);

    const user = data[userId];

    if (!user) {
        return null;
    }

    if (!Array.isArray(user.characters)) {
        return null;
    }


    const index =
        user.characters.findIndex(
            character =>
                String(character.citizenId) ===
                citizenId
        );


    if (index === -1) {
        return null;
    }


    const deleted =
        user.characters[index];


    const wasActive =
        String(user.activeCharacterId) ===
        citizenId;


    // =================================================
    // حذف الكركتر
    // =================================================

    user.characters.splice(
        index,
        1
    );


    // =================================================
    // إذا كان المحذوف هو الحالي
    //
    // لا يتم تسجيل الدخول بكركتر آخر
    // =================================================

    if (wasActive) {

        user.activeCharacterId = null;

        user.characters.forEach(
            character => {

                character.active = false;

            }
        );
    }


    saveCitizens(data);

    return deleted;
}


// =====================================================
// تعديل كركتر
// =====================================================

function updateCharacter(
    citizenId,
    updates
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }


    Object.assign(
        result.character,
        updates
    );


    const data =
        loadCitizens();


    data[result.userId]
        .characters =
        data[result.userId]
            .characters.map(
                character =>
                    String(
                        character.citizenId
                    ) ===
                    String(citizenId)
                        ? result.character
                        : character
            );


    saveCitizens(data);


    return result.character;
}


// =====================================================
// إضافة كاش
// =====================================================

function addCash(
    citizenId,
    amount
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return null;
    }


    result.character.cash +=
        amount;


    updateCharacter(
        citizenId,
        {
            cash:
                result.character.cash
        }
    );


    return result.character;
}


// =====================================================
// إزالة كاش
// =====================================================

function removeCash(
    citizenId,
    amount
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return null;
    }


    if (
        result.character.cash <
        amount
    ) {
        return false;
    }


    result.character.cash -=
        amount;


    updateCharacter(
        citizenId,
        {
            cash:
                result.character.cash
        }
    );


    return result.character;
}


// =====================================================
// إضافة للبنك
// =====================================================

function addBank(
    citizenId,
    amount
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return null;
    }


    result.character.bank +=
        amount;


    updateCharacter(
        citizenId,
        {
            bank:
                result.character.bank
        }
    );


    return result.character;
}


// =====================================================
// إزالة من البنك
// =====================================================

function removeBank(
    citizenId,
    amount
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return null;
    }


    if (
        result.character.bank <
        amount
    ) {
        return false;
    }


    result.character.bank -=
        amount;


    updateCharacter(
        citizenId,
        {
            bank:
                result.character.bank
        }
    );


    return result.character;
}


// =====================================================
// تصفير الأموال
// =====================================================

function resetMoney(
    citizenId
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }


    result.character.cash = 0;

    result.character.bank = 0;


    updateCharacter(
        citizenId,
        {
            cash: 0,
            bank: 0
        }
    );


    return result.character;
}


// =====================================================
// إضافة مخالفة
// =====================================================

function addFine(
    citizenId,
    fine
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }


    if (
        !Array.isArray(
            result.character.fines
        )
    ) {

        result.character.fines = [];

    }


    const newFine = {

        id:
            Date.now().toString(),

        ...fine,

        createdAt:
            new Date().toISOString()

    };


    result.character.fines.push(
        newFine
    );


    updateCharacter(
        citizenId,
        {
            fines:
                result.character.fines
        }
    );


    return newFine;
}


// =====================================================
// إضافة معاملة مالية
// =====================================================

function addTransaction(
    citizenId,
    transaction
) {

    const result =
        findCharacter(citizenId);

    if (!result) {
        return null;
    }


    if (
        !Array.isArray(
            result.character.transactions
        )
    ) {

        result.character.transactions = [];

    }


    const newTransaction = {

        id:
            Date.now().toString(),

        ...transaction,

        date:
            new Date().toISOString()

    };


    result.character.transactions.push(
        newTransaction
    );


    updateCharacter(
        citizenId,
        {
            transactions:
                result.character.transactions
        }
    );


    return newTransaction;
}


// =====================================================
// توافق مع النظام القديم
// =====================================================

function getCitizen(citizenId) {

    const result =
        findCharacter(citizenId);

    return result
        ? result.character
        : null;
}


function getCitizenByUserId(userId) {

    const character =
        getActiveCharacter(userId);

    return character || null;
}


// =====================================================
// إنشاء Citizen قديم
// =====================================================
//
// أبقيناه حتى لا تتعطل الأكواد القديمة.
//
// البيانات الجديدة الاختيارية:
//
// psn
// dateOfBirth
// birthPlace
// gender
// =====================================================

function createCitizen({
    citizenId,
    userId,
    name,
    age,
    psn,
    dateOfBirth,
    birthPlace,
    gender
}) {

    const data =
        loadCitizens();

    userId = String(userId);


    // =================================================
    // إنشاء حساب المستخدم
    // =================================================

    if (!data[userId]) {

        data[userId] = {

            discordId: userId,

            activeCharacterId:
                null,

            characters: []

        };

    }


    // =================================================
    // الحد الأقصى
    // =================================================

    if (
        data[userId]
            .characters
            .length >= MAX_CHARACTERS
    ) {

        return null;
    }


    // =================================================
    // إنشاء الشخصية
    // =================================================

    const character = {

        citizenId:
            String(citizenId),

        userId,

        name:
            String(name || '').trim(),

        // توافق قديم
        age:
            age !== undefined &&
            age !== null
                ? Number(age)
                : null,

        // البيانات الجديدة
        psn:
            String(psn || '').trim(),

        dateOfBirth:
            String(dateOfBirth || '').trim(),

        birthPlace:
            String(birthPlace || '').trim(),

        gender:
            String(gender || '').trim(),

        active: false,

        cash: 5000,

        bank: 0,

        job: null,

        rank: null,

        salary: 0,

        points: 0,

        servicesSuspended: false,

        suspensionReason: null,

        fines: [],

        history: [],

        transactions: [],

        createdAt:
            new Date().toISOString()

    };


    // =================================================
    // إضافة
    // =================================================

    data[userId]
        .characters
        .push(character);


    // =================================================
    // مهم:
    // إنشاء Citizen لا يعني تسجيل الدخول
    // =================================================


    saveCitizens(data);

    return character;
}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    // ==========================
    // إعدادات
    // ==========================

    MAX_CHARACTERS,

    // ==========================
    // قاعدة البيانات
    // ==========================

    loadCitizens,
    saveCitizens,

    // ==========================
    // المستخدمين
    // ==========================

    getUser,
    createUser,

    // ==========================
    // الكركترات
    // ==========================

    getCharacters,
    getCharacter,
    findCharacter,

    createCharacter,
    deleteCharacter,
    updateCharacter,

    canCreateCharacter,

    // ==========================
    // الكركتر الحالي
    // ==========================

    getActiveCharacter,
    setActiveCharacter,
    logoutCharacter,

    // ==========================
    // الهوية
    // ==========================

    generateCitizenId,

    // ==========================
    // الأموال
    // ==========================

    addCash,
    removeCash,
    addBank,
    removeBank,
    resetMoney,

    // ==========================
    // المخالفات
    // ==========================

    addFine,

    // ==========================
    // المعاملات
    // ==========================

    addTransaction,

    // ==========================
    // توافق قديم
    // ==========================

    getCitizen,
    getCitizenByUserId,
    createCitizen

};
