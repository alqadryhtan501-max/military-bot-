const fs = require('fs');
const path = require('path');

// =====================================================
// الإعدادات
// =====================================================

const MAX_CHARACTERS = 3;


// =====================================================
// قاعدة البيانات
// =====================================================

const DATA_DIR =
    path.join(__dirname, '../../data');

const DATA_FILE =
    path.join(DATA_DIR, 'citizens.json');


// إنشاء مجلد البيانات
if (!fs.existsSync(DATA_DIR)) {

    fs.mkdirSync(
        DATA_DIR,
        {
            recursive: true
        }
    );

}


// إنشاء قاعدة البيانات
if (!fs.existsSync(DATA_FILE)) {

    fs.writeFileSync(
        DATA_FILE,
        '{}',
        'utf8'
    );

}


// =====================================================
// قراءة قاعدة البيانات
// =====================================================

function loadCitizens() {

    try {

        const data =
            fs.readFileSync(
                DATA_FILE,
                'utf8'
            );

        if (!data.trim()) {
            return {};
        }

        const parsed =
            JSON.parse(data);

        if (
            !parsed ||
            typeof parsed !== 'object' ||
            Array.isArray(parsed)
        ) {

            return {};

        }

        return parsed;

    } catch (error) {

        console.error(
            '❌ خطأ في قراءة citizens.json:',
            error
        );

        return {};

    }

}


// =====================================================
// حفظ قاعدة البيانات
// =====================================================

function saveCitizens(data) {

    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(
                data,
                null,
                4
            ),
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
// المستخدم
// =====================================================

function getUser(userId) {

    const data =
        loadCitizens();

    return (
        data[String(userId)] ||
        null
    );

}


// =====================================================
// إنشاء حساب مستخدم
// =====================================================

function createUser(userId) {

    const data =
        loadCitizens();

    userId =
        String(userId);


    if (!data[userId]) {

        data[userId] = {

            discordId:
                userId,

            activeCharacterId:
                null,

            characters:
                []

        };

        saveCitizens(data);

    }


    return data[userId];

}


// =====================================================
// شخصيات المستخدم
// =====================================================

function getCharacters(userId) {

    const user =
        getUser(userId);

    if (!user) {
        return [];
    }

    if (
        !Array.isArray(
            user.characters
        )
    ) {

        return [];

    }

    return user.characters;

}


// =====================================================
// هل يستطيع إنشاء شخصية؟
// =====================================================

function canCreateCharacter(userId) {

    return (
        getCharacters(userId).length <
        MAX_CHARACTERS
    );

}


// =====================================================
// الحصول على شخصية معينة
// =====================================================

function getCharacter(
    userId,
    citizenId
) {

    const characters =
        getCharacters(userId);

    return (
        characters.find(
            character =>
                String(
                    character.citizenId
                ) ===
                String(citizenId)
        ) ||
        null
    );

}


// =====================================================
// البحث عن شخصية في جميع الحسابات
// =====================================================

function findCharacter(citizenId) {

    const data =
        loadCitizens();

    citizenId =
        String(citizenId);


    for (
        const userId of Object.keys(data)
    ) {

        const user =
            data[userId];


        if (
            !user ||
            !Array.isArray(
                user.characters
            )
        ) {

            continue;

        }


        const character =
            user.characters.find(
                item =>
                    String(
                        item.citizenId
                    ) ===
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
// الكركتر الحالي
// =====================================================

function getActiveCharacter(userId) {

    const user =
        getUser(userId);

    if (!user) {
        return null;
    }


    if (
        !user.activeCharacterId
    ) {

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

    const data =
        loadCitizens();

    userId =
        String(userId);

    citizenId =
        String(citizenId);


    const user =
        data[userId];


    if (!user) {
        return null;
    }


    if (
        !Array.isArray(
            user.characters
        )
    ) {

        return null;

    }


    const character =
        user.characters.find(
            item =>
                String(
                    item.citizenId
                ) ===
                citizenId
        );


    if (!character) {
        return null;
    }


    // إلغاء تسجيل الدخول
    // من جميع الشخصيات
    user.characters.forEach(
        item => {

            item.active =
                String(
                    item.citizenId
                ) ===
                citizenId;

        }
    );


    // تحديد الشخصية الحالية
    user.activeCharacterId =
        citizenId;


    saveCitizens(data);


    return character;

}


// =====================================================
// تسجيل الخروج
// =====================================================

function logoutCharacter(userId) {

    const data =
        loadCitizens();

    userId =
        String(userId);


    const user =
        data[userId];


    if (!user) {
        return false;
    }


    // إلغاء الشخصية الحالية
    user.activeCharacterId =
        null;


    // إلغاء Active
    if (
        Array.isArray(
            user.characters
        )
    ) {

        user.characters.forEach(
            character => {

                character.active =
                    false;

            }
        );

    }


    saveCitizens(data);


    return true;

}


// =====================================================
// توليد رقم هوية 5 أرقام
// =====================================================

function generateCitizenId() {

    let citizenId;


    do {

        citizenId =
            String(
                Math.floor(
                    10000 +
                    Math.random() *
                    90000
                )
            );

    } while (
        findCharacter(
            citizenId
        )
    );


    return citizenId;

}


// =====================================================
// إنشاء كركتر
// =====================================================
//
// createCharacter(
//     userId,
//     {
//         name,
//         psId,
//         birthDate,
//         birthPlace,
//         gender
//     }
// )
//
// =====================================================

function createCharacter(
    userId,
    characterData
) {

    const data =
        loadCitizens();

    userId =
        String(userId);


    // =================================================
    // إنشاء المستخدم إذا غير موجود
    // =================================================

    if (!data[userId]) {

        data[userId] = {

            discordId:
                userId,

            activeCharacterId:
                null,

            characters:
                []

        };

    }


    const user =
        data[userId];


    if (
        !Array.isArray(
            user.characters
        )
    ) {

        user.characters =
            [];

    }


    // =================================================
    // الحد الأقصى
    // =================================================

    if (
        user.characters.length >=
        MAX_CHARACTERS
    ) {

        return null;

    }


    // =================================================
    // البيانات
    // =================================================

    characterData =
        characterData || {};


    const name =
        String(
            characterData.name || ''
        ).trim();


    const psId =
        String(
            characterData.psId || ''
        ).trim();


    const birthDate =
        String(
            characterData.birthDate || ''
        ).trim();


    const birthPlace =
        String(
            characterData.birthPlace || ''
        ).trim();


    const gender =
        String(
            characterData.gender || ''
        ).trim();


    // =================================================
    // التحقق
    // =================================================

    if (!name) {
        return null;
    }

    if (!psId) {
        return null;
    }

    if (!birthDate) {
        return null;
    }

    if (!birthPlace) {
        return null;
    }

    if (!gender) {
        return null;
    }


    // =================================================
    // رقم الهوية
    // =================================================

    const citizenId =
        generateCitizenId();


    // =================================================
    // الشخصية
    // =================================================

    const character = {

        // ==========================
        // الهوية
        // ==========================

        citizenId,

        userId,

        name,

        psId,

        birthDate,

        birthPlace,

        gender,


        // ==========================
        // الحالة
        // ==========================

        active:
            false,


        // ==========================
        // الأموال
        // ==========================

        cash:
            5000,

        bank:
            0,


        // ==========================
        // الوظيفة
        // ==========================

        job:
            null,

        rank:
            null,

        salary:
            0,

        points:
            0,


        // ==========================
        // الخدمات
        // ==========================

        servicesSuspended:
            false,

        suspensionReason:
            null,


        // ==========================
        // المخالفات
        // ==========================

        fines:
            [],


        // ==========================
        // السجل
        // ==========================

        history:
            [],


        // ==========================
        // المعاملات المالية
        // ==========================

        transactions:
            [],


        // ==========================
        // تاريخ الإنشاء
        // ==========================

        createdAt:
            new Date().toISOString()

    };


    // =================================================
    // إضافة الشخصية
    // =================================================

    user.characters.push(
        character
    );


    // =================================================
    // مهم:
    // الشخصية الجديدة لا تسجل دخول تلقائياً
    // =================================================

    character.active =
        false;


    // =================================================
    // حفظ
    // =================================================

    saveCitizens(data);


    return character;

}


// =====================================================
// حذف شخصية
// =====================================================

function deleteCharacter(
    userId,
    citizenId
) {

    const data =
        loadCitizens();

    userId =
        String(userId);

    citizenId =
        String(citizenId);


    const user =
        data[userId];


    if (!user) {
        return null;
    }


    if (
        !Array.isArray(
            user.characters
        )
    ) {

        return null;

    }


    const index =
        user.characters.findIndex(
            character =>
                String(
                    character.citizenId
                ) ===
                citizenId
        );


    if (index === -1) {
        return null;
    }


    const deleted =
        user.characters[index];


    const wasActive =
        String(
            user.activeCharacterId
        ) ===
        citizenId;


    // حذف الشخصية
    user.characters.splice(
        index,
        1
    );


    // =================================================
    // إذا كانت الشخصية المحذوفة مسجل دخول فيها
    // =================================================

    if (wasActive) {

        user.activeCharacterId =
            null;


        user.characters.forEach(
            character => {

                character.active =
                    false;

            }
        );

    }


    saveCitizens(data);


    return deleted;

}


// =====================================================
// تعديل شخصية
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


    if (
        !updates ||
        typeof updates !== 'object'
    ) {

        return result.character;

    }


    Object.assign(
        result.character,
        updates
    );


    const data =
        loadCitizens();


    if (
        !data[result.userId]
    ) {

        return null;

    }


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


    amount =
        Number(amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return null;

    }


    result.character.cash =
        Number(
            result.character.cash || 0
        ) +
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


    amount =
        Number(amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return null;

    }


    const currentCash =
        Number(
            result.character.cash || 0
        );


    if (
        currentCash < amount
    ) {

        return false;

    }


    result.character.cash =
        currentCash -
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


    amount =
        Number(amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return null;

    }


    result.character.bank =
        Number(
            result.character.bank || 0
        ) +
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


    amount =
        Number(amount);


    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return null;

    }


    const currentBank =
        Number(
            result.character.bank || 0
        );


    if (
        currentBank < amount
    ) {

        return false;

    }


    result.character.bank =
        currentBank -
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


    result.character.cash =
        0;

    result.character.bank =
        0;


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

        result.character.fines =
            [];

    }


    const newFine = {

        id:
            Date.now().toString(),

        ...(
            fine || {}
        ),

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
// إضافة سجل
// =====================================================

function addHistory(
    citizenId,
    entry
) {

    const result =
        findCharacter(citizenId);


    if (!result) {
        return null;
    }


    if (
        !Array.isArray(
            result.character.history
        )
    ) {

        result.character.history =
            [];

    }


    const newEntry = {

        id:
            Date.now().toString(),

        ...(
            entry || {}
        ),

        createdAt:
            new Date().toISOString()

    };


    result.character.history.push(
        newEntry
    );


    updateCharacter(
        citizenId,
        {
            history:
                result.character.history
        }
    );


    return newEntry;

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

        result.character.transactions =
            [];

    }


    const newTransaction = {

        id:
            Date.now().toString(),

        ...(
            transaction || {}
        ),

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
// توافق مع الأنظمة القديمة
// =====================================================

function getCitizen(
    citizenId
) {

    const result =
        findCharacter(
            citizenId
        );


    return result
        ? result.character
        : null;

}


function getCitizenByUserId(
    userId
) {

    return getActiveCharacter(
        userId
    );

}


// =====================================================
// إنشاء Citizen قديم
// =====================================================

function createCitizen({
    citizenId,
    userId,
    name,
    age,
    psId,
    birthDate,
    birthPlace,
    gender
}) {

    const data =
        loadCitizens();

    userId =
        String(userId);


    if (!data[userId]) {

        data[userId] = {

            discordId:
                userId,

            activeCharacterId:
                null,

            characters:
                []

        };

    }


    const user =
        data[userId];


    if (
        !Array.isArray(
            user.characters
        )
    ) {

        user.characters =
            [];

    }


    if (
        user.characters.length >=
        MAX_CHARACTERS
    ) {

        return null;

    }


    const character = {

        citizenId:
            String(
                citizenId ||
                generateCitizenId()
            ),

        userId,

        name:
            String(
                name || ''
            ).trim(),

        age:
            age !== undefined &&
            age !== null
                ? Number(age)
                : null,

        psId:
            String(
                psId || ''
            ).trim(),

        birthDate:
            String(
                birthDate || ''
            ).trim(),

        birthPlace:
            String(
                birthPlace || ''
            ).trim(),

        gender:
            String(
                gender || ''
            ).trim(),

        active:
            false,

        cash:
            5000,

        bank:
            0,

        job:
            null,

        rank:
            null,

        salary:
            0,

        points:
            0,

        servicesSuspended:
            false,

        suspensionReason:
            null,

        fines:
            [],

        history:
            [],

        transactions:
            [],

        createdAt:
            new Date().toISOString()

    };


    user.characters.push(
        character
    );


    saveCitizens(data);


    return character;

}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    // الإعدادات
    MAX_CHARACTERS,

    // قاعدة البيانات
    loadCitizens,
    saveCitizens,

    // المستخدم
    getUser,
    createUser,

    // الشخصيات
    getCharacters,
    getCharacter,
    findCharacter,
    canCreateCharacter,

    createCharacter,
    deleteCharacter,
    updateCharacter,

    // Login / Logout
    getActiveCharacter,
    setActiveCharacter,
    logoutCharacter,

    // الهوية
    generateCitizenId,

    // الأموال
    addCash,
    removeCash,
    addBank,
    removeBank,
    resetMoney,

    // المخالفات
    addFine,

    // السجل
    addHistory,

    // المعاملات
    addTransaction,

    // توافق الأنظمة القديمة
    getCitizen,
    getCitizenByUserId,
    createCitizen

};
