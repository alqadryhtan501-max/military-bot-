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

function loadData() {

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
            '❌ خطأ في قراءة قاعدة البيانات:',
            error
        );

        return {};
    }
}

// =====================================================
// حفظ البيانات
// =====================================================

function saveData(data) {

    fs.writeFileSync(
        DATA_FILE,
        JSON.stringify(data, null, 4),
        'utf8'
    );
}

// =====================================================
// حساب Discord
// =====================================================

function getUser(discordId) {

    const data = loadData();

    return data[discordId] || null;
}

function createUser(discordId) {

    const data = loadData();

    if (!data[discordId]) {

        data[discordId] = {
            discordId: discordId,

            // الشخصية الحالية
            activeCharacterId: null,

            // جميع الشخصيات
            characters: []
        };

        saveData(data);
    }

    return data[discordId];
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
// العثور على شخصية برقم الهوية
// =====================================================

function findCharacter(citizenId) {

    const data = loadData();

    citizenId = String(citizenId);

    for (const discordId in data) {

        const user = data[discordId];

        if (!user || !Array.isArray(user.characters)) {
            continue;
        }

        const character =
            user.characters.find(
                character =>
                    String(character.citizenId) === citizenId
            );

        if (character) {

            return {
                user,
                character,
                discordId
            };
        }
    }

    return null;
}

// =====================================================
// الشخصية الحالية
// =====================================================

function getActiveCharacter(discordId) {

    const user = getUser(discordId);

    if (!user) {
        return null;
    }

    if (!user.activeCharacterId) {
        return null;
    }

    return user.characters.find(
        character =>
            String(character.citizenId) ===
            String(user.activeCharacterId)
    ) || null;
}

// =====================================================
// اختيار الشخصية الحالية
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

    // إلغاء active القديم
    user.characters.forEach(
        character => {
            character.active = false;
        }
    );

    // تفعيل الشخصية الجديدة
    character.active = true;

    user.activeCharacterId =
        String(character.citizenId);

    saveData(data);

    return character;
}

// =====================================================
// إنشاء شخصية
// =====================================================

function createCharacter(
    discordId,
    name,
    age
) {

    const data = loadData();

    // إنشاء حساب المستخدم
    if (!data[discordId]) {

        data[discordId] = {
            discordId: discordId,
            activeCharacterId: null,
            characters: []
        };
    }

    // =================================================
    // توليد رقم هوية فريد
    // =================================================

    let citizenId;

    do {

        citizenId = String(
            Math.floor(
                10000 +
                Math.random() * 90000
            )
        );

    } while (findCharacter(citizenId));

    // =================================================
    // الشخصية
    // =================================================

    const character = {

        citizenId,

        name,

        age: Number(age),

        // ==========================
        // الأموال
        // ==========================

        cash: 5000,

        bank: 10000,

        // ==========================
        // الخدمات
        // ==========================

        servicesSuspended: false,

        suspensionReason: null,

        // ==========================
        // الحالة
        // ==========================

        active: false,

        // ==========================
        // المخالفات
        // ==========================

        fines: [],

        // ==========================
        // السجل
        // ==========================

        history: [],

        // ==========================
        // معلومات إضافية
        // ==========================

        job: null,

        rank: null,

        salary: 0,

        points: 0,

        createdAt: Date.now()
    };

    data[discordId]
        .characters
        .push(character);

    // =================================================
    // إذا كانت أول شخصية
    // نخليها الشخصية الحالية تلقائيًا
    // =================================================

    if (
        data[discordId]
            .activeCharacterId === null
    ) {

        character.active = true;

        data[discordId]
            .activeCharacterId =
            character.citizenId;
    }

    saveData(data);

    return character;
}

// =====================================================
// حذف شخصية
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

    const deleted =
        user.characters[index];

    user.characters.splice(
        index,
        1
    );

    // =================================================
    // إذا حذف الشخصية الحالية
    // نختار شخصية أخرى تلقائيًا
    // =================================================

    if (
        String(user.activeCharacterId) ===
        String(citizenId)
    ) {

        if (user.characters.length > 0) {

            const newActive =
                user.characters[0];

            user.activeCharacterId =
                newActive.citizenId;

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

        } else {

            user.activeCharacterId =
                null;
        }
    }

    saveData(data);

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

    Object.assign(
        result.character,
        updates
    );

    const data = loadData();

    data[result.discordId]
        .characters =
        data[result.discordId]
            .characters.map(
                character =>
                    String(
                        character.citizenId
                    ) ===
                    String(citizenId)
                        ? result.character
                        : character
            );

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

    result.character.cash += amount;

    updateCharacter(
        citizenId,
        {
            cash: result.character.cash
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
        result.character.cash < amount
    ) {
        return false;
    }

    result.character.cash -= amount;

    updateCharacter(
        citizenId,
        {
            cash: result.character.cash
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

    result.character.bank += amount;

    updateCharacter(
        citizenId,
        {
            bank: result.character.bank
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
        result.character.bank < amount
    ) {
        return false;
    }

    result.character.bank -= amount;

    updateCharacter(
        citizenId,
        {
            bank: result.character.bank
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
// التصدير
// =====================================================

module.exports = {

    loadData,
    saveData,

    getUser,
    createUser,

    getCharacters,

    findCharacter,

    getActiveCharacter,
    setActiveCharacter,

    createCharacter,
    deleteCharacter,

    updateCharacter,

    addCash,
    removeCash,

    addBank,
    removeBank,

    resetMoney
};
