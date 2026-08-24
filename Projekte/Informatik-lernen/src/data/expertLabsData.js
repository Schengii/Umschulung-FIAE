// Data for GraphQL AST Resolver, Linux Permissions & Cryptography Labs

export const GRAPHQL_AST_SCENARIOS = [
  {
    id: 'user-posts-dataloader',
    title: 'Query: User & Associated Posts (N+1 vs DataLoader)',
    query: `query GetUserWithPosts {
  user(id: "42") {
    id
    name
    email
    posts(limit: 5) {
      id
      title
      commentsCount
    }
  }
}`,
    astTree: {
      kind: 'Document',
      definitions: [
        {
          kind: 'OperationDefinition',
          operation: 'query',
          name: 'GetUserWithPosts',
          selectionSet: [
            {
              kind: 'Field',
              name: 'user',
              arguments: { id: '42' },
              children: [
                { kind: 'Field', name: 'id' },
                { kind: 'Field', name: 'name' },
                { kind: 'Field', name: 'email' },
                {
                  kind: 'Field',
                  name: 'posts',
                  arguments: { limit: 5 },
                  children: [
                    { kind: 'Field', name: 'id' },
                    { kind: 'Field', name: 'title' },
                    { kind: 'Field', name: 'commentsCount' }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    naiveCalls: [
      { step: 1, resolver: 'Query.user(id: 42)', sql: 'SELECT * FROM users WHERE id = 42;' },
      { step: 2, resolver: 'User.posts(userId: 42)', sql: 'SELECT * FROM posts WHERE user_id = 42 LIMIT 5;' },
      { step: 3, resolver: 'Post.commentsCount(postId: 101)', sql: 'SELECT COUNT(*) FROM comments WHERE post_id = 101;' },
      { step: 4, resolver: 'Post.commentsCount(postId: 102)', sql: 'SELECT COUNT(*) FROM comments WHERE post_id = 102;' },
      { step: 5, resolver: 'Post.commentsCount(postId: 103)', sql: 'SELECT COUNT(*) FROM comments WHERE post_id = 103;' }
    ],
    dataloaderCalls: [
      { step: 1, resolver: 'Query.user', sql: 'SELECT * FROM users WHERE id = 42;' },
      { step: 2, resolver: 'User.posts', sql: 'SELECT * FROM posts WHERE user_id = 42 LIMIT 5;' },
      { step: 3, resolver: 'CommentsDataLoader.loadMany([101, 102, 103])', sql: 'SELECT post_id, COUNT(*) FROM comments WHERE post_id IN (101, 102, 103) GROUP BY post_id;' }
    ]
  }
];

export const LINUX_PERMISSION_MODES = [
  {
    octal: '755',
    symbolic: 'rwxr-xr-x',
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
    description: 'Standard für ausführbare Skripte und Verzeichnisse. Eigentümer darf alles; Gruppe & Andere dürfen lesen & ausführen.'
  },
  {
    octal: '644',
    symbolic: 'rw-r--r--',
    owner: { read: true, write: true, execute: false },
    group: { read: true, write: false, execute: false },
    others: { read: true, write: false, execute: false },
    description: 'Standard für reguläre Dateien (z. B. HTML, Textdateien, Configs). Nur Eigentümer darf schreiben.'
  },
  {
    octal: '700',
    symbolic: 'rwx------',
    owner: { read: true, write: true, execute: true },
    group: { read: false, write: false, execute: false },
    others: { read: false, write: false, execute: false },
    description: 'Privates Verzeichnis (z. B. ~/.ssh oder Home-Verzeichnis). Nur der Eigentümer hat vollen Zugriff.'
  },
  {
    octal: '4755',
    symbolic: 'rwsr-xr-x',
    special: 'SUID (Set User ID)',
    owner: { read: true, write: true, execute: true },
    group: { read: true, write: false, execute: true },
    others: { read: true, write: false, execute: true },
    description: 'SUID-Bit gesetzt (z. B. /usr/bin/passwd). Programm wird mit den Rechten des Dateieigentümers (meist root) ausgeführt.'
  }
];

export const RSA_CRYPTO_STEPS = [
  {
    step: 1,
    title: '1. Primzahlenauswahl (p, q)',
    desc: 'Wähle zwei geheime Primzahlen p und q.',
    math: 'p = 61, q = 53',
    detail: 'In realen Systemen haben p und q jeweils 1024 bis 2048 Bits Länge.'
  },
  {
    step: 2,
    title: '2. RSA-Modul (n) & Eulersche Phifunktion φ(n)',
    desc: 'Berechne das Produkt n und den Teilerfremdenwert φ(n).',
    math: 'n = p * q = 61 * 53 = 3233\nφ(n) = (p - 1) * (q - 1) = 60 * 52 = 3120',
    detail: 'n ist Teil des öffentlichen Schlüssels. Die Faktorisierung von n ist für Angreifer rechenintensiv.'
  },
  {
    step: 3,
    title: '3. Öffentlicher Exponent (e)',
    desc: 'Wähle ein e mit 1 < e < φ(n) und ggT(e, φ(n)) = 1.',
    math: 'e = 17 (standardmäßig oft 65537)',
    detail: 'Öffentlicher Schlüssel: Public Key = (e=17, n=3233)'
  },
  {
    step: 4,
    title: '4. Privater Exponent (d = e⁻¹ mod φ(n))',
    desc: 'Berechne das multiplikative Inverse von e modulo φ(n) via erweitertem euklidischen Algorithmus.',
    math: 'd = 17⁻¹ mod 3120 = 2753 (da 17 * 2753 = 46801 ≡ 1 mod 3120)',
    detail: 'Geheimer privater Schlüssel: Private Key = (d=2753, n=3233)'
  },
  {
    step: 5,
    title: '5. Ver- & Entschlüsselung (Verschlüsselung c = mᵉ mod n)',
    desc: 'Verschlüssele Nachricht m = 65 ("A").',
    math: 'Chiffretext: c = 65¹⁷ mod 3233 = 2790\nEntschlüsselung: m = 2790²⁷⁵³ mod 3233 = 65 ("A")',
    detail: 'Die mathematische Einwegfunktion basiert auf der Schwierigkeit des diskreten Logarithmus / Faktorisierung.'
  }
];
