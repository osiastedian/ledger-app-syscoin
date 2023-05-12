import { PsbtV2 } from "../bitcoin_client_js/build/main";
// 0 020815f579ead84a2889b1181270e60d8aea86ed33f0910465c7b7bb4df9468660 3044022039d8f92aa3df062b4d94dceeb161811539fa463c71747184047ef72115749f390220418e695cb844890098ca40cd2cae05dcd0776e26c113dde2f823665cf09539ce01
const psbtSerialized =
  "cHNidP8B+wQCAAAAAQIEAgAAAAEEAQEBBQECAQMEAAAAAAABDiAgkx77+aX8wMv1NRNBgMZtYIq3VTrigvj/WTNF9lj49gEQBP////8BDwQAAAAAAQEfGN2WAAAAAAAWABRm5tOZWKFEnduwXWiMetGmtt3qQyIGAggV9Xnq2EooibEYEnDmDYrqhu0z8JEEZce3u035RoZgGMBFhPhUAACAOQAAgAAAAIAAAAAAAAAAACICAggV9Xnq2EooibEYEnDmDYrqhu0z8JEEZce3u035RoZgRzBEAiA52Pkqo98GK02U3O6xYYEVOfpGPHF0cYQEfvchFXSfOQIgQY5pXLhEiQCYykDNLK4F3NB3bibBE93i+CNmXPCVOc4BAAEDCEBCDwAAAAAAAQQWABSJW6X3WhgxoKlbuVACxReV3FsNQgABAwjwlocAAAAAAAEEFgAUDMDOaIpNYwUI2K2xkJUpwgQFh8UA";
const signedPsbt = PsbtV2.fromBase64(psbtSerialized);

// partial_psbts = [signed_psbt_hww_b64]
//     for core_wallet_name in core_wallet_names:
//         partial_psbt_response = get_wallet_rpc(core_wallet_name).walletprocesspsbt(psbt_b64)
//         partial_psbts.append(partial_psbt_response["psbt"])

//     # ==> finalize the psbt, extract tx and broadcast
//     combined_psbt = rpc.combinepsbt(partial_psbts)
//     result = rpc.finalizepsbt(combined_psbt)

//     assert result["complete"] == True
//     rawtx = result["hex"]

//     # make sure the transaction is valid by broadcasting it (would fail if rejected)
//     rpc.sendrawtransaction(rawtx)

"syscoin-cli -rpcport=38370 -rpcuser=user -rpcpassword=passwd  decodepsbt";