import random
import os
from test_utils.fixtures import *

random.seed(0)  # make sure tests are repeatable

# path with tests
conftest_folder_path: Path = Path(__file__).parent

os.environ['SPECULOS_APPNAME'] = 'Syscoin Regtest:1.0.0'
os.environ["BITCOIN_APP_BINARY"] = str(conftest_folder_path.joinpath("app-binaries/syscoin-testnet.elf"))
os.environ["BITCOIN_APP_LIB_BINARY"] = str(conftest_folder_path.joinpath('app-binaries/syscoin.elf'))
