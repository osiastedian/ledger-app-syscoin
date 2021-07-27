import hmac
from hashlib import sha256

from bitcoin_client.command import BitcoinCommand
from bitcoin_client.exception import DenyError
from bitcoin_client.wallet import MultisigWallet
from bitcoin_client.common import AddressType

from .utils import automation


@automation("automations/register_wallet_accept.json")
def test_register_and_get_address(cmd: BitcoinCommand, speculos_globals):
    # test for a native segwit wallet (bech32 address)

    wallet = MultisigWallet(
        name="Cold storage",
        address_type=AddressType.WIT,
        threshold=2,
        keys_info=[
            "[76223a6e/48'/1'/0'/2']tpubDE7NQymr4AFtewpAsWtnreyq9ghkzQBXpCZjWLFVRAvnbf7vya2eMTvT2fPapNqL8SuVvLQdbUbMfWLVDCZKnsEBqp6UK93QEzL8Ck23AwF/**",
            "[f5acc2fd/48'/1'/0'/2']tpubDFAqEGNyad35aBCKUAXbQGDjdVhNueno5ZZVEn3sQbW5ci457gLR7HyTmHBg93oourBssgUxuWz1jX5uhc1qaqFo9VsybY1J5FuedLfm4dK/**",
        ],
    )

    wallet_id, wallet_hmac = cmd.register_wallet(wallet)

    assert wallet_id == wallet.id

    assert hmac.compare_digest(
        hmac.new(speculos_globals.wallet_registration_key, wallet_id, sha256).digest(),
        wallet_hmac,
    )

    res = cmd.get_wallet_address(wallet, wallet_hmac, 3)

    assert res == "tb1qwuxulrpu5d02eag4tphxhamaa24s8sk8d5s7kw340cesr0wf87csks3c9a"
