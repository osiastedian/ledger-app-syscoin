# Quick Guide: Running LedgerApp with [Pali-Extension](https://paliwallet.com/#extension)

## Prerequisites

1. Download and Install [Visual Studio Code (VSCode)](https://code.visualstudio.com/).

   1.1 Install the `ledger-dev-tools` extension in VSCode.

2. Download, install, and run [Docker](https://www.docker.com/).

   2.1 Replace the variable `COIN` value in the Makefile with "syscoin" by updating `#ifndef COIN` in the Makefile from "syscoin_test."

3. Install `virtualenv` with Python globally by running the following command:

   `pip install virtualenv`

4. In the terminal, run these Python commands:

   ```bash
   python3.11 -m virtualenv ledger
   source ledger/bin/activate
   ```

5. Go back to the Ledger extension in VSCode:

   - Click `Select App` and choose the `ledger-app-syscoin`option.

6. In the VSCode extension:

   - Click `Select Build Target` and select your Ledger device version (e.g., Nano S Plus).

7. Click `Update Container` to update Docker with the selected configurations.

8. Click `Build` to prepare the app for installation on the Ledger.

9. Click `Load App on Device`

9.1 Ensure that the `Install App` option is selected on your Ledger device.

## Pali Extension (Version 2.0.9 or Higher)

1. Click on the top-right menu.

2. Select `Connect Hardware Wallet`, and a full-screen will appear.

3. Click on the `Ledger` option.

4. Choose your Ledger device from the popup.

5. Open the Pali extension again.

6. Your Ledger account is set up and ready to make transactions.

## Troubleshooting Errors

If the app didn't install:

- Install another app first on the Ledger to have at least one additional app installed on the device.

- Enable experimental dev apps in the Ledger Live app.
