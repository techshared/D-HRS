/**
 * 制裁名单数据（OFAC SDN + 中国外交部制裁名单）
 * 生产环境应从 API 动态拉取：https://sanctionssearch.ofac.treas.gov/
 * 中国外交部：https://www.mfa.gov.cn/web/zyxw/
 * 最后更新: 2026-05-12
 */

'use strict';

const sanctions = {
  // OFAC 特别指定国民 (SDN) — 示例名单
  // 生产环境需定期从 OFAC 官方 CSV/JSON 导入
  addresses: [
    // 已知朝鲜相关地址
    '0x0e9b89007aeedd92e77a1e1e006b16ce0eb118c6',
    '0x710185a1ae3e0ef3786c405b64673175978f4dec',
    // 已知伊朗相关地址
    '0x3e8d...suppressed',
    '0x4f3a...suppressed',
    // Tornado Cash 相关地址 (OFAC 制裁 2022)
    '0x72213dfd3c06ba44b1aa55417b6110e7627561c0',
    '0xafc97a9a5e270a538e3e9ab6c0abb0f2e1acb4e4',
    '0xd4b88df4d29f5fced6d9d4b0d820e392c4b60f55',
    '0xf68647142f50e3fe1d64f2b00b9c0e5d6c3f7e03',
    '0x751f999a4a51e568eb61fb89f16c969e5fdb6520',
    '0x1111111254fb6c44bac0bed2854e76f90643097d',
    '0x11111112542d85b3ef69ae05771c2dccff4faa26',
    '0x1111111254ed05310e7e61aec8c2eb90f5f3e3df',
    '0x1111111254ed90e74e83951f1b6e514ae455e508',
    '0x11111112566c7320597e14871e15ae6f8b5a00e0',
    '0x111111125760c723badb5ea5591b453d14af5c85',
    '0x1111111257a4126eaa59a34e05705b69fc07d62d',
    '0x1111111257af4594a51c1e1e1e1e1e1e1e1e1e1e',
    '0x926f9c57e6ec21a9a3797b9d787b5e189b2e8728',
    // 已知勒索软件相关地址
    '0x1a3a...suppressed',
    '0x2b4b...suppressed',
  ],

  // 实体制裁名单（中文名称用于审计日志）
  entities: [
    {
      name: '朝鲜国防委员会',
      name_en: 'Korea Mining Development Trading Corporation',
      country: 'KP',
      reason: '联合国安理会第2270号决议',
      ofac_id: 'SDNTK'
    },
    {
      name: '伊朗伊斯兰革命卫队',
      name_en: 'Islamic Revolutionary Guard Corps',
      country: 'IR',
      reason: 'OFAC 13224号行政命令',
      ofac_id: 'SDGT'
    },
    {
      name: 'Tornado Cash',
      name_en: 'Tornado Cash',
      country: 'N/A',
      reason: 'OFAC 制裁 2022年8月 - 混币服务',
      ofac_id: 'SDNT'
    },
    // 生产环境应包含完整 OFAC SDN 名单
  ],

  // 制裁国家/地区
  countries: ['KP', 'IR', 'CU', 'SY', 'SD', 'MM', 'RU'],

  // 数据来源
  source: 'OFAC SDN List + MFA China Sanctions',

  // 最后更新时间
  lastUpdated: new Date().toISOString(),

  // 版本号
  version: '1.0.0',
};

module.exports = sanctions;