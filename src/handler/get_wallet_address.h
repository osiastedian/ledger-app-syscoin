#pragma once

#include "../crypto.h"
#include "../common/bip32.h"
#include "../boilerplate/dispatcher.h"

#include "wallet.h"

typedef struct {
    machine_context_t ctx;

    uint32_t address_index;
    multisig_wallet_header_t wallet_header;

    uint8_t next_pubkey_index;
    uint8_t display_address;

    char address[MAX_ADDRESS_LENGTH_STR + 1];
    size_t address_len;

    // bitmap of keys, to keep track of the ones that have already been seen; up to 15 for multisig.
    // could save some bytes with a bit vector, should this get too big
    uint8_t used_pubkey_indexes[15];

    // previous compressed pubkey, to validate lexicographic sorting in multisig
    uint8_t prev_compressed_pubkey[33];
    cx_sha256_t script_hash_context;
} get_wallet_address_state_t;


void handler_get_wallet_address(
    uint8_t p1,
    uint8_t p2,
    uint8_t lc,
    dispatcher_context_t *dispatcher_context
);