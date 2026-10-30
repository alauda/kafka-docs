# Spring Boot client sample

A minimal Spring Boot application that produces one message and consumes it back, used to verify the
client configurations documented in
[Client Configuration Reference](../../docs/en/how_to/40-config.mdx).

Each security combination is a self-contained Spring profile, so the `application-*.yml` files are
the same YAML that appears in the documentation. Changing one means re-running it here.

| Profile | Listener it targets | Trust material | Client identity |
| --- | --- | --- | --- |
| `scram-pkcs12` | `tls: true`, `scram-sha-512` | `ca.p12` | username and password |
| `scram-pem` | `tls: true`, `scram-sha-512` | `ca.crt` | username and password |
| `scram-pembundle` | `tls: true`, `scram-sha-512` | `ca.crt` via SSL bundle | username and password |
| `mtls-pkcs12` | `tls: true`, `tls` | `ca.p12` | `user.p12` |
| `mtls-pem` | `tls: true`, `tls` | `ca.crt` | `user.pem` (key and certificate in one file) |
| `mtls-pembundle` | `tls: true`, `tls` | `ca.crt` via SSL bundle | `user.crt` + `user.key` |

No credentials are stored in this project — every value comes from the environment.

## Extracting the material

```bash
NS=<namespace>; INSTANCE=<instance>; USER=<user>

kubectl -n "$NS" get secret "$INSTANCE-cluster-ca-cert" -o jsonpath='{.data.ca\.crt}'      | base64 -d > ca.crt
kubectl -n "$NS" get secret "$INSTANCE-cluster-ca-cert" -o jsonpath='{.data.ca\.p12}'      | base64 -d > ca.p12
kubectl -n "$NS" get secret "$INSTANCE-cluster-ca-cert" -o jsonpath='{.data.ca\.password}' | base64 -d > ca.password

# Mutual TLS users
kubectl -n "$NS" get secret "$USER" -o jsonpath='{.data.user\.crt}'      | base64 -d > user.crt
kubectl -n "$NS" get secret "$USER" -o jsonpath='{.data.user\.key}'      | base64 -d > user.key
kubectl -n "$NS" get secret "$USER" -o jsonpath='{.data.user\.p12}'      | base64 -d > user.p12
kubectl -n "$NS" get secret "$USER" -o jsonpath='{.data.user\.password}' | base64 -d > user.p12.password
cat user.key user.crt > user.pem

# SCRAM-SHA-512 users
kubectl -n "$NS" get secret "$USER" -o jsonpath='{.data.password}' | base64 -d > user.password
```

The bootstrap address comes from the instance itself:

```bash
kubectl -n "$NS" get kafka "$INSTANCE" \
  -o jsonpath='{.status.listeners[?(@.name=="external")].bootstrapServers}'
```

## Running

```bash
mvn package -DskipTests

CERTS=$PWD

SPRING_PROFILES_ACTIVE=scram-pem \
KAFKA_BOOTSTRAP_SERVERS=<node-address>:<bootstrap-node-port> \
KAFKA_CA_PEM=$CERTS/ca.crt \
KAFKA_USERNAME=<user> \
KAFKA_PASSWORD="$(cat $CERTS/user.password)" \
java -jar target/kafka-tls-sample-1.0.0.jar
```

A successful run prints:

```text
SENT      marker-... partition=1 offset=9
RECEIVED  marker-...
ROUND TRIP OK
```

The message carries a unique marker per run, so the listener only completes on the message this run
produced rather than on replayed history.

### Environment variables by profile

| Variable | Used by |
| --- | --- |
| `KAFKA_BOOTSTRAP_SERVERS` | all |
| `KAFKA_GROUP` | all (optional, defaults to `spring-demo`) |
| `KAFKA_USERNAME`, `KAFKA_PASSWORD` | the `scram-*` profiles |
| `KAFKA_TRUSTSTORE_PATH`, `KAFKA_TRUSTSTORE_PASSWORD` | the `*-pkcs12` profiles |
| `KAFKA_KEYSTORE_PATH`, `KAFKA_KEYSTORE_PASSWORD` | `mtls-pkcs12` |
| `KAFKA_CA_PEM` | the `*-pem` and `*-pembundle` profiles |
| `KAFKA_USER_PEM` | `mtls-pem` |
| `KAFKA_USER_CRT`, `KAFKA_USER_KEY` | `mtls-pembundle` |

## Prerequisites

The topic must exist, or the instance must allow automatic topic creation, and the Kafka user needs
`Write` and `Describe` on the topic plus `Read` on the consumer group. See
[User Management](../../docs/en/functions/20-user.mdx).
