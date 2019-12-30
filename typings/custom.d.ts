interface Indexed {
  [index: string]: any
}

interface ClientConfig {
  name: string,
  protoPath: string,
  host: string,
  port: number,
  timeout: number,
  maxSendMessageLength: number,
  maxReceiveMessageLength: number,
}
