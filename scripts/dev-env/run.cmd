@echo off

set image="ghcr.io/kevinwidjaja21/a339-fbw@sha256:79a522e325745b6fd8957504169291b919b0a350c834794ca9c6fa4ae0da75c5"

docker image inspect %image% 1> nul || docker system prune --filter label=kevinwidjaja21=true -f
docker run --rm -it -v "%cd%:/external" %image% %*
