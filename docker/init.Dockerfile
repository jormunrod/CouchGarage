FROM alpine:3.21

RUN apk add --no-cache bash curl

COPY docker/utils/init-couchdb.sh /init-couchdb.sh

RUN chmod +x /init-couchdb.sh

CMD ["/init-couchdb.sh"]