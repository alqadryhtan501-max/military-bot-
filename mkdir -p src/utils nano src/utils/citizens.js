const fs = require('fs');
const path = require('path');

// =====================================================
// مكان قاعدة البيانات
// =====================================================

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'citizens.json');

// إنشاء مجلد data إذا غير موجود
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// إنشاء ملف البيانات إذا غير موجود
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '{}', 'utf8');
}

// =====================================================
// قراءة البيانات
// =====================================================

function loadData() {
    try {

        const data = fs.readFileSync(DATA_FILE, 'utf8');

        if (!data.trim()) {
            return {};
        }

        return JSON.parse(data);

    } catch (error) {

        console.error('❌ خطأ في قراءة قاعدة البيانات:', error);

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
// الحصول على بيانات مستخدم Discord
// =====================================================

function getUser(discordId) {

    const data = loadData();

    return data[discordId] || null;
}

// =====================================================
// إنشاء حساب مستخدم
// =====================================================

function createUser(discordId) {

    const data = loadData();

    if (!data[discordId]) {

        data[discordId] = {
            discordId: discordId,
            characters: []
        };

        saveData(data);
    }

    return data[discordId];
}

// =====================================================
// الحصول على شخصية برقم الهوية
// =====================================================

function findCharacter(citizenId) {

    const data = loadData();

    for (const discordId in data) {

        const user = data[discordId];

        const character = user.characters.find(
            character => character.citizenId === String(citizenId)
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
// الحصول على الشخصية الحالية للمستخدم
// =====================================================

function getActiveCharacter(discordId) {

    const user = getUser(discordId);

    if (!user) {
        return null;
    }

    return user.characters.find(
        character => character.active === true
    ) || null;
}

// =====================================================
// إنشاء شخصية
// =====================================================

function createCharacter(discordId, name, age) {

    const data = loadData();

    // إنشاء حساب Discord إذا غير موجود
    if (!data[discordId]) {

        data[discordId] = {
            discordId: discordId,
            characters: []
        };
    }

    // توليد رقم هوية
    let citizenId;

    do {

        citizenId = String(
            Math.floor(10000 + Math.random() * 90000)
        );

    } while (findCharacter(citizenId));

    // إنشاء الشخصية
    const character = {

        citizenId: citizenId,

        name: name,

        age: Number(age),

        cash: 5000,

        bank: 10000,

        servicesSuspended: false,

        active: false,

        fines: [],

        createdAt: Date.now()
    };

    data[discordId].characters.push(character);

    saveData(data);

    return character;
}

// =====================================================
// تعديل شخصية
// =====================================================

function updateCharacter(citizenId, updates) {

    const data = loadData();

    for (const discordId in data) {

        const character = data[discordId].characters.find(
            character => character.citizenId === String(citizenId)
        );

        if (character) {

            Object.assign(character, updates);

            saveData(data);

            return character;
        }
    }

    return null;
}

// =====================================================
// إضافة كاش
// =====================================================

function addCash(citizenId, amount) {

    const result = findCharacter(citizenId);

    if (!result) {
        return null;
    }

    result.character.cash += Number(amount);

    const data = loadData();

    data[result.discordId].characters =
        data[result.discordId].characters.map(character =>
            character.citizenId === String(citizenId)
                ? result.character
                : character
        );

    saveData(data);

    return result.character;
}

// =====================================================
// سحب كاش
// =====================================================

function removeCash(citizenId, amount) {

    const result = findCharacter(citizenId);

    if (!result) {
        return null;
    }

    amount = Number(amount);

    if (result.character.cash < amount) {
        return false;
    }

    result.character.cash -= amount;

    const data = loadData();

    data[result.discordId].characters =
        data[result.discordId].characters.map(character =>
            character.citizenId === String(citizenId)
                ? result.character
                : character
        );

    saveData(data);

    return result.character;
}

// =====================================================
// إضافة للبنك
// =====================================================

function addBank(citizenId, amount) {

    const result = findCharacter(citizenId);

    if (!result) {
        return null;
    }

    result.character.bank += Number(amount);

    const data = loadData();

    data[result.discordId].characters =
        data[result.discordId].characters.map(character =>
            character.citizenId === String(citizenId)
                ? result.character
                : character
        );

    saveData(data);

    return result.character;
}

// =====================================================
// سحب من البنك
// =====================================================

function removeBank(citizenId, amount) {

    const result = findCharacter(citizenId);

    if (!result) {
        return null;
    }

    amount = Number(amount);

    if (result.character.bank < amount) {
        return false;
    }

    result.character.bank -= amount;

    const data = loadData();

    data[result.discordId].characters =
        data[result.discordId].characters.map(character =>
            character.citizenId === String(citizenId)
                ? result.character
                : character
        );

    saveData(data);

    return result.character;
}

// =====================================================
// تصفير الحساب
// =====================================================

function resetMoney(citizenId) {

    const result = findCharacter(citizenId);

    if (!result) {
        return null;
    }

    result.character.cash = 0;
    result.character.bank = 0;

    const data = loadData();

    data[result.discordId].characters =
        data[result.discordId].characters.map(character =>
            character.citizenId === String(citizenId)
                ? result.character
                : character
        );

    saveData(data);

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

    findCharacter,
    getActiveCharacter,

    createCharacter,
    updateCharacter,

    addCash,
    removeCash,

    addBank,
    removeBank,

    resetMoney
};
