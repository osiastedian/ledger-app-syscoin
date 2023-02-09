# An image derived from ledgerhq/speculos but also containing the bitcoin-core binaries

FROM ghcr.io/ledgerhq/speculos:latest

RUN useradd -r syscoin \
    && apt-get update -y \
    && apt-get install -y curl gnupg gosu \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ARG TARGETPLATFORM
ENV SYSCOIN_VERSION=4.4.0rc1
ENV SYSCOIN_DATA=.test_syscoin

RUN set -ex \
    && if [ "${TARGETPLATFORM}" = "linux/amd64" ]; then export TARGETPLATFORM=x86_64-linux-gnu; fi \
    && if [ "${TARGETPLATFORM}" = "linux/arm64" ]; then export TARGETPLATFORM=aarch64-linux-gnu; fi \
    && if [ "${TARGETPLATFORM}" = "linux/arm/v7" ]; then export TARGETPLATFORM=arm-linux-gnueabihf; fi \
    && for key in \
    01EA5486DE18A882D4C2684590C8019E36C2E964 \
    ; do \
    gpg --batch --keyserver keyserver.ubuntu.com --recv-keys "$key" || \
    gpg --batch --keyserver pgp.mit.edu --recv-keys "$key" || \
    gpg --batch --keyserver keyserver.pgp.com --recv-keys "$key" || \
    gpg --batch --keyserver ha.pool.sks-keyservers.net --recv-keys "$key" || \
    gpg --batch --keyserver hkp://p80.pool.sks-keyservers.net:80 --recv-keys "$key" ; \
    done \
    && gpg --keyserver hkp://keyserver.ubuntu.com --refresh-keys \
    && curl -SLO https://github.com/syscoin/syscoin/releases/download/v${SYSCOIN_VERSION}/syscoin-${SYSCOIN_VERSION}-${TARGETPLATFORM}.tar.gz \
    && curl -SLO https://github.com/syscoin/syscoin/releases/download/v${SYSCOIN_VERSION}/SHA256SUMS.asc \
    && gpg --verify SHA256SUMS.asc \
    && grep " syscoin-${SYSCOIN_VERSION}-${TARGETPLATFORM}.tar.gz" SHA256SUMS.asc | sha256sum -c - \
    && tar -xzf *.tar.gz -C / \
    && rm *.tar.gz *.asc \
    && rm -rf /syscoin-${SYSCOIN_VERSION}/bin/syscoin-qt


VOLUME [".test_syscoin"]

ENV PATH=/syscoin-${SYSCOIN_VERSION}/bin:$PATH

EXPOSE 8369 8370 18369 18370 18443 18444 38332 38333

RUN syscoind -version | grep "Syscoin Core version v${SYSCOIN_VERSION}"