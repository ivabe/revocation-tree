include "./circomlib/circuits/comparators.circom";

template Modulo() {
    signal input dividend;
    signal input modulus;
    signal output reminder;
    signal output quotient;

    component rangeCheck = LessThan(252);

    reminder <-- dividend % modulus;
    quotient <-- dividend \ modulus;
    dividend === quotient * modulus + reminder;

    rangeCheck.in[0] <== reminder;
    rangeCheck.in[1] <== modulus;
    rangeCheck.out === 1;
}