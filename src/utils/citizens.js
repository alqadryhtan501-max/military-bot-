const fs = require('fs');
const path = require('path');

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
// اختيار الكركتر الحالي
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


    // إلغاء الكركتر القديم

    user.characters.forEach(
        item => {

            item.active =
                String(item.citizenId) ===
                citizenId;

        }
    );


    // تحديد الحالي

    user.activeCharacterId =
        citizenId;


    saveCitizens(data);

    return character;
}


// =====================================================
// توليد رقم هوية فريد
// =====================================================

function generateCitizenId() {

    const data = loadCitizens();

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
// =====================================================

function createCharacter(
    userId,
    name,
    age
) {

    const data = loadCitizens();

    userId = String(userId);

    // إنشاء حساب المستخدم

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


    // توليد الهوية

    const citizenId =
        generateCitizenId();


    // إنشاء الكركتر

    const character = {

        // ==========================
        // الهوية
        // ==========================

        citizenId,

        userId,

        name: String(name).trim(),

        age: Number(age),


        // ==========================
        // الحالة
        // ==========================

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
    // إذا كان أول كركتر
    // يصبح الحالي تلقائياً
    // =================================================

    if (
        user.characters.length === 0
    ) {

        character.active = true;

        user.activeCharacterId =
            citizenId;

    }


    // إضافة الكركتر

    user.characters.push(
        character
    );


    // حفظ

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


    // حذف الكركتر

    user.characters.splice(
        index,
        1
    );


    // =================================================
    // إذا كان المحذوف هو الحالي
    // =================================================

    if (wasActive) {

        if (user.characters.length > 0) {

            const newActive =
                user.characters[0];

            user.characters.forEach(
                character => {

                    character.active =
                        String(
                            character.citizenId
                        ) ===
                        String(
                            newActive.citizenId
                        );

                }
            );

            user.activeCharacterId =
                String(
                    newActive.citizenId
                );

        } else {

            user.activeCharacterId =
                null;

        }
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


function createCitizen({
    citizenId,
    userId,
    name,
    age
}) {

    const data =
        loadCitizens();

    userId = String(userId);


    if (!data[userId]) {

        data[userId] = {

            discordId: userId,

            activeCharacterId:
                null,

            characters: []

        };

    }


    const character = {

        citizenId:
            String(citizenId),

        userId,

        name,

        age: Number(age),

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


    data[userId]
        .characters
        .push(character);


    if (
        data[userId]
            .activeCharacterId === null
    ) {

        character.active = true;

        data[userId]
            .activeCharacterId =
            character.citizenId;

    }


    saveCitizens(data);

    return character;
}


// =====================================================
// التصدير
// =====================================================

module.exports = {

    // قاعدة البيانات
    loadCitizens,
    saveCitizens,

    // المستخدمين
    getUser,
    createUser,

    // الكركترات
    getCharacters,
    getCharacter,
    findCharacter,

    createCharacter,
    deleteCharacter,
    updateCharacter,

    // الكركتر الحالي
    getActiveCharacter,
    setActiveCharacter,

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

    // المعاملات
    addTransaction,

    // توافق قديم
    getCitizen,
    getCitizenByUserId,
    createCitizen

};
