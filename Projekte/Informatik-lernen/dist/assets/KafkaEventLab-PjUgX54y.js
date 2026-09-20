import"./rolldown-runtime-hePW80VL.js";import{h as e}from"./vendor-charts-LpGij_Qu.js";import{n as t}from"./vendor-react-CYlvDiRg.js";import{et as n}from"./vendor-ui-Cq2y2VJf.js";e();var r=[{id:`producer_consumer`,title:`1. Kafka Producer & Consumer Pattern`,desc:`Event Producer veröffentlichen Nachrichten in Kafka Topics. Unabhängige Consumer Groups verarbeiten Events asynchron.`,producerCode:`// Kafka Producer (Node.js kaflajs)
const producer = kafka.producer();
await producer.send({
  topic: 'orders-topic',
  messages: [{ value: JSON.stringify({ orderId: 101, amount: 99.90 }) }],
});`,consumerCode:`// Kafka Consumer Group
const consumer = kafka.consumer({ groupId: 'payment-service-group' });
await consumer.subscribe({ topic: 'orders-topic' });
await consumer.run({
  eachMessage: async ({ message }) => {
    console.log("Verarbeite Bestellung:", message.value.toString());
  },
});`}],i=t();function a(){let e=r[0];return(0,i.jsxs)(`div`,{style:{maxWidth:`1000px`,margin:`0 auto`,paddingBottom:`60px`},children:[(0,i.jsxs)(`div`,{className:`glass-panel`,style:{padding:`32px`,marginBottom:`24px`,border:`2px solid var(--accent-teal)`},children:[(0,i.jsxs)(`h1`,{style:{fontSize:`2.2rem`,fontWeight:`800`,marginBottom:`8px`,color:`var(--text-main)`,display:`flex`,alignItems:`center`,gap:`10px`},children:[(0,i.jsx)(n,{size:32,style:{color:`var(--accent-teal)`}}),` Event-Driven Microservices (Apache Kafka)`]}),(0,i.jsx)(`p`,{style:{color:`var(--text-muted)`,fontSize:`1.05rem`},children:`Asynchrone Event-Driven Architektur mit Producers, Topics, Consumer Groups & RabbitMQ Queues.`})]}),(0,i.jsxs)(`div`,{className:`grid-responsive`,style:{gap:`20px`},children:[(0,i.jsxs)(`div`,{className:`glass-panel`,style:{padding:`24px`},children:[(0,i.jsx)(`span`,{className:`badge badge-teal`,style:{marginBottom:`10px`},children:`Event Producer (Publisher)`}),(0,i.jsx)(`div`,{className:`code-window`,children:(0,i.jsx)(`pre`,{className:`code-body`,children:(0,i.jsx)(`code`,{children:e.producerCode})})})]}),(0,i.jsxs)(`div`,{className:`glass-panel`,style:{padding:`24px`},children:[(0,i.jsx)(`span`,{className:`badge badge-indigo`,style:{marginBottom:`10px`},children:`Event Consumer (Subscriber)`}),(0,i.jsx)(`div`,{className:`code-window`,children:(0,i.jsx)(`pre`,{className:`code-body`,children:(0,i.jsx)(`code`,{children:e.consumerCode})})})]})]})]})}export{a as default};