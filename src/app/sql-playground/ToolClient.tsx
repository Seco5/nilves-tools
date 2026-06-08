'use client'
import { useState, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

function esc(s: string) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

const SQL_DB = {
  customers: [
    { id: 1, name: 'Alice Johnson', city: 'New York', joined_at: '2022-01-15' },
    { id: 2, name: 'Bob Smith', city: 'London', joined_at: '2022-03-20' },
    { id: 3, name: 'Carol White', city: 'New York', joined_at: '2022-05-10' },
    { id: 4, name: 'David Lee', city: 'Tokyo', joined_at: '2022-07-05' },
    { id: 5, name: 'Emma Davis', city: 'London', joined_at: '2022-09-18' },
    { id: 6, name: 'Frank Brown', city: 'Berlin', joined_at: '2023-01-22' },
  ],
  orders: [
    { id: 101, customer_id: 1, amount: 850, status: 'completed', date: '2023-06-01' },
    { id: 102, customer_id: 2, amount: 320, status: 'pending', date: '2023-06-03' },
    { id: 103, customer_id: 1, amount: 1200, status: 'completed', date: '2023-06-07' },
    { id: 104, customer_id: 3, amount: 450, status: 'cancelled', date: '2023-06-10' },
    { id: 105, customer_id: 4, amount: 675, status: 'completed', date: '2023-06-12' },
    { id: 106, customer_id: 5, amount: 290, status: 'pending', date: '2023-06-15' },
  ],
  products: [
    { id: 1, name: 'Laptop Pro', category: 'Electronics', price: 1299, stock: 15 },
    { id: 2, name: 'Wireless Mouse', category: 'Electronics', price: 49, stock: 80 },
    { id: 3, name: 'Standing Desk', category: 'Furniture', price: 599, stock: 20 },
    { id: 4, name: 'Office Chair', category: 'Furniture', price: 299, stock: 45 },
    { id: 5, name: 'Notebook', category: 'Stationery', price: 12, stock: 200 },
    { id: 6, name: 'Pen Set', category: 'Stationery', price: 18, stock: 150 },
  ],
}

type Row = Record<string, unknown>
type Loc = { tr: string; en: string }
const L = (tr: string, en: string): Loc => ({ tr, en })

type Topic = {
  group: Loc
  title: Loc
  badge: Loc
  desc: Loc
  pro: Loc
  tips: { tr: string[]; en: string[] }
  queries: string[]
  run: () => Row[]
}

const G_BASIC = L('Temel', 'Basic')
const G_GROUP = L('Gruplama', 'Grouping')
const G_JOIN = L('Birleştirme', 'Joins')
const G_FILTER = L('Filtreleme', 'Filtering')
const G_STRDATE = L('Metin & Tarih', 'String & Date')
const G_SET = L('Küme İşlemleri', 'Set Operations')
const G_ADV = L('İleri Seviye', 'Advanced')

const TOPICS: Topic[] = [
  // ── Basic ──
  {
    group: G_BASIC,
    title: L('SELECT & FROM', 'SELECT & FROM'),
    badge: L('Temel', 'Basic'),
    desc: L('<b>SELECT</b> hangi kolonların döneceğini, <b>FROM</b> hangi tablodan alınacağını belirtir.', '<b>SELECT</b> specifies which columns to return, <b>FROM</b> specifies the table.'),
    pro: L('SELECT * yerine sadece ihtiyacın olan kolonları yaz — büyük tablolarda performansı ciddi artırır.', 'Avoid SELECT * in production — specify only the columns you need for better performance.'),
    tips: { tr: ['Tüm kolonlar', 'Belirli kolonlar', 'Alias ile'], en: ['All columns', 'Specific columns', 'With alias'] },
    queries: ['SELECT *\nFROM customers;', 'SELECT name, city\nFROM customers;', 'SELECT name AS customer,\n       city AS location\nFROM customers;'],
    run: () => SQL_DB.customers.map(r => ({ ...r })),
  },
  {
    group: G_BASIC,
    title: L('WHERE', 'WHERE'),
    badge: L('Temel', 'Basic'),
    desc: L('<b>WHERE</b> satırları filtreler.', '<b>WHERE</b> filters rows.'),
    pro: L("WHERE içinde fonksiyon kullanmaktan kaçın (WHERE YEAR(date)=2024 yerine WHERE date BETWEEN). Index'i etkisiz kılar.", 'Avoid wrapping columns in functions inside WHERE — it prevents index usage. Use range conditions instead.'),
    tips: { tr: ['Şehre göre', 'Tutara göre', 'LIKE deseni'], en: ['Filter by city', 'Filter by amount', 'LIKE pattern'] },
    queries: ["SELECT * FROM customers\nWHERE city = 'New York';", 'SELECT * FROM orders\nWHERE amount > 500;', "SELECT * FROM customers\nWHERE name LIKE 'A%';"],
    run: () => SQL_DB.customers.filter(r => r.city === 'New York'),
  },
  {
    group: G_BASIC,
    title: L('ORDER BY', 'ORDER BY'),
    badge: L('Temel', 'Basic'),
    desc: L('<b>ORDER BY</b> sonuçları sıralar.', '<b>ORDER BY</b> sorts results.'),
    pro: L('Büyük tablolarda ORDER BY yavaşlatır. Sadece kullanıcıya gösterilecek son sorguda kullan.', 'ORDER BY on large tables is expensive. Only use it on the final query shown to users, not in subqueries.'),
    tips: { tr: ['İsim A-Z', 'Tutar çok-az', 'Çoklu sıralama'], en: ['Name A-Z', 'Amount high-low', 'Multi-column sort'] },
    queries: ['SELECT * FROM customers\nORDER BY name ASC;', 'SELECT * FROM orders\nORDER BY amount DESC;', 'SELECT * FROM customers\nORDER BY city ASC, name ASC;'],
    run: () => [...SQL_DB.customers].sort((a, b) => a.name.localeCompare(b.name)),
  },
  {
    group: G_BASIC,
    title: L('LIMIT & OFFSET', 'LIMIT & OFFSET'),
    badge: L('Temel', 'Basic'),
    desc: L('<b>LIMIT</b> satır sayısını sınırlar. <b>OFFSET</b> satır atlar.', '<b>LIMIT</b> caps row count. <b>OFFSET</b> skips rows.'),
    pro: L("Büyük OFFSET değerleri yavaştır — 'keyset pagination' (WHERE id > last_id LIMIT n) çok daha hızlı çalışır.", 'Large OFFSET values are slow. Use keyset pagination (WHERE id > last_seen_id LIMIT n) for better performance.'),
    tips: { tr: ['İlk 3 satır', 'Sayfa 2', 'En iyi 3 sipariş'], en: ['First 3 rows', 'Page 2', 'Top 3 orders'] },
    queries: ['SELECT * FROM customers\nLIMIT 3;', 'SELECT * FROM customers\nLIMIT 3 OFFSET 3;', 'SELECT * FROM orders\nORDER BY amount DESC\nLIMIT 3;'],
    run: () => SQL_DB.customers.slice(0, 3),
  },
  // ── Grouping ──
  {
    group: G_GROUP,
    title: L('GROUP BY', 'GROUP BY'),
    badge: L('Gruplama', 'Grouping'),
    desc: L('<b>GROUP BY</b> satırları gruplar. Aggregate fonksiyonlarla kullanılır.', '<b>GROUP BY</b> groups rows. Use with aggregate functions.'),
    pro: L('GROUP BY 1, 2 yazarak kolon adı yerine sıra numarası kullanabilirsin — uzun kolon adlarında çok pratik.', 'You can use GROUP BY 1, 2 instead of column names — very handy with long or aliased column names.'),
    tips: { tr: ['Şehre göre say', 'Statüye göre topla', 'Kategoriye göre ort.'], en: ['Count by city', 'Sum by status', 'Avg price by category'] },
    queries: ['SELECT city, COUNT(*) AS total\nFROM customers\nGROUP BY city;', 'SELECT status, SUM(amount) AS total\nFROM orders\nGROUP BY status;', 'SELECT category, AVG(price) AS avg_price\nFROM products\nGROUP BY category;'],
    run: () => { const g: Record<string, number> = {}; SQL_DB.customers.forEach(r => { g[r.city] = (g[r.city] || 0) + 1 }); return Object.entries(g).map(([city, total]) => ({ city, total })) },
  },
  {
    group: G_GROUP,
    title: L('HAVING', 'HAVING'),
    badge: L('Gruplama', 'Grouping'),
    desc: L('<b>HAVING</b> grupları filtreler.', '<b>HAVING</b> filters groups.'),
    pro: L("HAVING içinde alias kullanabilirsin bazı DB'lerde: SELECT COUNT(*) AS cnt ... HAVING cnt > 5. WHERE'dan sonra çalışır, aggregate filtreler için kullan.", 'In some databases you can use aliases in HAVING: HAVING cnt > 5. Remember: HAVING runs after WHERE, use it only for aggregate filters.'),
    tips: { tr: ['2+ müşterili şehir', 'Statü > $500'], en: ['Cities with 2+ customers', 'Status > $500'] },
    queries: ['SELECT city, COUNT(*) AS total\nFROM customers\nGROUP BY city\nHAVING COUNT(*) > 1;', 'SELECT status, SUM(amount) AS total\nFROM orders\nGROUP BY status\nHAVING SUM(amount) > 500;'],
    run: () => { const g: Record<string, number> = {}; SQL_DB.customers.forEach(r => { g[r.city] = (g[r.city] || 0) + 1 }); return Object.entries(g).filter(([, v]) => v > 1).map(([city, total]) => ({ city, total })) },
  },
  // ── Joins ──
  {
    group: G_JOIN,
    title: L('INNER JOIN', 'INNER JOIN'),
    badge: L('Birleştirme', 'Joins'),
    desc: L('<b>INNER JOIN</b> iki tabloda da eşleşen satırları döner.', '<b>INNER JOIN</b> returns rows that match in both tables.'),
    pro: L('JOIN yazdığında varsayılan olarak INNER JOIN gelir — açıkça yazmana gerek yok ama okunabilirlik için yazman önerilir.', 'Writing JOIN without a keyword defaults to INNER JOIN — but always write it explicitly for readability.'),
    tips: { tr: ['Müşterili siparişler', 'Filtreli join'], en: ['Orders with customer', 'Filtered join'] },
    queries: ['SELECT c.name, o.amount, o.status\nFROM customers c\nINNER JOIN orders o\n  ON c.id = o.customer_id;', "SELECT c.name, o.id, o.amount\nFROM customers c\nINNER JOIN orders o\n  ON c.id = o.customer_id\nWHERE o.status = 'completed';"],
    run: () => SQL_DB.orders.map(o => { const c = SQL_DB.customers.find(c => c.id === o.customer_id); return { name: c?.name, amount: o.amount, status: o.status } }),
  },
  {
    group: G_JOIN,
    title: L('LEFT JOIN', 'LEFT JOIN'),
    badge: L('Birleştirme', 'Joins'),
    desc: L('<b>LEFT JOIN</b> sol tablodaki tüm satırları döner.', '<b>LEFT JOIN</b> returns all rows from left table.'),
    pro: L('LEFT JOIN + WHERE sağ tablo IS NULL kombinasyonu, bir tabloda olup diğerinde olmayan kayıtları bulmak için klasik yöntemdir.', "LEFT JOIN + WHERE right_table.id IS NULL is the classic pattern for finding records that exist in one table but not another."),
    tips: { tr: ['Tüm müşteri + sipariş', 'Siparişsiz müşteri'], en: ['All customers + orders', 'No-order customers'] },
    queries: ['SELECT c.name, o.id AS order_id\nFROM customers c\nLEFT JOIN orders o\n  ON c.id = o.customer_id;', 'SELECT c.name\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nWHERE o.id IS NULL;'],
    run: () => SQL_DB.customers.map(c => { const os = SQL_DB.orders.filter(o => o.customer_id === c.id); return os.length ? os.map(o => ({ name: c.name, order_id: o.id })) : [{ name: c.name, order_id: null }] }).flat(),
  },
  // ── Filtering ──
  {
    group: G_FILTER,
    title: L('DISTINCT', 'DISTINCT'),
    badge: L('Filtreleme', 'Filtering'),
    desc: L('<b>DISTINCT</b> tekrarlayan satırları kaldırır.', '<b>DISTINCT</b> removes duplicate rows.'),
    pro: L('DISTINCT pahalı bir işlemdir. Önce neden duplicate var sorusunu sor — JOIN\'den mi geliyor? Doğru join tipi kullanmak daha iyi çözüm olabilir.', "DISTINCT is expensive. First ask why duplicates exist — if it's from a JOIN, fixing the join logic is often better than DISTINCT."),
    tips: { tr: ['Benzersiz şehirler', 'Benzersiz kategori'], en: ['Unique cities', 'Unique categories'] },
    queries: ['SELECT DISTINCT city\nFROM customers;', 'SELECT DISTINCT category\nFROM products;', 'SELECT DISTINCT status\nFROM orders;'],
    run: () => { const s = new Set<string>(); SQL_DB.customers.forEach(c => s.add(c.city)); return [...s].map(city => ({ city })) },
  },
  {
    group: G_FILTER,
    title: L('CASE WHEN', 'CASE WHEN'),
    badge: L('Filtreleme', 'Filtering'),
    desc: L('<b>CASE WHEN</b> sorgu içinde koşullu mantık kurar.', '<b>CASE WHEN</b> adds conditional logic inside queries.'),
    pro: L("CASE WHEN'i SELECT içinde aggregate ile kullanabilirsin: SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) — pivot tablo yaratmak için mükemmel.", "Use CASE WHEN inside aggregates: SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) — perfect for creating pivot-style reports."),
    tips: { tr: ['Tutar kademesi', 'Pivot sayım'], en: ['Amount tier', 'Pivot count'] },
    queries: ["SELECT id, amount,\n  CASE\n    WHEN amount >= 1000 THEN 'high'\n    WHEN amount >= 500 THEN 'medium'\n    ELSE 'low'\n  END AS tier\nFROM orders;", "SELECT\n  SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed,\n  SUM(CASE WHEN status='pending' THEN 1 ELSE 0 END) AS pending\nFROM orders;"],
    run: () => SQL_DB.orders.map(o => ({ id: o.id, amount: o.amount, tier: o.amount >= 1000 ? 'high' : o.amount >= 500 ? 'medium' : 'low' })),
  },
  {
    group: G_FILTER,
    title: L('COALESCE & NULLIF', 'COALESCE & NULLIF'),
    badge: L('Filtreleme', 'Filtering'),
    desc: L('<b>COALESCE</b> ilk NULL olmayan değeri döner, <b>NULLIF</b> iki değer eşitse NULL döner.', '<b>COALESCE</b> returns the first non-NULL value, <b>NULLIF</b> returns NULL when two values are equal.'),
    pro: L('NULLIF(value, 0) sıfıra bölme hatasını önler: AVG(revenue / NULLIF(cost, 0)) — cost 0 olduğunda NULL döner, hata vermez.', 'NULLIF(value, 0) prevents division by zero: AVG(revenue / NULLIF(cost, 0)) — returns NULL instead of throwing an error.'),
    tips: { tr: ['Varsayılan 0', 'Sıfıra bölmeyi önle'], en: ['Default to 0', 'Prevent divide by zero'] },
    queries: ['SELECT c.name,\n  COALESCE(SUM(o.amount), 0) AS total_spent\nFROM customers c\nLEFT JOIN orders o ON c.id = o.customer_id\nGROUP BY c.name;', 'SELECT id,\n  amount / NULLIF(0, 0) AS safe_div\nFROM orders;'],
    run: () => SQL_DB.customers.map(c => { const os = SQL_DB.orders.filter(o => o.customer_id === c.id); const total = os.reduce((a, o) => a + o.amount, 0); return { name: c.name, total_spent: total || 0, order_count: os.length } }),
  },
  // ── String & Date ──
  {
    group: G_STRDATE,
    title: L('String Functions', 'String Functions'),
    badge: L('Metin', 'String'),
    desc: L('<b>UPPER, LOWER, TRIM, CONCAT, LENGTH, SUBSTRING</b> ile metin işle.', 'Work with text using <b>UPPER, LOWER, TRIM, CONCAT, LENGTH, SUBSTRING</b>.'),
    pro: L("LIKE '%text%' index kullanamaz. Tam metin araması için FULLTEXT INDEX veya Elasticsearch gibi özel çözümler kullan.", "LIKE '%text%' can't use indexes. For full-text search, use FULLTEXT INDEX or a dedicated search engine like Elasticsearch."),
    tips: { tr: ['Büyük harf', 'Uzunluk', 'Birleştir'], en: ['Uppercase', 'Length', 'Concat'] },
    queries: ['SELECT name,\n  UPPER(name) AS upper_name,\n  LENGTH(name) AS name_len\nFROM customers;', "SELECT CONCAT(name, ' - ', city) AS label\nFROM customers;", 'SELECT SUBSTRING(name, 1, 3) AS short\nFROM customers;'],
    run: () => SQL_DB.customers.map(c => ({ name: c.name, upper: c.name.toUpperCase(), length: c.name.length, first_word: c.name.split(' ')[0] })),
  },
  {
    group: G_STRDATE,
    title: L('Date Functions', 'Date Functions'),
    badge: L('Tarih', 'Date'),
    desc: L('<b>NOW(), DATEDIFF(), DATE_FORMAT(), EXTRACT()</b> ile tarih işle.', 'Work with dates using <b>NOW(), DATEDIFF(), DATE_FORMAT(), EXTRACT()</b>.'),
    pro: L("Tarih karşılaştırmalarında string kullanma ('2024-01-01' gibi görünse de). Her zaman DATE() veya TIMESTAMP() ile cast et.", "Don't compare dates as strings. Always cast properly with DATE() or use parameterized queries to avoid timezone and format bugs."),
    tips: { tr: ['Katılım yılı', 'Ay çıkar'], en: ['Join year', 'Extract month'] },
    queries: ['SELECT name,\n  EXTRACT(YEAR FROM joined_at) AS year\nFROM customers;', "SELECT name,\n  DATE_FORMAT(joined_at, '%Y-%m') AS ym\nFROM customers;", 'SELECT name,\n  DATEDIFF(NOW(), joined_at) AS days_member\nFROM customers;'],
    run: () => SQL_DB.customers.map(c => ({ name: c.name, joined_at: c.joined_at, year: Number(c.joined_at.slice(0, 4)), month: Number(c.joined_at.slice(5, 7)) })),
  },
  // ── Set Operations ──
  {
    group: G_SET,
    title: L('UNION & UNION ALL', 'UNION & UNION ALL'),
    badge: L('Küme', 'Set'),
    desc: L('<b>UNION</b> sonuç kümelerini birleştirir (duplicate kaldırır), <b>UNION ALL</b> hepsini tutar.', '<b>UNION</b> combines result sets (removing duplicates), <b>UNION ALL</b> keeps them all.'),
    pro: L('UNION duplicate\'leri kaldırmak için ekstra işlem yapar. Duplicate olmayacağından eminsen UNION ALL kullan — çok daha hızlı.', "UNION removes duplicates with extra processing. Use UNION ALL when you know there are no duplicates — it's significantly faster."),
    tips: { tr: ['Şehir + kategori', 'Hepsini birleştir'], en: ['Cities + categories', 'Combine all'] },
    queries: ['SELECT city AS value FROM customers\nUNION\nSELECT category FROM products;', 'SELECT city AS value FROM customers\nUNION ALL\nSELECT category FROM products;'],
    run: () => { const s = new Set<string>(); SQL_DB.customers.forEach(c => s.add(c.city)); SQL_DB.products.forEach(p => s.add(p.category)); return [...s].map(value => ({ value })) },
  },
  {
    group: G_SET,
    title: L('EXISTS & NOT EXISTS', 'EXISTS & NOT EXISTS'),
    badge: L('Küme', 'Set'),
    desc: L('<b>EXISTS</b> bir alt sorgunun satır döndürüp döndürmediğini verimli şekilde kontrol eder.', '<b>EXISTS</b> efficiently checks whether a subquery returns any rows.'),
    pro: L('EXISTS vs IN: büyük alt sorgularda EXISTS çok daha hızlıdır çünkü ilk eşleşmede durur, IN ise tüm listeyi tarar.', 'EXISTS vs IN: for large subqueries EXISTS is much faster because it stops at the first match, while IN scans the entire list.'),
    tips: { tr: ['Siparişi olanlar', 'Siparişi olmayanlar'], en: ['Has orders', 'No orders'] },
    queries: ['SELECT * FROM customers c\nWHERE EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id\n);', 'SELECT * FROM customers c\nWHERE NOT EXISTS (\n  SELECT 1 FROM orders o\n  WHERE o.customer_id = c.id\n);'],
    run: () => SQL_DB.customers.filter(c => SQL_DB.orders.some(o => o.customer_id === c.id)).map(c => ({ id: c.id, name: c.name, city: c.city })),
  },
  // ── Advanced ──
  {
    group: G_ADV,
    title: L('Subquery', 'Subquery'),
    badge: L('İleri', 'Advanced'),
    desc: L('Başka bir sorgunun içine yerleştirilen sorgu.', 'A query nested inside another query.'),
    pro: L('Subquery yerine JOIN kullanmak genellikle daha hızlıdır. Optimizer her zaman en iyi yolu bulamayabilir.', "JOINs are generally faster than subqueries. The query optimizer can't always rewrite subqueries efficiently."),
    tips: { tr: ['Ortalama üstü', 'En pahalı ürün'], en: ['Above avg orders', 'Most expensive product'] },
    queries: ['SELECT * FROM orders\nWHERE amount > (\n  SELECT AVG(amount)\n  FROM orders\n);', 'SELECT * FROM products\nWHERE price = (\n  SELECT MAX(price)\n  FROM products\n);'],
    run: () => { const avg = SQL_DB.orders.reduce((a, o) => a + o.amount, 0) / SQL_DB.orders.length; return SQL_DB.orders.filter(o => o.amount > avg) },
  },
  {
    group: G_ADV,
    title: L('Window Functions', 'Window Functions'),
    badge: L('İleri', 'Advanced'),
    desc: L('ROW_NUMBER(), RANK(), SUM() OVER() satırları daraltmadan çalışır.', 'ROW_NUMBER(), RANK(), SUM() OVER() work without collapsing rows.'),
    pro: L("Window function'lar GROUP BY'ın aksine satırları daraltmaz — her satır için hesaplama yapılır, bu yüzden çok daha esnektir.", "Unlike GROUP BY, window functions don't collapse rows — each row keeps its identity while getting an aggregated value."),
    tips: { tr: ['Kümülatif toplam', 'Fiyat sıralaması'], en: ['Running total', 'Price ranking'] },
    queries: ['SELECT id, amount,\n  SUM(amount) OVER (\n    ORDER BY date\n  ) AS running_total\nFROM orders;', 'SELECT name, price,\n  RANK() OVER (\n    ORDER BY price DESC\n  ) AS price_rank\nFROM products;'],
    run: () => { let c = 0; return [...SQL_DB.orders].sort((a, b) => a.date.localeCompare(b.date)).map(o => { c += o.amount; return { id: o.id, amount: o.amount, date: o.date, running_total: Math.round(c * 100) / 100 } }) },
  },
  {
    group: G_ADV,
    title: L('CTE (WITH...AS)', 'CTE (WITH...AS)'),
    badge: L('İleri', 'Advanced'),
    desc: L('<b>WITH ... AS</b> okunabilir sorgular için geçici adlandırılmış sonuç kümeleri (common table expressions) oluşturur.', '<b>WITH ... AS</b> creates named temporary result sets (common table expressions) for readable queries.'),
    pro: L("CTE'ler aynı alt sorguyu birden fazla kez kullanman gerektiğinde mükemmeldir — hem okunabilirliği artırır hem de tekrarı önler.", 'CTEs shine when you need to reference the same subquery multiple times — they improve readability and eliminate repetition.'),
    tips: { tr: ['Yüksek siparişler', 'Çok adımlı'], en: ['High orders', 'Multi-step'] },
    queries: ['WITH high_orders AS (\n  SELECT * FROM orders\n  WHERE amount > 500\n)\nSELECT c.name, h.amount, h.status\nFROM high_orders h\nJOIN customers c ON c.id = h.customer_id;'],
    run: () => { const high = SQL_DB.orders.filter(o => o.amount > 500); return high.map(o => { const c = SQL_DB.customers.find(c => c.id === o.customer_id); return { customer: c?.name, amount: o.amount, status: o.status } }) },
  },
  {
    group: G_ADV,
    title: L('INSERT & UPDATE', 'INSERT & UPDATE'),
    badge: L('İleri', 'Advanced'),
    desc: L('<b>INSERT</b> yeni satır ekler, <b>UPDATE</b> mevcut satırları değiştirir.', '<b>INSERT</b> adds new rows, <b>UPDATE</b> modifies existing rows.'),
    pro: L('UPDATE yapmadan önce aynı WHERE koşuluyla SELECT çalıştır — kaç satırın etkileneceğini görmek için. Sonra UPDATE\'e geç.', 'Before running UPDATE, run a SELECT with the same WHERE clause to see exactly how many rows will be affected. Then switch to UPDATE.'),
    tips: { tr: ['Yeni müşteri', 'Statü güncelle'], en: ['New customer', 'Update status'] },
    queries: ["INSERT INTO customers (name, city, joined_at)\nVALUES ('Grace Hopper', 'Boston', '2023-05-01');", "UPDATE orders\nSET status = 'processing'\nWHERE status = 'pending';"],
    run: () => SQL_DB.orders.filter(o => o.status === 'pending').map(o => ({ id: o.id, old_status: o.status, new_status: 'processing' })),
  },
  {
    group: G_ADV,
    title: L('EXPLAIN', 'EXPLAIN'),
    badge: L('İleri', 'Advanced'),
    desc: L('<b>EXPLAIN</b> bir sorgunun nasıl çalıştırılacağını (execution plan) gösterir.', '<b>EXPLAIN</b> shows how a query will be executed (its execution plan).'),
    pro: L("EXPLAIN çıktısında 'type' kolonuna bak: ALL = full table scan (kötü), ref/eq_ref = index kullanıyor (iyi), const = en hızlı.", "In EXPLAIN output, check the 'type' column: ALL = full table scan (bad), ref/eq_ref = using index (good), const = fastest."),
    tips: { tr: ['Join planı', 'Tarama tipi'], en: ['Join plan', 'Scan type'] },
    queries: ['EXPLAIN\nSELECT c.name, o.amount\nFROM customers c\nJOIN orders o ON c.id = o.customer_id\nWHERE o.amount > 500;'],
    run: () => [
      { id: 1, select_type: 'SIMPLE', table: 'orders', type: 'ALL', possible_keys: null, rows: 6, Extra: 'Using where' },
      { id: 1, select_type: 'SIMPLE', table: 'customers', type: 'eq_ref', possible_keys: 'PRIMARY', rows: 1, Extra: null },
    ],
  },
  {
    group: G_ADV,
    title: L('WITH ROLLUP', 'WITH ROLLUP'),
    badge: L('İleri', 'Advanced'),
    desc: L('<b>WITH ROLLUP</b> GROUP BY sonucuna otomatik ara toplam ve genel toplam satırları ekler.', '<b>WITH ROLLUP</b> adds automatic subtotal and grand total rows to a GROUP BY result.'),
    pro: L('WITH ROLLUP GROUP BY sonuna eklenir ve otomatik ara toplam + genel toplam satırları ekler — raporlama sorgularında çok kullanışlı.', 'WITH ROLLUP appended to GROUP BY automatically adds subtotal and grand total rows — very useful for reporting queries.'),
    tips: { tr: ['Statü toplamı', 'Genel toplam'], en: ['Status totals', 'Grand total'] },
    queries: ['SELECT status, SUM(amount) AS total\nFROM orders\nGROUP BY status WITH ROLLUP;'],
    run: () => { const g: Record<string, number> = {}; SQL_DB.orders.forEach(o => { g[o.status] = (g[o.status] || 0) + o.amount }); const rows: Row[] = Object.entries(g).map(([status, total]) => ({ status, total })); rows.push({ status: 'ALL (rollup)', total: SQL_DB.orders.reduce((a, o) => a + o.amount, 0) }); return rows },
  },
  {
    group: G_ADV,
    title: L('ROW_NUMBER PARTITION', 'ROW_NUMBER PARTITION'),
    badge: L('İleri', 'Advanced'),
    desc: L('<b>ROW_NUMBER() OVER (PARTITION BY ...)</b> her grup içinde satır numarası verir — deduplikasyon için ileri window fonksiyonu.', '<b>ROW_NUMBER() OVER (PARTITION BY ...)</b> numbers rows within each group — an advanced window function for deduplication.'),
    pro: L('ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) ile her email\'in en son kaydını bulabilirsin — duplicate temizleme için klasik yöntem.', 'ROW_NUMBER() OVER (PARTITION BY email ORDER BY created_at DESC) finds the latest record per email — the classic deduplication pattern.'),
    tips: { tr: ['Şehir başına sıra', 'Her gruptan son'], en: ['Rank per city', 'Latest per group'] },
    queries: ['SELECT name, city,\n  ROW_NUMBER() OVER (\n    PARTITION BY city\n    ORDER BY joined_at DESC\n  ) AS rn\nFROM customers;', 'SELECT * FROM (\n  SELECT name, city,\n    ROW_NUMBER() OVER (\n      PARTITION BY city ORDER BY joined_at DESC\n    ) AS rn\n  FROM customers\n) t\nWHERE rn = 1;'],
    run: () => { const byCity: Record<string, typeof SQL_DB.customers> = {}; SQL_DB.customers.forEach(c => { (byCity[c.city] = byCity[c.city] || []).push(c) }); const out: Row[] = []; Object.values(byCity).forEach(list => { [...list].sort((a, b) => b.joined_at.localeCompare(a.joined_at)).forEach((c, idx) => out.push({ name: c.name, city: c.city, rn: idx + 1 })) }); return out },
  },
]

const FN_GROUPS: [string, string[]][] = [
  ['Aggregate', ['COUNT()', 'SUM()', 'AVG()', 'MIN()', 'MAX()']],
  ['String', ['UPPER()', 'LOWER()', 'TRIM()', 'CONCAT()', 'LENGTH()', 'SUBSTRING()', 'REPLACE()']],
  ['Date', ['NOW()', 'CURDATE()', 'DATEDIFF()', 'DATE_FORMAT()', 'EXTRACT()', 'TIMESTAMPDIFF()']],
  ['Numeric', ['ROUND()', 'FLOOR()', 'CEIL()', 'ABS()', 'MOD()']],
  ['Null', ['COALESCE()', 'NULLIF()', 'ISNULL()', 'IFNULL()']],
  ['Window', ['ROW_NUMBER()', 'RANK()', 'DENSE_RANK()', 'LAG()', 'LEAD()', 'SUM() OVER()']],
]

const QR_TIPS: { title: Loc; desc: Loc }[] = [
  { title: L('SELECT * kullanma', 'Avoid SELECT *'), desc: L('Sadece ihtiyacın olan kolonları seç. Performans ve okunabilirlik için kritik.', 'Only select columns you need. Critical for performance and readability.') },
  { title: L('GROUP BY 1, 2 kısayolu', 'GROUP BY positional shortcut'), desc: L('Kolon adı yerine sıra numarası yazabilirsin: GROUP BY 1, 2', 'Use column position instead of name: GROUP BY 1, 2') },
  { title: L('UNION ALL daha hızlı', 'UNION ALL is faster'), desc: L('Duplicate yoksa UNION yerine UNION ALL kullan — ekstra işlem yapmaz.', 'Use UNION ALL instead of UNION when no duplicates exist — skips dedup step.') },
  { title: L('EXPLAIN ile analiz et', 'Use EXPLAIN to analyze'), desc: L("Yavaş sorguların önüne EXPLAIN yaz — optimizer'ın ne yaptığını göster.", 'Prepend EXPLAIN to slow queries to see what the optimizer is doing.') },
  { title: L('EXISTS vs IN', 'EXISTS vs IN'), desc: L('Büyük listelerde EXISTS çok daha hızlıdır — ilk eşleşmede durur.', 'EXISTS is much faster for large lists — it stops at the first match.') },
  { title: L('NULLIF ile sıfıra bölmeyi önle', 'Prevent division by zero with NULLIF'), desc: L('revenue / NULLIF(cost, 0) — cost 0 ise NULL döner, hata vermez.', 'revenue / NULLIF(cost, 0) — returns NULL instead of divide-by-zero error.') },
  { title: L("WHERE'da fonksiyon kullanma", 'Avoid functions in WHERE'), desc: L("WHERE YEAR(date)=2024 index'i etkisiz kılar. WHERE date BETWEEN kullan.", 'WHERE YEAR(date)=2024 kills index usage. Use WHERE date BETWEEN instead.') },
  { title: L('INSERT INTO ... SELECT', 'INSERT INTO ... SELECT'), desc: L('Bir tablodan diğerine tek sorguda kopyala — döngüye gerek yok.', 'Copy data between tables in one query — no need for loops.') },
  { title: L('CASE WHEN ile pivot', 'Pivot with CASE WHEN'), desc: L("SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) ile pivot tablo yap.", "SUM(CASE WHEN status='active' THEN 1 ELSE 0 END) creates pivot-style reports.") },
  { title: L('Keyset pagination', 'Keyset pagination'), desc: L('OFFSET yerine WHERE id > last_id LIMIT n — büyük tablolarda çok daha hızlı.', 'Use WHERE id > last_id LIMIT n instead of OFFSET for large tables.') },
  { title: L('WITH ROLLUP ile otomatik toplam', 'Auto totals with WITH ROLLUP'), desc: L('GROUP BY ... WITH ROLLUP ekle — ara toplamlar otomatik gelir.', 'Add WITH ROLLUP to GROUP BY — subtotals and grand totals appear automatically.') },
  { title: L('LEFT JOIN + IS NULL', 'LEFT JOIN + IS NULL'), desc: L("A'da olup B'de olmayan kayıtları bulmak için klasik yöntem.", "Classic pattern to find records in A that don't exist in B.") },
  { title: L('ROW_NUMBER ile duplicate temizle', 'Deduplicate with ROW_NUMBER'), desc: L('PARTITION BY + ROW_NUMBER ile her gruptan en son kaydı al.', 'Use PARTITION BY + ROW_NUMBER to get the latest record per group.') },
  { title: L("Alias'ı HAVING'de kullan", 'Use aliases in HAVING'), desc: L("Bazı DB'lerde: SELECT COUNT(*) AS cnt ... HAVING cnt > 5 çalışır.", 'In some databases: SELECT COUNT(*) AS cnt ... HAVING cnt > 5 works.') },
  { title: L('CTE ile okunabilirlik', 'CTEs for readability'), desc: L("Aynı subquery'yi iki kez yazıyorsan WITH ... AS ile CTE'ye al.", 'If you write the same subquery twice, move it into a CTE with WITH...AS.') },
]

export default function SqlPlayground() {
  const { lang } = useLanguage()
  const tr = (a: string, b: string) => (lang === 'tr' ? a : b)
  const loc = (l: Loc) => l[lang]

  const [topicIdx, setTopicIdx] = useState(0)
  const [query, setQuery] = useState(TOPICS[0].queries[0])
  const [result, setResult] = useState('')
  const [rowCount, setRowCount] = useState('')
  const [chip, setChip] = useState<'idle' | 'ok' | 'err'>('idle')
  const [msg, setMsg] = useState(tr('Bir konu seç ve sorgu çalıştır', 'Select a topic and run a query'))
  const [time, setTime] = useState('')
  const [search, setSearch] = useState('')
  const [qrOpen, setQrOpen] = useState(false)
  const [qrTab, setQrTab] = useState<'fn' | 'tips'>('fn')
  const taRef = useRef<HTMLTextAreaElement>(null)

  const setTopic = (i: number) => {
    setTopicIdx(i)
    setQuery(TOPICS[i].queries[0])
    setResult('')
    setRowCount(''); setChip('idle'); setMsg(tr('Sorgu yüklendi', 'Query loaded')); setTime('')
  }

  const loadQ = (ti: number, qi: number) => { setQuery(TOPICS[ti].queries[qi] || '') }

  const insertAtCursor = (text: string) => {
    const ta = taRef.current
    if (!ta) { setQuery(q => q + text); return }
    const start = ta.selectionStart, end = ta.selectionEnd
    const next = query.slice(0, start) + text + query.slice(end)
    setQuery(next)
    requestAnimationFrame(() => { ta.focus(); const pos = start + text.length; ta.setSelectionRange(pos, pos) })
  }

  const run = () => {
    const t0 = Date.now()
    try {
      const rows = TOPICS[topicIdx].run() as Row[]
      const ms = Date.now() - t0
      if (!rows?.length) { setResult(`<span style="color:var(--muted);font-size:.77rem">${tr('Sonuç yok', 'No results')}</span>`); setChip('ok'); setMsg(tr('0 satır', '0 rows')); return }
      const cols = Object.keys(rows[0])
      let html = '<table class="res-table"><thead><tr>' + cols.map(c => `<th>${c}</th>`).join('') + '</tr></thead><tbody>'
      rows.forEach(r => { html += '<tr>' + cols.map(c => `<td>${r[c] ?? '<span style="color:var(--muted)">NULL</span>'}</td>`).join('') + '</tr>' })
      html += '</tbody></table>'
      setResult(html); setRowCount(rows.length + ' ' + tr('satır', 'rows'))
      setChip('ok'); setMsg(rows.length + ' ' + tr('satır döndü', 'rows returned')); setTime(ms + 'ms')
    } catch (e: unknown) {
      setResult('<span style="color:var(--red);font-size:.77rem">' + esc((e as Error).message) + '</span>')
      setChip('err'); setMsg((e as Error).message)
    }
  }

  const topic = TOPICS[topicIdx]

  // Build filtered topic list, grouped
  const q = search.trim().toLowerCase()
  const filtered = TOPICS.map((t, i) => ({ t, i })).filter(({ t }) =>
    !q || loc(t.title).toLowerCase().includes(q) || loc(t.badge).toLowerCase().includes(q) || loc(t.group).toLowerCase().includes(q)
  )
  const topicList: React.ReactNode[] = []
  let lastGroup = ''
  filtered.forEach(({ t, i }) => {
    const gl = loc(t.group)
    if (gl !== lastGroup) { topicList.push(<div key={'g' + i} className="sql-group">{gl}</div>); lastGroup = gl }
    topicList.push(
      <button key={i} className={`sql-topic${i === topicIdx ? ' active' : ''}`} onClick={() => setTopic(i)}>
        {loc(t.title)}
      </button>
    )
  })

  return (
    <>
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Topics */}
        <div style={{ width: 200, flexShrink: 0, background: 'var(--surface)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 10px', borderBottom: '1px solid var(--border)' }}>
            <input
              className="sql-search"
              placeholder={tr('Konu ara…', 'Search topics…')}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '6px 6px' }}>
            {topicList.length ? topicList : (
              <div style={{ padding: '14px 10px', fontSize: '.72rem', color: 'var(--muted)', textAlign: 'center' }}>
                {tr('Konu bulunamadı', 'No topics found')}
              </div>
            )}
          </div>
        </div>

        {/* Main */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRight: '1px solid var(--border)' }}>
          <div style={{ padding: '8px 14px', borderBottom: '1px solid var(--border)', background: 'var(--surface)', display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
            <span style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--text)', fontFamily: 'var(--display)' }}>{loc(topic.title)}</span>
            <span style={{ fontSize: '.6rem', padding: '2px 8px', borderRadius: 10, background: 'var(--teal-dim)', color: 'var(--teal2)', fontWeight: 700, letterSpacing: '.04em' }}>{loc(topic.badge)}</span>
          </div>
          <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', background: 'var(--bg)', flexShrink: 0 }}>
            <div style={{ fontSize: '.79rem', color: 'var(--muted2)', lineHeight: 1.7, marginBottom: 8 }} dangerouslySetInnerHTML={{ __html: loc(topic.desc) }} />
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {(lang === 'tr' ? topic.tips.tr : topic.tips.en).map((tip, j) => (
                <span key={j} className="sql-tip" onClick={() => loadQ(topicIdx, j)}>{tip}</span>
              ))}
            </div>
            <div className="sql-pro">
              <span className="sql-pro-label">💡 {tr('Pro İpucu', 'Pro Tip')}</span>
              <span className="sql-pro-text">{loc(topic.pro)}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            <div style={{ padding: '6px 14px', background: 'var(--surface)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 7, flexShrink: 0 }}>
              <span style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>{tr('Sorgu', 'Query')}</span>
              <div className="btn-group">
                <button className="btn" onClick={() => setQuery('')}>{tr('temizle', 'clear')}</button>
                <button className="btn primary" onClick={run}>▶ {tr('Çalıştır', 'Run')}</button>
              </div>
            </div>
            <textarea ref={taRef} style={{ flex: 1, padding: '12px 14px', fontFamily: 'var(--mono)', fontSize: '.79rem', lineHeight: 1.75, background: 'var(--bg)', color: 'var(--text)', border: 'none', outline: 'none', resize: 'none', tabSize: 2, minHeight: 80 }} placeholder={tr('SQL yaz…', 'Write SQL here…')} value={query} onChange={e => setQuery(e.target.value)} spellCheck={false} />
          </div>
          <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', flexShrink: 0, display: 'flex', flexDirection: 'column', maxHeight: 200 }}>
            <div style={{ padding: '5px 14px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: '.62rem', fontWeight: 600, letterSpacing: '.09em', textTransform: 'uppercase', color: 'var(--muted)' }}>{tr('Sonuç', 'Result')}</span>
              <span style={{ fontSize: '.7rem', color: 'var(--teal2)', fontFamily: 'var(--mono)' }}>{rowCount}</span>
            </div>
            <div style={{ flex: 1, overflow: 'auto', padding: '8px 14px' }} dangerouslySetInnerHTML={{ __html: result || `<span style="color:var(--muted);font-size:.77rem;font-family:var(--mono)">▶ ${tr('Çalıştır\'a bas', 'Press Run')}</span>` }} />
          </div>
        </div>

        {/* Right column: Schema + Quick Reference */}
        <div style={{ width: 240, flexShrink: 0, background: 'var(--surface)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border)', fontSize: '.62rem', fontWeight: 600, letterSpacing: '.1em', textTransform: 'uppercase', color: 'var(--muted)' }}>Schema</div>
          <div style={{ flex: 1, overflowY: 'auto', padding: '10px 12px', fontFamily: 'var(--mono)', fontSize: '.7rem' }}>
            <div style={{ color: 'var(--teal2)', fontWeight: 700, marginBottom: 3 }}>customers</div>
            <div style={{ color: 'var(--yellow)', paddingLeft: 7 }}>id <span style={{ color: 'var(--muted)' }}>PK</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>name <span style={{ color: 'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>city <span style={{ color: 'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>joined_at <span style={{ color: 'var(--muted)' }}>DATE</span></div>
            <div style={{ color: 'var(--teal2)', fontWeight: 700, marginTop: 9, marginBottom: 3 }}>orders</div>
            <div style={{ color: 'var(--yellow)', paddingLeft: 7 }}>id <span style={{ color: 'var(--muted)' }}>PK</span></div>
            <div style={{ color: 'var(--blue)', paddingLeft: 7 }}>customer_id <span style={{ color: 'var(--muted)' }}>FK</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>amount <span style={{ color: 'var(--muted)' }}>DECIMAL</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>status <span style={{ color: 'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>date <span style={{ color: 'var(--muted)' }}>DATE</span></div>
            <div style={{ color: 'var(--teal2)', fontWeight: 700, marginTop: 9, marginBottom: 3 }}>products</div>
            <div style={{ color: 'var(--yellow)', paddingLeft: 7 }}>id <span style={{ color: 'var(--muted)' }}>PK</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>name <span style={{ color: 'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>category <span style={{ color: 'var(--muted)' }}>VARCHAR</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>price <span style={{ color: 'var(--muted)' }}>DECIMAL</span></div>
            <div style={{ color: 'var(--muted2)', paddingLeft: 7 }}>stock <span style={{ color: 'var(--muted)' }}>INT</span></div>
          </div>

          {/* Quick Reference (collapsible) */}
          <div style={{ borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0, maxHeight: qrOpen ? '55%' : 'auto' }}>
            <button className="sql-qr-toggle" onClick={() => setQrOpen(o => !o)}>
              <span>{tr('Hızlı Başvuru', 'Quick Reference')}</span>
              <span>{qrOpen ? '▲' : '▼'}</span>
            </button>
            {qrOpen && (
              <>
                <div className="sql-qr-tabs">
                  <button className={`sql-qr-tab${qrTab === 'fn' ? ' active' : ''}`} onClick={() => setQrTab('fn')}>{tr('Fonksiyonlar', 'Functions')}</button>
                  <button className={`sql-qr-tab${qrTab === 'tips' ? ' active' : ''}`} onClick={() => setQrTab('tips')}>{tr('İpuçları', 'Tips')}</button>
                </div>
                <div style={{ overflowY: 'auto', padding: '8px 10px' }}>
                  {qrTab === 'fn' ? (
                    FN_GROUPS.map(([grp, fns]) => (
                      <div key={grp} style={{ marginBottom: 8 }}>
                        <div className="sql-group" style={{ marginTop: 0 }}>{grp}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                          {fns.map(fn => (
                            <button key={fn} className="sql-fn" onClick={() => insertAtCursor(fn)} title={tr('Editöre ekle', 'Insert into editor')}>{fn}</button>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    QR_TIPS.map((tip, i) => (
                      <div key={i} className="sql-qrtip">
                        <div className="sql-qrtip-title"><span className="sql-qrtip-num">{i + 1}</span>{loc(tip.title)}</div>
                        <div className="sql-qrtip-desc">{loc(tip.desc)}</div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="statusbar">
        <span className={`chip chip-${chip}`}>{chip === 'idle' ? 'IDLE' : chip === 'ok' ? 'OK' : 'ERROR'}</span>
        <span>{msg}</span>
        <span style={{ marginLeft: 'auto' }}>{time}</span>
      </div>
    </>
  )
}
