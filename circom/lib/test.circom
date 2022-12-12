// This file should be used for testing purposes, mainly compiling circuits
// Create specific testing functions to test templates
// It is advised to use keyword "test_" for all functions  

// Use the following command to compile files and put them in the specified output file:
// circom test.circom --wasm --sym --r1cs -o test_out_files

// Feel free to comment out component main and create a new one according to the circuit to be tested out

include "./util.circom";

template test_extractKthBit(n) {
    signal input in;
    signal input k;

    signal output outBit; // bit value, must be either 0/1

    component extractKthBit = extractKthBit(n);
    extractKthBit.in <== in;
    extractKthBit.k <== k;
    outBit <== extractKthBit.outBit;
}

// component main = test_function_here();
component main = test_extractKthBit(253);