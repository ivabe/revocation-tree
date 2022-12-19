const expect = require('chai').expect;

const sum = (array) => array.reduce((a, b) => a + b, 0)

describe('RevocationRegistry class', function () {
    beforeEach(function () {
        //TODO: instantiate a new one before each
    })

    it('[METHOD] update()', function () {
        // add an assertion
        expect(sum([1, 2, 3, 4, 5])).to.equal(15);
    })
})