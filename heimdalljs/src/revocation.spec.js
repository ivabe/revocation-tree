const expect = require('chai').expect;
const fs = require('fs').promises;

const {RevocationRegistry} = require('./revocation');
const {merklePoseidon} = require('../src/crypto/poseidon.js');
const {signPoseidon} = require('../circomlib/eddsa');

const secretKeyPath = './test/attribute/ca_sk.txt';
const sum = (array) => array.reduce((a, b) => a + b, 0);

describe('RevocationRegistry class', () => {
    let secretKey;
    before(async () => {
        console.debug('Debug -> before: Loading the input files');
        secretKey = await fs.readFile(secretKeyPath, 'utf8');
        console.debug('Debug -> before: secretKey >> ', secretKey);
    });

    after(async () => {
        console.debug('Debug -> after: cleaning after testing');
    });

    let revocationRegistry;
    beforeEach(() => {
        console.debug('Debug -> beforeEach: (re)instantiation RevocationRegistry');
        revocationRegistry = new RevocationRegistry(secretKey, merklePoseidon, (sk, msg) => signPoseidon(sk, BigInt(msg)));
        console.debug('Debug -> beforeEach: revocationRegistry >> ', revocationRegistry);
    });

    describe('Performing the tests', () => {
        it('[METHOD] update()', () => {
            expect(sum([1, 2, 3, 4, 5])).to.equal(15);
        });
    });
});