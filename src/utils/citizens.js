const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, '../../data');
const dataFile = path.join(dataDir, 'citizens.json');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, '{}', 'utf8');
}

function loadCitizens() {
    try {
        const data = fs.readFileSync(dataFile, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('خطأ في قراءة citizens.json:', error);
        return {};
    }
}

function saveCitizens(citizens) {
    fs.writeFileSync(
        dataFile,
        JSON.stringify(citizens, null, 2),
        'utf8'
    );
}

function getCitizen(citizenId) {
    const citizens = loadCitizens();
    return citizens[String(citizenId)] || null;
}

function getCitizenByUserId(userId) {
    const citizens = loadCitizens();

    return Object.values(citizens).find(
        citizen => citizen.userId === userId
    ) || null;
}

function createCitizen({
    citizenId,
    userId,
    name,
    age
}) {
    const citizens = loadCitizens();

    citizens[String(citizenId)] = {
        citizenId: String(citizenId),
        userId,
        name,
        age: String(age),

        cash: 5000,
        bank: 0,

        createdAt: new Date().toISOString(),

        transactions: []
    };

    saveCitizens(citizens);

    return citizens[String(citizenId)];
}

function updateCitizen(citizenId, data) {
    const citizens = loadCitizens();
    const id = String(citizenId);

    if (!citizens[id]) {
        return null;
    }

    citizens[id] = {
        ...citizens[id],
        ...data
    };

    saveCitizens(citizens);

    return citizens[id];
}

function addTransaction(citizenId, transaction) {
    const citizen = getCitizen(citizenId);

    if (!citizen) {
        return null;
    }

    citizen.transactions.push({
        ...transaction,
        date: new Date().toISOString()
    });

    updateCitizen(citizenId, {
        transactions: citizen.transactions
    });

    return citizen;
}

function generateCitizenId() {
    const citizens = loadCitizens();

    let citizenId;

    do {
        citizenId = Math.floor(
            10000 + Math.random() * 90000
        ).toString();
    } while (citizens[citizenId]);

    return citizenId;
}

module.exports = {
    loadCitizens,
    saveCitizens,
    getCitizen,
    getCitizenByUserId,
    createCitizen,
    updateCitizen,
    addTransaction,
    generateCitizenId
};
