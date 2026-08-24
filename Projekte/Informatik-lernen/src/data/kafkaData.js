export const KAFKA_PATTERNS = [
  {
    id: 'producer_consumer',
    title: '1. Kafka Producer & Consumer Pattern',
    desc: 'Event Producer veröffentlichen Nachrichten in Kafka Topics. Unabhängige Consumer Groups verarbeiten Events asynchron.',
    producerCode: `// Kafka Producer (Node.js kaflajs)
const producer = kafka.producer();
await producer.send({
  topic: 'orders-topic',
  messages: [{ value: JSON.stringify({ orderId: 101, amount: 99.90 }) }],
});`,
    consumerCode: `// Kafka Consumer Group
const consumer = kafka.consumer({ groupId: 'payment-service-group' });
await consumer.subscribe({ topic: 'orders-topic' });
await consumer.run({
  eachMessage: async ({ message }) => {
    console.log("Verarbeite Bestellung:", message.value.toString());
  },
});`
  }
];
