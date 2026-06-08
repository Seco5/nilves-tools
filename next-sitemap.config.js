/** @type {import('next-sitemap').IConfig} */
const toolRoutes = [
  '/json-formatter',
  '/diff-checker',
  '/xml-formatter',
  '/sql-formatter',
  '/csv-json',
  '/markdown-preview',
  '/uuid-generator',
  '/password-generator',
  '/hash-generator',
  '/lorem-ipsum',
  '/color-converter',
  '/barcode-qr',
  '/base64',
  '/url-encode-decode',
  '/jwt-decoder',
  '/timestamp',
  '/number-base',
  '/cron-expression',
  '/regex-tester',
  '/tckn-generator',
  '/vkn-generator',
  '/tr-iban-generator',
  '/credit-card-generator',
  '/fake-person-data',
  '/sql-playground',
  '/project-planner',
]

module.exports = {
  siteUrl: 'https://devtools.nilves.com',
  generateRobotsTxt: true,
  generateIndexSitemap: false,
  changefreq: 'weekly',
  priority: 0.8,
  // Ensure the home page plus all 22 tool routes are always present in the sitemap
  additionalPaths: async (config) =>
    ['/', ...toolRoutes].map((route) => ({
      loc: route,
      changefreq: config.changefreq,
      priority: route === '/' ? 1.0 : config.priority,
      lastmod: new Date().toISOString(),
    })),
  robotsTxtOptions: {
    policies: [{ userAgent: '*', allow: '/' }],
  },
}
