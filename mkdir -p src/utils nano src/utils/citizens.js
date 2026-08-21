const fs = require('fs');
const path = require('path');

// =====================================================
// إعدادات قاعدة البيانات
// =====================================================

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'citizens.json');

// =====================================================
// إنشاء مجلد وقاعدة البيانات
// =====================================================

if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify({}, null, 4),
        'utf8'
    );
}

// =====================================================
// قراءة قاعدة البيانات
// =====================================================

function loadData() {

    try {

        const rawData = fs.readFileSync(
            DATA_FILE,
            'utf8'
        );

        if (!rawData.trim()) {
            return {};
        }

        const data = JSON.parse(rawData);

        if (
            typeof data !== 'object' ||
            data === null ||
            Array.isArray(data)
        ) {

            console.error(
                '❌ قاعدة البيانات غير صالحة.'
            );

            return {};
        }

        return data;

    } catch (error) {

        console.error(
            '❌ خطأ في قراءة قاعدة البيانات:',
            error
        );

        return {};
    }
}

// =====================================================
// حفظ قاعدة البيانات
// =====================================================

function saveData(data) {

    try {

        fs.writeFileSync(
            DATA_FILE,
            JSON.stringify(data, null, 4),
            'utf8'
        );

        return true;

    } catch (error) {

        console.error(
            '❌ خطأ في حفظ قاعدة البيانات:',
            error
        );

        return false;
    }
}

// =====================================================
// إنشاء حساب Discord
// =====================================================

function createUser(discordId) {

    const data = loadData();

    if (!data[discordId]) {

        data[discordId] = {

            discordId: discordId,

            activeCharacterId: null,

            characters: [],

            createdAt: Date.now(),

            updatedAt: Date.now()
        };

        saveData(data);
    }

    return data[discordId];
}

// =====================================================
// الحصول على حساب Discord
// =====================================================

function getUser(discordId) {

    const data = loadData();

    return data[discordId] || null;
}

// =====================================================
// الحصول على جميع الشخصيات
// =====================================================

function getCharacters(discordId) {

    const user = getUser(discordId);

    if (!user) {
        return [];
    }

    return user.characters || [];
}

// =====================================================
// توليد رقم هوية فريد
// =====================================================

function generateCitizenId(data) {

    let citizenId;

    do {

        citizenId = String(
            Math.floor(
                10000 + Math.random() * 90000
            )
        );

    } while (
        findCharacterFromData(
            data,
            citizenId
        )
    );

    return citizenId;
}

// =====================================================
// البحث عن Character داخل البيانات
// =====================================================

function findCharacterFromData(
    data,
    citizenId
) {

    citizenId = String(citizenId);

    for (
        const discordId in data
    ) {

        const user = data[discordId];

        if (
            !user ||
            !Array.isArray(user.characters)
        ) {
            continue;
        }

        const character =
            user.characters.find(
                character =>
                    String(character.citizenId) ===
                    citizenId
            );

        if (character) {

            return {
                character,
                user,
                discordId
            };
        }
    }

    return null;
}

// =====================================================
// البحث عن Character برقم الهوية
// =====================================================

function findCharacter(citizenId) {

    const data = loadData();

    return findCharacterFromData(
        data,
        citizenId
    );
}

// =====================================================
// إنشاء Character جديد
// =====================================================

function createCharacter(
    discordId,
    name,
    age
) {

    const data = loadData();

    // إنشاء حساب Discord
    if (!data[discordId]) {

        data[discordId] = {

            discordId: discordId,

            activeCharacterId: null,

            characters: [],

            createdAt: Date.now(),

            updatedAt: Date.now()
        };
    }

    const user = data[discordId];

    // التحقق من الاسم
    if (
        typeof name !== 'string' ||
        !name.trim()
    ) {

        throw new Error(
            'اسم الشخصية غير صالح.'
        );
    }

    // التحقق من العمر
    const characterAge = Number(age);

    if (
        !Number.isInteger(characterAge) ||
        characterAge < 1 ||
        characterAge > 120
    ) {

        throw new Error(
            'العمر غير صالح.'
        );
    }

    // توليد رقم الهوية
    const citizenId =
        generateCitizenId(data);

    // Character
    const character = {

        citizenId: citizenId,

        name: name.trim(),

        age: characterAge,

        // =================================================
        // الاقتصاد
        // =================================================

        cash: 5000,

        bank: 10000,

        // =================================================
        // الخدمات
        // =================================================

        servicesSuspended: false,

        suspensionReason: null,

        // =================================================
        // الوظيفة
        // =================================================

        job: {

            name: null,

            rank: null,

            salary: 0,

            points: 0
        },

        // =================================================
        // المخالفات
        // =================================================

        fines: [],

        // =================================================
        // سجل الشخصية
        // =================================================

        history: [],

        // =================================================
        // المركبات
        // =================================================

        vehicles: [],

        // =================================================
        // العقارات
        // =================================================

        properties: [],

        // =================================================
        // الرخص
        // =================================================

        licenses: [],

        // =================================================
        // الحالة
        // =================================================

        active: false,

        createdAt: Date.now(),

        updatedAt: Date.now()
    };

    user.characters.push(character);

    // إذا هذه أول شخصية
    // نجعلها الشخصية النشطة تلقائيًا

    if (
        user.activeCharacterId === null
    ) {

        user.activeCharacterId =
            citizenId;

        character.active = true;
    }

    user.updatedAt = Date.now();

    saveData(data);

    return character;
}

// =====================================================
// اختيار Character نشط
// =====================================================

function setActiveCharacter(
    discordId,
    citizenId
) {

    const data = loadData();

    const user = data[discordId];

    if (!user) {
        return null;
    }

    const character =
        user.characters.find(
            character =>
                String(character.citizenId) ===
                String(citizenId)
        );

    if (!character) {
        return null;
    }

    // إلغاء الشخصية الحالية
    for (
        const currentCharacter of
        user.characters
    ) {

        currentCharacter.active = false;
    }

    // تفعيل الجديدة
    character.active = true;

    user.activeCharacterId =
        character.citizenId;

    user.updatedAt = Date.now();

    saveData(data);

    return character;
}

// =====================================================
// الحصول على Character النشط
// =====================================================

function getActiveCharacter(
    discordId
) {

    const user = getUser(discordId);

    if (!user) {
        return null;
    }

    // الطريقة الأساسية
    if (
        user.activeCharacterId
    ) {

        const character =
            user.characters.find(
                character =>
                    String(character.citizenId) ===
                    String(
                        user.activeCharacterId
                    )
            );

        if (character) {
            return character;
        }
    }

    // احتياط إذا كانت البيانات قديمة
    const activeCharacter =
        user.characters.find(
            character =>
                character.active === true
        );

    return activeCharacter || null;
}

// =====================================================
// حذف Character
// =====================================================

function deleteCharacter(
    discordId,
    citizenId
) {

    const data = loadData();

    const user = data[discordId];

    if (!user) {
        return null;
    }

    const index =
        user.characters.findIndex(
            character =>
                String(character.citizenId) ===
                String(citizenId)
        );

    if (index === -1) {
        return null;
    }

    const deletedCharacter =
        user.characters[index];

    user.characters.splice(index, 1);

    // إذا حذف الشخصية النشطة
    if (
        String(user.activeCharacterId) ===
        String(citizenId)
    ) {

        user.activeCharacterId = null;

        if (
            user.characters.length > 0
        ) {

            user.characters[0].active = true;

            user.activeCharacterId =
                user.characters[0].citizenId;
        }
    }

    user.updatedAt = Date.now();

    saveData(data);

    return deletedCharacter;
}

// =====================================================
// تحديث Character
// =====================================================

function updateCharacter(
    citizenId,
    updates
) {

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    Object.assign(
        result.character,
        updates
    );

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return result.character;
}

// =====================================================
// إضافة كاش
// =====================================================

function addCash(
    citizenId,
    amount
) {

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    result.character.cash += amount;

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return result.character;
}

// =====================================================
// سحب كاش
// =====================================================

function removeCash(
    citizenId,
    amount
) {

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    if (
        result.character.cash < amount
    ) {
        return false;
    }

    result.character.cash -= amount;

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return result.character;
}

// =====================================================
// إضافة للبنك
// =====================================================

function addBank(
    citizenId,
    amount
) {

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    result.character.bank += amount;

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return result.character;
}

// =====================================================
// سحب من البنك
// =====================================================

function removeBank(
    citizenId,
    amount
) {

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    if (
        result.character.bank < amount
    ) {
        return false;
    }

    result.character.bank -= amount;

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return result.character;
}

// =====================================================
// تحويل من بنك إلى بنك
// =====================================================

function transferBank(
    fromCitizenId,
    toCitizenId,
    amount
) {

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    if (
        String(fromCitizenId) ===
        String(toCitizenId)
    ) {
        return false;
    }

    const data = loadData();

    const sender =
        findCharacterFromData(
            data,
            fromCitizenId
        );

    const receiver =
        findCharacterFromData(
            data,
            toCitizenId
        );

    if (!sender || !receiver) {
        return null;
    }

    if (
        sender.character.bank < amount
    ) {
        return false;
    }

    sender.character.bank -= amount;

    receiver.character.bank += amount;

    sender.character.updatedAt =
        Date.now();

    receiver.character.updatedAt =
        Date.now();

    sender.user.updatedAt =
        Date.now();

    receiver.user.updatedAt =
        Date.now();

    saveData(data);

    return {
        sender: sender.character,
        receiver: receiver.character
    };
}

// =====================================================
// تحويل كاش
// =====================================================

function transferCash(
    fromCitizenId,
    toCitizenId,
    amount
) {

    amount = Number(amount);

    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {
        return false;
    }

    if (
        String(fromCitizenId) ===
        String(toCitizenId)
    ) {
        return false;
    }

    const data = loadData();

    const sender =
        findCharacterFromData(
            data,
            fromCitizenId
        );

    const receiver =
        findCharacterFromData(
            data,
            toCitizenId
        );

    if (!sender || !receiver) {
        return null;
    }

    if (
        sender.character.cash < amount
    ) {
        return false;
    }

    sender.character.cash -= amount;

    receiver.character.cash += amount;

    sender.character.updatedAt =
        Date.now();

    receiver.character.updatedAt =
        Date.now();

    sender.user.updatedAt =
        Date.now();

    receiver.user.updatedAt =
        Date.now();

    saveData(data);

    return {
        sender: sender.character,
        receiver: receiver.character
    };
}

// =====================================================
// تصفير أموال Character
// =====================================================

function resetMoney(
    citizenId
) {

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    result.character.cash = 0;

    result.character.bank = 0;

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return result.character;
}

// =====================================================
// إضافة مخالفة
// =====================================================

function addFine(
    citizenId,
    fine
) {

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    const newFine = {

        id:
            `F-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`,

        reason:
            fine.reason || 'غير محدد',

        amount:
            Number(fine.amount) || 0,

        issuedBy:
            fine.issuedBy || null,

        status:
            'unpaid',

        createdAt:
            Date.now(),

        paidAt:
            null
    };

    result.character.fines.push(
        newFine
    );

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return newFine;
}

// =====================================================
// حذف مخالفة
// =====================================================

function removeFine(
    citizenId,
    fineId
) {

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    const index =
        result.character.fines.findIndex(
            fine =>
                String(fine.id) ===
                String(fineId)
        );

    if (index === -1) {
        return null;
    }

    const removedFine =
        result.character.fines.splice(
            index,
            1
        )[0];

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return removedFine;
}

// =====================================================
// دفع مخالفة
// =====================================================

function payFine(
    citizenId,
    fineId
) {

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    // Character غير موجود
    if (!result) {
        return null;
    }

    const character =
        result.character;

    // التأكد من وجود المخالفات
    if (
        !Array.isArray(character.fines)
    ) {

        character.fines = [];
    }

    // البحث عن المخالفة
    const fine =
        character.fines.find(
            item =>
                String(item.id) ===
                String(fineId)
        );

    // المخالفة غير موجودة
    if (!fine) {
        return null;
    }

    // المخالفة مدفوعة مسبقاً
    if (
        fine.status === 'paid'
    ) {

        return false;
    }

    const amount =
        Number(fine.amount);

    // التأكد من صحة المبلغ
    if (
        !Number.isFinite(amount) ||
        amount <= 0
    ) {

        return false;
    }

    // التأكد من وجود رصيد كافي
    if (
        Number(character.bank || 0) < amount
    ) {

        return false;
    }

    // خصم قيمة المخالفة من البنك
    character.bank -= amount;

    // تحديث حالة المخالفة
    fine.status = 'paid';

    fine.paidAt =
        Date.now();

    // تحديث الشخصية
    character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    // حفظ البيانات
    const saved =
        saveData(data);

    if (!saved) {
        return false;
    }

    return {
        character,
        fine
    };
}

// =====================================================
// إيقاف الخدمات
// =====================================================

function suspendServices(
    citizenId,
    reason
) {

    return updateCharacter(
        citizenId,
        {
            servicesSuspended: true,
            suspensionReason:
                reason || null
        }
    );
}

// =====================================================
// تفعيل الخدمات
// =====================================================

function activateServices(
    citizenId
) {

    return updateCharacter(
        citizenId,
        {
            servicesSuspended: false,
            suspensionReason: null
        }
    );
}

// =====================================================
// إضافة سجل
// =====================================================

function addHistory(
    citizenId,
    historyItem
) {

    const data = loadData();

    const result =
        findCharacterFromData(
            data,
            citizenId
        );

    if (!result) {
        return null;
    }

    const item = {

        id:
            `H-${Date.now()}-${Math.floor(
                Math.random() * 1000
            )}`,

        type:
            historyItem.type || 'general',

        description:
            historyItem.description || '',

        by:
            historyItem.by || null,

        createdAt:
            Date.now()
    };

    result.character.history.push(
        item
    );

    result.character.updatedAt =
        Date.now();

    result.user.updatedAt =
        Date.now();

    saveData(data);

    return item;
}

// =====================================================
// فحص وجود Character
// =====================================================

function characterExists(
    citizenId
) {

    return Boolean(
        findCharacter(citizenId)
    );
}

// =====================================================
// إحصائيات الحساب
// =====================================================

function getUserStats(
    discordId
) {

    const user =
        getUser(discordId);

    if (!user) {
        return null;
    }

    const characters =
        user.characters || [];

    return {

        characterCount:
            characters.length,

        activeCharacterId:
            user.activeCharacterId,

        totalCash:
            characters.reduce(
                (total, character) =>
                    total +
                    Number(character.cash || 0),
                0
            ),

        totalBank:
            characters.reduce(
                (total, character) =>
                    total +
                    Number(character.bank || 0),
                0
            )
    };
}

// =====================================================
// التصدير
// =====================================================

module.exports = {

    // قاعدة البيانات
    loadData,
    saveData,

    // Discord User
    createUser,
    getUser,
    getUserStats,

    // Characters
    getCharacters,
    createCharacter,
    deleteCharacter,
    findCharacter,
    characterExists,

    // Character النشط
    getActiveCharacter,
    setActiveCharacter,

    // تعديل
    updateCharacter,

    // الكاش
    addCash,
    removeCash,
    transferCash,

    // البنك
    addBank,
    removeBank,
    transferBank,
    resetMoney,

    // المخالفات
    addFine,
    removeFine,
    payFine,

    // الخدمات
    suspendServices,
    activateServices,

    // السجل
    addHistory
};
