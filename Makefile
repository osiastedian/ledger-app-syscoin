# ****************************************************************************
#    Ledger App for Syscoin
#    (c) 2023 Ledger SAS.
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.
# ****************************************************************************

ifeq ($(BOLOS_SDK),)
$(error Environment variable BOLOS_SDK is not set)
endif

include $(BOLOS_SDK)/Makefile.defines

# TODO: compile with the right path restrictions

# Application allowed derivation curves.
CURVE_APP_LOAD_PARAMS = secp256k1

# Application allowed derivation paths.
PATH_APP_LOAD_PARAMS = ""
APP_LOAD_PARAMS += --path_slip21 "LEDGER-Wallet policy"

# Application version
APPVERSION_M = 2
APPVERSION_N = 0
APPVERSION_P = 0
APPVERSION   = "$(APPVERSION_M).$(APPVERSION_N).$(APPVERSION_P)"

APP_STACK_MIN_SIZE = 3072

# Setting to allow building variant applications
VARIANT_PARAM = COIN
VARIANT_VALUES = syscoin_test syscoin
# COIN=syscoin
# simplify for tests
ifndef COIN
COIN=syscoin_test
endif

########################################
#     Application custom permissions   #
########################################
HAVE_APPLICATION_FLAG_DERIVE_MASTER = 1
HAVE_APPLICATION_FLAG_GLOBAL_PIN = 1
HAVE_APPLICATION_FLAG_BOLOS_SETTINGS = 1
HAVE_APPLICATION_FLAG_LIBRARY = 1

ifeq ($(COIN),syscoin_test)

# Syscoin testnet, no legacy support
DEFINES   += BIP32_PUBKEY_VERSION=0x043587CF
DEFINES   += BIP44_COIN_TYPE=1
DEFINES   += COIN_P2PKH_VERSION=111
DEFINES   += COIN_P2SH_VERSION=196
DEFINES   += COIN_NATIVE_SEGWIT_PREFIX=\"tb\"
DEFINES   += COIN_COINID_SHORT=\"TEST\"

APPNAME = "Syscoin Test"
PATH_APP_LOAD_PARAMS = "0'/1'" "44'/1'" "45'/1'" "84'/1'" "86'/1'" "48'/1'" "49'/1'"

else ifeq ($(COIN),syscoin)

# Syscoin mainnet, no legacy support
DEFINES   += BIP32_PUBKEY_VERSION=0x0488B21E
DEFINES   += BIP44_COIN_TYPE=57
DEFINES   += BIP44_COIN_TYPE_2=57
DEFINES   += COIN_P2PKH_VERSION=63
DEFINES   += COIN_P2SH_VERSION=5
DEFINES   += COIN_NATIVE_SEGWIT_PREFIX=\"sys\"
DEFINES   += COIN_COINID_SHORT=\"SYS\"

APPNAME = "Syscoin"
PATH_APP_LOAD_PARAMS = "44'/57'" "45'/57'" "84'/57'" "86'/57'"

else
ifeq ($(filter clean,$(MAKECMDGOALS)),)
$(error Unsupported COIN - use syscoin_test, syscoin)
endif
endif

# Application icons following guidelines:
# https://developers.ledger.com/docs/embedded-app/design-requirements/#device-icon
ICON_NANOS = icons/nanos_app_syscoin.gif
ICON_NANOX = icons/nanox_app_syscoin.gif
ICON_NANOSP = icons/nanox_app_syscoin.gif
ICON_STAX = icons/stax_app_syscoin.gif

########################################
# Application communication interfaces #
########################################
ENABLE_BLUETOOTH = 1

########################################
#         NBGL custom features         #
########################################
ENABLE_NBGL_QRCODE = 1

########################################
#          Features disablers          #
########################################
# Don't use standard app file to avoid conflicts for now
DISABLE_STANDARD_APP_FILES = 1

# Don't use default IO_SEPROXY_BUFFER_SIZE to use another
# value for NANOS for an unknown reason.
DISABLE_DEFAULT_IO_SEPROXY_BUFFER_SIZE = 1

DEFINES   += UNUSED\(x\)=\(void\)x
DEFINES   += HAVE_BOLOS_APP_STACK_CANARY


ifeq ($(TARGET_NAME),TARGET_NANOS)
DEFINES       += IO_SEPROXYHAL_BUFFER_SIZE_B=72
DEFINES       += HAVE_WALLET_ID_SDK
else
DEFINES       += IO_SEPROXYHAL_BUFFER_SIZE_B=300
endif

ifeq ($(TARGET_NAME),TARGET_NANOS)
    # enables optimizations using the shared 1K CXRAM region
    DEFINES   += USE_CXRAM_SECTION
endif

# debugging helper functions and macros
CFLAGS    += -include debug-helpers/debug.h

# DEFINES   += HAVE_PRINT_STACK_POINTER

ifeq ($(DEBUG),10)
    $(warning Using semihosted PRINTF. Only run with speculos!)
    DEFINES   += HAVE_PRINTF HAVE_SEMIHOSTED_PRINTF PRINTF=semihosted_printf
endif

# Needed to be able to include the definition of G_cx
INCLUDES_PATH += $(BOLOS_SDK)/lib_cxng/src

# Application source files
APP_SOURCE_PATH += src

# Allow usage of function from lib_standard_app/crypto_helpers.c
APP_SOURCE_FILES += ${BOLOS_SDK}/lib_standard_app/crypto_helpers.c

include $(BOLOS_SDK)/Makefile.standard_app

# Makes a detailed report of code and data size in debug/size-report.txt
# More useful for production builds with DEBUG=0
size-report: bin/app.elf
	arm-none-eabi-nm --print-size --size-sort --radix=d bin/app.elf >debug/size-report.txt
