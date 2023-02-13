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
            f"[{fpr}/86'/0'/0']xpub6DHZiJ3exSSEXbUXU6ms7wbrmxn4xmEUWACNa4KvySsfKEedUdkjdKkvuBzaCwby5BpYq3Mpz1yispmjsCcg7h6LCy7U6t6r5nz1WUEfceo",
        ],
    )

    # Account 0, first receiving address = m/86'/0'/0'/0/0
    res = client.get_wallet_address(wallet, None, 0, 0, False)
    assert res == "sys1p0m3eu6an4wkvh44xzmfv84gcgfzum3yc3mx3wdhldzcyaww094usc4ep9s"

    # Account 0, second receiving address = m/86'/0'/0'/0/1
    res = client.get_wallet_address(wallet, None, 0, 1, False)
    assert res == "sys1p8rnd42g79wm09mfjean0gpnh9xkfffehhsdj3ncry8j4ttn4d2hsxmam7a"

    # Account 1, first change address = m/86'/0'/0'/1/0
    res = client.get_wallet_address(wallet, None, 1, 0, False)
    assert res == "sys1pxserze5gzhhtnm9l2d8evk0t3lqzqznx6948nrzfzcv72sqrv8ns979qmt"
