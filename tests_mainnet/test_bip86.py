from bitcoin_client.ledger_bitcoin import Client, WalletPolicy

from test_utils import SpeculosGlobals, mnemonic

MNEMONIC = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about"


@mnemonic(MNEMONIC)
def test_bip86(client: Client, speculos_globals: SpeculosGlobals):
    # Test vectors for BIP-0086: https://github.com/bitcoin/bips/blob/master/bip-0086.mediawiki

    fpr = speculos_globals.master_key_fingerprint.hex()

    # test for a native taproot wallet (bech32m addresses, per BIP-0086)

    wallet = WalletPolicy(
        name="",
        descriptor_template="tr(@0/**)",
        keys_info=[
            f"[{fpr}/86'/57'/0']xpub6CXaPZmr2vSHZwkubMWbGMhV2512eXPaEPnYLyfuJou6QU6pk1w5WsEPCkqTNJRNATxZ3eHT2xtm3Y3VkbvbSxu3rasjdTNv3twG2Yvvv6W"
        ],
    )

    # Account 0, first receiving address = m/86'/57'/0'/0/0
    res = client.get_wallet_address(wallet, None, 0, 0, False)
    assert res == "sys1p8k2ecghp80cxharnjpa2u7v26vp905fm2g2g343ujv2fzt7a6ldq7cpfn6"

    # Account 0, second receiving address = m/86'/57'/0'/0/1
    res = client.get_wallet_address(wallet, None, 0, 1, False)
    assert res == "sys1pdss0dx7r8rxagzr7czwnnhlhulpnkxgm2jc9sm6lnrqf3khr2y4q2x7hha"

    # Account 1, first change address = m/86'/57'/0'/1/0
    res = client.get_wallet_address(wallet, None, 1, 0, False)
    assert res == "sys1pfvqw5h6nsmfa9pycktuc74hjh05r02862wc6z2a9uqkvn5l6rrrqsyhmps"
